import { isDateKey, offsetDate } from "@/lib/date";
import type { ResolveData } from "@/features/workspace/types";
import type {
  AcademicModule,
  AlgorithmLog,
  Assessment,
  Goal,
  GuitarPracticeSession,
  Habit,
  JobApplication,
  Milestone,
  Reflection,
  Semester,
  SemesterResolution,
  Task,
} from "@/types";

export type NewTaskInput = Pick<Task, "title" | "category" | "priority"> &
  Partial<
    Pick<Task, "scheduledDate" | "deadline" | "estimatedMinutes" | "goalId">
  >;
export type UpdateTaskInput = NewTaskInput;

export type NewGoalInput = Pick<
  Goal,
  "title" | "description" | "category" | "priority"
> &
  Partial<Pick<Goal, "deadline" | "motivation">>;
export type UpdateGoalInput = NewGoalInput;

export type NewMilestoneInput = Pick<Milestone, "title"> &
  Partial<Pick<Milestone, "description" | "deadline">>;
export type UpdateMilestoneInput = NewMilestoneInput;

export type NewHabitInput = Pick<
  Habit,
  "title" | "category" | "measurementType"
> &
  Partial<
    Pick<
      Habit,
      | "targetValue"
      | "unit"
      | "scheduleType"
      | "targetDays"
      | "targetFrequency"
    >
  >;
export type UpdateHabitInput = NewHabitInput;

export type NewModuleInput = Pick<
  AcademicModule,
  "code" | "name" | "credits" | "targetGrade" | "color"
> &
  Partial<Pick<AcademicModule, "lecturer">>;
export type UpdateModuleInput = NewModuleInput;

export type NewAssessmentInput = Pick<
  Assessment,
  "moduleId" | "title" | "type" | "weight" | "deadline"
> &
  Partial<Pick<Assessment, "targetScore">>;
export type UpdateAssessmentInput = NewAssessmentInput;

export type NewAlgorithmLogInput = Omit<
  AlgorithmLog,
  "id" | "userId" | "semesterId"
>;
export type UpdateAlgorithmLogInput = NewAlgorithmLogInput;

export type NewApplicationInput = Omit<JobApplication, "id" | "userId">;
export type UpdateApplicationInput = NewApplicationInput;

export type GuitarSessionInput = Omit<
  GuitarPracticeSession,
  "id" | "userId" | "semesterId"
>;

export type NewSemesterResolutionInput = Pick<SemesterResolution, "title">;
export type UpdateSemesterResolutionInput = NewSemesterResolutionInput;

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

