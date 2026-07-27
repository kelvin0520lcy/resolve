import {
  getWeekDateKeys,
  isDateKey,
  isValidTimeZone,
  offsetDate,
  parseLocalDate,
} from "@/lib/date";
import type { ResolveData } from "@/features/workspace/types";
import {
  getTaskDeadline,
  getTaskEstimatedMinutes,
  getTaskScheduleDate,
} from "@/features/workspace/lib/deadlines";
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
  WorkspaceEvent,
  WorkspacePreferences,
} from "@/types";

export type NewTaskInput = Pick<Task, "title" | "category" | "priority"> &
  Partial<
    Pick<
      Task,
      | "description"
      | "scheduledDate"
      | "deadline"
      | "schedule"
      | "deadlineInfo"
      | "estimatedMinutes"
      | "goalId"
      | "milestoneId"
      | "moduleId"
      | "assessmentId"
      | "prerequisiteTaskIds"
      | "requiredForMilestone"
      | "origin"
    >
  >;
export type UpdateTaskInput = Partial<
  Omit<NewTaskInput, "schedule"> & Pick<Task, "status">
> & {
  schedule?: Partial<NonNullable<Task["schedule"]>>;
};

export type NewGoalInput = Pick<
  Goal,
  "title" | "description" | "category" | "priority"
> &
  Partial<
    Pick<
      Goal,
      | "deadline"
      | "deadlineInfo"
      | "motivation"
      | "measurementType"
      | "targetValue"
      | "currentValue"
      | "unit"
    >
  >;
export type UpdateGoalInput = NewGoalInput;

export type NewMilestoneInput = Pick<Milestone, "title"> &
  Partial<
    Pick<
      Milestone,
      "description" | "deadline" | "deadlineInfo" | "completionMode"
    >
  >;
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
  Partial<
    Pick<
      Assessment,
      "targetScore" | "deadlineInfo" | "estimatedEffortMinutes"
    >
  >;
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

export type NewEventInput = Omit<
  WorkspaceEvent,
  "id" | "userId" | "semesterId" | "createdAt" | "updatedAt"
>;
export type UpdateEventInput = NewEventInput;

export type PreparationTaskDraft = {
  id?: string;
  title: string;
  estimatedMinutes?: number;
  category?: string;
  priority?: Task["priority"];
};
export type LinkedTaskRemovalPolicy = "preserve" | "delete";

export type MutationMeta = {
  identity: string;
  id?: string;
  timestamp?: string;
};

