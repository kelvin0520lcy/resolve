import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  getDocFromServer: vi.fn(),
  setDoc: vi.fn(async () => {}),
  serverTimestamp: vi.fn(() => "server-time"),
}));

vi.mock("firebase/firestore", () => ({
  doc: (_db: unknown, collection: string, id: string) => ({
    path: `${collection}/${id}`,
  }),
  getDocFromServer: mocks.getDocFromServer,
  setDoc: mocks.setDoc,
  serverTimestamp: mocks.serverTimestamp,
}));

vi.mock("@/lib/firebase/config", () => ({
  getFirebaseDb: () => ({ name: "test-db" }),
}));

import {
  getWorkspaceSchemaCompatibility,
  loadWorkspace,
  saveWorkspace,
  WORKSPACE_COLLECTION,
  WORKSPACE_SCHEMA_VERSION,
} from "@/lib/firebase/workspace";

beforeEach(() => {
  mocks.getDocFromServer.mockReset();
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
});
