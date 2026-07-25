import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  ResolveProvider,
  useResolve,
} from "@/contexts/resolve-context";

const syncMocks = vi.hoisted(() => ({
  onValue: null as ((snapshot: {
    data: unknown;
    schemaVersion: number;
    hasPendingWrites: boolean;
    fromCache: boolean;
  }) => void) | null,
  onMissing: null as (() => void) | null,
  onError: null as ((error: Error) => void) | null,
  saveWorkspace: vi
    .fn<(userId: string, data: unknown) => Promise<void>>()
    .mockResolvedValue(undefined),
  unsubscribe: vi.fn(),
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
    schemaVersion === 2
      ? "current"
      : schemaVersion < 2
        ? "upgrade"
        : "unsupported",
  saveWorkspace: syncMocks.saveWorkspace,
  subscribeToWorkspace: (
    _userId: string,
    onValue: typeof syncMocks.onValue,
    onMissing: typeof syncMocks.onMissing,
    onError: typeof syncMocks.onError,
  ) => {
    syncMocks.onValue = onValue;
    syncMocks.onMissing = onMissing;
    syncMocks.onError = onError;
    return syncMocks.unsubscribe;
  },
}));

function ProviderProbe() {
  const { goals, syncStatus, syncError, addTask } = useResolve();
  return (
    <>
      <output aria-label="goal count">{goals.length}</output>
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
    </>
  );
}

async function startProvider() {
  render(
    <ResolveProvider>
      <ProviderProbe />
    </ResolveProvider>,
  );
  await act(async () => {
    vi.runOnlyPendingTimers();
  });
  await waitFor(() => expect(syncMocks.onValue).toBeTypeOf("function"));
}

beforeEach(() => {
  vi.useFakeTimers({ shouldAdvanceTime: true });
  window.localStorage.clear();
  syncMocks.onValue = null;
  syncMocks.onMissing = null;
  syncMocks.onError = null;
  syncMocks.saveWorkspace.mockClear();
  syncMocks.unsubscribe.mockClear();
});

afterEach(() => {
  vi.useRealTimers();
});

describe("ResolveProvider cloud safety", () => {
  it("migrates an older workspace without clearing its records", async () => {
    await startProvider();

    await act(async () => {
      syncMocks.onValue?.({
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
        hasPendingWrites: false,
        fromCache: false,
      });
    });

    expect(screen.getByLabelText("goal count")).toHaveTextContent("1");
    expect(syncMocks.saveWorkspace).toHaveBeenCalledTimes(1);
    expect(syncMocks.saveWorkspace.mock.calls[0][1]).toMatchObject({
      goals: [expect.objectContaining({ id: "kept-goal" })],
    });
  });

  it("blocks writes from an app older than the cloud workspace", async () => {
    await startProvider();

    act(() => {
      syncMocks.onValue?.({
        data: { goals: [] },
        schemaVersion: 3,
        hasPendingWrites: false,
        fromCache: false,
      });
    });

    expect(screen.getByLabelText("sync status")).toHaveTextContent("error");
    expect(screen.getByLabelText("sync error")).toHaveTextContent(
      "newer Resolve version",
    );
    fireEvent.click(screen.getByRole("button", { name: "Add local task" }));
    act(() => {
      vi.advanceTimersByTime(500);
    });
    expect(syncMocks.saveWorkspace).not.toHaveBeenCalled();
  });

  it("does not write before an errored subscription reads the server", async () => {
    await startProvider();

    act(() => {
      syncMocks.onError?.(new Error("network unavailable"));
    });
    fireEvent.click(screen.getByRole("button", { name: "Add local task" }));
    act(() => {
      vi.advanceTimersByTime(500);
    });

    expect(screen.getByLabelText("sync status")).toHaveTextContent("offline");
    expect(syncMocks.saveWorkspace).not.toHaveBeenCalled();
  });
});