function mutationId(meta: MutationMeta, suffix?: string) {
  const id = meta.id ?? crypto.randomUUID();
  return suffix ? `${id}:${suffix}` : id;
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

function normalizeTaskMinutes(minutes: unknown) {
  return Number.isFinite(minutes)
    ? Math.min(720, Math.max(5, Math.round(minutes as number)))
    : undefined;
}

function taskDeadline(
  task: Partial<Pick<Task, "deadline" | "deadlineInfo">>,
) {
  return (
    task.deadlineInfo ??
    (isDateKey(task.deadline)
      ? ({ kind: "date", date: task.deadline } as const)
      : undefined)
  );
}

function validTaskSchedule(
  schedule: Partial<NonNullable<Task["schedule"]>> | undefined,
) {
  if (!schedule) return true;
  return (
    (schedule.date === undefined || isDateKey(schedule.date)) &&
    (schedule.startTime === undefined ||
      /^([01]\d|2[0-3]):[0-5]\d$/.test(schedule.startTime)) &&
    (schedule.timeZone === undefined || isValidTimeZone(schedule.timeZone))
  );
}

function validTaskDeadline(deadline: Task["deadlineInfo"]) {
  if (!deadline) return true;
  return deadline.kind === "date"
    ? isDateKey(deadline.date)
    : !Number.isNaN(Date.parse(deadline.at)) &&
        isValidTimeZone(deadline.timeZone);
}

function hasOwn(value: object, key: PropertyKey) {
  return Object.prototype.hasOwnProperty.call(value, key);
}

function recalculateAutomaticMilestones(
  current: ResolveData,
  timestamp: string,
): ResolveData {
  let changed = false;
  const milestones = current.milestones.map((milestone) => {
    if (milestone.completionMode !== "required_tasks") return milestone;
    const requiredTasks = current.tasks.filter(
      (task) =>
        task.milestoneId === milestone.id && task.requiredForMilestone === true,
    );
    const completed =
      requiredTasks.length > 0 &&
      requiredTasks.every((task) => task.status === "completed");
    if (completed === milestone.completed) return milestone;
    changed = true;
    return {
      ...milestone,
      completed,
      completedAt: completed ? timestamp : undefined,
    };
  });
  if (!changed) return current;
  const reopenedGoalIds = new Set(
    milestones
      .filter((milestone) => !milestone.completed)
      .map((milestone) => milestone.goalId),
  );
  const next: ResolveData = {
    ...current,
    milestones,
    goals: current.goals.map((goal) =>
      goal.status === "completed" && reopenedGoalIds.has(goal.id)
        ? { ...goal, status: "active", updatedAt: timestamp }
        : goal,
    ),
  };
  return recalculateAutomaticMilestones(next, timestamp);
}

export function addTaskToData(
  current: ResolveData,
  task: NewTaskInput,
  meta: MutationMeta,
): ResolveData {
  const cleanTitle = task.title.trim();
  if (
    !cleanTitle ||
    !validTaskSchedule(task.schedule) ||
    !validTaskDeadline(taskDeadline(task))
  ) {
    return current;
  }
  const timestamp = mutationTime(meta);
  const scheduleDate = isDateKey(task.schedule?.date)
    ? task.schedule.date
    : isDateKey(task.scheduledDate)
      ? task.scheduledDate
      : undefined;
  const estimatedMinutes = normalizeTaskMinutes(
    task.schedule?.estimatedMinutes ?? task.estimatedMinutes,
  );
  const requestedMilestone = current.milestones.find(
    (milestone) => milestone.id === task.milestoneId,
  );
  const requestedGoal = current.goals.find((goal) => goal.id === task.goalId);
  const goalId = requestedMilestone?.goalId ?? requestedGoal?.id;
  const milestoneId =
    requestedMilestone && requestedMilestone.goalId === goalId
      ? requestedMilestone.id
      : undefined;
  const assessmentModule = current.modules.find((moduleRecord) =>
    moduleRecord.assessments.some(
      (assessment) => assessment.id === task.assessmentId,
    ),
  );
  const moduleId =
    assessmentModule?.id ??
    (current.modules.some(
      (moduleRecord) => moduleRecord.id === task.moduleId,
    )
      ? task.moduleId
      : undefined);
  const assessmentId = assessmentModule
    ? task.assessmentId
    : undefined;
  const schedule = scheduleDate
    ? {
        date: scheduleDate,
        startTime: task.schedule?.startTime,
        estimatedMinutes,
        timeZone:
          task.schedule?.timeZone || current.preferences.timeZone,
      }
    : undefined;
  const deadlineInfo = taskDeadline(task);

  const next: ResolveData = {
    ...current,
    tasks: [
      ...current.tasks,
      {
        ...task,
        title: cleanTitle,
        id: mutationId(meta),
        userId: meta.identity,
        semesterId: current.semester.id,
        description: task.description?.trim() || undefined,
        scheduledDate: scheduleDate,
        schedule,
        deadline:
          deadlineInfo?.kind === "date" ? deadlineInfo.date : undefined,
        deadlineInfo,
        estimatedMinutes,
        goalId,
        milestoneId,
        moduleId,
        assessmentId,
        prerequisiteTaskIds: (task.prerequisiteTaskIds ?? []).filter((id) =>
          current.tasks.some((candidate) => candidate.id === id),
        ),
        requiredForMilestone:
          Boolean(milestoneId) && task.requiredForMilestone === true,
        deferral: { deferCount: 0 },
        status: "planned",
        createdAt: timestamp,
        updatedAt: timestamp,
      },
    ],
  };
  return recalculateAutomaticMilestones(next, timestamp);
}

export function updateTaskInData(
  current: ResolveData,
  taskId: string,
  changes: UpdateTaskInput,
  timestamp = new Date().toISOString(),
): ResolveData {
  const existing = current.tasks.find((task) => task.id === taskId);
  const cleanTitle = hasOwn(changes, "title")
    ? changes.title?.trim() ?? ""
    : existing?.title ?? "";
  if (
    !existing ||
    !cleanTitle ||
    !validTaskSchedule(changes.schedule) ||
    (hasOwn(changes, "deadlineInfo") &&
      !validTaskDeadline(changes.deadlineInfo))
  ) {
    return current;
  }
  const changesSchedule = hasOwn(changes, "schedule");
  const changesScheduledDate = hasOwn(changes, "scheduledDate");
  const changesEstimate =
    hasOwn(changes, "estimatedMinutes") ||
    (changes.schedule !== undefined &&
      hasOwn(changes.schedule, "estimatedMinutes"));
  const scheduleDate = changesSchedule
    ? changes.schedule === undefined
      ? undefined
      : hasOwn(changes.schedule, "date")
        ? isDateKey(changes.schedule.date)
          ? changes.schedule.date
          : isDateKey(changes.scheduledDate)
            ? changes.scheduledDate
            : undefined
        : changesScheduledDate
          ? isDateKey(changes.scheduledDate)
            ? changes.scheduledDate
            : undefined
          : getTaskScheduleDate(existing)
    : changesScheduledDate
      ? isDateKey(changes.scheduledDate)
        ? changes.scheduledDate
        : undefined
      : getTaskScheduleDate(existing);
  const estimatedMinutes = changesEstimate
    ? normalizeTaskMinutes(
        changes.schedule?.estimatedMinutes ?? changes.estimatedMinutes,
      )
    : getTaskEstimatedMinutes(existing);
  const changesDeadline =
    hasOwn(changes, "deadline") || hasOwn(changes, "deadlineInfo");
  const deadlineInfo = changesDeadline
    ? taskDeadline(changes)
    : getTaskDeadline(existing);
  const requestedGoalId = hasOwn(changes, "goalId")
    ? changes.goalId
    : existing.goalId;
  const requestedMilestoneId = hasOwn(changes, "milestoneId")
    ? changes.milestoneId
    : hasOwn(changes, "goalId")
      ? undefined
      : existing.milestoneId;
  const requestedMilestone = current.milestones.find(
    (milestone) => milestone.id === requestedMilestoneId,
  );
  const requestedGoal = current.goals.find(
    (goal) => goal.id === requestedGoalId,
  );
  const goalId = requestedMilestone?.goalId ?? requestedGoal?.id;
  const milestoneId =
    requestedMilestone && requestedMilestone.goalId === goalId
      ? requestedMilestone.id
      : undefined;
  const requestedAssessmentId = hasOwn(changes, "assessmentId")
    ? changes.assessmentId
    : existing.assessmentId;
  const assessmentModule = current.modules.find((moduleRecord) =>
    moduleRecord.assessments.some(
      (assessment) => assessment.id === requestedAssessmentId,
    ),
  );
  const requestedModuleId = hasOwn(changes, "moduleId")
    ? changes.moduleId
    : existing.moduleId;
  const moduleId =
    assessmentModule?.id ??
    (current.modules.some(
      (moduleRecord) => moduleRecord.id === requestedModuleId,
    )
      ? requestedModuleId
      : undefined);
  const assessmentId =
    assessmentModule?.id === moduleId ? requestedAssessmentId : undefined;

  const next: ResolveData = {
    ...current,
    tasks: current.tasks.map((task) =>
      task.id === taskId
        ? {
            ...task,
            title: cleanTitle,
            description: hasOwn(changes, "description")
              ? changes.description?.trim() || undefined
              : task.description,
            category: hasOwn(changes, "category")
              ? changes.category?.trim() || "custom"
              : task.category,
            priority: changes.priority ?? task.priority,
            scheduledDate: scheduleDate,
            schedule: scheduleDate
              ? {
                  date: scheduleDate,
                  startTime:
                    changes.schedule && hasOwn(changes.schedule, "startTime")
                      ? changes.schedule.startTime
                      : task.schedule?.startTime,
                  estimatedMinutes,
                  timeZone:
                    changes.schedule?.timeZone ||
                    task.schedule?.timeZone ||
                    current.preferences.timeZone,
                }
              : undefined,
            deadline:
              deadlineInfo?.kind === "date" ? deadlineInfo.date : undefined,
            deadlineInfo,
            estimatedMinutes,
            goalId,
            milestoneId,
            moduleId,
            assessmentId,
            prerequisiteTaskIds: hasOwn(changes, "prerequisiteTaskIds")
              ? (changes.prerequisiteTaskIds ?? []).filter(
                  (id) =>
                    id !== taskId &&
                    current.tasks.some((item) => item.id === id),
                )
              : task.prerequisiteTaskIds,
            requiredForMilestone:
              Boolean(milestoneId) &&
              (hasOwn(changes, "requiredForMilestone")
                ? changes.requiredForMilestone === true
                : task.requiredForMilestone === true),
            origin: hasOwn(changes, "origin") ? changes.origin : task.origin,
            dailyPriorityRank:
              scheduleDate === (task.schedule?.date ?? task.scheduledDate)
                ? task.dailyPriorityRank
                : undefined,
            status: changes.status ?? task.status,
            updatedAt: timestamp,
          }
        : task,
    ),
  };
  return recalculateAutomaticMilestones(next, timestamp);
}

export function toggleTaskInData(
  current: ResolveData,
  taskId: string,
  timestamp = new Date().toISOString(),
): ResolveData {
  if (!current.tasks.some((task) => task.id === taskId)) return current;
  const next: ResolveData = {
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
  return recalculateAutomaticMilestones(next, timestamp);
}

export function removeTaskFromData(
  current: ResolveData,
  taskId: string,
): ResolveData {
  if (!current.tasks.some((task) => task.id === taskId)) return current;
  const next: ResolveData = {
    ...current,
    tasks: current.tasks.filter((task) => task.id !== taskId),
  };
  return recalculateAutomaticMilestones(next, new Date().toISOString());
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
            schedule: {
              date: scheduledDate,
              startTime: task.schedule?.startTime,
              estimatedMinutes:
                task.schedule?.estimatedMinutes ?? task.estimatedMinutes,
              timeZone:
                task.schedule?.timeZone ?? current.preferences.timeZone,
            },
            status:
              task.status === "completed"
                ? "completed"
                : task.scheduledDate &&
                    task.scheduledDate <= offsetDate(0) &&
                    scheduledDate > task.scheduledDate
                  ? "rescheduled"
                  : task.status === "in_progress"
                    ? "in_progress"
                    : "planned",
            deferral:
              task.scheduledDate &&
              task.scheduledDate <= offsetDate(0) &&
              scheduledDate > task.scheduledDate
                ? {
                    deferCount: (task.deferral?.deferCount ?? 0) + 1,
                    lastDeferredFrom: task.scheduledDate,
                    lastDeferredTo: scheduledDate,
                    lastDeferredAt: timestamp,
                  }
                : task.deferral ?? { deferCount: 0 },
            dailyPriorityRank:
              task.scheduledDate === scheduledDate
                ? task.dailyPriorityRank
                : undefined,
            updatedAt: timestamp,
          }
        : task,
    ),
  };
}

