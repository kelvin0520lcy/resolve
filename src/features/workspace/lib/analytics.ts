import type {
  Goal,
  GuitarPracticeSession,
  Milestone,
  ModuleStudyLog,
  Task,
  WorkspaceEvent,
} from "@/types";
import {
  getTaskEstimatedMinutes,
  getTaskScheduleDate,
} from "@/features/workspace/lib/deadlines";
import { expandEvents } from "@/features/workspace/lib/events";

export type DateRange = {
  startDate: string;
  endDate: string;
};

export type DailyCapacitySummary = {
  date: string;
  configuredTaskCapacityMinutes: number;
  scheduledTaskMinutes: number;
  fixedEventMinutes: number;
  remainingTaskCapacityMinutes: number;
  isOverloaded: boolean;
};

export function getDailyCapacitySummary({
  date,
  capacityMinutes,
  tasks,
  events,
}: {
  date: string;
  capacityMinutes: number;
  tasks: Task[];
  events: WorkspaceEvent[];
}): DailyCapacitySummary {
  const scheduledTaskMinutes = tasks
    .filter((task) => !["cancelled", "skipped"].includes(task.status))
    .reduce((sum, task) => {
      const taskDate = getTaskScheduleDate(task);
      const duration = getTaskEstimatedMinutes(task) ?? 0;
      if (!taskDate || !duration) return sum;
      if (!task.schedule?.startTime) {
        return taskDate === date ? sum + duration : sum;
      }
      const start =
        Number(task.schedule.startTime.slice(0, 2)) * 60 +
        Number(task.schedule.startTime.slice(3, 5));
      const firstDayMinutes = Math.min(duration, 1440 - start);
      if (taskDate === date) return sum + firstDayMinutes;
      const nextDate = new Date(`${taskDate}T12:00:00Z`);
      nextDate.setUTCDate(nextDate.getUTCDate() + 1);
      return nextDate.toISOString().slice(0, 10) === date
        ? sum + Math.max(0, duration - firstDayMinutes)
        : sum;
    }, 0);
  const fixedEventMinutes = expandEvents(events, date, date).reduce(
    (sum, event) => sum + (event.durationMinutes ?? 0),
    0,
  );
  const usedMinutes = scheduledTaskMinutes + fixedEventMinutes;
  return {
    date,
    configuredTaskCapacityMinutes: capacityMinutes,
    scheduledTaskMinutes,
    fixedEventMinutes,
    remainingTaskCapacityMinutes: Math.max(0, capacityMinutes - usedMinutes),
    isOverloaded: usedMinutes > capacityMinutes,
  };
}

export function getTasksInRange(tasks: Task[], range: DateRange) {
  return tasks.filter((task) => {
    const date = getTaskScheduleDate(task);
    return (
      date !== undefined &&
      date >= range.startDate &&
      date <= range.endDate &&
      !["cancelled", "skipped"].includes(task.status)
    );
  });
}

export function getModuleStudyMinutes(
  moduleId: string,
  logs: ModuleStudyLog[],
  tasks: Task[],
  range: DateRange,
) {
  const manualMinutes = logs
    .filter(
      (log) =>
        log.moduleId === moduleId &&
        log.date >= range.startDate &&
        log.date <= range.endDate &&
        !log.sourceTaskId,
    )
    .reduce((sum, log) => sum + log.minutes, 0);
  const taskMinutes = tasks
    .filter(
      (task) =>
        (task.moduleId === moduleId ||
          (task.origin?.kind === "assessment-preparation" &&
            task.origin.moduleId === moduleId)) &&
        task.status === "completed" &&
        (task.completedAt?.slice(0, 10) ?? getTaskScheduleDate(task)) !==
          undefined &&
        (task.completedAt?.slice(0, 10) ?? getTaskScheduleDate(task))! >=
          range.startDate &&
        (task.completedAt?.slice(0, 10) ?? getTaskScheduleDate(task))! <=
          range.endDate,
    )
    .reduce((sum, task) => sum + (task.actualMinutes ?? 0), 0);
  return manualMinutes + taskMinutes;
}

export function getPlannedMinutesByCategory(
  tasks: Task[],
  range?: DateRange,
): Record<string, number> {
  const totals: Record<string, number> = {};
  for (const task of range ? getTasksInRange(tasks, range) : tasks) {
    totals[task.category] =
      (totals[task.category] ?? 0) + (getTaskEstimatedMinutes(task) ?? 0);
  }
  return totals;
}

export function getActualMinutesByCategory(
  tasks: Task[],
  guitarSessions: GuitarPracticeSession[],
  range?: DateRange,
): Record<string, number> {
  const totals: Record<string, number> = {};
  for (const task of tasks) {
    if (["cancelled", "skipped"].includes(task.status)) continue;
    const activityDate =
      task.completedAt?.slice(0, 10) ?? getTaskScheduleDate(task);
    if (
      range &&
      (!activityDate ||
        activityDate < range.startDate ||
        activityDate > range.endDate)
    ) {
      continue;
    }
    if (task.actualMinutes) {
      totals[task.category] =
        (totals[task.category] ?? 0) + task.actualMinutes;
    }
  }
  for (const session of guitarSessions) {
    if (
      range &&
      (session.date < range.startDate || session.date > range.endDate)
    ) {
      continue;
    }
    totals.guitar = (totals.guitar ?? 0) + session.durationMinutes;
  }
  return totals;
}

export function getAverageGoalProgress(
  goals: Goal[],
  milestones: Milestone[],
) {
  const relevantGoals = goals.filter(
    (goal) => !["paused", "abandoned"].includes(goal.status),
  );
  if (!relevantGoals.length) return undefined;
  const total = relevantGoals.reduce((sum, goal) => {
    if (goal.status === "completed") return sum + 100;
    if (goal.measurementType === "milestone") {
      const breakdown = milestones.filter(
        (milestone) => milestone.goalId === goal.id,
      );
      return (
        sum +
        (breakdown.length
          ? (breakdown.filter((milestone) => milestone.completed).length /
              breakdown.length) *
            100
          : 0)
      );
    }
    if (
      goal.measurementType !== "manual" &&
      goal.targetValue !== undefined &&
      goal.targetValue > 0
    ) {
      return (
        sum +
        Math.min(100, ((goal.currentValue ?? 0) / goal.targetValue) * 100)
      );
    }
    return sum;
  }, 0);
  return Math.round(total / relevantGoals.length);
}

export function getTrackedMinutesByCategory(
  tasks: Task[],
  guitarSessions: GuitarPracticeSession[],
  range?: DateRange,
): Record<string, number> {
  const totals: Record<string, number> = {};

  for (const task of range ? getTasksInRange(tasks, range) : tasks) {
    totals[task.category] =
      (totals[task.category] ?? 0) +
      (task.actualMinutes ?? getTaskEstimatedMinutes(task) ?? 0);
  }
  for (const session of guitarSessions.filter(
    (candidate) =>
      !range ||
      (candidate.date >= range.startDate && candidate.date <= range.endDate),
  )) {
    totals.guitar = (totals.guitar ?? 0) + session.durationMinutes;
  }

  return totals;
}
