import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  CLOUD_REFRESH_INTERVAL_MS,
  CLOUD_SAVE_DEBOUNCE_MS,
  ResolveProvider,
  createEmptyData,
  useResolve,
} from "@/contexts/resolve-context";
import { CURRENT_WORKSPACE_SCHEMA_VERSION } from "@/features/workspace/lib/migrations";

type ReadResult =
  | { kind: "missing" }
  | {
      kind: "value";
      snapshot: {
        data: unknown;
        schemaVersion: number;
        revision: number;
        updatedByClientId?: string;
      };
    };

const syncMocks = vi.hoisted(() => ({
  loadWorkspace:
    vi.fn<(userId: string) => Promise<ReadResult>>(),
  syncWorkspaceTransaction: vi.fn(),
  upgradeWorkspaceTransaction: vi.fn(),
  saveCloudRecoverySnapshot: vi.fn(async () => undefined),
  saveCloudSemesterArchive: vi.fn(async () => ({ created: true })),
  saveRecoverySnapshot: vi.fn(async () => undefined),
}));

vi.mock("@/features/workspace/lib/recovery", async (importOriginal) => {
  const actual =
    await importOriginal<typeof import("@/features/workspace/lib/recovery")>();
  return {
    ...actual,
    saveRecoverySnapshot: syncMocks.saveRecoverySnapshot,
  };
});

vi.mock("@/contexts/auth-context", () => ({
  useAuth: () => ({
    user: {
      id: "cloud-user",
      displayName: "Cloud User",
      email: "cloud@example.com",
    },
    isConfigured: true,
    canUseCloud: true,
  }),
}));

vi.mock("@/lib/firebase/workspace", () => {
  class WorkspaceConflictError extends Error {}
  return {
  loadWorkspace: syncMocks.loadWorkspace,
  syncWorkspaceTransaction: syncMocks.syncWorkspaceTransaction,
  upgradeWorkspaceTransaction: syncMocks.upgradeWorkspaceTransaction,
  saveCloudRecoverySnapshot: syncMocks.saveCloudRecoverySnapshot,
  saveCloudSemesterArchive: syncMocks.saveCloudSemesterArchive,
  WorkspaceConflictError,
  };
});

vi.mock("@/features/workspace/sync/tab-coordinator", () => ({
  TabSyncCoordinator: class {
    tabId = "test-tab";
    start(onLeader: (leader: boolean) => void) {
      onLeader(true);
    }
    stop() {}
    publish() {}
    requestSync() {}
  },
}));

function ProviderProbe() {
  const {
    goals,
    tasks,
    syncStatus,
    syncError,
    isSyncLeader,
    addTask,
    syncWorkspaceNow,
  } = useResolve();
  return (
    <>
      <output aria-label="goal count">{goals.length}</output>
      <output aria-label="task count">{tasks.length}</output>
      <output aria-label="sync status">{syncStatus}</output>
      <output aria-label="sync error">{syncError}</output>
      <output aria-label="sync leader">
        {isSyncLeader ? "leader" : "follower"}
      </output>
      <button
        type="button"
        onClick={() =>
          addTask({
            title: "Local edit",
            category: "personal",
            priority: "medium",
          })
        }
      >
        Add local task
      </button>
      <button type="button" onClick={() => void syncWorkspaceNow()}>
        Sync now
      </button>
    </>
  );
}

async function flushStartup() {
  await act(async () => {
    vi.advanceTimersByTime(0);
    await Promise.resolve();
    await Promise.resolve();
  });
}

function renderProvider() {
  render(
    <ResolveProvider>
      <ProviderProbe />
    </ResolveProvider>,
  );
}

async function startWithCloudResult(result: ReadResult) {
  syncMocks.loadWorkspace.mockResolvedValue(result);
  renderProvider();
  await flushStartup();
  await waitFor(() =>
    expect(syncMocks.loadWorkspace).toHaveBeenCalledTimes(1),
  );
  await waitFor(() =>
    expect(screen.getByLabelText("sync status")).not.toHaveTextContent(
      /connecting|migrating/,
    ),
  );
  await waitFor(() =>
    expect(screen.getByLabelText("sync leader")).toHaveTextContent("leader"),
  );
}