export function setTaskDailyPriorityInData(
  current: ResolveData,
  taskId: string,
  rank: Task["dailyPriorityRank"],
  timestamp = new Date().toISOString(),
): ResolveData {
  const target = current.tasks.find((task) => task.id === taskId);
  const scheduledDate = target?.schedule?.date ?? target?.scheduledDate;
  if (
    !target ||
    !scheduledDate ||
    (rank !== undefined && ![1, 2, 3].includes(rank))
  ) {
    return current;
  }

  return {
    ...current,
    tasks: current.tasks.map((task) => {
      const taskDate = task.schedule?.date ?? task.scheduledDate;
      if (task.id === taskId) {
        return { ...task, dailyPriorityRank: rank, updatedAt: timestamp };
      }
      if (
        rank !== undefined &&
        taskDate === scheduledDate &&
        task.dailyPriorityRank === rank
      ) {
        return { ...task, dailyPriorityRank: undefined, updatedAt: timestamp };
      }
      return task;
    }),
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
  const targetValue =
    Number.isFinite(goal.targetValue) && goal.targetValue! > 0
      ? goal.targetValue
      : undefined;
  const currentValue = Number.isFinite(goal.currentValue)
    ? Math.max(0, goal.currentValue!)
    : undefined;
  const unit = goal.unit?.trim() || undefined;

  return {
    ...current,
    goals: [
      ...current.goals,
      {
        ...goal,
        title: cleanTitle,
        description: cleanDescription,
        deadline: isDateKey(goal.deadline) ? goal.deadline : undefined,
        deadlineInfo:
          goal.deadlineInfo ??
          (isDateKey(goal.deadline)
            ? { kind: "date", date: goal.deadline }
            : undefined),
        id: mutationId(meta),
        userId: meta.identity,
        semesterId: current.semester.id,
        measurementType: ["percentage", "count", "duration"].includes(
          goal.measurementType ?? "",
        )
          ? goal.measurementType!
          : "manual",
        ...(targetValue !== undefined ? { targetValue } : {}),
        ...(currentValue !== undefined ? { currentValue } : {}),
        ...(unit ? { unit } : {}),
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
            measurementType:
              current.milestones.some(
                (milestone) => milestone.goalId === goalId,
              )
                ? ("milestone" as const)
                : ["percentage", "count", "duration"].includes(
                      changes.measurementType ?? "",
                    )
                  ? changes.measurementType!
                  : ("manual" as const),
            targetValue:
              Number.isFinite(changes.targetValue) &&
              changes.targetValue! > 0
                ? changes.targetValue
                : undefined,
            currentValue: Number.isFinite(changes.currentValue)
              ? Math.max(0, changes.currentValue!)
              : undefined,
            unit: changes.unit?.trim() || undefined,
            deadline: isDateKey(changes.deadline)
              ? changes.deadline
              : undefined,
            deadlineInfo:
              changes.deadlineInfo ??
              (isDateKey(changes.deadline)
                ? { kind: "date", date: changes.deadline }
                : undefined),
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
  linkedTaskPolicy: LinkedTaskRemovalPolicy = "preserve",
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
    tasks:
      linkedTaskPolicy === "delete"
        ? current.tasks.filter(
            (task) =>
              task.goalId !== goalId &&
              !(task.milestoneId && milestoneIds.has(task.milestoneId)),
          )
        : current.tasks.map((task) =>
            task.goalId === goalId ||
            (task.milestoneId && milestoneIds.has(task.milestoneId))
              ? {
                  ...task,
                  goalId: undefined,
                  milestoneId: undefined,
                  requiredForMilestone: false,
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
            measurementType: goalMilestones.length
              ? "milestone"
              : item.measurementType === "milestone"
                ? "manual"
                : item.measurementType,
            targetValue: goalMilestones.length
              ? undefined
              : item.targetValue,
            currentValue: goalMilestones.length
              ? undefined
              : item.currentValue,
            unit: goalMilestones.length ? undefined : item.unit,
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
        deadlineInfo:
          milestone.deadlineInfo ??
          (isDateKey(milestone.deadline)
            ? { kind: "date", date: milestone.deadline }
            : undefined),
        completed: false,
        order,
        completionMode:
          milestone.completionMode === "required_tasks"
            ? "required_tasks"
            : "manual",
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
            deadlineInfo:
              changes.deadlineInfo ??
              (isDateKey(changes.deadline)
                ? { kind: "date", date: changes.deadline }
                : undefined),
            completionMode:
              changes.completionMode ?? item.completionMode ?? "manual",
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
  if (targetMilestone.completionMode === "required_tasks") return current;

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
        ? {
            ...task,
            milestoneId: undefined,
            requiredForMilestone: false,
            updatedAt: timestamp,
          }
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
  linkedTaskPolicy: LinkedTaskRemovalPolicy = "preserve",
  timestamp = new Date().toISOString(),
): ResolveData {
  const target = current.modules.find((module) => module.id === moduleId);
  if (!target) return current;
  const assessmentIds = new Set(
    target.assessments.map((assessment) => assessment.id),
  );
  const isLinked = (task: Task) =>
    task.moduleId === moduleId ||
    (task.origin?.kind === "assessment-preparation" &&
      (task.origin.moduleId === moduleId ||
        assessmentIds.has(task.origin.assessmentId)));
  return {
    ...current,
    modules: current.modules.filter((module) => module.id !== moduleId),
    moduleStudyLogs: current.moduleStudyLogs.filter(
      (log) => log.moduleId !== moduleId,
    ),
    tasks:
      linkedTaskPolicy === "delete"
        ? current.tasks.filter((task) => !isLinked(task))
        : current.tasks.map((task) =>
            isLinked(task)
              ? {
                  ...task,
                  moduleId: undefined,
                  assessmentId: undefined,
                  origin: undefined,
                  updatedAt: timestamp,
                }
              : task,
          ),
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
                estimatedEffortMinutes: normalizeTaskMinutes(
                  assessment.estimatedEffortMinutes,
                ),
                progress: 0,
                status: "not_started",
                deadlineInfo:
                  assessment.deadlineInfo ?? {
                    kind: "date",
                    date: assessment.deadline,
                  },
                preparation: { generatedTaskIds: [] },
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
    deadlineInfo:
      changes.deadlineInfo ?? {
        kind: "date",
        date: changes.deadline,
      },
    targetScore:
      changes.targetScore === undefined
        ? existing.targetScore
        : !Number.isFinite(changes.targetScore)
          ? existing.targetScore
          : Math.min(100, Math.max(0, changes.targetScore)),
    estimatedEffortMinutes:
      changes.estimatedEffortMinutes === undefined
        ? existing.estimatedEffortMinutes
        : normalizeTaskMinutes(changes.estimatedEffortMinutes),
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
    tasks:
      sourceModule.id === changes.moduleId
        ? current.tasks
        : current.tasks.map((task) =>
            task.origin?.kind === "assessment-preparation" &&
            task.origin.assessmentId === assessmentId
              ? {
                  ...task,
                  origin: {
                    ...task.origin,
                    moduleId: changes.moduleId,
                  },
                }
              : task,
          ),
  };
}

export function planAssessmentPreparationToData(
  current: ResolveData,
  assessmentId: string,
  templateId: string,
  drafts: PreparationTaskDraft[],
  meta: MutationMeta,
): ResolveData {
  const moduleRecord = current.modules.find((item) =>
    item.assessments.some((assessment) => assessment.id === assessmentId),
  );
  const assessment = moduleRecord?.assessments.find(
    (item) => item.id === assessmentId,
  );
  if (!moduleRecord || !assessment) return current;
  const existing = current.tasks.filter(
    (task) =>
      task.origin?.kind === "assessment-preparation" &&
      task.origin.assessmentId === assessmentId &&
      task.status !== "cancelled",
  );
  const existingStepIds = new Set(
    existing
      .map((task) => task.origin?.kind === "assessment-preparation"
        ? task.origin.templateStepId
        : undefined)
      .filter((id): id is string => Boolean(id)),
  );
  const timestamp = mutationTime(meta);
  const newTasks: Task[] = [];
  for (const [index, draft] of drafts.entries()) {
    const title = draft.title.trim();
    const templateStepId = draft.id?.trim() || `${templateId}:step-${index + 1}`;
    if (!title || existingStepIds.has(templateStepId)) continue;
    existingStepIds.add(templateStepId);
    newTasks.push({
      id: mutationId(meta, templateStepId),
      userId: meta.identity,
      semesterId: current.semester.id,
      title,
      category: draft.category?.trim() || "academics",
      priority:
        draft.priority ?? (assessment.weight >= 40 ? "high" : "medium"),
      estimatedMinutes: normalizeTaskMinutes(draft.estimatedMinutes),
      status: "planned",
      origin: {
        kind: "assessment-preparation",
        assessmentId,
        moduleId: moduleRecord.id,
        templateId,
        templateStepId,
      },
      prerequisiteTaskIds: [],
      requiredForMilestone: false,
      deferral: { deferCount: 0 },
      createdAt: timestamp,
      updatedAt: timestamp,
    });
  }
  if (!newTasks.length) return current;
  const generatedTaskIds = [
    ...(assessment.preparation?.generatedTaskIds ?? []).filter((id) =>
      current.tasks.some(
        (task) => task.id === id && task.status !== "cancelled",
      ),
    ),
    ...newTasks.map((task) => task.id),
  ];
  return {
    ...current,
    tasks: [...current.tasks, ...newTasks],
    modules: current.modules.map((item) =>
      item.id === moduleRecord.id
        ? {
            ...item,
            assessments: item.assessments.map((candidate) =>
              candidate.id === assessmentId
                ? {
                    ...candidate,
                    preparation: {
                      templateId,
                      generatedTaskIds,
                      generatedAt: timestamp,
                    },
                  }
                : candidate,
            ),
          }
        : item,
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
                    : assessment.status === "submitted"
                      ? "submitted"
                    : normalizedProgress === 100
                      ? "ready_to_submit"
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

export function markAssessmentSubmittedInData(
  current: ResolveData,
  moduleId: string,
  assessmentId: string,
  submitted = true,
  timestamp = new Date().toISOString(),
): ResolveData {
  const moduleRecord = current.modules.find((module) => module.id === moduleId);
  const assessment = moduleRecord?.assessments.find(
    (candidate) => candidate.id === assessmentId,
  );
  if (!assessment || assessment.status === "graded") return current;
  if (submitted && assessment.progress < 100) return current;

  return {
    ...current,
    modules: current.modules.map((module) =>
      module.id === moduleId
        ? {
            ...module,
            assessments: module.assessments.map((candidate) =>
              candidate.id === assessmentId
                ? {
                    ...candidate,
                    status: submitted
                      ? ("submitted" as const)
                      : candidate.progress === 100
                        ? ("ready_to_submit" as const)
                        : candidate.progress > 0
                          ? ("in_progress" as const)
                          : ("not_started" as const),
                    submittedAt: submitted ? timestamp : undefined,
                  }
                : candidate,
            ),
          }
        : module,
    ),
  };
}

export function removeAssessmentFromData(
  current: ResolveData,
  moduleId: string,
  assessmentId: string,
  linkedTaskPolicy: LinkedTaskRemovalPolicy = "preserve",
  timestamp = new Date().toISOString(),
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
    tasks:
      linkedTaskPolicy === "delete"
        ? current.tasks.filter(
            (task) =>
              !(
                task.assessmentId === assessmentId ||
                (task.origin?.kind === "assessment-preparation" &&
                  task.origin.assessmentId === assessmentId)
              ),
          )
        : current.tasks.map((task) =>
            task.assessmentId === assessmentId ||
            (task.origin?.kind === "assessment-preparation" &&
              task.origin.assessmentId === assessmentId)
              ? {
                  ...task,
                  assessmentId: undefined,
                  origin: undefined,
                  updatedAt: timestamp,
                }
              : task,
          ),
  };
}

export function updateModuleStudyMinutesInData(
  current: ResolveData,
  moduleId: string,
  minutes: number,
  date = offsetDate(0),
): ResolveData {
  if (
    !Number.isFinite(minutes) ||
    !isDateKey(date) ||
    !current.modules.some((module) => module.id === moduleId)
  ) {
    return current;
  }

  const weekDates = getWeekDateKeys(parseLocalDate(date));
  const desiredTotal = Math.min(10080, Math.max(0, Math.round(minutes)));
  const manualLogId = `manual:${moduleId}:${date}`;
  const otherMinutes = current.moduleStudyLogs
    .filter(
      (log) =>
        log.moduleId === moduleId &&
        weekDates.includes(log.date) &&
        log.id !== manualLogId,
    )
    .reduce((sum, log) => sum + log.minutes, 0);
  const todayMinutes = Math.min(
    1440,
    Math.max(0, desiredTotal - otherMinutes),
  );
  const withoutManual = current.moduleStudyLogs.filter(
    (log) => log.id !== manualLogId,
  );
  return {
    ...current,
    moduleStudyLogs: todayMinutes
      ? [
          ...withoutManual,
          {
            id: manualLogId,
            moduleId,
            userId: current.semester.userId,
            date,
            minutes: todayMinutes,
            note: "Manual study log",
          },
        ]
      : withoutManual,
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
  weekStart = getWeekDateKeys()[0],
): ResolveData {
  const cleaned = priorities.map((priority) => priority.trim());
  if (
    cleaned.length !== 3 ||
    !cleaned.some(Boolean) ||
    !isDateKey(weekStart) ||
    getWeekDateKeys(parseLocalDate(weekStart))[0] !== weekStart
  ) {
    return current;
  }
  return {
    ...current,
    weeklyPrioritiesByWeek: {
      ...current.weeklyPrioritiesByWeek,
      [weekStart]: cleaned,
    },
  };
}

function validEventInput(event: NewEventInput) {
  if (
    !event.title.trim() ||
    !isDateKey(event.date) ||
    !isValidTimeZone(event.timeZone)
  ) {
    return false;
  }
  if (
    event.startTime &&
    !/^([01]\d|2[0-3]):[0-5]\d$/.test(event.startTime)
  ) {
    return false;
  }
  if (
    event.durationMinutes !== undefined &&
    (!Number.isFinite(event.durationMinutes) || event.durationMinutes <= 0)
  ) {
    return false;
  }
  if (event.recurrence.kind === "none") return true;
  return (
    isDateKey(event.recurrence.startsOn) &&
    (!event.recurrence.endsOn || isDateKey(event.recurrence.endsOn)) &&
    event.recurrence.weekdays.length > 0
  );
}

export function addEventToData(
  current: ResolveData,
  event: NewEventInput,
  meta: MutationMeta,
): ResolveData {
  if (!validEventInput(event)) return current;
  const timestamp = mutationTime(meta);
  return {
    ...current,
    events: [
      ...current.events,
      {
        ...event,
        id: mutationId(meta),
        userId: meta.identity,
        semesterId: current.semester.id,
        title: event.title.trim(),
        category: event.category.trim() || "personal",
        timeZone: event.timeZone || current.preferences.timeZone,
        durationMinutes: Number.isFinite(event.durationMinutes)
          ? Math.min(1440, Math.max(5, Math.round(event.durationMinutes!)))
          : undefined,
        createdAt: timestamp,
        updatedAt: timestamp,
      },
    ],
  };
}

export function updateEventInData(
  current: ResolveData,
  eventId: string,
  event: UpdateEventInput,
  timestamp = new Date().toISOString(),
): ResolveData {
  if (
    !validEventInput(event) ||
    !current.events.some((item) => item.id === eventId)
  ) {
    return current;
  }
  return {
    ...current,
    events: current.events.map((item) =>
      item.id === eventId
        ? {
            ...item,
            ...event,
            title: event.title.trim(),
            category: event.category.trim() || "personal",
            timeZone: event.timeZone || current.preferences.timeZone,
            durationMinutes: Number.isFinite(event.durationMinutes)
              ? Math.min(
                  1440,
                  Math.max(5, Math.round(event.durationMinutes!)),
                )
              : undefined,
            updatedAt: timestamp,
          }
        : item,
    ),
  };
}

export function removeEventFromData(
  current: ResolveData,
  eventId: string,
): ResolveData {
  if (!current.events.some((event) => event.id === eventId)) return current;
  return {
    ...current,
    events: current.events.filter((event) => event.id !== eventId),
  };
}

export function updateWorkspacePreferencesInData(
  current: ResolveData,
  changes: Partial<WorkspacePreferences>,
): ResolveData {
  return {
    ...current,
    preferences: {
      ...current.preferences,
      timeZone:
        isValidTimeZone(changes.timeZone)
          ? changes.timeZone
          : current.preferences.timeZone,
      dailyCapacityMinutes: Number.isFinite(changes.dailyCapacityMinutes)
        ? Math.min(
            1440,
            Math.max(30, Math.round(changes.dailyCapacityMinutes!)),
          )
        : current.preferences.dailyCapacityMinutes,
      autoNextAction:
        changes.autoNextAction ?? current.preferences.autoNextAction,
      pinnedTaskId:
        hasOwn(changes, "pinnedTaskId")
          ? changes.pinnedTaskId &&
            current.tasks.some((task) => task.id === changes.pinnedTaskId)
            ? changes.pinnedTaskId
            : undefined
          : current.preferences.pinnedTaskId,
      hiddenRecommendationDate:
        hasOwn(changes, "hiddenRecommendationDate")
          ? changes.hiddenRecommendationDate &&
            isDateKey(changes.hiddenRecommendationDate)
            ? changes.hiddenRecommendationDate
            : undefined
          : current.preferences.hiddenRecommendationDate,
    },
  };
}

export function setMilestoneCompletionModeInData(
  current: ResolveData,
  milestoneId: string,
  completionMode: Milestone["completionMode"],
  timestamp = new Date().toISOString(),
): ResolveData {
  if (
    !current.milestones.some((milestone) => milestone.id === milestoneId) ||
    !["manual", "required_tasks"].includes(completionMode ?? "")
  ) {
    return current;
  }
  return recalculateAutomaticMilestones(
    {
      ...current,
      milestones: current.milestones.map((milestone) =>
        milestone.id === milestoneId
          ? { ...milestone, completionMode }
          : milestone,
      ),
    },
    timestamp,
  );
}

export function startNewSemesterInData(
  current: ResolveData,
  semester: Semester,
  timestamp = new Date().toISOString(),
): ResolveData {
  if (
    !semester.name.trim() ||
    !isDateKey(semester.startDate) ||
    !isDateKey(semester.endDate) ||
    semester.endDate <= semester.startDate
  ) {
    return current;
  }
  const summary = {
    id: `archive-${current.semester.id}-${timestamp}`,
    semesterId: current.semester.id,
    semesterName: current.semester.name,
    archivedAt: timestamp,
    completedTasks: current.tasks.filter((task) => task.status === "completed")
      .length,
    completedGoals: current.goals.filter((goal) => goal.status === "completed")
      .length,
    habitCompletions: current.habitLogs.filter((log) => log.completed).length,
    reflectionCount: current.reflections.length,
  };
  return {
    ...current,
    semester: {
      ...semester,
      userId: current.semester.userId,
      status: "active",
      resolutions: semester.resolutions ?? [],
    },
    goals: [],
    milestones: [],
    tasks: [],
    habits: [],
    habitLogs: [],
    guitarSessions: [],
    reflections: [],
    modules: [],
    moduleStudyLogs: [],
    algorithmLogs: [],
    applications: [],
    events: [],
    weeklyPriorities: ["", "", ""],
    weeklyPrioritiesByWeek: {},
    archiveSummaries: [...current.archiveSummaries, summary],
  };
}
