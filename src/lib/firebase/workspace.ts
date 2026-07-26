import {
  collection,
  deleteDoc,
  doc,
  getDocs,
  getDocFromServer,
  runTransaction,
  serverTimestamp,
  setDoc,
} from "firebase/firestore";
import { getFirebaseDb } from "@/lib/firebase/config";
import {
  mergeWorkspacePatches,
  type WorkspaceConflict,
  type WorkspacePatch,
} from "@/features/workspace/lib/patches";
import {
  CURRENT_WORKSPACE_SCHEMA_VERSION,
} from "@/features/workspace/lib/migrations";
import type { RecoverySnapshot } from "@/features/workspace/lib/recovery";
import type { ResolveData } from "@/features/workspace/types";

export const WORKSPACE_COLLECTION = "workspaces";
export const WORKSPACE_SCHEMA_VERSION = CURRENT_WORKSPACE_SCHEMA_VERSION;

export type WorkspaceSchemaCompatibility =
  | "current"
  | "upgrade"
  | "unsupported";

export type WorkspaceSnapshot<T> = {
  data: T;
  schemaVersion: number;
  revision: number;
  updatedByClientId?: string;
};

export type WorkspaceReadResult<T> =
  | { kind: "missing" }
  | { kind: "value"; snapshot: WorkspaceSnapshot<T> };

export function getWorkspaceSchemaCompatibility(
  schemaVersion: number,
): WorkspaceSchemaCompatibility {
  if (schemaVersion === WORKSPACE_SCHEMA_VERSION) return "current";
  return schemaVersion < WORKSPACE_SCHEMA_VERSION
    ? "upgrade"
    : "unsupported";
}

function serializable<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

export async function loadWorkspace<T>(
  userId: string,
): Promise<WorkspaceReadResult<T>> {
  const reference = doc(getFirebaseDb(), WORKSPACE_COLLECTION, userId);
  const snapshot = await getDocFromServer(reference);

  if (!snapshot.exists()) return { kind: "missing" };

  const value = snapshot.data();
  if (value.userId !== userId || !value.data) {
    throw new Error("The workspace document is malformed.");
  }

  return {
    kind: "value",
    snapshot: {
      data: value.data as T,
      schemaVersion:
        typeof value.schemaVersion === "number" ? value.schemaVersion : 0,
      revision:
        typeof value.revision === "number" ? Math.max(0, value.revision) : 0,
      updatedByClientId:
        typeof value.updatedByClientId === "string"
          ? value.updatedByClientId
          : undefined,
    },
  };
}

export async function saveWorkspace<T>(
  userId: string,
  data: T,
  revision = 1,
  clientId = "legacy-client",
) {
  const reference = doc(getFirebaseDb(), WORKSPACE_COLLECTION, userId);
  await setDoc(reference, {
    userId,
    schemaVersion: WORKSPACE_SCHEMA_VERSION,
    revision,
    updatedByClientId: clientId,
    data: serializable(data),
    updatedAt: serverTimestamp(),
  });
}

export class WorkspaceConflictError extends Error {
  constructor(
    readonly conflicts: WorkspaceConflict[],
    readonly remoteData: ResolveData,
    readonly mergedData: ResolveData,
    readonly remoteRevision: number,
  ) {
    super("Some fields changed on another device and need your review.");
    this.name = "WorkspaceConflictError";
  }
}

export type WorkspaceTransactionResult = {
  data: ResolveData;
  revision: number;
  patchesApplied: number;
};

