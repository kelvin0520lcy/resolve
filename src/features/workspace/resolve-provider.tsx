"use client";

import {
  createContext,
  useContext,
  useMemo,
  type ReactNode,
} from "react";
import { useAuth } from "@/contexts/auth-context";
import {
  getWeekDateKeys,
  isDateKey,
  offsetDate,
  parseLocalDate,
  toDateKey,
} from "@/lib/date";
import {
  addSemesterResolutionToData,
  addAssessmentToData,
  addEventToData,
  addAlgorithmLogToData,
  addApplicationToData,
  addGoalToData,
  addGuitarSessionToData,
  addHabitToData,
  addMilestoneToData,
  addModuleToData,
  addTaskToData,
  moveTaskInData,
  setTaskDailyPriorityInData,
  planAssessmentPreparationToData,
  removeAlgorithmLogFromData,
  removeApplicationFromData,
  removeAssessmentFromData,
  removeEventFromData,
  removeGoalFromData,
  removeGuitarSessionFromData,
  removeHabitFromData,
  removeMilestoneFromData,
  removeModuleFromData,
  removeReflectionFromData,
  removeSemesterResolutionFromData,
  removeTaskFromData,
  saveReflectionToData,
  setGoalCompletedInData,
  setMilestoneCompletionModeInData,
  startNewSemesterInData,
  toggleHabitInData,
  toggleMilestoneInData,
  toggleSemesterResolutionInData,
  toggleTaskInData,
  updateApplicationStageInData,
  updateApplicationInData,
  updateAssessmentInData,
  updateAssessmentProgressInData,
  markAssessmentSubmittedInData,
  updateAlgorithmLogInData,
  updateGoalInData,
  updateGuitarSessionInData,
  updateHabitInData,
  updateMilestoneInData,
  updateModuleInData,
  updateModuleStudyMinutesInData,
  updatePrioritiesInData,
  updateSemesterInData,
  updateEventInData,
  updateWorkspacePreferencesInData,
  updateSemesterResolutionInData,
  updateTaskInData,
  updateTaskActualMinutesInData,
  type GuitarSessionInput,
  type LinkedTaskRemovalPolicy,
  type NewAlgorithmLogInput,
  type NewApplicationInput,
  type NewAssessmentInput,
  type NewEventInput,
  type NewGoalInput,
  type NewHabitInput,
  type NewMilestoneInput,
  type NewModuleInput,
  type NewTaskInput,
  type NewSemesterResolutionInput,
  type UpdateAlgorithmLogInput,
  type UpdateApplicationInput,
  type UpdateAssessmentInput,
  type UpdateEventInput,
  type PreparationTaskDraft,
  type UpdateGoalInput,
  type UpdateHabitInput,
  type UpdateMilestoneInput,
  type UpdateModuleInput,
  type UpdateTaskInput,
  type UpdateSemesterResolutionInput,
} from "@/features/workspace/lib/resolve-actions";
import {
  useWorkspaceSync,
  type WorkspaceSyncMetrics,
} from "@/features/workspace/sync/use-workspace-sync";
export {
  CLOUD_REFRESH_INTERVAL_MS,
  CLOUD_SAVE_DEBOUNCE_MS,
} from "@/features/workspace/sync/use-workspace-sync";
import type { WorkspaceSizeReport } from "@/features/workspace/lib/workspace-size";
import type { WorkspaceConflict } from "@/features/workspace/lib/patches";
import type { RecoverySnapshot } from "@/features/workspace/lib/recovery";
import { WorkspaceRecovery } from "@/components/workspace/workspace-recovery";
import {
  createEmptyGuitarLearningState,
  normalizeGuitarLearningState,
} from "@/features/guitar-learning/lib/learning-state";
import type { GuitarLearningState } from "@/features/guitar-learning/types";
import type { ResolveData } from "@/features/workspace/types";
import type {
  AcademicModule,
  AlgorithmLog,
  Goal,
  GuitarPracticeSession,
  Habit,
  HabitLog,
  JobApplication,
  Milestone,
  ModuleStudyLog,
  Reflection,
  Semester,
  SemesterResolution,
  Task,
  WorkspaceEvent,
} from "@/types";

