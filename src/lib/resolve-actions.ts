import { isDateKey, offsetDate } from "@/lib/date";
import type { ResolveData } from "@/contexts/resolve-context";
import type {
  AcademicModule,
  AlgorithmLog,
  Assessment,
  Goal,
  GuitarPracticeSession,
  Habit,
  JobApplication,
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

export type NewHabitInput = Pick<
  Habit,
  "title" | "category" | "measurementType" | "targetDays"
> &
  Partial<Pick<Habit, "targetValue" | "unit">>;

export type NewModuleInput = Pick<
  AcademicModule,
  "code" | "name" | "credits" | "targetGrade" | "color"
> &
  Partial<Pick<AcademicModule, "lecturer">>;

export type NewAssessmentInput = Pick<
  Assessment,
  "moduleId" | "title" | "type" | "weight" | "deadline"
> &
  Partial<Pick<Assessment, "targetScore">>;

export type NewAlgorithmLogInput = Omit<
  AlgorithmLog,
  "id" | "userId" | "semesterId"
>;

export type NewApplicationInput = Omit<JobApplication, "id" | "userId">;

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

export function updateTaskActualMinutesInData(
  current: ResolveData,
  taskId: string,
  minutes: number,
  timestamp = new Date().toISOString(),
): ResolveData {
  if (
    !Number.isFinite(minutes) ||
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
            actualMinutes: Math.min(720, Math.max(0, Math.round(minutes))),
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

export function addHabitToData(
  current: ResolveData,
  habit: NewHabitInput,
  meta: MutationMeta,
): ResolveData {
  const title = habit.title.trim();
  const targetDays = [...new Set(habit.targetDays)]
    .filter((day) => Number.isInteger(day) && day >= 0 && day <= 6)
    .sort((a, b) => a - b);
  if (!title || !targetDays.length) return current;

  return {
    ...current,
    habits: [
      ...current.habits,
      {
        ...habit,
        id: mutationId(meta),
        userId: meta.identity,
        semesterId: current.semester.id,
        title,
        targetDays,
        targetValue:
          habit.targetValue === undefined ||
          !Number.isFinite(habit.targetValue)
            ? undefined
            : Math.max(1, habit.targetValue),
        isActive: true,
      },
    ],
  };
}

export function addModuleToData(
  current: ResolveData,
  module: NewModuleInput,
  meta: MutationMeta,
): ResolveData {
  const code = module.code.trim().toUpperCase();
  const name = module.name.trim();
  if (!code || !name || !Number.isFinite(module.credits)) return current;

  return {
    ...current,
    modules: [
      ...current.modules,
      {
        ...module,
        id: mutationId(meta),
        userId: meta.identity,
        semesterId: current.semester.id,
        code,
        name,
        lecturer: module.lecturer?.trim() || undefined,
        credits: Math.min(30, Math.max(1, Math.round(module.credits))),
        targetGrade: module.targetGrade.trim() || "A",
        color: /^#[0-9a-f]{6}$/i.test(module.color)
          ? module.color
          : "#7eb8da",
        weeklyStudyMinutes: 0,
        assessments: [],
      },
    ],
  };
}

export function addAssessmentToData(
  current: ResolveData,
  assessment: NewAssessmentInput,
  meta: MutationMeta,
): ResolveData {
  const title = assessment.title.trim();
  if (
    !title ||
    !isDateKey(assessment.deadline) ||
    !current.modules.some((module) => module.id === assessment.moduleId) ||
    !Number.isFinite(assessment.weight)
  ) {
    return current;
  }

  return {
    ...current,
    modules: current.modules.map((module) =>
      module.id === assessment.moduleId
        ? {
            ...module,
            assessments: [
              ...module.assessments,
              {
                ...assessment,
                id: mutationId(meta),
                title,
                weight: Math.min(
                  100,
                  Math.max(0, Math.round(assessment.weight)),
                ),
                targetScore:
                  assessment.targetScore === undefined ||
                  !Number.isFinite(assessment.targetScore)
                    ? undefined
                    : Math.min(100, Math.max(0, assessment.targetScore)),
                progress: 0,
                status: "not_started",
              },
            ],
          }
        : module,
    ),
  };
}

export function updateAssessmentProgressInData(
  current: ResolveData,
  moduleId: string,
  assessmentId: string,
  progress: number,
): ResolveData {
  if (
    !Number.isFinite(progress) ||
    !current.modules.some(
      (module) =>
        module.id === moduleId &&
        module.assessments.some((assessment) => assessment.id === assessmentId),
    )
  ) {
    return current;
  }

  const normalizedProgress = Math.min(100, Math.max(0, Math.round(progress)));
  return {
    ...current,
    modules: current.modules.map((module) =>
      module.id === moduleId
        ? {
            ...module,
            assessments: module.assessments.map((assessment) => {
              if (assessment.id !== assessmentId) return assessment;
              return {
                ...assessment,
                progress: normalizedProgress,
                status:
                  assessment.status === "graded"
                    ? "graded"
                    : normalizedProgress === 100
                      ? "submitted"
                      : normalizedProgress > 0
                        ? "in_progress"
                        : "not_started",
              };
            }),
          }
        : module,
    ),
  };
}

export function updateModuleStudyMinutesInData(
  current: ResolveData,
  moduleId: string,
  minutes: number,
): ResolveData {
  if (
    !Number.isFinite(minutes) ||
    !current.modules.some((module) => module.id === moduleId)
  ) {
    return current;
  }

  return {
    ...current,
    modules: current.modules.map((module) =>
      module.id === moduleId
        ? {
            ...module,
            weeklyStudyMinutes: Math.min(
              10080,
              Math.max(0, Math.round(minutes)),
            ),
          }
        : module,
    ),
  };
}

export function addAlgorithmLogToData(
  current: ResolveData,
  log: NewAlgorithmLogInput,
  meta: MutationMeta,
): ResolveData {
  const problemName = log.problemName.trim();
  if (
    !problemName ||
    !isDateKey(log.completedDate) ||
    !Number.isFinite(log.minutes) ||
    log.minutes <= 0
  ) {
    return current;
  }

  return {
    ...current,
    algorithmLogs: [
      {
        ...log,
        id: mutationId(meta),
        userId: meta.identity,
        semesterId: current.semester.id,
        problemName,
        platform: log.platform.trim() || "Practice",
        topic: log.topic.trim() || "General",
        minutes: Math.min(720, Math.max(1, Math.round(log.minutes))),
        confidence: Math.min(5, Math.max(1, Math.round(log.confidence))),
        lesson: log.lesson.trim(),
      },
      ...current.algorithmLogs,
    ],
  };
}

export function addApplicationToData(
  current: ResolveData,
  application: NewApplicationInput,
  meta: MutationMeta,
): ResolveData {
  const company = application.company.trim();
  const role = application.role.trim();
  if (!company || !role || !isDateKey(application.applicationDate)) {
    return current;
  }

  return {
    ...current,
    applications: [
      {
        ...application,
        id: mutationId(meta),
        userId: meta.identity,
        company,
        role,
        nextAction: application.nextAction?.trim() || undefined,
        nextActionDate: isDateKey(application.nextActionDate)
          ? application.nextActionDate
          : undefined,
      },
      ...current.applications,
    ],
  };
}

export function updateApplicationStageInData(
  current: ResolveData,
  applicationId: string,
  stage: JobApplication["stage"],
): ResolveData {
  const validStages: JobApplication["stage"][] = [
    "saved",
    "applied",
    "assessment",
    "interview",
    "offer",
    "closed",
  ];
  if (
    !validStages.includes(stage) ||
    !current.applications.some(
      (application) => application.id === applicationId,
    )
  ) {
    return current;
  }

  return {
    ...current,
    applications: current.applications.map((application) =>
      application.id === applicationId
        ? { ...application, stage }
        : application,
    ),
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

  const existing = current.reflections.find(
    (item) =>
      item.type === reflection.type &&
      item.periodStart === reflection.periodStart &&
      item.periodEnd === reflection.periodEnd,
  );
  const normalized = {
    ...reflection,
    wins: reflection.wins?.trim() || undefined,
    difficulties: reflection.difficulties?.trim() || undefined,
    lessons: reflection.lessons?.trim() || undefined,
    neglectedAreas: reflection.neglectedAreas?.trim() || undefined,
    nextChanges: reflection.nextChanges?.trim() || undefined,
    mood:
      reflection.mood === undefined || !Number.isFinite(reflection.mood)
        ? undefined
        : Math.min(5, Math.max(1, Math.round(reflection.mood))),
    energy:
      reflection.energy === undefined || !Number.isFinite(reflection.energy)
        ? undefined
        : Math.min(5, Math.max(1, Math.round(reflection.energy))),
    id: existing?.id ?? mutationId(meta),
    userId: meta.identity,
    semesterId: current.semester.id,
    createdAt: existing?.createdAt ?? mutationTime(meta),
  };

  return {
    ...current,
    reflections: existing
      ? current.reflections.map((item) =>
          item.id === existing.id ? normalized : item,
        )
      : [normalized, ...current.reflections],
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
