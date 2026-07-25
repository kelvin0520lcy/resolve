import {
  doc,
  getDocFromServer,
  serverTimestamp,
  setDoc,
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
    },
  };
}

export async function saveWorkspace<T>(userId: string, data: T) {
  const reference = doc(getFirebaseDb(), WORKSPACE_COLLECTION, userId);
  await setDoc(reference, {
    userId,
    schemaVersion: WORKSPACE_SCHEMA_VERSION,
    data: serializable(data),
    updatedAt: serverTimestamp(),
  });
}