function normalizeHabitSchedule(habit: NewHabitInput) {
  const targetDays = [...new Set(habit.targetDays ?? [])]
    .filter((day) => Number.isInteger(day) && day >= 0 && day <= 6)
    .sort((a, b) => a - b);
  const scheduleType =
    habit.scheduleType === "times_per_week"
      ? ("times_per_week" as const)
      : ("days_of_week" as const);
  const targetFrequency =
    scheduleType === "times_per_week"
      ? Math.min(
          7,
          Math.max(
            1,
            Math.round(
              Number.isFinite(habit.targetFrequency)
                ? habit.targetFrequency!
                : 1,
            ),
          ),
        )
      : targetDays.length;

  return { scheduleType, targetDays, targetFrequency };
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

export function updateTaskInData(
  current: ResolveData,
  taskId: string,
  changes: UpdateTaskInput,
  timestamp = new Date().toISOString(),
): ResolveData {
  const cleanTitle = changes.title.trim();
  const existing = current.tasks.find((task) => task.id === taskId);
  if (!existing || !cleanTitle) return current;
  const estimatedMinutes = Number.isFinite(changes.estimatedMinutes)
    ? Math.min(720, Math.max(5, Math.round(changes.estimatedMinutes!)))
    : existing.estimatedMinutes;

  return {
    ...current,
    tasks: current.tasks.map((task) =>
      task.id === taskId
        ? {
            ...task,
            title: cleanTitle,
            category: changes.category.trim() || "custom",
            priority: changes.priority,
            scheduledDate: isDateKey(changes.scheduledDate)
              ? changes.scheduledDate
              : task.scheduledDate,
            deadline: isDateKey(changes.deadline)
              ? changes.deadline
              : undefined,
            estimatedMinutes,
            goalId:
              changes.goalId === undefined
                ? task.goalId
                : current.goals.some((goal) => goal.id === changes.goalId)
                  ? changes.goalId
                  : task.goalId,
            updatedAt: timestamp,
          }
        : task,
    ),
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

export function removeTaskFromData(
  current: ResolveData,
  taskId: string,
): ResolveData {
  if (!current.tasks.some((task) => task.id === taskId)) return current;
  return {
    ...current,
    tasks: current.tasks.filter((task) => task.id !== taskId),
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
  const timestamp = mutationTime(meta);

  return {
    ...current,
    goals: [
      ...current.goals,
      {
        ...goal,
        title: cleanTitle,
        description: cleanDescription,
        deadline: isDateKey(goal.deadline) ? goal.deadline : undefined,
        id: mutationId(meta),
        userId: meta.identity,
        semesterId: current.semester.id,
        measurementType: "manual",
        startDate: offsetDate(0),
        status: "active",
        createdAt: timestamp,
        updatedAt: timestamp,
      },
    ],
  };
}

export function updateGoalInData(
  current: ResolveData,
  goalId: string,
  changes: UpdateGoalInput,
  timestamp = new Date().toISOString(),
): ResolveData {
  const title = changes.title.trim();
  const description = changes.description.trim();
  if (
    !title ||
    !description ||
    !current.goals.some((goal) => goal.id === goalId)
  ) {
    return current;
  }

  return {
    ...current,
    goals: current.goals.map((goal) =>
      goal.id === goalId
        ? {
            ...goal,
            title,
            description,
            category: changes.category,
            priority: changes.priority,
            motivation: changes.motivation?.trim() || undefined,
            deadline: isDateKey(changes.deadline)
              ? changes.deadline
              : undefined,
            updatedAt: timestamp,
          }
        : goal,
    ),
  };
}

export function removeGoalFromData(
  current: ResolveData,
  goalId: string,
  timestamp = new Date().toISOString(),
): ResolveData {
  if (!current.goals.some((goal) => goal.id === goalId)) return current;
  const milestoneIds = new Set(
    current.milestones
      .filter((milestone) => milestone.goalId === goalId)
      .map((milestone) => milestone.id),
  );

  return {
    ...current,
    goals: current.goals.filter((goal) => goal.id !== goalId),
    milestones: current.milestones.filter(
      (milestone) => milestone.goalId !== goalId,
    ),
    tasks: current.tasks.map((task) =>
      task.goalId === goalId ||
      (task.milestoneId && milestoneIds.has(task.milestoneId))
        ? {
            ...task,
            goalId: undefined,
            milestoneId: undefined,
            updatedAt: timestamp,
          }
        : task,
    ),
  };
}

export function setGoalCompletedInData(
  current: ResolveData,
  goalId: string,
  completed: boolean,
  timestamp = new Date().toISOString(),
): ResolveData {
  const goal = current.goals.find((item) => item.id === goalId);
  if (!goal) return current;
  const goalMilestones = current.milestones.filter(
    (milestone) => milestone.goalId === goalId,
  );
  if (
    completed &&
    goalMilestones.some((milestone) => !milestone.completed)
  ) {
    return current;
  }

  return {
    ...current,
    goals: current.goals.map((item) =>
      item.id === goalId
        ? {
            ...item,
            measurementType: goalMilestones.length ? "milestone" : "manual",
            targetValue: undefined,
            currentValue: undefined,
            unit: undefined,
            status: completed ? "completed" : "active",
            updatedAt: timestamp,
          }
        : item,
    ),
  };
}

export function addMilestoneToData(
  current: ResolveData,
  goalId: string,
  milestone: NewMilestoneInput,
  meta: MutationMeta,
): ResolveData {
  const title = milestone.title.trim();
  if (!title || !current.goals.some((goal) => goal.id === goalId)) {
    return current;
  }
  const description = milestone.description?.trim() || undefined;
  const order =
    current.milestones
      .filter((item) => item.goalId === goalId)
      .reduce((highest, item) => Math.max(highest, item.order), 0) + 1;

  return {
    ...current,
    goals: current.goals.map((goal) =>
      goal.id === goalId
        ? {
            ...goal,
            measurementType: "milestone",
            targetValue: undefined,
            currentValue: undefined,
            unit: undefined,
            status: goal.status === "completed" ? "active" : goal.status,
            updatedAt: mutationTime(meta),
          }
        : goal,
    ),
    milestones: [
      ...current.milestones,
      {
        id: mutationId(meta),
        goalId,
        title,
        description,
        deadline: isDateKey(milestone.deadline)
          ? milestone.deadline
          : undefined,
        completed: false,
        order,
      },
    ],
  };
}

export function updateMilestoneInData(
  current: ResolveData,
  milestoneId: string,
  changes: UpdateMilestoneInput,
  timestamp = new Date().toISOString(),
): ResolveData {
  const title = changes.title.trim();
  const milestone = current.milestones.find(
    (item) => item.id === milestoneId,
  );
  if (!milestone || !title) return current;

  return {
    ...current,
    goals: current.goals.map((goal) =>
      goal.id === milestone.goalId
        ? { ...goal, updatedAt: timestamp }
        : goal,
    ),
    milestones: current.milestones.map((item) =>
      item.id === milestoneId
        ? {
            ...item,
            title,
            description: changes.description?.trim() || undefined,
            deadline: isDateKey(changes.deadline)
              ? changes.deadline
              : undefined,
          }
        : item,
    ),
  };
}

export function toggleMilestoneInData(
  current: ResolveData,
  milestoneId: string,
  timestamp = new Date().toISOString(),
): ResolveData {
  if (!current.milestones.some((milestone) => milestone.id === milestoneId)) {
    return current;
  }
  const targetMilestone = current.milestones.find(
    (milestone) => milestone.id === milestoneId,
  )!;

  return {
    ...current,
    goals: targetMilestone.completed
      ? current.goals.map((goal) =>
          goal.id === targetMilestone.goalId && goal.status === "completed"
            ? { ...goal, status: "active", updatedAt: timestamp }
            : goal,
        )
      : current.goals,
    milestones: current.milestones.map((milestone) =>
      milestone.id === milestoneId
        ? {
            ...milestone,
            completed: !milestone.completed,
            completedAt: milestone.completed ? undefined : timestamp,
          }
        : milestone,
    ),
  };
}

export function removeMilestoneFromData(
  current: ResolveData,
  milestoneId: string,
  timestamp = new Date().toISOString(),
): ResolveData {
  if (!current.milestones.some((milestone) => milestone.id === milestoneId)) {
    return current;
  }
  const targetMilestone = current.milestones.find(
    (milestone) => milestone.id === milestoneId,
  )!;
  const remainingGoalMilestones = current.milestones.filter(
    (milestone) =>
      milestone.goalId === targetMilestone.goalId &&
      milestone.id !== milestoneId,
  );
  const completionStillValid =
    remainingGoalMilestones.length === 0 ||
    remainingGoalMilestones.every((milestone) => milestone.completed);

  return {
    ...current,
    goals: current.goals.map((goal) =>
      goal.id === targetMilestone.goalId
        ? {
            ...goal,
            measurementType: remainingGoalMilestones.length
              ? ("milestone" as const)
              : ("manual" as const),
            status:
              goal.status === "completed" && !completionStillValid
                ? ("active" as const)
                : goal.status,
            updatedAt: timestamp,
          }
        : goal,
    ),
    milestones: current.milestones.filter(
      (milestone) => milestone.id !== milestoneId,
    ),
    tasks: current.tasks.map((task) =>
      task.milestoneId === milestoneId
        ? { ...task, milestoneId: undefined, updatedAt: timestamp }
        : task,
    ),
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
  const schedule = normalizeHabitSchedule(habit);
  if (
    !title ||
    (schedule.scheduleType === "days_of_week" &&
      schedule.targetDays.length === 0)
  ) {
    return current;
  }

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
        scheduleType: schedule.scheduleType,
        targetDays: schedule.targetDays,
        targetFrequency: schedule.targetFrequency,
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

export function updateHabitInData(
  current: ResolveData,
  habitId: string,
  changes: UpdateHabitInput,
): ResolveData {
  const title = changes.title.trim();
  const schedule = normalizeHabitSchedule(changes);
  if (
    !current.habits.some((habit) => habit.id === habitId) ||
    !title ||
    (schedule.scheduleType === "days_of_week" &&
      schedule.targetDays.length === 0)
  ) {
    return current;
  }

  return {
    ...current,
    habits: current.habits.map((habit) =>
      habit.id === habitId
        ? {
            ...habit,
            title,
            category: changes.category.trim() || "personal",
            measurementType: changes.measurementType,
            targetValue:
              changes.targetValue === undefined ||
              !Number.isFinite(changes.targetValue)
                ? undefined
                : Math.max(1, changes.targetValue),
            unit: changes.unit?.trim() || undefined,
            scheduleType: schedule.scheduleType,
            targetDays: schedule.targetDays,
            targetFrequency: schedule.targetFrequency,
          }
        : habit,
    ),
  };
}

export function removeHabitFromData(
  current: ResolveData,
  habitId: string,
): ResolveData {
  if (!current.habits.some((habit) => habit.id === habitId)) return current;
  return {
    ...current,
    habits: current.habits.filter((habit) => habit.id !== habitId),
    habitLogs: current.habitLogs.filter((log) => log.habitId !== habitId),
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

export function updateModuleInData(
  current: ResolveData,
  moduleId: string,
  changes: UpdateModuleInput,
): ResolveData {
  const code = changes.code.trim().toUpperCase();
  const name = changes.name.trim();
  if (
    !code ||
    !name ||
    !Number.isFinite(changes.credits) ||
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
            code,
            name,
            lecturer: changes.lecturer?.trim() || undefined,
            credits: Math.min(30, Math.max(1, Math.round(changes.credits))),
            targetGrade: changes.targetGrade.trim() || "A",
            color: /^#[0-9a-f]{6}$/i.test(changes.color)
              ? changes.color
              : module.color,
          }
        : module,
    ),
  };
}

export function removeModuleFromData(
  current: ResolveData,
  moduleId: string,
): ResolveData {
  if (!current.modules.some((module) => module.id === moduleId)) return current;
  return {
    ...current,
    modules: current.modules.filter((module) => module.id !== moduleId),
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

export function updateAssessmentInData(
  current: ResolveData,
  assessmentId: string,
  changes: UpdateAssessmentInput,
): ResolveData {
  const sourceModule = current.modules.find((module) =>
    module.assessments.some((assessment) => assessment.id === assessmentId),
  );
  const targetModuleExists = current.modules.some(
    (module) => module.id === changes.moduleId,
  );
  const title = changes.title.trim();
  if (
    !sourceModule ||
    !targetModuleExists ||
    !title ||
    !isDateKey(changes.deadline) ||
    !Number.isFinite(changes.weight)
  ) {
    return current;
  }
  const existing = sourceModule.assessments.find(
    (assessment) => assessment.id === assessmentId,
  )!;
  const updated: Assessment = {
    ...existing,
    moduleId: changes.moduleId,
    title,
    type: changes.type,
    weight: Math.min(100, Math.max(0, Math.round(changes.weight))),
    deadline: changes.deadline,
    targetScore:
      changes.targetScore === undefined
        ? existing.targetScore
        : !Number.isFinite(changes.targetScore)
          ? existing.targetScore
          : Math.min(100, Math.max(0, changes.targetScore)),
  };

  return {
    ...current,
    modules: current.modules.map((module) => {
      const withoutTarget = module.assessments.filter(
        (assessment) => assessment.id !== assessmentId,
      );
      return module.id === changes.moduleId
        ? { ...module, assessments: [...withoutTarget, updated] }
        : { ...module, assessments: withoutTarget };
    }),
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

export function removeAssessmentFromData(
  current: ResolveData,
  moduleId: string,
  assessmentId: string,
): ResolveData {
  if (
    !current.modules.some(
      (module) =>
        module.id === moduleId &&
        module.assessments.some((assessment) => assessment.id === assessmentId),
    )
  ) {
    return current;
  }

  return {
    ...current,
    modules: current.modules.map((module) =>
      module.id === moduleId
        ? {
            ...module,
            assessments: module.assessments.filter(
              (assessment) => assessment.id !== assessmentId,
            ),
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

export function updateAlgorithmLogInData(
  current: ResolveData,
  logId: string,
  changes: UpdateAlgorithmLogInput,
): ResolveData {
  const problemName = changes.problemName.trim();
  if (
    !current.algorithmLogs.some((log) => log.id === logId) ||
    !problemName ||
    !isDateKey(changes.completedDate) ||
    !Number.isFinite(changes.minutes) ||
    changes.minutes <= 0
  ) {
    return current;
  }

  return {
    ...current,
    algorithmLogs: current.algorithmLogs.map((log) =>
      log.id === logId
        ? {
            ...log,
            platform: changes.platform.trim() || "Practice",
            problemName,
            topic: changes.topic.trim() || "General",
            difficulty: changes.difficulty,
            completedDate: changes.completedDate,
            minutes: Math.min(720, Math.max(1, Math.round(changes.minutes))),
            usedHints: changes.usedHints,
            confidence: Math.min(
              5,
              Math.max(1, Math.round(changes.confidence)),
            ),
            lesson: changes.lesson.trim(),
          }
        : log,
    ),
  };
}

export function removeAlgorithmLogFromData(
  current: ResolveData,
  logId: string,
): ResolveData {
  if (!current.algorithmLogs.some((log) => log.id === logId)) return current;
  return {
    ...current,
    algorithmLogs: current.algorithmLogs.filter((log) => log.id !== logId),
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

export function updateApplicationInData(
  current: ResolveData,
  applicationId: string,
  changes: UpdateApplicationInput,
): ResolveData {
  const company = changes.company.trim();
  const role = changes.role.trim();
  if (
    !current.applications.some(
      (application) => application.id === applicationId,
    ) ||
    !company ||
    !role ||
    !isDateKey(changes.applicationDate)
  ) {
    return current;
  }

  return {
    ...current,
    applications: current.applications.map((application) =>
      application.id === applicationId
        ? {
            ...application,
            company,
            role,
            applicationDate: changes.applicationDate,
            stage: changes.stage,
            nextAction: changes.nextAction?.trim() || undefined,
            nextActionDate: isDateKey(changes.nextActionDate)
              ? changes.nextActionDate
              : undefined,
          }
        : application,
    ),
  };
}

export function removeApplicationFromData(
  current: ResolveData,
  applicationId: string,
): ResolveData {
  if (
    !current.applications.some(
      (application) => application.id === applicationId,
    )
  ) {
    return current;
  }
  return {
    ...current,
    applications: current.applications.filter(
      (application) => application.id !== applicationId,
    ),
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
  session: GuitarSessionInput,
  meta: MutationMeta,
): ResolveData {
  const category = session.category.trim();
  const techniques = session.techniques
    .map((technique) => technique.trim())
    .filter(Boolean);
  if (
    !isDateKey(session.date) ||
    !Number.isFinite(session.durationMinutes) ||
    session.durationMinutes <= 0 ||
    !category ||
    techniques.length === 0
  ) {
    return current;
  }
  return {
    ...current,
    guitarSessions: [
      {
        ...session,
        category,
        techniques,
        durationMinutes: Math.min(
          720,
          Math.max(5, Math.round(session.durationMinutes)),
        ),
        cleanBpm:
          session.cleanBpm === undefined || !Number.isFinite(session.cleanBpm)
            ? undefined
            : Math.min(400, Math.max(20, Math.round(session.cleanBpm))),
        confidence:
          session.confidence === undefined ||
          !Number.isFinite(session.confidence)
            ? undefined
            : Math.min(5, Math.max(1, Math.round(session.confidence))),
        difficulty:
          session.difficulty === undefined ||
          !Number.isFinite(session.difficulty)
            ? undefined
            : Math.min(5, Math.max(1, Math.round(session.difficulty))),
        song: session.song?.trim() || undefined,
        exercise: session.exercise?.trim() || undefined,
        notes: session.notes?.trim() || undefined,
        nextFocus: session.nextFocus?.trim() || undefined,
        id: mutationId(meta),
        userId: meta.identity,
        semesterId: current.semester.id,
      },
      ...current.guitarSessions,
    ],
  };
}

export function updateGuitarSessionInData(
  current: ResolveData,
  sessionId: string,
  changes: GuitarSessionInput,
): ResolveData {
  const category = changes.category.trim();
  const techniques = changes.techniques
    .map((technique) => technique.trim())
    .filter(Boolean);
  if (
    !current.guitarSessions.some((session) => session.id === sessionId) ||
    !isDateKey(changes.date) ||
    !Number.isFinite(changes.durationMinutes) ||
    changes.durationMinutes <= 0 ||
    !category ||
    techniques.length === 0
  ) {
    return current;
  }

  return {
    ...current,
    guitarSessions: current.guitarSessions.map((session) =>
      session.id === sessionId
        ? {
            ...session,
            ...changes,
            category,
            techniques,
            durationMinutes: Math.min(
              720,
              Math.max(5, Math.round(changes.durationMinutes)),
            ),
            cleanBpm:
              changes.cleanBpm === undefined ||
              !Number.isFinite(changes.cleanBpm)
                ? undefined
                : Math.min(400, Math.max(20, Math.round(changes.cleanBpm))),
            confidence:
              changes.confidence === undefined ||
              !Number.isFinite(changes.confidence)
                ? undefined
                : Math.min(
                    5,
                    Math.max(1, Math.round(changes.confidence)),
                  ),
            difficulty:
              changes.difficulty === undefined ||
              !Number.isFinite(changes.difficulty)
                ? undefined
                : Math.min(
                    5,
                    Math.max(1, Math.round(changes.difficulty)),
                  ),
            song: changes.song?.trim() || undefined,
            exercise: changes.exercise?.trim() || undefined,
            notes: changes.notes?.trim() || undefined,
            nextFocus: changes.nextFocus?.trim() || undefined,
          }
        : session,
    ),
  };
}

export function removeGuitarSessionFromData(
  current: ResolveData,
  sessionId: string,
): ResolveData {
  if (!current.guitarSessions.some((session) => session.id === sessionId)) {
    return current;
  }
  return {
    ...current,
    guitarSessions: current.guitarSessions.filter(
      (session) => session.id !== sessionId,
    ),
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

export function removeReflectionFromData(
  current: ResolveData,
  reflectionId: string,
): ResolveData {
  if (
    !current.reflections.some(
      (reflection) => reflection.id === reflectionId,
    )
  ) {
    return current;
  }
  return {
    ...current,
    reflections: current.reflections.filter(
      (reflection) => reflection.id !== reflectionId,
    ),
  };
}

export function addSemesterResolutionToData(
  current: ResolveData,
  resolution: NewSemesterResolutionInput,
  meta: MutationMeta,
): ResolveData {
  const title = resolution.title.trim();
  if (!title) return current;
  const timestamp = mutationTime(meta);

  return {
    ...current,
    semester: {
      ...current.semester,
      mainResolution: undefined,
      resolutions: [
        ...(current.semester.resolutions ?? []),
        {
          id: mutationId(meta),
          title,
          completed: false,
          createdAt: timestamp,
          updatedAt: timestamp,
        },
      ],
    },
  };
}

export function updateSemesterResolutionInData(
  current: ResolveData,
  resolutionId: string,
  changes: UpdateSemesterResolutionInput,
  timestamp = new Date().toISOString(),
): ResolveData {
  const title = changes.title.trim();
  const resolutions = current.semester.resolutions ?? [];
  if (
    !title ||
    !resolutions.some((resolution) => resolution.id === resolutionId)
  ) {
    return current;
  }

  return {
    ...current,
    semester: {
      ...current.semester,
      mainResolution: undefined,
      resolutions: resolutions.map((resolution) =>
        resolution.id === resolutionId
          ? { ...resolution, title, updatedAt: timestamp }
          : resolution,
      ),
    },
  };
}

export function toggleSemesterResolutionInData(
  current: ResolveData,
  resolutionId: string,
  timestamp = new Date().toISOString(),
): ResolveData {
  const resolutions = current.semester.resolutions ?? [];
  if (!resolutions.some((resolution) => resolution.id === resolutionId)) {
    return current;
  }

  return {
    ...current,
    semester: {
      ...current.semester,
      mainResolution: undefined,
      resolutions: resolutions.map((resolution) =>
        resolution.id === resolutionId
          ? {
              ...resolution,
              completed: !resolution.completed,
              completedAt: resolution.completed ? undefined : timestamp,
              updatedAt: timestamp,
            }
          : resolution,
      ),
    },
  };
}

export function removeSemesterResolutionFromData(
  current: ResolveData,
  resolutionId: string,
): ResolveData {
  const resolutions = current.semester.resolutions ?? [];
  if (!resolutions.some((resolution) => resolution.id === resolutionId)) {
    return current;
  }

  return {
    ...current,
    semester: {
      ...current.semester,
      mainResolution: undefined,
      resolutions: resolutions.filter(
        (resolution) => resolution.id !== resolutionId,
      ),
    },
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
      resolutions:
        semester.resolutions ?? current.semester.resolutions ?? [],
      mainResolution: semester.mainResolution?.trim() || undefined,
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