type ResolveContextValue = ResolveData & {
  storageMode: "browser" | "cloud";
  syncStatus:
    | "demo"
    | "connecting"
    | "migrating"
    | "saving"
    | "synced"
    | "offline"
    | "conflict"
    | "recovery_required"
    | "error";
  syncError: string;
  lastSyncedAt: string | null;
  conflicts: WorkspaceConflict[];
  isSyncLeader: boolean;
  workspaceSize: WorkspaceSizeReport;
  syncMetrics: WorkspaceSyncMetrics;
  canUndo: boolean;
  syncWorkspaceNow: () => Promise<void>;
  resolveConflict: (
    conflictId: string,
    choice: "local" | "remote",
  ) => void;
  undoLastChange: () => void;
  exportWorkspace: () => void;
  exportTasksCsv: () => void;
  exportCalendarIcs: () => void;
  importWorkspace: (value: unknown) => Promise<void>;
  listRecoverySnapshots: () => Promise<RecoverySnapshot[]>;
  deleteRecoverySnapshot: (id: string) => Promise<void>;
  addTask: (task: NewTaskInput) => void;
  updateTask: (taskId: string, task: UpdateTaskInput) => void;
  toggleTask: (taskId: string) => void;
  removeTask: (taskId: string) => void;
  moveTask: (taskId: string, scheduledDate: string) => void;
  setTaskDailyPriority: (
    taskId: string,
    rank: Task["dailyPriorityRank"],
  ) => void;
  addGoal: (goal: NewGoalInput) => void;
  updateGoal: (goalId: string, goal: UpdateGoalInput) => void;
  removeGoal: (
    goalId: string,
    linkedTaskPolicy?: LinkedTaskRemovalPolicy,
  ) => void;
  addMilestone: (goalId: string, milestone: NewMilestoneInput) => void;
  updateMilestone: (
    milestoneId: string,
    milestone: UpdateMilestoneInput,
  ) => void;
  toggleMilestone: (milestoneId: string) => void;
  removeMilestone: (milestoneId: string) => void;
  setGoalCompleted: (goalId: string, completed: boolean) => void;
  addHabit: (habit: NewHabitInput) => void;
  updateHabit: (habitId: string, habit: UpdateHabitInput) => void;
  removeHabit: (habitId: string) => void;
  addModule: (module: NewModuleInput) => void;
  updateModule: (moduleId: string, module: UpdateModuleInput) => void;
  removeModule: (
    moduleId: string,
    linkedTaskPolicy?: LinkedTaskRemovalPolicy,
  ) => void;
  addAssessment: (assessment: NewAssessmentInput) => void;
  updateAssessment: (
    assessmentId: string,
    assessment: UpdateAssessmentInput,
  ) => void;
  removeAssessment: (
    moduleId: string,
    assessmentId: string,
    linkedTaskPolicy?: LinkedTaskRemovalPolicy,
  ) => void;
  addAlgorithmLog: (log: NewAlgorithmLogInput) => void;
  updateAlgorithmLog: (
    logId: string,
    log: UpdateAlgorithmLogInput,
  ) => void;
  removeAlgorithmLog: (logId: string) => void;
  addApplication: (application: NewApplicationInput) => void;
  updateApplication: (
    applicationId: string,
    application: UpdateApplicationInput,
  ) => void;
  removeApplication: (applicationId: string) => void;
  updateApplicationStage: (
    applicationId: string,
    stage: JobApplication["stage"],
  ) => void;
  updateAssessmentProgress: (
    moduleId: string,
    assessmentId: string,
    progress: number,
  ) => void;
  markAssessmentSubmitted: (
    moduleId: string,
    assessmentId: string,
    submitted?: boolean,
  ) => void;
  planAssessmentPreparation: (
    assessmentId: string,
    templateId: string,
    drafts: PreparationTaskDraft[],
  ) => void;
  updateModuleStudyMinutes: (moduleId: string, minutes: number) => void;
  updateTaskActualMinutes: (taskId: string, minutes: number) => void;
  toggleHabit: (habitId: string, date: string) => void;
  addGuitarSession: (session: GuitarSessionInput) => void;
  updateGuitarSession: (
    sessionId: string,
    session: GuitarSessionInput,
  ) => void;
  removeGuitarSession: (sessionId: string) => void;
  updateGuitarLearning: (
    updater: (current: GuitarLearningState) => GuitarLearningState,
  ) => void;
  saveReflection: (
    reflection: Omit<
      Reflection,
      "id" | "userId" | "semesterId" | "createdAt"
    >,
  ) => void;
  removeReflection: (reflectionId: string) => void;
  addSemesterResolution: (resolution: NewSemesterResolutionInput) => void;
  updateSemesterResolution: (
    resolutionId: string,
    resolution: UpdateSemesterResolutionInput,
  ) => void;
  toggleSemesterResolution: (resolutionId: string) => void;
  removeSemesterResolution: (resolutionId: string) => void;
  updateSemester: (semester: Semester) => void;
  updatePriorities: (priorities: string[], weekStart?: string) => void;
  addEvent: (event: NewEventInput) => void;
  updateEvent: (eventId: string, event: UpdateEventInput) => void;
  removeEvent: (eventId: string) => void;
  setMilestoneCompletionMode: (
    milestoneId: string,
    mode: Milestone["completionMode"],
  ) => void;
  updateWorkspacePreferences: (
    changes: Partial<ResolveData["preferences"]>,
  ) => void;
  archiveSemester: (nextSemester: Semester) => Promise<void>;
  resetWorkspace: () => void;
};

const ResolveContext = createContext<ResolveContextValue | null>(null);

export { getWeekDateKeys, offsetDate, toDateKey };

export function createEmptyData(userId: string): ResolveData {
  const year = new Date().getFullYear();
  const timeZone =
    Intl.DateTimeFormat().resolvedOptions().timeZone || "Asia/Kuala_Lumpur";
  return {
    semester: {
      id: `semester-${userId}`,
      userId,
      name: "My semester",
      academicYear: `${year}/${year + 1}`,
      startDate: offsetDate(0),
      endDate: offsetDate(112),
      resolutions: [],
      status: "active",
    },
    goals: [],
    milestones: [],
    tasks: [],
    habits: [],
    habitLogs: [],
    guitarSessions: [],
    guitarLearning: createEmptyGuitarLearningState(userId),
    reflections: [],
    modules: [],
    moduleStudyLogs: [],
    algorithmLogs: [],
    applications: [],
    events: [],
    weeklyPriorities: ["", "", ""],
    weeklyPrioritiesByWeek: {},
    preferences: {
      timeZone,
      dailyCapacityMinutes: 480,
      autoNextAction: true,
    },
    archiveSummaries: [],
  };
}

