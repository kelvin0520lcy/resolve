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

type ReadResult =
  | { kind: "missing" }
  | {
      kind: "value";
      snapshot: { data: unknown; schemaVersion: number };
    };

const syncMocks = vi.hoisted(() => ({
  loadWorkspace:
    vi.fn<(userId: string) => Promise<ReadResult>>(),
  saveWorkspace: vi
    .fn<(userId: string, data: unknown) => Promise<void>>()
    .mockResolvedValue(undefined),
}));

vi.mock("@/contexts/auth-context", () => ({
  useAuth: () => ({
    user: {
      id: "cloud-user",
      displayName: "Cloud User",
      email: "cloud@example.com",
    },
    isConfigured: true,
  }),
}));

vi.mock("@/lib/firebase/workspace", () => ({
  getWorkspaceSchemaCompatibility: (schemaVersion: number) =>
    schemaVersion === 3
      ? "current"
      : schemaVersion < 3
        ? "upgrade"
        : "unsupported",
  loadWorkspace: syncMocks.loadWorkspace,
  saveWorkspace: syncMocks.saveWorkspace,
}));

function ProviderProbe() {
  const {
    goals,
    tasks,
    syncStatus,
    syncError,
    addTask,
    syncWorkspaceNow,
  } = useResolve();
  return (
    <>
      <output aria-label="goal count">{goals.length}</output>
      <output aria-label="task count">{tasks.length}</output>
      <output aria-label="sync status">{syncStatus}</output>
      <output aria-label="sync error">{syncError}</output>
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
      "connecting",
    ),
  );
}

beforeEach(() => {
  vi.useFakeTimers({ shouldAdvanceTime: true });
  window.localStorage.clear();
  syncMocks.loadWorkspace.mockReset();
  syncMocks.saveWorkspace.mockReset();
  syncMocks.saveWorkspace.mockResolvedValue(undefined);
});

afterEach(() => {
  vi.useRealTimers();
});

describe("ResolveProvider quota-conscious cloud sync", () => {
  it("loads an older workspace without spending a write on migration", async () => {
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
      },
    });

    expect(screen.getByLabelText("goal count")).toHaveTextContent("1");
    expect(syncMocks.saveWorkspace).not.toHaveBeenCalled();
  });

  it("groups several rapid edits into one delayed Firestore write", async () => {
    await startWithCloudResult({
      kind: "value",
      snapshot: {
        data: createEmptyData("cloud-user"),
        schemaVersion: 3,
      },
    });

    fireEvent.click(screen.getByRole("button", { name: "Add local task" }));
    fireEvent.click(screen.getByRole("button", { name: "Add local task" }));
    fireEvent.click(screen.getByRole("button", { name: "Add local task" }));
    expect(screen.getByLabelText("task count")).toHaveTextContent("3");

    act(() => {
      vi.advanceTimersByTime(CLOUD_SAVE_DEBOUNCE_MS - 1);
    });
    expect(syncMocks.saveWorkspace).not.toHaveBeenCalled();

    await act(async () => {
      vi.advanceTimersByTime(1);
      await Promise.resolve();
    });
    expect(syncMocks.saveWorkspace).toHaveBeenCalledTimes(1);
    expect(syncMocks.saveWorkspace.mock.calls[0][1]).toMatchObject({
      tasks: expect.arrayContaining([
        expect.objectContaining({ title: "Local edit" }),
      ]),
    });
    expect(
      (syncMocks.saveWorkspace.mock.calls[0][1] as { tasks: unknown[] }).tasks,
    ).toHaveLength(3);
  });

  it("keeps a failed write dirty and allows an explicit retry", async () => {
    await startWithCloudResult({
      kind: "value",
      snapshot: {
        data: createEmptyData("cloud-user"),
        schemaVersion: 3,
      },
    });
    syncMocks.saveWorkspace.mockRejectedValueOnce(
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
        window.localStorage.getItem("resolve-sync-v1:cloud-user") ?? "{}",
      ),
    ).toMatchObject({ dirty: true });

    syncMocks.saveWorkspace.mockResolvedValue(undefined);
    fireEvent.click(screen.getByRole("button", { name: "Sync now" }));
    await waitFor(() =>
      expect(syncMocks.saveWorkspace).toHaveBeenCalledTimes(2),
    );
    await waitFor(() =>
      expect(screen.getByLabelText("sync status")).toHaveTextContent("synced"),
    );
    expect(
      JSON.parse(
        window.localStorage.getItem("resolve-sync-v1:cloud-user") ?? "{}",
      ),
    ).toMatchObject({ dirty: false });
  });

  it("does not poll again until the cloud-check cache expires", async () => {
    const result: ReadResult = {
      kind: "value",
      snapshot: {
        data: createEmptyData("cloud-user"),
        schemaVersion: 3,
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
      "resolve-sync-v1:cloud-user",
      JSON.stringify({ dirty: false, lastCheckedAt: Date.now() }),
    );

    renderProvider();
    await flushStartup();

    expect(screen.getByLabelText("task count")).toHaveTextContent("1");
    expect(screen.getByLabelText("sync status")).toHaveTextContent("synced");
    expect(syncMocks.loadWorkspace).not.toHaveBeenCalled();
    expect(syncMocks.saveWorkspace).not.toHaveBeenCalled();
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
      "resolve-sync-v1:cloud-user",
      JSON.stringify({ dirty: true, lastCheckedAt: 0 }),
    );

    renderProvider();
    await flushStartup();
    expect(syncMocks.loadWorkspace).not.toHaveBeenCalled();

    await act(async () => {
      vi.advanceTimersByTime(CLOUD_SAVE_DEBOUNCE_MS);
      await Promise.resolve();
    });
    expect(syncMocks.saveWorkspace).toHaveBeenCalledTimes(1);
    expect(syncMocks.saveWorkspace.mock.calls[0][1]).toMatchObject({
      tasks: [expect.objectContaining({ id: "unsynced-task" })],
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

    expect(syncMocks.saveWorkspace).toHaveBeenCalledTimes(1);
    expect(syncMocks.saveWorkspace.mock.calls[0][1]).toMatchObject({
      weeklyPriorities: ["Finish the report", "", ""],
    });
  });

  it("does not create an empty Firestore document for a new account", async () => {
    await startWithCloudResult({ kind: "missing" });
    act(() => {
      vi.advanceTimersByTime(CLOUD_SAVE_DEBOUNCE_MS);
    });
    expect(syncMocks.saveWorkspace).not.toHaveBeenCalled();
  });

  it("blocks writes from an app older than the cloud workspace", async () => {
    await startWithCloudResult({
      kind: "value",
      snapshot: { data: { goals: [] }, schemaVersion: 4 },
    });

    expect(screen.getByLabelText("sync status")).toHaveTextContent("error");
    expect(screen.getByLabelText("sync error")).toHaveTextContent(
      "newer Resolve version",
    );
    fireEvent.click(screen.getByRole("button", { name: "Add local task" }));
    act(() => {
      vi.advanceTimersByTime(CLOUD_SAVE_DEBOUNCE_MS);
    });
    expect(syncMocks.saveWorkspace).not.toHaveBeenCalled();
  });

  it("keeps local edits without writing when the initial server read fails", async () => {
    syncMocks.loadWorkspace.mockRejectedValue(
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
    expect(syncMocks.saveWorkspace).not.toHaveBeenCalled();
    expect(
      JSON.parse(
        window.localStorage.getItem("resolve-sync-v1:cloud-user") ?? "{}",
      ),
    ).toMatchObject({ dirty: true });
  });
});
