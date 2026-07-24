import { isDateKey, offsetDate } from "@/lib/date";
import type { ResolveData } from "@/contexts/resolve-context";
import type {
  Goal,
  GuitarPracticeSession,
  Reflection,
  Semester,
  Task,
} from "@/types";

export type NewTaskInput = Pick<Task, "title" | "category" | "priority"> &
  Partial<
    Pick<Task, "scheduledDate" | "deadline" | "estimatedMinutes" | "goalId">
  >;

export type NewGoalInput = Pick<
  Goal,
  "title" | "description" | "category" | "priority" | "targetValue" | "unit"
> &
  Partial<Pick<Goal, "deadline" | "motivation">>;

export type MutationMeta = {
  identity: string;
  id?: string;
  timestamp?: string;
};

function mutationId(meta: MutationMeta) {
  return meta.id ?? crypto.randomUUID();
}

function mutationTime(meta: MutationMeta) {
  return meta.timestamp ?? new Date().toISOString();
}

export function addTaskToData(
  current: ResolveData,
  task: NewTaskInput,
  meta: MutationMeta,
): ResolveData {
  const cleanTitle = task.title.trim();
  if (!cleanTitle) return current;
  const requestedMinutes = Number.isFinite(task.estimatedMinutes)
    ? task.estimatedMinutes!
    : 30;
  const timestamp = mutationTime(meta);

  return {
    ...current,
    tasks: [
      ...current.tasks,
      {
        ...task,
        title: cleanTitle,
        id: mutationId(meta),
        userId: meta.identity,
        semesterId: current.semester.id,
        scheduledDate: isDateKey(task.scheduledDate)
          ? task.scheduledDate
          : offsetDate(0),
        deadline: isDateKey(task.deadline) ? task.deadline : undefined,
        estimatedMinutes: Math.min(
          720,
          Math.max(5, Math.round(requestedMinutes)),
        ),
        status: "planned",
        createdAt: timestamp,
        updatedAt: timestamp,
      },
    ],
  };
}

export function toggleTaskInData(
  current: ResolveData,
  taskId: string,
  timestamp = new Date().toISOString(),
): ResolveData {
  if (!current.tasks.some((task) => task.id === taskId)) return current;
  return {
    ...current,
    tasks: current.tasks.map((task) =>
      task.id === taskId
        ? {
            ...task,
            status: task.status === "completed" ? "planned" : "completed",
            completedAt: task.status === "completed" ? undefined : timestamp,
            updatedAt: timestamp,
          }
        : task,
    ),
  };
}

export function moveTaskInData(
  current: ResolveData,
  taskId: string,
  scheduledDate: string,
  timestamp = new Date().toISOString(),
): ResolveData {
  if (
    !isDateKey(scheduledDate) ||
    !current.tasks.some((task) => task.id === taskId)
  ) {
    return current;
  }
  return {
    ...current,
    tasks: current.tasks.map((task) =>
      task.id === taskId
        ? {
            ...task,
            scheduledDate,
            status: task.status === "completed" ? "completed" : "rescheduled",
            updatedAt: timestamp,
          }
        : task,
    ),
  };
}

export function addGoalToData(
  current: ResolveData,
  goal: NewGoalInput,
  meta: MutationMeta,
): ResolveData {
  const cleanTitle = goal.title.trim();
  const cleanDescription = goal.description.trim();
  if (!cleanTitle || !cleanDescription) return current;
  const targetValue = Number.isFinite(goal.targetValue)
    ? Math.max(1, goal.targetValue!)
    : 1;
  const timestamp = mutationTime(meta);

  return {
    ...current,
    goals: [
      ...current.goals,
      {
        ...goal,
        title: cleanTitle,
        description: cleanDescription,
        targetValue,
        deadline: isDateKey(goal.deadline) ? goal.deadline : undefined,
        id: mutationId(meta),
        userId: meta.identity,
        semesterId: current.semester.id,
        measurementType: "count",
        currentValue: 0,
        startDate: offsetDate(0),
        status: "active",
        createdAt: timestamp,
        updatedAt: timestamp,
      },
    ],
  };
}