export async function syncWorkspaceTransaction({
  userId,
  localData,
  baseRevision,
  patches,
  clientId,
}: {
  userId: string;
  localData: ResolveData;
  baseRevision: number;
  patches: WorkspacePatch[];
  clientId: string;
}): Promise<WorkspaceTransactionResult> {
  const database = getFirebaseDb();
  const reference = doc(database, WORKSPACE_COLLECTION, userId);
  return runTransaction(database, async (transaction) => {
    const snapshot = await transaction.get(reference);
    let nextData = serializable(localData);
    let remoteRevision = 0;

    if (snapshot.exists()) {
      const value = snapshot.data();
      if (value.userId !== userId || !value.data) {
        throw new Error("The cloud workspace is malformed.");
      }
      const schemaVersion =
        typeof value.schemaVersion === "number" ? value.schemaVersion : 0;
      if (schemaVersion > WORKSPACE_SCHEMA_VERSION) {
        throw new Error(
          "This workspace was saved by a newer Resolve version. Update the app before syncing.",
        );
      }
      if (schemaVersion < WORKSPACE_SCHEMA_VERSION) {
        throw new Error(
          "The cloud workspace needs to be migrated before changes can sync.",
        );
      }
      remoteRevision =
        typeof value.revision === "number" ? Math.max(0, value.revision) : 0;
      if (remoteRevision !== baseRevision) {
        const remoteData = value.data as ResolveData;
        const merged = mergeWorkspacePatches(remoteData, patches);
        if (merged.conflicts.length) {
          throw new WorkspaceConflictError(
            merged.conflicts,
            remoteData,
            merged.data,
            remoteRevision,
          );
        }
        nextData = serializable(merged.data);
      }
    }

    const revision = remoteRevision + 1;
    transaction.set(reference, {
      userId,
      schemaVersion: WORKSPACE_SCHEMA_VERSION,
      revision,
      updatedByClientId: clientId,
      data: nextData,
      updatedAt: serverTimestamp(),
    });
    return {
      data: nextData,
      revision,
      patchesApplied: patches.length,
    };
  });
}

export async function upgradeWorkspaceTransaction({
  userId,
  expectedRevision,
  data,
  clientId,
}: {
  userId: string;
  expectedRevision: number;
  data: ResolveData;
  clientId: string;
}) {
  const database = getFirebaseDb();
  const reference = doc(database, WORKSPACE_COLLECTION, userId);
  return runTransaction(database, async (transaction) => {
    const snapshot = await transaction.get(reference);
    if (!snapshot.exists()) {
      throw new Error("The cloud workspace disappeared during migration.");
    }
    const value = snapshot.data();
    const revision =
      typeof value.revision === "number" ? Math.max(0, value.revision) : 0;
    if (revision !== expectedRevision) {
      throw new Error(
        "The cloud workspace changed during migration. Reload before retrying.",
      );
    }
    const nextRevision = revision + 1;
    transaction.set(reference, {
      userId,
      schemaVersion: WORKSPACE_SCHEMA_VERSION,
      revision: nextRevision,
      updatedByClientId: clientId,
      data: serializable(data),
      updatedAt: serverTimestamp(),
    });
    return { data, revision: nextRevision };
  });
}

function recoveryCollection(userId: string) {
  return collection(
    getFirebaseDb(),
    WORKSPACE_COLLECTION,
    userId,
    "recoverySnapshots",
  );
}

export async function saveCloudRecoverySnapshot(
  userId: string,
  snapshot: RecoverySnapshot,
) {
  const reference = doc(recoveryCollection(userId), snapshot.id);
  await setDoc(reference, {
    ...serializable(snapshot),
    userId,
    updatedAt: serverTimestamp(),
  });
  const snapshots = await loadCloudRecoverySnapshots(userId);
  await Promise.all(
    snapshots
      .slice(4)
      .map((item) => deleteCloudRecoverySnapshot(userId, item.id)),
  );
}

export async function loadCloudRecoverySnapshots(userId: string) {
  const results = await getDocs(recoveryCollection(userId));
  return results.docs
    .map((item) => item.data() as RecoverySnapshot & { userId?: string })
    .filter((item) => item.userId === userId)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export async function deleteCloudRecoverySnapshot(
  userId: string,
  snapshotId: string,
) {
  await deleteDoc(doc(recoveryCollection(userId), snapshotId));
}

export async function saveCloudSemesterArchive(
  userId: string,
  data: ResolveData,
) {
  const reference = doc(
    getFirebaseDb(),
    WORKSPACE_COLLECTION,
    userId,
    "semesterArchives",
    data.semester.id,
  );
  await setDoc(reference, {
    userId,
    schemaVersion: WORKSPACE_SCHEMA_VERSION,
    semesterId: data.semester.id,
    semesterName: data.semester.name,
    archivedAt: serverTimestamp(),
    data: serializable(data),
  });
}
