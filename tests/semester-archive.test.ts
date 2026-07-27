import { beforeEach, describe, expect, it, vi } from "vitest";

type TransactionMock = {
  get: ReturnType<typeof vi.fn>;
  set: ReturnType<typeof vi.fn>;
};

const firestoreMocks = vi.hoisted(() => {
  const transaction = {
    get: vi.fn(),
    set: vi.fn(),
  };
  return {
    transaction,
    reference: { path: "archive" },
    runTransaction: vi.fn(
      async (
        _database: unknown,
        operation: (transaction: TransactionMock) => Promise<unknown>,
      ) => operation(transaction),
    ),
  };
});

vi.mock("firebase/firestore", () => ({
  collection: vi.fn(),
  deleteDoc: vi.fn(),
  doc: vi.fn(() => firestoreMocks.reference),
  getDocs: vi.fn(),
  getDocFromServer: vi.fn(),
  runTransaction: firestoreMocks.runTransaction,
  serverTimestamp: vi.fn(() => "server-time"),
  setDoc: vi.fn(),
}));

vi.mock("@/lib/firebase/config", () => ({
  getFirebaseDb: () => ({ project: "test" }),
}));

import { createEmptyData } from "@/contexts/resolve-context";
import { hashWorkspace } from "@/features/workspace/lib/recovery";
import { saveCloudSemesterArchive } from "@/lib/firebase/workspace";

beforeEach(() => {
  vi.clearAllMocks();
});

describe("semester archive transaction", () => {
  it("creates one immutable archive with its content hash", async () => {
    const data = createEmptyData("user-1");
    firestoreMocks.transaction.get.mockResolvedValue({
      exists: () => false,
    });

    await expect(saveCloudSemesterArchive("user-1", data)).resolves.toEqual({
      created: true,
    });
    expect(firestoreMocks.transaction.set).toHaveBeenCalledWith(
      firestoreMocks.reference,
      expect.objectContaining({
        archiveVersion: 1,
        workspaceHash: hashWorkspace(data),
        data,
      }),
    );
  });

  it("treats an identical retry as success without rewriting", async () => {
    const data = createEmptyData("user-1");
    firestoreMocks.transaction.get.mockResolvedValue({
      exists: () => true,
      data: () => ({
        workspaceHash: hashWorkspace(data),
        data,
      }),
    });

    await expect(saveCloudSemesterArchive("user-1", data)).resolves.toEqual({
      created: false,
    });
    expect(firestoreMocks.transaction.set).not.toHaveBeenCalled();
  });

  it("refuses to overwrite a different archive with the same semester ID", async () => {
    const data = createEmptyData("user-1");
    firestoreMocks.transaction.get.mockResolvedValue({
      exists: () => true,
      data: () => ({
        workspaceHash: "different",
        data: { semester: { id: data.semester.id } },
      }),
    });

    await expect(saveCloudSemesterArchive("user-1", data)).rejects.toThrow(
      /different archive/,
    );
    expect(firestoreMocks.transaction.set).not.toHaveBeenCalled();
  });
});
