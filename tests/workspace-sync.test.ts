import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  onSnapshot: vi.fn(),
  setDoc: vi.fn(async () => {}),
  serverTimestamp: vi.fn(() => "server-time"),
}));

vi.mock("firebase/firestore", () => ({
  doc: (_db: unknown, collection: string, id: string) => ({
    path: `${collection}/${id}`,
  }),
  onSnapshot: mocks.onSnapshot,
  setDoc: mocks.setDoc,
  serverTimestamp: mocks.serverTimestamp,
}));

vi.mock("@/lib/firebase/config", () => ({
  getFirebaseDb: () => ({ name: "test-db" }),
}));

import {
  getWorkspaceSchemaCompatibility,
  saveWorkspace,
  subscribeToWorkspace,
  WORKSPACE_COLLECTION,
  WORKSPACE_SCHEMA_VERSION,
} from "@/lib/firebase/workspace";

beforeEach(() => {
  mocks.onSnapshot.mockReset();
  mocks.setDoc.mockClear();
  mocks.serverTimestamp.mockClear();
});

describe("Firestore workspace sync", () => {
  it("distinguishes current, upgradeable, and newer workspace schemas", () => {
    expect(
      getWorkspaceSchemaCompatibility(WORKSPACE_SCHEMA_VERSION),
    ).toBe("current");
    expect(
      getWorkspaceSchemaCompatibility(WORKSPACE_SCHEMA_VERSION - 1),
    ).toBe("upgrade");
    expect(
      getWorkspaceSchemaCompatibility(WORKSPACE_SCHEMA_VERSION + 1),
    ).toBe("unsupported");
  });

  it("writes a user-owned serializable workspace envelope", async () => {
    await saveWorkspace("user-1", {
      title: "Semester",
      optional: undefined,
    });

    expect(mocks.setDoc).toHaveBeenCalledWith(
      { path: `${WORKSPACE_COLLECTION}/user-1` },
      {
        userId: "user-1",
        schemaVersion: WORKSPACE_SCHEMA_VERSION,
        data: { title: "Semester" },
        updatedAt: "server-time",
      },
      { merge: true },
    );
  });

  it("does not create a workspace from an empty local cache snapshot", () => {
    let snapshotHandler: ((snapshot: unknown) => void) | undefined;
    const missing = vi.fn();
    mocks.onSnapshot.mockImplementation(
      (_ref, _options, next: (snapshot: unknown) => void) => {
        snapshotHandler = next;
        return vi.fn();
      },
    );

    subscribeToWorkspace("user-1", vi.fn(), missing, vi.fn());
    snapshotHandler?.({
      exists: () => false,
      metadata: { fromCache: true },
    });
    expect(missing).not.toHaveBeenCalled();

    snapshotHandler?.({
      exists: () => false,
      metadata: { fromCache: false },
    });
    expect(missing).toHaveBeenCalledTimes(1);
  });

  it("returns valid user-owned snapshots and rejects malformed ownership", () => {
    let snapshotHandler: ((snapshot: unknown) => void) | undefined;
    const value = vi.fn();
    const error = vi.fn();
    mocks.onSnapshot.mockImplementation(
      (_ref, _options, next: (snapshot: unknown) => void) => {
        snapshotHandler = next;
        return vi.fn();
      },
    );

    subscribeToWorkspace("user-1", value, vi.fn(), error);
    snapshotHandler?.({
      exists: () => true,
      data: () => ({
        userId: "user-1",
        schemaVersion: WORKSPACE_SCHEMA_VERSION,
        data: { tasks: [] },
      }),
      metadata: { fromCache: false, hasPendingWrites: false },
    });
    expect(value).toHaveBeenCalledWith({
      data: { tasks: [] },
      schemaVersion: WORKSPACE_SCHEMA_VERSION,
      fromCache: false,
      hasPendingWrites: false,
    });

    snapshotHandler?.({
      exists: () => true,
      data: () => ({ userId: "another-user", data: { tasks: [] } }),
      metadata: { fromCache: false, hasPendingWrites: false },
    });
    expect(error).toHaveBeenCalledTimes(1);
  });

  it("reports legacy snapshots so the provider can migrate their data", () => {
    let snapshotHandler: ((snapshot: unknown) => void) | undefined;
    const value = vi.fn();
    mocks.onSnapshot.mockImplementation(
      (_ref, _options, next: (snapshot: unknown) => void) => {
        snapshotHandler = next;
        return vi.fn();
      },
    );

    subscribeToWorkspace("user-1", value, vi.fn(), vi.fn());
    snapshotHandler?.({
      exists: () => true,
      data: () => ({
        userId: "user-1",
        schemaVersion: 1,
        data: { goals: [{ id: "legacy-demo-goal" }] },
      }),
      metadata: { fromCache: false, hasPendingWrites: false },
    });

    expect(value).toHaveBeenCalledWith({
      data: { goals: [{ id: "legacy-demo-goal" }] },
      schemaVersion: 1,
      fromCache: false,
      hasPendingWrites: false,
    });
  });
});
