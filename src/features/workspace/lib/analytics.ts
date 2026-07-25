import type { GuitarPracticeSession, Task } from "@/types";

export function getTrackedMinutesByCategory(
  tasks: Task[],
  guitarSessions: GuitarPracticeSession[],
): Record<string, number> {
  const totals: Record<string, number> = {};

  for (const task of tasks) {
    totals[task.category] =
      (totals[task.category] ?? 0) +
      (task.actualMinutes ?? task.estimatedMinutes ?? 0);
  }
  for (const session of guitarSessions) {
    totals.guitar = (totals.guitar ?? 0) + session.durationMinutes;
  }

  return totals;
}
