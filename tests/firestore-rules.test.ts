import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import {
  assertFails,
  assertSucceeds,
  initializeTestEnvironment,
  type RulesTestEnvironment,
} from "@firebase/rules-unit-testing";
import {
  deleteDoc,
  doc,
  getDoc,
  setDoc,
  updateDoc,
} from "firebase/firestore";
import { afterAll, beforeAll, beforeEach, describe, it } from "vitest";

const emulatorDescribe = process.env.FIRESTORE_EMULATOR_HOST
  ? describe
  : describe.skip;

emulatorDescribe("Firestore ownership and revision rules", () => {
  let environment: RulesTestEnvironment;

  beforeAll(async () => {
    environment = await initializeTestEnvironment({
      projectId: "resolve-rules-test",
      firestore: {
        rules: readFileSync(
          resolve(process.cwd(), "firestore.rules"),
          "utf8",
        ),
      },
    });
  });

  beforeEach(async () => {
    await environment.clearFirestore();
  });

  afterAll(async () => {
    await environment.cleanup();
  });

  it("permits only sequential owner workspace revisions", async () => {
    const database = environment.authenticatedContext("user-1").firestore();
    const workspace = doc(database, "workspaces/user-1");
    const payload = {
      userId: "user-1",
      schemaVersion: 6,
      revision: 1,
      updatedByClientId: "client-1",
      data: { tasks: [] },
    };

    await assertSucceeds(setDoc(workspace, payload));
    await assertFails(updateDoc(workspace, { revision: 3 }));
    await assertSucceeds(
      setDoc(workspace, { ...payload, revision: 2 }),
    );
    await assertFails(
      setDoc(workspace, {
        ...payload,
        revision: 3,
        userId: "other-user",
      }),
    );
  });

  it("denies anonymous and cross-user workspace access", async () => {
    await environment.withSecurityRulesDisabled(async (context) => {
      await setDoc(doc(context.firestore(), "workspaces/user-1"), {
        userId: "user-1",
        schemaVersion: 6,
        revision: 1,
        updatedByClientId: "client-1",
        data: { tasks: [] },
      });
    });

    await assertFails(
      getDoc(
        doc(environment.unauthenticatedContext().firestore(), "workspaces/user-1"),
      ),
    );
    await assertFails(
      getDoc(
        doc(
          environment.authenticatedContext("user-2").firestore(),
          "workspaces/user-1",
        ),
      ),
    );
  });

  it("blocks every client operation after a trusted deletion marker exists", async () => {
    await environment.withSecurityRulesDisabled(async (context) => {
      await setDoc(doc(context.firestore(), "accountDeletions/user-1"), {
        userId: "user-1",
        status: "deleting",
      });
    });
    const database = environment.authenticatedContext("user-1").firestore();

    await assertFails(
      setDoc(doc(database, "workspaces/user-1"), {
        userId: "user-1",
        schemaVersion: 6,
        revision: 1,
        updatedByClientId: "client-1",
        data: { tasks: [] },
      }),
    );
    await assertFails(getDoc(doc(database, "accountDeletions/user-1")));
    await assertFails(
      setDoc(doc(database, "accountDeletions/user-1"), {
        userId: "user-1",
        status: "deleted",
      }),
    );
    await assertFails(
      updateDoc(doc(database, "accountDeletions/user-1"), {
        status: "deleted",
      }),
    );
    await assertFails(
      deleteDoc(doc(database, "accountDeletions/user-1")),
    );
  });

  it("allows a valid archive create but never a client overwrite", async () => {
    const database = environment.authenticatedContext("user-1").firestore();
    const archive = doc(
      database,
      "workspaces/user-1/semesterArchives/semester-1",
    );
    const payload = {
      userId: "user-1",
      schemaVersion: 6,
      archiveVersion: 1,
      semesterId: "semester-1",
      semesterName: "Semester 1",
      workspaceHash: "abc123",
      data: { semester: { id: "semester-1" } },
    };

    await assertSucceeds(setDoc(archive, payload));
    await assertFails(setDoc(archive, payload));
    await assertSucceeds(deleteDoc(archive));
  });

  it("allows valid owner recovery snapshots to be created and deleted", async () => {
    const database = environment.authenticatedContext("user-1").firestore();
    const snapshot = doc(
      database,
      "workspaces/user-1/recoverySnapshots/snapshot-1",
    );

    await assertSucceeds(
      setDoc(snapshot, {
        id: "snapshot-1",
        userId: "user-1",
        schemaVersion: 6,
        createdAt: "2026-07-27T00:00:00.000Z",
        workspaceHash: "abc123",
        reason: "migration",
        payload: { tasks: [] },
      }),
    );
    await assertFails(
      updateDoc(snapshot, { workspaceHash: "overwritten" }),
    );
    await assertSucceeds(deleteDoc(snapshot));
  });
});
