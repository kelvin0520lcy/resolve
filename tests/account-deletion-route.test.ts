import { beforeEach, describe, expect, it, vi } from "vitest";

const adminMocks = vi.hoisted(() => {
  const marker = {
    set: vi.fn(),
  };
  const workspace = { path: "workspaces/user-1" };
  const profile = { delete: vi.fn() };
  const db = {
    collection: vi.fn((name: string) => ({
      doc: vi.fn(() => {
        if (name === "accountDeletions") return marker;
        if (name === "workspaces") return workspace;
        return profile;
      }),
    })),
    recursiveDelete: vi.fn(),
  };
  const auth = {
    verifyIdToken: vi.fn(),
    deleteUser: vi.fn(),
  };
  return { auth, db, marker, profile, workspace };
});

vi.mock("@/lib/firebase/admin", () => ({
  getFirebaseAdmin: () => ({
    auth: adminMocks.auth,
    db: adminMocks.db,
  }),
}));

import {
  DELETION_TOMBSTONE_RETENTION_MS,
  POST,
} from "@/app/api/account/delete/route";

function request(token = "token") {
  return new Request("http://localhost/api/account/delete", {
    method: "POST",
    headers: token ? { authorization: `Bearer ${token}` } : undefined,
  });
}

beforeEach(() => {
  vi.clearAllMocks();
  adminMocks.auth.verifyIdToken.mockResolvedValue({
    uid: "user-1",
    auth_time: Math.floor(Date.now() / 1_000),
  });
  adminMocks.marker.set.mockResolvedValue(undefined);
  adminMocks.db.recursiveDelete.mockResolvedValue(undefined);
  adminMocks.profile.delete.mockResolvedValue(undefined);
  adminMocks.auth.deleteUser.mockResolvedValue(undefined);
});

describe("trusted account deletion", () => {
  it("requires a bearer token", async () => {
    const response = await POST(request(""));
    expect(response.status).toBe(401);
    expect(adminMocks.auth.verifyIdToken).not.toHaveBeenCalled();
  });

  it("requires a recently authenticated token before writing a marker", async () => {
    adminMocks.auth.verifyIdToken.mockResolvedValue({
      uid: "user-1",
      auth_time: Math.floor(Date.now() / 1_000) - 301,
    });

    const response = await POST(request());

    expect(response.status).toBe(401);
    expect(adminMocks.marker.set).not.toHaveBeenCalled();
  });

  it("returns an authentication response for a rejected token", async () => {
    adminMocks.auth.verifyIdToken.mockRejectedValue(new Error("revoked"));

    const response = await POST(request());

    expect(response.status).toBe(401);
    expect(adminMocks.marker.set).not.toHaveBeenCalled();
  });

  it("locks writes, removes the account, and retains a deletion tombstone", async () => {
    const startedAt = Date.now();
    const response = await POST(request());

    expect(response.status).toBe(200);
    expect(adminMocks.marker.set).toHaveBeenCalledTimes(2);
    expect(adminMocks.db.recursiveDelete).toHaveBeenCalledWith(
      adminMocks.workspace,
    );
    expect(adminMocks.profile.delete).toHaveBeenCalled();
    expect(adminMocks.auth.deleteUser).toHaveBeenCalledWith("user-1");
    const finalMarker = adminMocks.marker.set.mock.calls[1]?.[0];
    expect(finalMarker).toMatchObject({
      userId: "user-1",
      status: "deleted",
    });
    expect(finalMarker.expiresAt.toMillis()).toBeGreaterThanOrEqual(
      startedAt + DELETION_TOMBSTONE_RETENTION_MS,
    );
    expect(
      adminMocks.marker.set.mock.invocationCallOrder[0],
    ).toBeLessThan(adminMocks.db.recursiveDelete.mock.invocationCallOrder[0]);
    expect(
      adminMocks.db.recursiveDelete.mock.invocationCallOrder[0],
    ).toBeLessThan(adminMocks.auth.deleteUser.mock.invocationCallOrder[0]);
  });

  it("keeps the deletion marker when cleanup fails so client writes stay blocked", async () => {
    adminMocks.db.recursiveDelete.mockRejectedValue(new Error("quota"));

    const response = await POST(request());

    expect(response.status).toBe(500);
    expect(adminMocks.marker.set).toHaveBeenCalledTimes(1);
    expect(adminMocks.auth.deleteUser).not.toHaveBeenCalled();
  });

  it("reports success when only the final tombstone update fails", async () => {
    adminMocks.marker.set
      .mockResolvedValueOnce(undefined)
      .mockRejectedValueOnce(new Error("write interrupted"));

    const response = await POST(request());

    expect(response.status).toBe(200);
    expect(adminMocks.marker.set).toHaveBeenCalledTimes(2);
  });
});
