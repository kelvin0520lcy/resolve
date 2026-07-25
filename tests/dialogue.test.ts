import { describe, expect, it } from "vitest";
import {
  resolveCharacterState,
  type DialogueContext,
} from "@/lib/character/dialogue";

const BASE: DialogueContext = {
  tasksCompletedToday: 1,
  tasksTotalToday: 3,
  overdueTasks: 0,
  upcomingDeadlines: 0,
  habitStreak: 2,
  weeklyWorkloadHours: 20,
  hourOfDay: 14,
};

describe("resolveCharacterState", () => {
  it.each([
    [{ weeklyWorkloadHours: 51 }, "overwhelmed", "excessive_weekly_workload"],
    [{ overdueTasks: 3 }, "concerned", "multiple_overdue_tasks"],
    [{ upcomingDeadlines: 3 }, "nervous", "upcoming_deadlines"],
    [
      { tasksCompletedToday: 3, tasksTotalToday: 3 },
      "happy",
      "all_tasks_complete",
    ],
    [{ habitStreak: 7 }, "proud", "habit_streak"],
  ])(
    "selects %s as %s",
    (override, expression, triggerReason) => {
      expect(resolveCharacterState({ ...BASE, ...override })).toMatchObject({
        expression,
        triggerReason,
      });
    },
  );

  it("prioritizes urgent overload signals over positive signals", () => {
    expect(
      resolveCharacterState({
        ...BASE,
        weeklyWorkloadHours: 60,
        overdueTasks: 8,
        tasksCompletedToday: 3,
        tasksTotalToday: 3,
      }).expression,
    ).toBe("overwhelmed");
  });

  it("uses the morning greeting before 10", () => {
    expect(resolveCharacterState({ ...BASE, hourOfDay: 9 })).toMatchObject({
      expression: "neutral",
      triggerReason: "morning_greeting",
      scene: "bedroom",
    });
  });

  it("falls back to the neutral scene", () => {
    expect(resolveCharacterState(BASE)).toMatchObject({
      expression: "neutral",
      triggerReason: "default",
      scene: "neutral",
    });
  });
});