beforeEach(() => {
  vi.useFakeTimers({ shouldAdvanceTime: true });
  window.localStorage.clear();
  syncMocks.loadWorkspace.mockReset();
  syncMocks.syncWorkspaceTransaction.mockReset();
  syncMocks.syncWorkspaceTransaction.mockImplementation(
    async ({
      localData,
      baseRevision,
      patches,
    }: {
      localData: unknown;
      baseRevision: number;
      patches: unknown[];
    }) => ({
      data: localData,
      revision: baseRevision + 1,
      patchesApplied: patches.length,
    }),
  );
  syncMocks.upgradeWorkspaceTransaction.mockReset();
  syncMocks.upgradeWorkspaceTransaction.mockImplementation(
    async ({ data, expectedRevision }: { data: unknown; expectedRevision: number }) => ({
      data,
      revision: expectedRevision + 1,
    }),
  );
  syncMocks.saveCloudRecoverySnapshot.mockClear();
  syncMocks.saveCloudSemesterArchive.mockClear();
  syncMocks.saveRecoverySnapshot.mockClear();
});

afterEach(() => {
  vi.useRealTimers();
});

describe("ResolveProvider quota-conscious cloud sync", () => {
  it("enters recovery mode without replacing or syncing malformed local data", async () => {
    const raw = JSON.stringify({ malformed: true, irreplaceable: "keep me" });
    window.localStorage.setItem("resolve-data-v2:cloud-user", raw);
    window.localStorage.setItem(
      "resolve-sync-v2:cloud-user",
      JSON.stringify({
        dirty: true,
        lastCheckedAt: 0,
        baseRevision: 2,
        schemaVersion: CURRENT_WORKSPACE_SCHEMA_VERSION,
        patches: [],
      }),
    );

    renderProvider();
    await flushStartup();

    expect(
      screen.getByRole("heading", { name: "Your workspace was not replaced" }),
    ).toBeInTheDocument();
    expect(window.localStorage.getItem("resolve-data-v2:cloud-user")).toBe(raw);
    expect(syncMocks.loadWorkspace).not.toHaveBeenCalled();
    expect(syncMocks.syncWorkspaceTransaction).not.toHaveBeenCalled();
    expect(syncMocks.saveRecoverySnapshot).toHaveBeenCalledTimes(1);
  });

  it("backs up and transactionally upgrades an older workspace", async () => {
    await startWithCloudResult({
      kind: "value",
      snapshot: {
        data: {
          goals: [
            {
              id: "kept-goal",
              userId: "cloud-user",
              semesterId: "old-semester",
              title: "Keep this goal",
              description: "This must survive the upgrade.",
              category: "personal",
              priority: "high",
              measurementType: "count",
              startDate: "2026-07-01",
              status: "active",
              createdAt: "2026-07-01T00:00:00.000Z",
              updatedAt: "2026-07-01T00:00:00.000Z",
            },
          ],
        },
        schemaVersion: 1,
        revision: 2,
      },
    });

    expect(screen.getByLabelText("goal count")).toHaveTextContent("1");
    expect(syncMocks.upgradeWorkspaceTransaction).toHaveBeenCalledTimes(1);
    expect(syncMocks.saveCloudRecoverySnapshot).toHaveBeenCalledTimes(1);
  });

  it("does not upgrade an older cloud workspace after malformed records would be discarded", async () => {
    await startWithCloudResult({
      kind: "value",
      snapshot: {
        data: {
          goals: [{ id: "goal-without-a-title" }],
        },
        schemaVersion: 1,
        revision: 2,
      },
    });

    expect(screen.getByLabelText("sync status")).toHaveTextContent("offline");
    expect(screen.getByLabelText("sync error")).toHaveTextContent(
      "goals[0] is missing required data",
    );
    expect(syncMocks.upgradeWorkspaceTransaction).not.toHaveBeenCalled();
    expect(syncMocks.saveRecoverySnapshot).toHaveBeenCalledTimes(1);
  });

  it("groups several rapid edits into one delayed Firestore write", async () => {
    await startWithCloudResult({
      kind: "value",
      snapshot: {
        data: createEmptyData("cloud-user"),
        schemaVersion: 4,
        revision: 1,
      },
    });

    fireEvent.click(screen.getByRole("button", { name: "Add local task" }));
    fireEvent.click(screen.getByRole("button", { name: "Add local task" }));
    fireEvent.click(screen.getByRole("button", { name: "Add local task" }));
    expect(screen.getByLabelText("task count")).toHaveTextContent("3");

    act(() => {
      vi.advanceTimersByTime(CLOUD_SAVE_DEBOUNCE_MS - 1);
    });
    expect(syncMocks.syncWorkspaceTransaction).not.toHaveBeenCalled();

    await act(async () => {
      vi.advanceTimersByTime(1);
      await Promise.resolve();
    });
    expect(syncMocks.syncWorkspaceTransaction).toHaveBeenCalledTimes(1);
    expect(syncMocks.syncWorkspaceTransaction.mock.calls[0][0]).toMatchObject({
      localData: {
        tasks: expect.arrayContaining([
        expect.objectContaining({ title: "Local edit" }),
        ]),
      },
    });
    expect(
      (syncMocks.syncWorkspaceTransaction.mock.calls[0][0] as {
        localData: { tasks: unknown[] };
      }).localData.tasks,
    ).toHaveLength(3);
  });

  it("keeps a failed write dirty and allows an explicit retry", async () => {
    await startWithCloudResult({
      kind: "value",
      snapshot: {
        data: createEmptyData("cloud-user"),
        schemaVersion: 4,
        revision: 1,
      },
    });
    syncMocks.syncWorkspaceTransaction.mockRejectedValueOnce(
      new Error("quota exceeded"),
    );

    fireEvent.click(screen.getByRole("button", { name: "Add local task" }));
    await act(async () => {
      vi.advanceTimersByTime(CLOUD_SAVE_DEBOUNCE_MS);
      await Promise.resolve();
    });
    expect(screen.getByLabelText("sync status")).toHaveTextContent("offline");
    expect(
      JSON.parse(
        window.localStorage.getItem("resolve-sync-v2:cloud-user") ?? "{}",
      ),
    ).toMatchObject({ dirty: true });

    fireEvent.click(screen.getByRole("button", { name: "Sync now" }));
    await waitFor(() =>
      expect(syncMocks.syncWorkspaceTransaction).toHaveBeenCalledTimes(2),
    );
    await waitFor(() =>
      expect(screen.getByLabelText("sync status")).toHaveTextContent("synced"),
    );
    expect(
      JSON.parse(
        window.localStorage.getItem("resolve-sync-v2:cloud-user") ?? "{}",
      ),
    ).toMatchObject({ dirty: false });
  });

  it("retries dirty changes as soon as connectivity returns", async () => {
    await startWithCloudResult({
      kind: "value",
      snapshot: {
        data: createEmptyData("cloud-user"),
        schemaVersion: CURRENT_WORKSPACE_SCHEMA_VERSION,
        revision: 1,
      },
    });
    syncMocks.syncWorkspaceTransaction.mockRejectedValueOnce(
      new Error("network unavailable"),
    );
    fireEvent.click(screen.getByRole("button", { name: "Add local task" }));
    await act(async () => {
      vi.advanceTimersByTime(CLOUD_SAVE_DEBOUNCE_MS);
      await Promise.resolve();
    });
    expect(screen.getByLabelText("sync status")).toHaveTextContent("offline");

    await act(async () => {
      window.dispatchEvent(new Event("online"));
      await Promise.resolve();
    });
    await waitFor(() =>
      expect(syncMocks.syncWorkspaceTransaction).toHaveBeenCalledTimes(2),
    );
    await waitFor(() =>
      expect(screen.getByLabelText("sync status")).toHaveTextContent("synced"),
    );
  });

  it("does not poll again until the cloud-check cache expires", async () => {
    const result: ReadResult = {
      kind: "value",
      snapshot: {
        data: createEmptyData("cloud-user"),
        schemaVersion: 4,
        revision: 1,
      },
    };
    await startWithCloudResult(result);
    syncMocks.loadWorkspace.mockResolvedValue(result);

    act(() => window.dispatchEvent(new Event("focus")));
    expect(syncMocks.loadWorkspace).toHaveBeenCalledTimes(1);

    act(() => {
      vi.advanceTimersByTime(CLOUD_REFRESH_INTERVAL_MS);
      window.dispatchEvent(new Event("focus"));
    });
    await waitFor(() =>
      expect(syncMocks.loadWorkspace).toHaveBeenCalledTimes(2),
    );
  });

  it("skips a startup read when a recently checked local copy is clean", async () => {
    const local = createEmptyData("cloud-user");
    local.tasks.push({
      id: "cached-task",
      userId: "cloud-user",
      semesterId: local.semester.id,
      title: "Cached",
      category: "personal",
      priority: "medium",
      status: "planned",
      createdAt: "2026-07-01T00:00:00.000Z",
      updatedAt: "2026-07-01T00:00:00.000Z",
    });
    window.localStorage.setItem(
      "resolve-data-v2:cloud-user",
      JSON.stringify(local),
    );
    window.localStorage.setItem(
      "resolve-sync-base-v1:cloud-user",
      JSON.stringify(local),
    );
    window.localStorage.setItem(
      "resolve-sync-v2:cloud-user",
      JSON.stringify({
        dirty: false,
        lastCheckedAt: Date.now(),
        baseRevision: 4,
        schemaVersion: 4,
        patches: [],
      }),
    );

    renderProvider();
    await flushStartup();

    expect(screen.getByLabelText("task count")).toHaveTextContent("1");
    expect(screen.getByLabelText("sync status")).toHaveTextContent("synced");
    expect(syncMocks.loadWorkspace).not.toHaveBeenCalled();
    expect(syncMocks.syncWorkspaceTransaction).not.toHaveBeenCalled();
  });

  it("retries a dirty browser copy without reading over it", async () => {
    const local = createEmptyData("cloud-user");
    local.tasks.push({
      id: "unsynced-task",
      userId: "cloud-user",
      semesterId: local.semester.id,
      title: "Keep me",
      category: "personal",
      priority: "medium",
      status: "planned",
      createdAt: "2026-07-01T00:00:00.000Z",
      updatedAt: "2026-07-01T00:00:00.000Z",
    });
    window.localStorage.setItem(
      "resolve-data-v2:cloud-user",
      JSON.stringify(local),
    );
    window.localStorage.setItem(
      "resolve-sync-base-v1:cloud-user",
      JSON.stringify(createEmptyData("cloud-user")),
    );
    window.localStorage.setItem(
      "resolve-sync-v2:cloud-user",
      JSON.stringify({
        dirty: true,
        lastCheckedAt: Date.now(),
        baseRevision: 3,
        schemaVersion: 4,
        patches: [],
      }),
    );

    renderProvider();
    await flushStartup();
    expect(syncMocks.loadWorkspace).not.toHaveBeenCalled();

    await act(async () => {
      vi.advanceTimersByTime(CLOUD_SAVE_DEBOUNCE_MS);
      await Promise.resolve();
    });
    expect(syncMocks.syncWorkspaceTransaction).toHaveBeenCalledTimes(1);
    expect(syncMocks.syncWorkspaceTransaction.mock.calls[0][0]).toMatchObject({
      localData: {
        tasks: [expect.objectContaining({ id: "unsynced-task" })],
      },
    });
  });

  it("uploads meaningful local data when the server document is missing", async () => {
    const local = createEmptyData("cloud-user");
    local.weeklyPriorities = ["Finish the report", "", ""];
    window.localStorage.setItem(
      "resolve-data-v2:cloud-user",
      JSON.stringify(local),
    );

    await startWithCloudResult({ kind: "missing" });
    await act(async () => {
      vi.advanceTimersByTime(CLOUD_SAVE_DEBOUNCE_MS);
      await Promise.resolve();
    });

    expect(syncMocks.syncWorkspaceTransaction).toHaveBeenCalledTimes(1);
    expect(syncMocks.syncWorkspaceTransaction.mock.calls[0][0]).toMatchObject({
      localData: {
        weeklyPriorities: ["Finish the report", "", ""],
      },
    });
  });

  it("does not create an empty Firestore document for a new account", async () => {
    await startWithCloudResult({ kind: "missing" });
    act(() => {
      vi.advanceTimersByTime(CLOUD_SAVE_DEBOUNCE_MS);
    });
    expect(syncMocks.syncWorkspaceTransaction).not.toHaveBeenCalled();
  });

  it("blocks writes from an app older than the cloud workspace", async () => {
    await startWithCloudResult({
      kind: "value",
      snapshot: { data: { goals: [] }, schemaVersion: 7, revision: 1 },
    });

    expect(screen.getByLabelText("sync status")).toHaveTextContent("error");
    expect(screen.getByLabelText("sync error")).toHaveTextContent(
      "newer Resolve version",
    );
    fireEvent.click(screen.getByRole("button", { name: "Add local task" }));
    act(() => {
      vi.advanceTimersByTime(CLOUD_SAVE_DEBOUNCE_MS);
    });
    expect(syncMocks.syncWorkspaceTransaction).not.toHaveBeenCalled();
  });

  it("keeps local edits without writing when the initial server read fails", async () => {
    syncMocks.loadWorkspace.mockRejectedValue(
      new Error("network unavailable"),
    );
    syncMocks.syncWorkspaceTransaction.mockRejectedValue(
      new Error("network unavailable"),
    );
    renderProvider();
    await flushStartup();
    await waitFor(() =>
      expect(screen.getByLabelText("sync status")).toHaveTextContent(
        "offline",
      ),
    );

    fireEvent.click(screen.getByRole("button", { name: "Add local task" }));
    act(() => {
      vi.advanceTimersByTime(CLOUD_SAVE_DEBOUNCE_MS);
    });

    expect(screen.getByLabelText("task count")).toHaveTextContent("1");
    expect(syncMocks.syncWorkspaceTransaction).toHaveBeenCalledTimes(1);
    expect(
      JSON.parse(
        window.localStorage.getItem("resolve-sync-v2:cloud-user") ?? "{}",
      ),
    ).toMatchObject({ dirty: true });
  });
});
