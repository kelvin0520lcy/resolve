import { describe, expect, it } from "vitest";
import { getTrackedMinutesByCategory } from "@/features/workspace/lib/analytics";
import type { GuitarPracticeSession, Task } from "@/types";

describe("workspace analytics", () => {
  it("uses actual task time when available and includes guitar sessions", () => {
    const tasks = [
      {
        id: "task-1",
        category: "academics",
        estimatedMinutes: 60,
        actualMinutes: 45,
      },
      {
        id: "task-2",
        category: "guitar",
        estimatedMinutes: 20,
      },
    ] as Task[];
    const sessions = [
      {
        id: "session-1",
        category: "Technique",
        durationMinutes: 30,
      },
    ] as GuitarPracticeSession[];

    expect(getTrackedMinutesByCategory(tasks, sessions)).toEqual({
      academics: 45,
      guitar: 50,
    });
  });
});
