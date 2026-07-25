import { describe, expect, it } from "vitest";
import { getCharacterTask } from "@/lib/character-tasks";
import type { Task } from "@/types";

function task(
  id: string,
  title: string,
  category: string,
  scheduledDate: string,
): Task {
  return {
    id,
    title,
    category,
    scheduledDate,
    userId: "user-1",
    semesterId: "semester-1",
    priority: "medium",
    status: "planned",
    createdAt: "2026-07-24T00:00:00.000Z",
    updatedAt: "2026-07-24T00:00:00.000Z",
  };
}

describe("member-aware task dialogue", () => {
  it("selects only the nearest task related to the member", () => {
    const result = getCharacterTask("bocchi", [
      task("career", "Send application", "career", "2026-07-24"),
      task("guitar-later", "Practise chorus", "guitar", "2026-07-28"),
      task("guitar-next", "Warm up bends", "guitar", "2026-07-25"),
    ]);

    expect(result.task?.id).toBe("guitar-next");
    expect(result.related).toBe(true);
    expect(result.dialogue).toContain("Warm up bends");
  });

  it("reframes an unrelated task in the member's personality", () => {
    const result = getCharacterTask("ryo", [
      task("guitar", "Change guitar strings", "guitar", "2026-07-25"),
    ]);

    expect(result.related).toBe(false);
    expect(result.dialogue).toContain("measurable");
    expect(result.dialogue).toContain("Change guitar strings");
  });

  it("uses a useful member-specific empty message without inventing a task", () => {
    const result = getCharacterTask("kita", []);
    expect(result.task).toBeNull();
    expect(result.dialogue).toContain("spotlight");
  });

  it("ignores completed tasks", () => {
    const completed = task(
      "done",
      "Completed graph review",
      "academics",
      "2026-07-24",
    );
    completed.status = "completed";
    expect(getCharacterTask("ryo", [completed]).task).toBeNull();
  });
});
