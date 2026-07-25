import type { Habit } from "@/types";

export function getScheduledHabits(habits: Habit[], date: string): Habit[] {
  const weekday = new Date(`${date}T12:00:00`).getDay();
  return habits.filter(
    (habit) => habit.isActive && habit.targetDays.includes(weekday),
  );
}
