import {
  doc,
  onSnapshot,
  serverTimestamp,
  setDoc,
  type Unsubscribe,
} from "firebase/firestore";
import { getFirebaseDb } from "@/lib/firebase/config";

export const WORKSPACE_COLLECTION = "workspaces";
export const WORKSPACE_SCHEMA_VERSION = 3;

export type WorkspaceSchemaCompatibility =
  | "current"
  | "upgrade"
  | "unsupported";

export type WorkspaceSnapshot<T> = {
  data: T;
  schemaVersion: number;
  hasPendingWrites: boolean;
  fromCache: boolean;
};

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

export function subscribeToWorkspace<T>(
  userId: string,
  onValue: (snapshot: WorkspaceSnapshot<T>) => void,
  onMissing: () => void,
  onError: (error: Error) => void,
): Unsubscribe {
  const reference = doc(getFirebaseDb(), WORKSPACE_COLLECTION, userId);

  return onSnapshot(
    reference,
    { includeMetadataChanges: true },
    (snapshot) => {
      if (!snapshot.exists()) {
        // An empty cache is not proof that the server document is missing.
        // Wait for a server-backed snapshot before creating a workspace.
        if (!snapshot.metadata.fromCache) onMissing();
        return;
      }

      const value = snapshot.data();
      if (value.userId !== userId || !value.data) {
        onError(new Error("The workspace document is malformed."));
        return;
      }

      onValue({
        data: value.data as T,
        schemaVersion:
          typeof value.schemaVersion === "number" ? value.schemaVersion : 0,
        hasPendingWrites: snapshot.metadata.hasPendingWrites,
        fromCache: snapshot.metadata.fromCache,
      });
    },
    (error) => onError(error),
  );
}

export async function saveWorkspace<T>(userId: string, data: T) {
  const reference = doc(getFirebaseDb(), WORKSPACE_COLLECTION, userId);
  await setDoc(
    reference,
    {
      userId,
      schemaVersion: WORKSPACE_SCHEMA_VERSION,
      data: serializable(data),
      updatedAt: serverTimestamp(),
    },
    { merge: true },
  );
}
