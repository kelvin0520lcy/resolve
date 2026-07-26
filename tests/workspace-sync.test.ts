import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  getDocFromServer: vi.fn(),
  setDoc: vi.fn(async () => {}),
  serverTimestamp: vi.fn(() => "server-time"),
  transactionGet: vi.fn(),
  transactionSet: vi.fn(),
}));

vi.mock("firebase/firestore", () => ({
  doc: (_db: unknown, collection: string, id: string) => ({
    path: `${collection}/${id}`,
  }),
  getDocFromServer: mocks.getDocFromServer,
  setDoc: mocks.setDoc,
  serverTimestamp: mocks.serverTimestamp,
  runTransaction: async (
    _database: unknown,
    callback: (transaction: {
      get: typeof mocks.transactionGet;
      set: typeof mocks.transactionSet;
    }) => unknown,
  ) =>
    callback({
      get: mocks.transactionGet,
      set: mocks.transactionSet,
    }),
}));

vi.mock("@/lib/firebase/config", () => ({
  getFirebaseDb: () => ({ name: "test-db" }),
}));

import {
  getWorkspaceSchemaCompatibility,
  loadWorkspace,
  saveWorkspace,
  syncWorkspaceTransaction,
  WORKSPACE_COLLECTION,
  WORKSPACE_SCHEMA_VERSION,
} from "@/lib/firebase/workspace";
import { createEmptyData } from "@/contexts/resolve-context";
import { buildWorkspacePatches } from "@/features/workspace/lib/patches";

beforeEach(() => {
  mocks.getDocFromServer.mockReset();
  mocks.setDoc.mockClear();
  mocks.serverTimestamp.mockClear();
  mocks.transactionGet.mockReset();
  mocks.transactionSet.mockReset();
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
        revision: 1,
        updatedByClientId: "legacy-client",
        data: { title: "Semester" },
        updatedAt: "server-time",
      },
    );
  });

  it("performs one explicit server read and reports a missing workspace", async () => {
    mocks.getDocFromServer.mockResolvedValue({
      exists: () => false,
    });

    await expect(loadWorkspace("user-1")).resolves.toEqual({
      kind: "missing",
    });
    expect(mocks.getDocFromServer).toHaveBeenCalledTimes(1);
  });

  it("returns a valid user-owned server snapshot", async () => {
    mocks.getDocFromServer.mockResolvedValue({
      exists: () => true,
      data: () => ({
        userId: "user-1",
        schemaVersion: WORKSPACE_SCHEMA_VERSION,
        data: { tasks: [] },
      }),
    });

    await expect(loadWorkspace("user-1")).resolves.toEqual({
      kind: "value",
      snapshot: {
        data: { tasks: [] },
        schemaVersion: WORKSPACE_SCHEMA_VERSION,
        revision: 0,
        updatedByClientId: undefined,
      },
    });
  });

  it("rejects a malformed or incorrectly owned workspace", async () => {
    mocks.getDocFromServer.mockResolvedValue({
      exists: () => true,
      data: () => ({ userId: "another-user", data: { tasks: [] } }),
    });

    await expect(loadWorkspace("user-1")).rejects.toThrow(
      "workspace document is malformed",
    );
  });

  it("uses one transaction read and one write to merge a coalesced flush", async () => {
    const base = createEmptyData("user-1");
    base.tasks.push({
      id: "task-1",
      userId: "user-1",
      semesterId: base.semester.id,
      title: "Original",
      category: "personal",
      priority: "medium",
      status: "planned",
      createdAt: "",
      updatedAt: "",
    });
    const local = structuredClone(base);
    local.tasks[0].title = "Local title";
    const remote = structuredClone(base);
    remote.tasks[0].scheduledDate = "2026-08-01";
    const patches = buildWorkspacePatches(base, local, "device-a", "now");
    mocks.transactionGet.mockResolvedValue({
      exists: () => true,
      data: () => ({
        userId: "user-1",
        schemaVersion: WORKSPACE_SCHEMA_VERSION,
        revision: 2,
        data: remote,
      }),
    });

    const result = await syncWorkspaceTransaction({
      userId: "user-1",
      localData: local,
      baseRevision: 1,
      patches,
      clientId: "device-a",
    });

    expect(mocks.transactionGet).toHaveBeenCalledTimes(1);
    expect(mocks.transactionSet).toHaveBeenCalledTimes(1);
    expect(result.revision).toBe(3);
    expect(result.data.tasks[0]).toMatchObject({
      title: "Local title",
      scheduledDate: "2026-08-01",
    });
  });
});