export function normalizeStoredData(
  value: unknown,
  userId: string,
): ResolveData {
  const seed = createEmptyData(userId);
  if (!value || typeof value !== "object" || Array.isArray(value)) return seed;

  const stored = value as Partial<ResolveData>;
  const recordArray = <T,>(candidate: unknown): T[] =>
    Array.isArray(candidate)
      ? (candidate.filter(
          (item) =>
            Boolean(item) && typeof item === "object" && !Array.isArray(item),
        ) as T[])
      : [];
  const stringArray = (candidate: unknown): string[] =>
    Array.isArray(candidate)
      ? candidate
          .filter((item): item is string => typeof item === "string")
          .map((item) => item.trim())
          .filter(Boolean)
      : [];
  const optionalDate = (candidate: unknown) =>
    isDateKey(candidate) ? candidate : undefined;
  const deadlineValue = (candidate: unknown, legacy?: unknown) => {
    if (candidate && typeof candidate === "object" && !Array.isArray(candidate)) {
      const value = candidate as { kind?: unknown; date?: unknown; at?: unknown; timeZone?: unknown };
      if (value.kind === "date" && isDateKey(value.date)) {
        return { kind: "date" as const, date: value.date };
      }
      if (
        value.kind === "dateTime" &&
        typeof value.at === "string" &&
        !Number.isNaN(Date.parse(value.at)) &&
        typeof value.timeZone === "string" &&
        value.timeZone
      ) {
        return {
          kind: "dateTime" as const,
          at: value.at,
          timeZone: value.timeZone,
        };
      }
    }
    return isDateKey(legacy)
      ? ({ kind: "date" as const, date: legacy })
      : undefined;
  };
  const storedSemester =
    stored.semester &&
    typeof stored.semester === "object" &&
    !Array.isArray(stored.semester)
      ? stored.semester
      : undefined;
  const legacyResolution =
    typeof storedSemester?.mainResolution === "string"
      ? storedSemester.mainResolution.trim() || undefined
      : undefined;
  const normalizedResolutions = recordArray<SemesterResolution>(
    storedSemester?.resolutions,
  )
    .filter(
      (resolution) =>
        typeof resolution.id === "string" &&
        Boolean(resolution.id) &&
        typeof resolution.title === "string",
    )
    .map((resolution) => {
      const completed = resolution.completed === true;
      const createdAt =
        typeof resolution.createdAt === "string" && resolution.createdAt
          ? resolution.createdAt
          : `${storedSemester?.startDate ?? seed.semester.startDate}T00:00:00.000Z`;
      return {
        id: resolution.id,
        title: resolution.title.trim(),
        completed,
        createdAt,
        updatedAt:
          typeof resolution.updatedAt === "string" && resolution.updatedAt
            ? resolution.updatedAt
            : createdAt,
        completedAt:
          completed && typeof resolution.completedAt === "string"
            ? resolution.completedAt
            : undefined,
      };
    })
    .filter((resolution) => Boolean(resolution.title));
  const resolutions =
    normalizedResolutions.length || !legacyResolution
      ? normalizedResolutions
      : [
          {
            id: "legacy-main-resolution",
            title: legacyResolution,
            completed: false,
            createdAt: `${storedSemester?.startDate ?? seed.semester.startDate}T00:00:00.000Z`,
            updatedAt: `${storedSemester?.startDate ?? seed.semester.startDate}T00:00:00.000Z`,
          },
        ];
  const semester =
    storedSemester &&
    isDateKey(storedSemester.startDate) &&
    isDateKey(storedSemester.endDate) &&
    storedSemester.endDate > storedSemester.startDate
      ? {
          ...seed.semester,
          ...storedSemester,
          id:
            typeof storedSemester.id === "string" && storedSemester.id
              ? storedSemester.id
              : seed.semester.id,
          userId,
          name:
            typeof storedSemester.name === "string" &&
            storedSemester.name.trim()
              ? storedSemester.name.trim()
              : seed.semester.name,
          academicYear:
            typeof storedSemester.academicYear === "string"
              ? storedSemester.academicYear.trim()
              : seed.semester.academicYear,
          recessWeekStart: optionalDate(storedSemester.recessWeekStart),
          readingWeekStart: optionalDate(storedSemester.readingWeekStart),
          examPeriodStart: optionalDate(storedSemester.examPeriodStart),
          theme:
            typeof storedSemester.theme === "string"
              ? storedSemester.theme.trim() || undefined
              : undefined,
          resolutions,
          mainResolution: legacyResolution,
          targetGpa: Number.isFinite(storedSemester.targetGpa)
            ? Math.min(5, Math.max(0, storedSemester.targetGpa!))
            : undefined,
          description:
            typeof storedSemester.description === "string"
              ? storedSemester.description.trim() || undefined
              : undefined,
          status: ["upcoming", "active", "completed"].includes(
            storedSemester.status,
          )
            ? storedSemester.status
            : ("active" as const),
        }
      : seed.semester;
  const priorities =
    Array.isArray(stored.weeklyPriorities) &&
    stored.weeklyPriorities.length === 3 &&
    stored.weeklyPriorities.every(
      (priority) => typeof priority === "string",
    )
      ? stored.weeklyPriorities.map((priority) => priority.trim())
      : seed.weeklyPriorities;
  const weeklyPrioritiesByWeek =
    stored.weeklyPrioritiesByWeek &&
    typeof stored.weeklyPrioritiesByWeek === "object" &&
    !Array.isArray(stored.weeklyPrioritiesByWeek)
      ? Object.fromEntries(
          Object.entries(stored.weeklyPrioritiesByWeek).flatMap(
            ([weekStart, value]) =>
              isDateKey(weekStart) &&
              getWeekDateKeys(parseLocalDate(weekStart))[0] === weekStart &&
              Array.isArray(value) &&
              value.length === 3 &&
              value.every((priority) => typeof priority === "string")
                ? [[weekStart, value.map((priority) => priority.trim())]]
                : [],
          ),
        )
      : {};
  const rawMilestones = recordArray<Milestone>(stored.milestones)
    .filter(
      (milestone) =>
        typeof milestone.id === "string" &&
        typeof milestone.goalId === "string" &&
        typeof milestone.title === "string",
    )
    .map((milestone, index) => ({
      ...milestone,
      title: milestone.title.trim(),
      description:
        typeof milestone.description === "string"
          ? milestone.description.trim() || undefined
          : undefined,
      deadline: optionalDate(milestone.deadline),
      deadlineInfo: deadlineValue(
        milestone.deadlineInfo,
        milestone.deadline,
      ),
      completed: milestone.completed === true,
      completedAt:
        milestone.completed === true &&
        typeof milestone.completedAt === "string"
          ? milestone.completedAt
          : undefined,
      order: Number.isFinite(milestone.order)
        ? Math.max(1, Math.round(milestone.order))
        : index + 1,
      completionMode:
        milestone.completionMode === "required_tasks"
          ? ("required_tasks" as const)
          : ("manual" as const),
    }))
    .filter((milestone) => Boolean(milestone.title));
  const validGoalStatuses: Goal["status"][] = [
    "not_started",
    "active",
    "at_risk",
    "paused",
    "completed",
    "abandoned",
  ];
  const validPriorities: Goal["priority"][] = ["low", "medium", "high"];
  const validGoalMeasurements: Goal["measurementType"][] = [
    "percentage",
    "count",
    "duration",
    "milestone",
    "manual",
  ];
  const goals = recordArray<Goal>(stored.goals)
    .filter(
      (goal) =>
        typeof goal.id === "string" && typeof goal.title === "string",
    )
    .map((goal) => {
      const goalMilestones = rawMilestones.filter(
        (milestone) => milestone.goalId === goal.id,
      );
      const completionIsValid =
        goalMilestones.length === 0 ||
        goalMilestones.every((milestone) => milestone.completed);

      return {
        ...goal,
        userId,
        semesterId: semester.id,
        title: goal.title.trim(),
        description:
          typeof goal.description === "string" ? goal.description.trim() : "",
        category:
          typeof goal.category === "string" && goal.category.trim()
            ? goal.category
            : "custom",
        priority: validPriorities.includes(goal.priority)
          ? goal.priority
          : "medium",
        measurementType: goalMilestones.length
          ? ("milestone" as const)
          : validGoalMeasurements.includes(goal.measurementType)
            ? goal.measurementType
            : ("manual" as const),
        targetValue:
          Number.isFinite(goal.targetValue) && goal.targetValue! > 0
            ? goal.targetValue
            : undefined,
        currentValue: Number.isFinite(goal.currentValue)
          ? Math.max(0, goal.currentValue!)
          : undefined,
        unit:
          typeof goal.unit === "string"
            ? goal.unit.trim() || undefined
            : undefined,
        startDate: optionalDate(goal.startDate) ?? semester.startDate,
        deadline: optionalDate(goal.deadline),
        deadlineInfo: deadlineValue(goal.deadlineInfo, goal.deadline),
        status:
          goal.status === "completed" && !completionIsValid
            ? ("active" as const)
            : validGoalStatuses.includes(goal.status)
              ? goal.status
              : ("active" as const),
        createdAt:
          typeof goal.createdAt === "string" ? goal.createdAt : "",
        updatedAt:
          typeof goal.updatedAt === "string" ? goal.updatedAt : "",
      };
    })
    .filter((goal) => Boolean(goal.title));
  const goalIds = new Set(goals.map((goal) => goal.id));
  const milestones = rawMilestones.filter((milestone) =>
    goalIds.has(milestone.goalId),
  );
  const milestoneIds = new Set(
    milestones.map((milestone) => milestone.id),
  );
  const milestoneGoalById = new Map(
    milestones.map((milestone) => [milestone.id, milestone.goalId]),
  );
  const validTaskStatuses: Task["status"][] = [
    "planned",
    "in_progress",
    "completed",
    "skipped",
    "rescheduled",
    "cancelled",
  ];
  const tasks = recordArray<Task>(stored.tasks)
    .filter(
      (task) =>
        typeof task.id === "string" && typeof task.title === "string",
    )
    .map((task) => {
      const legacyScheduleDate = optionalDate(task.scheduledDate);
      const scheduleCandidate =
        task.schedule &&
        typeof task.schedule === "object" &&
        !Array.isArray(task.schedule)
          ? task.schedule
          : undefined;
      const scheduleDate =
        optionalDate(scheduleCandidate?.date) ?? legacyScheduleDate;
      const scheduleMinutes = Number.isFinite(
        scheduleCandidate?.estimatedMinutes,
      )
        ? Math.min(
            720,
            Math.max(5, Math.round(scheduleCandidate!.estimatedMinutes!)),
          )
        : Number.isFinite(task.estimatedMinutes)
          ? Math.min(720, Math.max(5, Math.round(task.estimatedMinutes!)))
          : undefined;
      const timeZone =
        typeof scheduleCandidate?.timeZone === "string" &&
        scheduleCandidate.timeZone
          ? scheduleCandidate.timeZone
          : seed.preferences.timeZone;
      return {
      ...task,
      userId,
      semesterId: semester.id,
      title: task.title.trim(),
      category:
        typeof task.category === "string" && task.category.trim()
          ? task.category
          : "custom",
      scheduledDate: scheduleDate,
      deadline: optionalDate(task.deadline),
      schedule: scheduleDate
        ? {
            date: scheduleDate,
            startTime:
              typeof scheduleCandidate?.startTime === "string" &&
              /^([01]\d|2[0-3]):[0-5]\d$/.test(scheduleCandidate.startTime)
                ? scheduleCandidate.startTime
                : undefined,
            estimatedMinutes: scheduleMinutes,
            timeZone,
          }
        : undefined,
      deadlineInfo: deadlineValue(task.deadlineInfo, task.deadline),
      estimatedMinutes: scheduleMinutes,
      actualMinutes: Number.isFinite(task.actualMinutes)
        ? Math.min(720, Math.max(0, Math.round(task.actualMinutes!)))
        : undefined,
      difficulty: Number.isFinite(task.difficulty)
        ? (Math.min(
            5,
            Math.max(1, Math.round(task.difficulty!)),
          ) as Task["difficulty"])
        : undefined,
      priority: validPriorities.includes(task.priority)
        ? task.priority
        : "medium",
      status: validTaskStatuses.includes(task.status)
        ? task.status
        : "planned",
      goalId:
        typeof task.milestoneId === "string" &&
        milestoneGoalById.has(task.milestoneId)
          ? milestoneGoalById.get(task.milestoneId)
          : typeof task.goalId === "string" && goalIds.has(task.goalId)
            ? task.goalId
            : undefined,
      milestoneId:
        typeof task.milestoneId === "string" &&
        milestoneIds.has(task.milestoneId)
          ? task.milestoneId
          : undefined,
      moduleId:
        typeof task.moduleId === "string" ? task.moduleId : undefined,
      assessmentId:
        typeof task.assessmentId === "string"
          ? task.assessmentId
          : undefined,
      createdAt:
        typeof task.createdAt === "string" ? task.createdAt : "",
      updatedAt:
        typeof task.updatedAt === "string" ? task.updatedAt : "",
      prerequisiteTaskIds: stringArray(task.prerequisiteTaskIds),
      requiredForMilestone:
        typeof task.milestoneId === "string" &&
        milestoneIds.has(task.milestoneId) &&
        task.requiredForMilestone === true,
      dailyPriorityRank: [1, 2, 3].includes(task.dailyPriorityRank ?? 0)
        ? task.dailyPriorityRank
        : undefined,
      deferral: {
        deferCount:
          task.deferral &&
          Number.isFinite(task.deferral.deferCount)
            ? Math.max(0, Math.round(task.deferral.deferCount))
            : 0,
        lastDeferredFrom: optionalDate(task.deferral?.lastDeferredFrom),
        lastDeferredTo: optionalDate(task.deferral?.lastDeferredTo),
        lastDeferredAt:
          typeof task.deferral?.lastDeferredAt === "string"
            ? task.deferral.lastDeferredAt
            : undefined,
        lastReason:
          typeof task.deferral?.lastReason === "string"
            ? task.deferral.lastReason.trim() || undefined
            : undefined,
      },
    };
    })
    .filter((task) => Boolean(task.title));
  const habits = recordArray<Habit>(stored.habits)
    .filter(
      (habit) =>
        typeof habit.id === "string" && typeof habit.title === "string",
    )
    .map((habit) => {
      const targetDays = Array.isArray(habit.targetDays)
        ? [
            ...new Set(
              habit.targetDays.filter(
                (day) =>
                  Number.isInteger(day) &&
                  Number(day) >= 0 &&
                  Number(day) <= 6,
              ),
            ),
          ].sort((a, b) => a - b)
        : [];
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
                    ? habit.targetFrequency
                    : 1,
                ),
              ),
            )
          : targetDays.length;

      return {
        ...habit,
        userId,
        semesterId: semester.id,
        title: habit.title.trim(),
        scheduleType,
        targetDays,
        targetFrequency,
        isActive: habit.isActive !== false,
      };
    })
    .filter(
      (habit) =>
        Boolean(habit.title) &&
        (habit.scheduleType === "times_per_week" ||
          habit.targetDays.length > 0),
    );
  const habitIds = new Set(habits.map((habit) => habit.id));
  const habitLogs = recordArray<HabitLog>(stored.habitLogs)
    .filter(
      (log) =>
        typeof log.id === "string" &&
        typeof log.habitId === "string" &&
        habitIds.has(log.habitId) &&
        isDateKey(log.date),
    )
    .map((log) => ({
      ...log,
      userId,
      completed: log.completed === true,
    }));
  const guitarSessions = recordArray<GuitarPracticeSession>(
    stored.guitarSessions,
  )
    .filter(
      (session) =>
        typeof session.id === "string" &&
        isDateKey(session.date) &&
        typeof session.category === "string" &&
        Number.isFinite(session.durationMinutes) &&
        session.durationMinutes > 0,
    )
    .map((session) => ({
      ...session,
      userId,
      semesterId: semester.id,
      category: session.category.trim() || "Foundations",
      durationMinutes: Math.min(
        720,
        Math.max(5, Math.round(session.durationMinutes)),
      ),
      techniques: stringArray(session.techniques),
      cleanBpm: Number.isFinite(session.cleanBpm)
        ? Math.min(400, Math.max(20, Math.round(session.cleanBpm!)))
        : undefined,
      confidence: Number.isFinite(session.confidence)
        ? Math.min(5, Math.max(1, Math.round(session.confidence!)))
        : undefined,
      difficulty: Number.isFinite(session.difficulty)
        ? Math.min(5, Math.max(1, Math.round(session.difficulty!)))
        : undefined,
    }));
  const guitarLearning = normalizeGuitarLearningState(
    stored.guitarLearning,
    userId,
  );
  const validReflectionTypes: Reflection["type"][] = [
    "daily",
    "weekly",
    "monthly",
    "semester",
  ];
  const reflections = recordArray<Reflection>(stored.reflections)
    .filter(
      (reflection) =>
        typeof reflection.id === "string" &&
        isDateKey(reflection.periodStart) &&
        isDateKey(reflection.periodEnd) &&
        reflection.periodEnd >= reflection.periodStart,
    )
    .map((reflection) => ({
      ...reflection,
      userId,
      semesterId: semester.id,
      type: validReflectionTypes.includes(reflection.type)
        ? reflection.type
        : ("daily" as const),
      createdAt:
        typeof reflection.createdAt === "string"
          ? reflection.createdAt
          : "",
    }));
  const validAssessmentTypes: AcademicModule["assessments"][number]["type"][] =
    ["assignment", "project", "quiz", "midterm", "presentation", "exam"];
  const validAssessmentStatuses: AcademicModule["assessments"][number]["status"][] =
    [
      "not_started",
      "in_progress",
      "ready_to_submit",
      "submitted",
      "graded",
    ];
  const modules = recordArray<AcademicModule>(stored.modules)
    .filter(
      (module) =>
        typeof module.id === "string" &&
        typeof module.code === "string" &&
        typeof module.name === "string",
    )
    .map((module) => ({
      ...module,
      userId,
      semesterId: semester.id,
      code: module.code.trim().toUpperCase(),
      name: module.name.trim(),
      credits: Number.isFinite(module.credits)
        ? Math.min(30, Math.max(1, Math.round(module.credits)))
        : 1,
      weeklyStudyMinutes: Number.isFinite(module.weeklyStudyMinutes)
        ? Math.min(
            10080,
            Math.max(0, Math.round(module.weeklyStudyMinutes)),
          )
        : 0,
      assessments: recordArray<AcademicModule["assessments"][number]>(
        module.assessments,
      )
        .filter(
          (assessment) =>
            typeof assessment.id === "string" &&
            typeof assessment.title === "string" &&
            isDateKey(assessment.deadline),
        )
        .map((assessment) => ({
          ...assessment,
          moduleId: module.id,
          title: assessment.title.trim(),
          type: validAssessmentTypes.includes(assessment.type)
            ? assessment.type
            : ("assignment" as const),
          weight: Number.isFinite(assessment.weight)
            ? Math.min(100, Math.max(0, Math.round(assessment.weight)))
            : 0,
          progress: Number.isFinite(assessment.progress)
            ? Math.min(100, Math.max(0, Math.round(assessment.progress)))
            : 0,
          status: validAssessmentStatuses.includes(assessment.status)
            ? assessment.status
            : ("not_started" as const),
          submittedAt:
            typeof assessment.submittedAt === "string"
              ? assessment.submittedAt
              : undefined,
          feedback:
            typeof assessment.feedback === "string"
              ? assessment.feedback.trim() || undefined
              : undefined,
          lessonsLearned:
            typeof assessment.lessonsLearned === "string"
              ? assessment.lessonsLearned.trim() || undefined
              : undefined,
          estimatedEffortMinutes: Number.isFinite(
            assessment.estimatedEffortMinutes,
          )
            ? Math.min(
                10080,
                Math.max(5, Math.round(assessment.estimatedEffortMinutes!)),
              )
            : undefined,
          deadlineInfo: deadlineValue(
            assessment.deadlineInfo,
            assessment.deadline,
          ),
          preparation: {
            templateId:
              typeof assessment.preparation?.templateId === "string"
                ? assessment.preparation.templateId
                : undefined,
            generatedTaskIds: stringArray(
              assessment.preparation?.generatedTaskIds,
            ),
            generatedAt:
              typeof assessment.preparation?.generatedAt === "string"
                ? assessment.preparation.generatedAt
                : undefined,
          },
        })),
    }))
    .filter((module) => Boolean(module.code) && Boolean(module.name));
  const moduleIds = new Set(modules.map((module) => module.id));
  const moduleStudyLogs = recordArray<ModuleStudyLog>(stored.moduleStudyLogs)
    .filter(
      (log) =>
        typeof log.id === "string" &&
        typeof log.moduleId === "string" &&
        moduleIds.has(log.moduleId) &&
        isDateKey(log.date) &&
        Number.isFinite(log.minutes) &&
        log.minutes > 0,
    )
    .map((log) => ({
      ...log,
      userId,
      minutes: Math.min(1440, Math.max(1, Math.round(log.minutes))),
      sourceTaskId:
        typeof log.sourceTaskId === "string" &&
        tasks.some((task) => task.id === log.sourceTaskId)
          ? log.sourceTaskId
          : undefined,
      note:
        typeof log.note === "string" ? log.note.trim() || undefined : undefined,
    }));
  const validDifficulties: AlgorithmLog["difficulty"][] = [
    "Easy",
    "Medium",
    "Hard",
  ];
  const algorithmLogs = recordArray<AlgorithmLog>(stored.algorithmLogs)
    .filter(
      (log) =>
        typeof log.id === "string" &&
        typeof log.problemName === "string" &&
        isDateKey(log.completedDate) &&
        Number.isFinite(log.minutes),
    )
    .map((log) => ({
      ...log,
      userId,
      semesterId: semester.id,
      problemName: log.problemName.trim(),
      platform:
        typeof log.platform === "string" && log.platform.trim()
          ? log.platform.trim()
          : "Practice",
      topic:
        typeof log.topic === "string" && log.topic.trim()
          ? log.topic.trim()
          : "General",
      difficulty: validDifficulties.includes(log.difficulty)
        ? log.difficulty
        : ("Medium" as const),
      minutes: Math.min(720, Math.max(1, Math.round(log.minutes))),
      confidence: Number.isFinite(log.confidence)
        ? Math.min(5, Math.max(1, Math.round(log.confidence)))
        : 3,
      lesson: typeof log.lesson === "string" ? log.lesson.trim() : "",
      usedHints: log.usedHints === true,
    }))
    .filter((log) => Boolean(log.problemName));
  const validApplicationStages: JobApplication["stage"][] = [
    "saved",
    "applied",
    "assessment",
    "interview",
    "offer",
    "closed",
  ];
  const applications = recordArray<JobApplication>(stored.applications)
    .filter(
      (application) =>
        typeof application.id === "string" &&
        typeof application.company === "string" &&
        typeof application.role === "string" &&
        isDateKey(application.applicationDate),
    )
    .map((application) => ({
      ...application,
      userId,
      company: application.company.trim(),
      role: application.role.trim(),
      stage: validApplicationStages.includes(application.stage)
        ? application.stage
        : ("saved" as const),
      nextAction:
        typeof application.nextAction === "string"
          ? application.nextAction.trim() || undefined
          : undefined,
      nextActionDate: optionalDate(application.nextActionDate),
      nextActionDeadline: deadlineValue(
        application.nextActionDeadline,
        application.nextActionDate,
      ),
    }))
    .filter(
      (application) =>
        Boolean(application.company) && Boolean(application.role),
    );

  const validRecurrenceKinds = [
    "none",
    "weekly",
    "fortnightly",
    "selected_weekdays",
  ];
  const events = recordArray<WorkspaceEvent>(stored.events)
    .filter(
      (event) =>
        typeof event.id === "string" &&
        typeof event.title === "string" &&
        isDateKey(event.date),
    )
    .map((event) => {
      const rawRecurrence = (
        event.recurrence &&
        typeof event.recurrence === "object" &&
        !Array.isArray(event.recurrence)
          ? event.recurrence
          : { kind: "none" }
      ) as Record<string, unknown>;
      const rawKind =
        typeof rawRecurrence.kind === "string" ? rawRecurrence.kind : "none";
      const kind = validRecurrenceKinds.includes(rawKind)
        ? rawKind
        : "none";
      const rawWeekdays = rawRecurrence.weekdays;
      const weekdays: number[] = Array.isArray(rawWeekdays)
        ? [
            ...new Set(
              rawWeekdays.filter(
                (day): day is number =>
                  typeof day === "number" &&
                  Number.isInteger(day) &&
                  day >= 0 &&
                  day <= 6,
              ),
            ),
          ]
        : [];
      const recurrence =
        kind === "none"
          ? ({ kind: "none" } as const)
          : {
              kind: kind as "weekly" | "fortnightly" | "selected_weekdays",
              weekdays,
              startsOn:
                optionalDate(
                  rawRecurrence.startsOn,
                ) ?? event.date,
              endsOn: optionalDate(rawRecurrence.endsOn),
              excludedDates: Array.isArray(rawRecurrence.excludedDates)
                ? rawRecurrence.excludedDates.filter(
                    (date): date is string => isDateKey(date),
                  )
                : [],
            };
      return {
        ...event,
        userId,
        semesterId: semester.id,
        title: event.title.trim(),
        category:
          typeof event.category === "string" && event.category.trim()
            ? event.category.trim()
            : "personal",
        startTime:
          typeof event.startTime === "string" &&
          /^([01]\d|2[0-3]):[0-5]\d$/.test(event.startTime)
            ? event.startTime
            : undefined,
        durationMinutes: Number.isFinite(event.durationMinutes)
          ? Math.min(1440, Math.max(5, Math.round(event.durationMinutes!)))
          : undefined,
        timeZone:
          typeof event.timeZone === "string" && event.timeZone
            ? event.timeZone
            : seed.preferences.timeZone,
        recurrence,
        createdAt:
          typeof event.createdAt === "string" ? event.createdAt : "",
        updatedAt:
          typeof event.updatedAt === "string" ? event.updatedAt : "",
      };
    })
    .filter((event) => Boolean(event.title));
  const storedPreferences =
    stored.preferences &&
    typeof stored.preferences === "object" &&
    !Array.isArray(stored.preferences)
      ? stored.preferences
      : undefined;
  const preferences = {
    timeZone:
      typeof storedPreferences?.timeZone === "string" &&
      storedPreferences.timeZone
        ? storedPreferences.timeZone
        : seed.preferences.timeZone,
    dailyCapacityMinutes: Number.isFinite(
      storedPreferences?.dailyCapacityMinutes,
    )
      ? Math.min(
          1440,
          Math.max(30, Math.round(storedPreferences!.dailyCapacityMinutes)),
        )
      : seed.preferences.dailyCapacityMinutes,
    autoNextAction: storedPreferences?.autoNextAction !== false,
    pinnedTaskId:
      typeof storedPreferences?.pinnedTaskId === "string" &&
      tasks.some((task) => task.id === storedPreferences.pinnedTaskId)
        ? storedPreferences.pinnedTaskId
        : undefined,
    hiddenRecommendationDate: optionalDate(
      storedPreferences?.hiddenRecommendationDate,
    ),
  };

  return {
    semester,
    goals,
    milestones,
    tasks,
    habits,
    habitLogs,
    guitarSessions,
    guitarLearning,
    reflections,
    modules,
    moduleStudyLogs,
    algorithmLogs,
    applications,
    events,
    weeklyPriorities: priorities,
    weeklyPrioritiesByWeek,
    preferences,
    archiveSummaries: recordArray(stored.archiveSummaries),
  };
}

