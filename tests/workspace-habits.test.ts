import { describe, expect, it } from "vitest";
import {
  getHabitCompletionCount,
  getHabitConsistency,
  getHabitScheduleLabel,
  getHabitTargetCount,
  getScheduledHabits,
} from "@/features/workspace/lib/habits";
import type { Habit, HabitLog } from "@/types";

function habit(
  id: string,
  overrides: Partial<Habit> = {},
): Habit {
  return {
    id,
    userId: "user-1",
    semesterId: "semester-1",
    title: id,
    category: "personal",
    measurementType: "boolean",
    scheduleType: "days_of_week",
    targetDays: [0, 1, 2, 3, 4, 5, 6],
    targetFrequency: 7,
    isActive: true,
    ...overrides,
  };
}

describe("workspace habit schedule", () => {
  it("returns only active habits scheduled for the requested day", () => {
    const habits = [
      habit("daily"),
      habit("weekday", {
        targetDays: [1, 2, 3, 4, 5],
        targetFrequency: 5,
      }),
      habit("inactive", {
        targetDays: [0],
        targetFrequency: 1,
        isActive: false,
      }),
      habit("flexible", {
        scheduleType: "times_per_week",
        targetDays: [],
        targetFrequency: 2,
      }),
    ];

    expect(
      getScheduledHabits(habits, "2026-07-26").map((habit) => habit.id),
    ).toEqual(["daily", "flexible"]);
    expect(
      getScheduledHabits(habits, "2026-07-27").map((habit) => habit.id),
    ).toEqual(["daily", "weekday", "flexible"]);
  });

  it("caps flexible weekly consistency at 100% once frequency is achieved", () => {
    const flexible = habit("flexible", {
      scheduleType: "times_per_week",
      targetDays: [],
      targetFrequency: 2,
    });
    const dates = [
      "2026-07-20",
      "2026-07-21",
      "2026-07-22",
      "2026-07-23",
      "2026-07-24",
      "2026-07-25",
      "2026-07-26",
    ];
    const logs = ["2026-07-20", "2026-07-22", "2026-07-24"].map(
      (date, index) =>
        ({
          id: `log-${index}`,
          habitId: flexible.id,
          userId: "user-1",
          date,
          completed: true,
        }) satisfies HabitLog,
    );

    expect(getHabitTargetCount(flexible, dates)).toBe(2);
    expect(getHabitCompletionCount(flexible, logs, dates)).toBe(3);
    expect(getHabitConsistency(flexible, logs, dates)).toBe(100);
    expect(getHabitScheduleLabel(flexible)).toBe(
      "2× per week · choose any days",
    );
  });

  it("counts only selected weekdays for a fixed schedule", () => {
    const selected = habit("selected", {
      targetDays: [1, 3],
      targetFrequency: 2,
    });
    const dates = [
      "2026-07-20",
      "2026-07-21",
      "2026-07-22",
      "2026-07-23",
      "2026-07-24",
      "2026-07-25",
      "2026-07-26",
    ];
    const logs: HabitLog[] = [
      {
        id: "monday",
        habitId: selected.id,
        userId: "user-1",
        date: "2026-07-20",
        completed: true,
      },
      {
        id: "off-day",
        habitId: selected.id,
        userId: "user-1",
        date: "2026-07-21",
        completed: true,
      },
    ];

    expect(getHabitTargetCount(selected, dates)).toBe(2);
    expect(getHabitCompletionCount(selected, logs, dates)).toBe(1);
    expect(getHabitConsistency(selected, logs, dates)).toBe(50);
    expect(getHabitScheduleLabel(selected)).toBe("Mon · Wed");
  });
});
