import { describe, expect, it } from "vitest";
import { getScheduledHabits } from "@/features/workspace/lib/habits";
import type { Habit } from "@/types";

describe("workspace habit schedule", () => {
  it("returns only active habits scheduled for the requested day", () => {
    const habits = [
      { id: "daily", isActive: true, targetDays: [0, 1, 2, 3, 4, 5, 6] },
      { id: "weekday", isActive: true, targetDays: [1, 2, 3, 4, 5] },
      { id: "inactive", isActive: false, targetDays: [0] },
    ] as Habit[];

    expect(
      getScheduledHabits(habits, "2026-07-26").map((habit) => habit.id),
    ).toEqual(["daily"]);
    expect(
      getScheduledHabits(habits, "2026-07-27").map((habit) => habit.id),
    ).toEqual(["daily", "weekday"]);
  });
});