export function ResolveProvider({ children }: { children: ReactNode }) {
  const { user, isConfigured } = useAuth();
  const identity = user?.id ?? "demo-user";
  const accountSyncEnabled = isConfigured && Boolean(user);
  const emptyData = useMemo(() => createEmptyData(identity), [identity]);
  const {
    data,
    hydrated,
    storageMode,
    syncStatus,
    syncError,
    lastSyncedAt,
    conflicts,
    isSyncLeader,
    workspaceSize,
    syncMetrics,
    canUndo,
    recoveryRequired,
    mutateData,
    syncWorkspaceNow,
    resolveConflict,
    undoLastChange,
    exportWorkspace,
    exportTasksCsv,
    exportCalendarIcs,
    importWorkspace,
    archiveWorkspace,
    listRecoverySnapshots,
    deleteRecoverySnapshot,
    downloadRecoveryPayload,
    retryRecoveryMigration,
    restoreLatestRecoverySnapshot,
    startFreshAfterRecovery,
  } = useWorkspaceSync({
    identity,
    enabled: accountSyncEnabled,
    emptyData,
    normalize: normalizeStoredData,
  });

  const value = useMemo<ResolveContextValue>(
    () => ({
      ...data,
      weeklyPriorities:
        data.weeklyPrioritiesByWeek[getWeekDateKeys()[0]] ??
        data.weeklyPriorities,
      storageMode,
      syncStatus,
      syncError,
      lastSyncedAt,
      conflicts,
      isSyncLeader,
      workspaceSize,
      syncMetrics,
      canUndo,
      syncWorkspaceNow,
      resolveConflict,
      undoLastChange,
      exportWorkspace,
      exportTasksCsv,
      exportCalendarIcs,
      importWorkspace,
      listRecoverySnapshots,
      deleteRecoverySnapshot,
      addTask(task) {
        mutateData((current) =>
          addTaskToData(current, task, { identity }),
        );
      },
      updateTask(taskId, task) {
        mutateData((current) => updateTaskInData(current, taskId, task));
      },
      toggleTask(taskId) {
        mutateData((current) => toggleTaskInData(current, taskId));
      },
      removeTask(taskId) {
        mutateData((current) => removeTaskFromData(current, taskId));
      },
      moveTask(taskId, scheduledDate) {
        mutateData((current) =>
          moveTaskInData(current, taskId, scheduledDate),
        );
      },
      setTaskDailyPriority(taskId, rank) {
        mutateData((current) =>
          setTaskDailyPriorityInData(current, taskId, rank),
        );
      },
      addGoal(goal) {
        mutateData((current) =>
          addGoalToData(current, goal, { identity }),
        );
      },
      updateGoal(goalId, goal) {
        mutateData((current) => updateGoalInData(current, goalId, goal));
      },
      removeGoal(goalId, linkedTaskPolicy = "preserve") {
        mutateData((current) =>
          removeGoalFromData(
            current,
            goalId,
            new Date().toISOString(),
            linkedTaskPolicy,
          ),
        );
      },
      addMilestone(goalId, milestone) {
        mutateData((current) =>
          addMilestoneToData(current, goalId, milestone, { identity }),
        );
      },
      updateMilestone(milestoneId, milestone) {
        mutateData((current) =>
          updateMilestoneInData(current, milestoneId, milestone),
        );
      },
      toggleMilestone(milestoneId) {
        mutateData((current) =>
          toggleMilestoneInData(current, milestoneId),
        );
      },
      removeMilestone(milestoneId) {
        mutateData((current) =>
          removeMilestoneFromData(current, milestoneId),
        );
      },
      setGoalCompleted(goalId, completed) {
        mutateData((current) =>
          setGoalCompletedInData(current, goalId, completed),
        );
      },
      addHabit(habit) {
        mutateData((current) =>
          addHabitToData(current, habit, { identity }),
        );
      },
      updateHabit(habitId, habit) {
        mutateData((current) =>
          updateHabitInData(current, habitId, habit),
        );
      },
      removeHabit(habitId) {
        mutateData((current) => removeHabitFromData(current, habitId));
      },
      addModule(module) {
        mutateData((current) =>
          addModuleToData(current, module, { identity }),
        );
      },
      updateModule(moduleId, module) {
        mutateData((current) =>
          updateModuleInData(current, moduleId, module),
        );
      },
      removeModule(moduleId, linkedTaskPolicy = "preserve") {
        mutateData((current) =>
          removeModuleFromData(current, moduleId, linkedTaskPolicy),
        );
      },
      addAssessment(assessment) {
        mutateData((current) =>
          addAssessmentToData(current, assessment, { identity }),
        );
      },
      updateAssessment(assessmentId, assessment) {
        mutateData((current) =>
          updateAssessmentInData(current, assessmentId, assessment),
        );
      },
      removeAssessment(
        moduleId,
        assessmentId,
        linkedTaskPolicy = "preserve",
      ) {
        mutateData((current) =>
          removeAssessmentFromData(
            current,
            moduleId,
            assessmentId,
            linkedTaskPolicy,
          ),
        );
      },
      addAlgorithmLog(log) {
        mutateData((current) =>
          addAlgorithmLogToData(current, log, { identity }),
        );
      },
      updateAlgorithmLog(logId, log) {
        mutateData((current) =>
          updateAlgorithmLogInData(current, logId, log),
        );
      },
      removeAlgorithmLog(logId) {
        mutateData((current) =>
          removeAlgorithmLogFromData(current, logId),
        );
      },
      addApplication(application) {
        mutateData((current) =>
          addApplicationToData(current, application, { identity }),
        );
      },
      updateApplication(applicationId, application) {
        mutateData((current) =>
          updateApplicationInData(current, applicationId, application),
        );
      },
      removeApplication(applicationId) {
        mutateData((current) =>
          removeApplicationFromData(current, applicationId),
        );
      },
      updateApplicationStage(applicationId, stage) {
        mutateData((current) =>
          updateApplicationStageInData(current, applicationId, stage),
        );
      },
      updateAssessmentProgress(moduleId, assessmentId, progress) {
        mutateData((current) =>
          updateAssessmentProgressInData(
            current,
            moduleId,
            assessmentId,
            progress,
          ),
        );
      },
      markAssessmentSubmitted(moduleId, assessmentId, submitted = true) {
        mutateData((current) =>
          markAssessmentSubmittedInData(
            current,
            moduleId,
            assessmentId,
            submitted,
          ),
        );
      },
      planAssessmentPreparation(assessmentId, templateId, drafts) {
        mutateData((current) =>
          planAssessmentPreparationToData(
            current,
            assessmentId,
            templateId,
            drafts,
            { identity },
          ),
        );
      },
      updateModuleStudyMinutes(moduleId, minutes) {
        mutateData((current) =>
          updateModuleStudyMinutesInData(current, moduleId, minutes),
        );
      },
      toggleHabit(habitId, date) {
        mutateData((current) =>
          toggleHabitInData(current, habitId, date, { identity }),
        );
      },
      updateTaskActualMinutes(taskId, minutes) {
        mutateData((current) =>
          updateTaskActualMinutesInData(current, taskId, minutes),
        );
      },
      addGuitarSession(session) {
        mutateData((current) =>
          addGuitarSessionToData(current, session, { identity }),
        );
      },
      updateGuitarSession(sessionId, session) {
        mutateData((current) =>
          updateGuitarSessionInData(current, sessionId, session),
        );
      },
      removeGuitarSession(sessionId) {
        mutateData((current) =>
          removeGuitarSessionFromData(current, sessionId),
        );
      },
      updateGuitarLearning(updater) {
        mutateData((current) => ({
          ...current,
          guitarLearning: normalizeGuitarLearningState(
            updater(current.guitarLearning),
            identity,
          ),
        }));
      },
      saveReflection(reflection) {
        mutateData((current) =>
          saveReflectionToData(current, reflection, { identity }),
        );
      },
      removeReflection(reflectionId) {
        mutateData((current) =>
          removeReflectionFromData(current, reflectionId),
        );
      },
      addSemesterResolution(resolution) {
        mutateData((current) =>
          addSemesterResolutionToData(current, resolution, { identity }),
        );
      },
      updateSemesterResolution(resolutionId, resolution) {
        mutateData((current) =>
          updateSemesterResolutionInData(
            current,
            resolutionId,
            resolution,
          ),
        );
      },
      toggleSemesterResolution(resolutionId) {
        mutateData((current) =>
          toggleSemesterResolutionInData(current, resolutionId),
        );
      },
      removeSemesterResolution(resolutionId) {
        mutateData((current) =>
          removeSemesterResolutionFromData(current, resolutionId),
        );
      },
      updateSemester(semester) {
        mutateData((current) =>
          updateSemesterInData(current, semester, identity),
        );
      },
      updatePriorities(priorities, weekStart) {
        mutateData((current) =>
          updatePrioritiesInData(current, priorities, weekStart),
        );
      },
      addEvent(event) {
        mutateData((current) =>
          addEventToData(current, event, { identity }),
        );
      },
      updateEvent(eventId, event) {
        mutateData((current) => updateEventInData(current, eventId, event));
      },
      removeEvent(eventId) {
        mutateData((current) => removeEventFromData(current, eventId));
      },
      setMilestoneCompletionMode(milestoneId, mode) {
        mutateData((current) =>
          setMilestoneCompletionModeInData(current, milestoneId, mode),
        );
      },
      updateWorkspacePreferences(changes) {
        mutateData((current) =>
          updateWorkspacePreferencesInData(current, changes),
        );
      },
      async archiveSemester(nextSemester) {
        const next = startNewSemesterInData(data, nextSemester);
        if (next === data) return;
        await archiveWorkspace(next);
      },
      resetWorkspace() {
        mutateData(() => createEmptyData(identity));
      },
    }),
    [
      canUndo,
      conflicts,
      data,
      deleteRecoverySnapshot,
      archiveWorkspace,
      exportWorkspace,
      exportTasksCsv,
      exportCalendarIcs,
      identity,
      importWorkspace,
      isSyncLeader,
      lastSyncedAt,
      listRecoverySnapshots,
      mutateData,
      resolveConflict,
      storageMode,
      syncError,
      syncMetrics,
      syncWorkspaceNow,
      syncStatus,
      undoLastChange,
      workspaceSize,
    ],
  );

  if (!hydrated) {
    return (
      <div
        className="flex min-h-screen items-center justify-center bg-background"
        role="status"
        aria-label="Loading workspace"
      >
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-accent/30 border-t-accent" />
      </div>
    );
  }

  if (recoveryRequired) {
    return (
      <WorkspaceRecovery
        recovery={recoveryRequired}
        downloadRaw={downloadRecoveryPayload}
        retry={retryRecoveryMigration}
        restoreLatest={restoreLatestRecoverySnapshot}
        startFresh={startFreshAfterRecovery}
      />
    );
  }

  return (
    <ResolveContext.Provider value={value}>
      {children}
    </ResolveContext.Provider>
  );
}

export function useResolve() {
  const context = useContext(ResolveContext);
  if (!context) {
    throw new Error("useResolve must be used within ResolveProvider");
  }
  return context;
}

export function useOptionalResolve() {
  return useContext(ResolveContext);
}