export function updateGoalProgressInData(
  current: ResolveData,
  goalId: string,
  progress: number,
  timestamp = new Date().toISOString(),
): ResolveData {
  if (
    !Number.isFinite(progress) ||
    !current.goals.some((goal) => goal.id === goalId)
  ) {
    return current;
  }
  return {
    ...current,
    goals: current.goals.map((goal) => {
      if (goal.id !== goalId) return goal;
      const target =
        Number.isFinite(goal.targetValue) && (goal.targetValue ?? 0) > 0
          ? goal.targetValue!
          : Math.max(1, progress);
      const currentValue = Math.max(0, Math.min(progress, target));
      return {
        ...goal,
        currentValue,
        status:
          currentValue >= target
            ? "completed"
            : goal.status === "completed"
              ? "active"
              : goal.status,
        updatedAt: timestamp,
      };
    }),
  };
}

export function toggleHabitInData(
  current: ResolveData,
  habitId: string,
  date: string,
  meta: MutationMeta,
): ResolveData {
  if (
    !isDateKey(date) ||
    !current.habits.some((habit) => habit.id === habitId)
  ) {
    return current;
  }
  const existing = current.habitLogs.find(
    (log) => log.habitId === habitId && log.date === date,
  );
  return {
    ...current,
    habitLogs: existing
      ? current.habitLogs.map((log) =>
          log.id === existing.id
            ? { ...log, completed: !log.completed }
            : log,
        )
      : [
          ...current.habitLogs,
          {
            id: mutationId(meta),
            habitId,
            userId: meta.identity,
            date,
            completed: true,
          },
        ],
  };
}

export function addGuitarSessionToData(
  current: ResolveData,
  session: Omit<GuitarPracticeSession, "id" | "userId" | "semesterId">,
  meta: MutationMeta,
): ResolveData {
  if (
    !isDateKey(session.date) ||
    !Number.isFinite(session.durationMinutes) ||
    session.durationMinutes <= 0
  ) {
    return current;
  }
  return {
    ...current,
    guitarSessions: [
      {
        ...session,
        durationMinutes: Math.min(
          720,
          Math.max(5, Math.round(session.durationMinutes)),
        ),
        cleanBpm:
          session.cleanBpm === undefined || !Number.isFinite(session.cleanBpm)
            ? undefined
            : Math.min(400, Math.max(20, Math.round(session.cleanBpm))),
        id: mutationId(meta),
        userId: meta.identity,
        semesterId: current.semester.id,
      },
      ...current.guitarSessions,
    ],
  };
}

export function saveReflectionToData(
  current: ResolveData,
  reflection: Omit<
    Reflection,
    "id" | "userId" | "semesterId" | "createdAt"
  >,
  meta: MutationMeta,
): ResolveData {
  if (
    !isDateKey(reflection.periodStart) ||
    !isDateKey(reflection.periodEnd) ||
    reflection.periodEnd < reflection.periodStart ||
    ![
      reflection.wins,
      reflection.difficulties,
      reflection.lessons,
      reflection.nextChanges,
    ].some((entry) => entry?.trim())
  ) {
    return current;
  }
  return {
    ...current,
    reflections: [
      {
        ...reflection,
        id: mutationId(meta),
        userId: meta.identity,
        semesterId: current.semester.id,
        createdAt: mutationTime(meta),
      },
      ...current.reflections,
    ],
  };
}

export function updateSemesterInData(
  current: ResolveData,
  semester: Semester,
  identity: string,
): ResolveData {
  if (
    !isDateKey(semester.startDate) ||
    !isDateKey(semester.endDate) ||
    semester.endDate <= semester.startDate
  ) {
    return current;
  }
  return {
    ...current,
    semester: {
      ...semester,
      id: current.semester.id,
      userId: identity,
      name: semester.name.trim(),
      academicYear: semester.academicYear.trim(),
      targetGpa:
        semester.targetGpa === undefined ||
        !Number.isFinite(semester.targetGpa)
          ? undefined
          : Math.min(5, Math.max(0, semester.targetGpa)),
    },
  };
}

export function updatePrioritiesInData(
  current: ResolveData,
  priorities: string[],
): ResolveData {
  const cleaned = priorities.map((priority) => priority.trim());
  if (cleaned.length !== 3 || cleaned.some((priority) => !priority)) {
    return current;
  }
  return { ...current, weeklyPriorities: cleaned };
}
