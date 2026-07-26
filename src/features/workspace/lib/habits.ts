import type { Habit, HabitLog } from "@/types";
import { getWeekDateKeys, parseLocalDate } from "@/lib/date";

const DAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export function isHabitScheduledOnDate(habit: Habit, date: string): boolean {
  if (!habit.isActive) return false;
  if (habit.scheduleType === "times_per_week") return true;
  const weekday = new Date(`${date}T12:00:00`).getDay();
  return habit.targetDays.includes(weekday);
}

export function getScheduledHabits(habits: Habit[], date: string): Habit[] {
  return habits.filter((habit) => isHabitScheduledOnDate(habit, date));
}

export function getHabitTargetCount(habit: Habit, dates: string[]): number {
  if (habit.scheduleType === "times_per_week") {
    const datesByWeek = groupDatesByWeek(dates);
    const frequency = Math.max(1, Math.round(habit.targetFrequency));
    return [...datesByWeek.values()].reduce(
      (sum, weekDates) => sum + Math.min(weekDates.length, frequency),
      0,
    );
  }
  return dates.filter((date) => isHabitScheduledOnDate(habit, date)).length;
}

function groupDatesByWeek(dates: string[]) {
  const grouped = new Map<string, string[]>();
  for (const date of [...new Set(dates)].sort()) {
    const weekStart = getWeekDateKeys(parseLocalDate(date))[0];
    grouped.set(weekStart, [...(grouped.get(weekStart) ?? []), date]);
  }
  return grouped;
}

export function getHabitCompletionCount(
  habit: Habit,
  logs: HabitLog[],
  dates: string[],
): number {
  const dateSet = new Set(dates);
  return new Set(
    logs
      .filter(
        (log) =>
          log.habitId === habit.id &&
          log.completed &&
          dateSet.has(log.date) &&
          (habit.scheduleType === "times_per_week" ||
            isHabitScheduledOnDate(habit, log.date)),
      )
      .map((log) => log.date),
  ).size;
}

export function getHabitAchievedCount(
  habit: Habit,
  logs: HabitLog[],
  dates: string[],
): number {
  if (habit.scheduleType !== "times_per_week") {
    return Math.min(
      getHabitCompletionCount(habit, logs, dates),
      getHabitTargetCount(habit, dates),
    );
  }
  const datesByWeek = groupDatesByWeek(dates);
  return [...datesByWeek.values()].reduce((sum, weekDates) => {
    const target = Math.min(
      weekDates.length,
      Math.max(1, Math.round(habit.targetFrequency)),
    );
    return (
      sum +
      Math.min(getHabitCompletionCount(habit, logs, weekDates), target)
    );
  }, 0);
}

export function getHabitConsistency(
  habit: Habit,
  logs: HabitLog[],
  dates: string[],
): number {
  const target = getHabitTargetCount(habit, dates);
  if (!target) return 0;
  const completed = getHabitAchievedCount(habit, logs, dates);
  return Math.round((completed / target) * 100);
}

export function getHabitScheduleLabel(habit: Habit): string {
  if (habit.scheduleType === "times_per_week") {
    return `${habit.targetFrequency}× per week · choose any days`;
  }
  if (habit.targetDays.length === 7) return "Every day";
  if (
    habit.targetDays.length === 5 &&
    habit.targetDays.every((day, index) => day === index + 1)
  ) {
    return "Weekdays";
  }
  if (
    habit.targetDays.length === 2 &&
    habit.targetDays[0] === 0 &&
    habit.targetDays[1] === 6
  ) {
    return "Weekends";
  }
  return habit.targetDays.map((day) => DAY_LABELS[day]).join(" · ");
}
