import type { Habit, HabitLog } from "@/types";

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
    return Math.min(
      dates.length,
      Math.max(1, Math.round(habit.targetFrequency)),
    );
  }
  return dates.filter((date) => isHabitScheduledOnDate(habit, date)).length;
}

export function getHabitCompletionCount(
  habit: Habit,
  logs: HabitLog[],
  dates: string[],
): number {
  const dateSet = new Set(dates);
  return logs.filter(
    (log) =>
      log.habitId === habit.id &&
      log.completed &&
      dateSet.has(log.date) &&
      (habit.scheduleType === "times_per_week" ||
        isHabitScheduledOnDate(habit, log.date)),
  ).length;
}

export function getHabitConsistency(
  habit: Habit,
  logs: HabitLog[],
  dates: string[],
): number {
  const target = getHabitTargetCount(habit, dates);
  if (!target) return 0;
  const completed = getHabitCompletionCount(habit, logs, dates);
  return Math.round((Math.min(completed, target) / target) * 100);
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
