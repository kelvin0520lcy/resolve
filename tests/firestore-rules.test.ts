import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const rules = readFileSync(
  resolve(process.cwd(), "firestore.rules"),
  "utf8",
);

describe("Firestore ownership rules", () => {
  it("uses explicit workspace paths instead of a broad root wildcard", () => {
    expect(rules).toContain("match /workspaces/{userId}");
    expect(rules).toContain("request.resource.data.schemaVersion == 6");
    expect(rules).toContain("request.resource.data.revision == resource.data.revision + 1");
    expect(rules).not.toContain("match /{collection}/{docId}");
  });

  it("keeps snapshots immutable and owner-scoped", () => {
    expect(rules).toContain(
      "match /workspaces/{userId}/recoverySnapshots/{snapshotId}",
    );
    expect(rules).toContain("request.resource.data.id == snapshotId");
    expect(rules).toContain("allow update: if false;");
  });
});
