"use client";

import {
  useCallback,
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { useAuth } from "@/contexts/auth-context";
import {
  getWeekDateKeys,
  isDateKey,
  offsetDate,
  toDateKey,
} from "@/lib/date";
import {
  addSemesterResolutionToData,
  addAssessmentToData,
  addAlgorithmLogToData,
  addApplicationToData,
  addGoalToData,
  addGuitarSessionToData,
  addHabitToData,
  addMilestoneToData,
  addModuleToData,
  addTaskToData,
  moveTaskInData,
  removeAlgorithmLogFromData,
  removeApplicationFromData,
  removeAssessmentFromData,
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
  toggleHabitInData,
  toggleMilestoneInData,
  toggleSemesterResolutionInData,
  toggleTaskInData,
  updateApplicationStageInData,
  updateApplicationInData,
  updateAssessmentInData,
  updateAssessmentProgressInData,
  updateAlgorithmLogInData,
  updateGoalInData,
  updateGuitarSessionInData,
  updateHabitInData,
  updateMilestoneInData,
  updateModuleInData,
  updateModuleStudyMinutesInData,
  updatePrioritiesInData,
  updateSemesterInData,
  updateSemesterResolutionInData,
  updateTaskInData,
  updateTaskActualMinutesInData,
  type GuitarSessionInput,
  type NewAlgorithmLogInput,
  type NewApplicationInput,
  type NewAssessmentInput,
  type NewGoalInput,
  type NewHabitInput,
  type NewMilestoneInput,
  type NewModuleInput,
  type NewTaskInput,
  type NewSemesterResolutionInput,
  type UpdateAlgorithmLogInput,
  type UpdateApplicationInput,
  type UpdateAssessmentInput,
  type UpdateGoalInput,
  type UpdateHabitInput,
  type UpdateMilestoneInput,
  type UpdateModuleInput,
  type UpdateTaskInput,
  type UpdateSemesterResolutionInput,
} from "@/features/workspace/lib/resolve-actions";
import {
  getWorkspaceSchemaCompatibility,
  loadWorkspace,
  saveWorkspace,
} from "@/lib/firebase/workspace";
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
  Reflection,
  Semester,
  SemesterResolution,
  Task,
} from "@/types";

type ResolveContextValue = ResolveData & {
  storageMode: "browser" | "cloud";
  syncStatus:
    | "demo"
    | "connecting"
    | "saving"
    | "synced"
    | "offline"
    | "error";
  syncError: string;
  lastSyncedAt: string | null;
  syncWorkspaceNow: () => Promise<void>;
  addTask: (task: NewTaskInput) => void;
  updateTask: (taskId: string, task: UpdateTaskInput) => void;
  toggleTask: (taskId: string) => void;
  removeTask: (taskId: string) => void;
  moveTask: (taskId: string, scheduledDate: string) => void;
  addGoal: (goal: NewGoalInput) => void;
  updateGoal: (goalId: string, goal: UpdateGoalInput) => void;
  removeGoal: (goalId: string) => void;
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
  removeModule: (moduleId: string) => void;
  addAssessment: (assessment: NewAssessmentInput) => void;
  updateAssessment: (
    assessmentId: string,
    assessment: UpdateAssessmentInput,
  ) => void;
  removeAssessment: (moduleId: string, assessmentId: string) => void;
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
  updatePriorities: (priorities: string[]) => void;
  resetWorkspace: () => void;
};

const ResolveContext = createContext<ResolveContextValue | null>(null);

export { getWeekDateKeys, offsetDate, toDateKey };

export const CLOUD_SAVE_DEBOUNCE_MS = 15_000;
export const CLOUD_REFRESH_INTERVAL_MS = 15 * 60_000;

type LocalSyncMetadata = {
  dirty: boolean;
  lastCheckedAt: number;
};

function readLocalSyncMetadata(key: string): LocalSyncMetadata {
  try {
    const parsed = JSON.parse(
      window.localStorage.getItem(key) ?? "",
    ) as Partial<LocalSyncMetadata>;
    return {
      dirty: parsed.dirty === true,
      lastCheckedAt: Number.isFinite(parsed.lastCheckedAt)
        ? Math.max(0, parsed.lastCheckedAt!)
        : 0,
    };
  } catch {
    return { dirty: false, lastCheckedAt: 0 };
  }
}

function writeLocalSyncMetadata(
  key: string,
  metadata: LocalSyncMetadata,
) {
  try {
    window.localStorage.setItem(key, JSON.stringify(metadata));
  } catch {
    // The in-memory and primary local workspace remain usable.
  }
}

function hasMeaningfulWorkspaceData(data: ResolveData, userId: string) {
  const empty = createEmptyData(userId);
  const hasRecords = [
    data.goals,
    data.milestones,
    data.tasks,
    data.habits,
    data.habitLogs,
    data.guitarSessions,
    data.reflections,
    data.modules,
    data.algorithmLogs,
    data.applications,
    data.semester.resolutions,
    data.guitarLearning.progress,
  ].some((records) => (records?.length ?? 0) > 0);
  if (hasRecords || data.weeklyPriorities.some(Boolean)) return true;

  const semesterFields: Array<keyof Semester> = [
    "name",
    "academicYear",
    "startDate",
    "endDate",
    "recessWeekStart",
    "readingWeekStart",
    "examPeriodStart",
    "theme",
    "targetGpa",
    "description",
    "status",
    "mainResolution",
  ];
  if (
    semesterFields.some(
      (field) => data.semester[field] !== empty.semester[field],
    )
  ) {
    return true;
  }

  const profile = data.guitarLearning.profile;
  const emptyProfile = empty.guitarLearning.profile;
  return (
    profile.handedness !== emptyProfile.handedness ||
    profile.placementCompleted ||
    profile.preferredTuning.some(
      (note, index) => note !== emptyProfile.preferredTuning[index],
    ) ||
    profile.selectedPathIds.length > 0 ||
    profile.confusingConceptIds.length > 0 ||
    profile.bookmarkedLessonIds.length > 0 ||
    profile.hiddenRecommendationIds.length > 0 ||
    Boolean(profile.currentLessonId)
  );
}

export function createEmptyData(userId: string): ResolveData {
  const year = new Date().getFullYear();
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
    algorithmLogs: [],
    applications: [],
    weeklyPriorities: ["", "", ""],
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
      completed: milestone.completed === true,
      completedAt:
        milestone.completed === true &&
        typeof milestone.completedAt === "string"
          ? milestone.completedAt
          : undefined,
      order: Number.isFinite(milestone.order)
        ? Math.max(1, Math.round(milestone.order))
        : index + 1,
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
          : ("manual" as const),
        targetValue: undefined,
        currentValue: undefined,
        unit: undefined,
        startDate: optionalDate(goal.startDate) ?? semester.startDate,
        deadline: optionalDate(goal.deadline),
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
    .map((task) => ({
      ...task,
      userId,
      semesterId: semester.id,
      title: task.title.trim(),
      category:
        typeof task.category === "string" && task.category.trim()
          ? task.category
          : "custom",
      scheduledDate: optionalDate(task.scheduledDate),
      deadline: optionalDate(task.deadline),
      estimatedMinutes: Number.isFinite(task.estimatedMinutes)
        ? Math.min(720, Math.max(5, Math.round(task.estimatedMinutes!)))
        : undefined,
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
        typeof task.goalId === "string" && goalIds.has(task.goalId)
          ? task.goalId
          : undefined,
      milestoneId:
        typeof task.milestoneId === "string" &&
        milestoneIds.has(task.milestoneId)
          ? task.milestoneId
          : undefined,
      createdAt:
        typeof task.createdAt === "string" ? task.createdAt : "",
      updatedAt:
        typeof task.updatedAt === "string" ? task.updatedAt : "",
    }))
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
    ["not_started", "in_progress", "submitted", "graded"];
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
        })),
    }))
    .filter((module) => Boolean(module.code) && Boolean(module.name));
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
    }))
    .filter(
      (application) =>
        Boolean(application.company) && Boolean(application.role),
    );

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
    algorithmLogs,
    applications,
    weeklyPriorities: priorities,
  };
}

export function ResolveProvider({ children }: { children: ReactNode }) {
  const { user, isConfigured } = useAuth();
  const identity = user?.id ?? "demo-user";
  const storageKey = `resolve-data-v2:${identity}`;
  const syncMetadataKey = `resolve-sync-v1:${identity}`;
  const accountSyncEnabled = isConfigured && Boolean(user);
  const [data, setData] = useState<ResolveData>(() =>
    createEmptyData(identity),
  );
  const [hydratedKey, setHydratedKey] = useState<string | null>(null);
  const [cloudReadyKey, setCloudReadyKey] = useState<string | null>(null);
  const [syncStatus, setSyncStatus] =
    useState<ResolveContextValue["syncStatus"]>(
      accountSyncEnabled ? "connecting" : "demo",
    );
  const [syncError, setSyncError] = useState("");
  const [lastSyncedAt, setLastSyncedAt] = useState<string | null>(null);
  const dataJson = useMemo(() => JSON.stringify(data), [data]);
  const dataRef = useRef(data);
  const dataJsonRef = useRef(dataJson);
  const lastRemoteJson = useRef("");
  const dirtyRef = useRef(false);
  const lastCheckedAtRef = useRef(0);
  const readSequenceRef = useRef(0);
  const readInFlightKeyRef = useRef<string | null>(null);
  const writeInFlightRef = useRef<Promise<void> | null>(null);
  const activeStorageKeyRef = useRef(storageKey);

  useEffect(() => {
    dataRef.current = data;
    dataJsonRef.current = dataJson;
  }, [data, dataJson]);

  const updateSyncMetadata = useCallback(
    (dirty: boolean, lastCheckedAt = lastCheckedAtRef.current) => {
      dirtyRef.current = dirty;
      lastCheckedAtRef.current = lastCheckedAt;
      writeLocalSyncMetadata(syncMetadataKey, {
        dirty,
        lastCheckedAt,
      });
    },
    [syncMetadataKey],
  );

  const mutateData = useCallback(
    (updater: (current: ResolveData) => ResolveData) => {
      const current = dataRef.current;
      const next = updater(current);
      if (next === current) return;
      dataRef.current = next;
      dataJsonRef.current = JSON.stringify(next);
      updateSyncMetadata(true);
      setData(next);
    },
    [updateSyncMetadata],
  );

  const persistWorkspace = useCallback(
    async (snapshotData: ResolveData, snapshotJson: string) => {
      const targetStorageKey = storageKey;
      if (snapshotJson === lastRemoteJson.current) {
        updateSyncMetadata(false, Date.now());
        return;
      }

      if (writeInFlightRef.current) {
        try {
          await writeInFlightRef.current;
        } catch {
          // The queued snapshot below gets its own retry and status handling.
        }
        if (snapshotJson === lastRemoteJson.current) return;
      }

      setSyncStatus("saving");
      setSyncError("");
      const write = saveWorkspace(identity, snapshotData);
      writeInFlightRef.current = write;

      try {
        await write;
        if (activeStorageKeyRef.current !== targetStorageKey) return;
        lastRemoteJson.current = snapshotJson;
        const savedAt = Date.now();
        if (dataJsonRef.current === snapshotJson) {
          updateSyncMetadata(false, savedAt);
          setSyncStatus("synced");
          setLastSyncedAt(new Date(savedAt).toISOString());
        } else {
          updateSyncMetadata(true, savedAt);
          setSyncStatus("saving");
        }
      } catch (error: unknown) {
        if (activeStorageKeyRef.current !== targetStorageKey) return;
        updateSyncMetadata(true);
        setSyncStatus("offline");
        setSyncError(
          error instanceof Error
            ? error.message
            : "Cloud sync failed. Changes remain saved in this browser.",
        );
      } finally {
        if (writeInFlightRef.current === write) {
          writeInFlightRef.current = null;
        }
      }
    },
    [identity, storageKey, updateSyncMetadata],
  );

  const refreshWorkspaceFromCloud = useCallback(
    async (force = false) => {
      if (!accountSyncEnabled || dirtyRef.current) return;
      if (readInFlightKeyRef.current === storageKey) return;
      const now = Date.now();
      if (
        !force &&
        now - lastCheckedAtRef.current < CLOUD_REFRESH_INTERVAL_MS
      ) {
        setCloudReadyKey(storageKey);
        setSyncStatus("synced");
        return;
      }

      const sequence = ++readSequenceRef.current;
      readInFlightKeyRef.current = storageKey;
      setSyncStatus("connecting");
      setSyncError("");
      try {
        const result = await loadWorkspace<ResolveData>(identity);
        if (sequence !== readSequenceRef.current) return;
        if (dirtyRef.current) {
          setCloudReadyKey(storageKey);
          setSyncStatus("saving");
          return;
        }

        const checkedAt = Date.now();
        if (result.kind === "missing") {
          const local = dataRef.current;
          if (hasMeaningfulWorkspaceData(local, identity)) {
            lastRemoteJson.current = "__missing_cloud_workspace__";
            updateSyncMetadata(true, checkedAt);
            setCloudReadyKey(storageKey);
            setSyncStatus("saving");
            return;
          }

          const empty = createEmptyData(identity);
          const emptyJson = JSON.stringify(empty);
          lastRemoteJson.current = emptyJson;
          dataRef.current = empty;
          dataJsonRef.current = emptyJson;
          setData(empty);
          updateSyncMetadata(false, checkedAt);
          setCloudReadyKey(storageKey);
          setSyncStatus("synced");
          setLastSyncedAt(new Date(checkedAt).toISOString());
          return;
        }

        const compatibility = getWorkspaceSchemaCompatibility(
          result.snapshot.schemaVersion,
        );
        if (compatibility === "unsupported") {
          setCloudReadyKey(null);
          setSyncStatus("error");
          setSyncError(
            "This workspace was saved by a newer Resolve version. Update the app before editing it.",
          );
          return;
        }

        const normalized = normalizeStoredData(
          result.snapshot.data,
          identity,
        );
        const remoteJson = JSON.stringify(normalized);
        lastRemoteJson.current = remoteJson;
        if (remoteJson !== dataJsonRef.current) {
          dataRef.current = normalized;
          dataJsonRef.current = remoteJson;
          setData(normalized);
        }
        updateSyncMetadata(false, checkedAt);
        setCloudReadyKey(storageKey);
        setSyncStatus("synced");
        setLastSyncedAt(new Date(checkedAt).toISOString());
      } catch (error: unknown) {
        if (sequence !== readSequenceRef.current) return;
        setSyncStatus("offline");
        setSyncError(
          error instanceof Error
            ? error.message
            : "Could not check the cloud workspace.",
        );
      } finally {
        if (readInFlightKeyRef.current === storageKey) {
          readInFlightKeyRef.current = null;
        }
      }
    },
    [
      accountSyncEnabled,
      identity,
      storageKey,
      updateSyncMetadata,
    ],
  );

  useEffect(() => {
    const startupId = window.setTimeout(() => {
      let initial = createEmptyData(identity);
      let hasLocalWorkspace = false;
      try {
        const stored = window.localStorage.getItem(storageKey);
        if (stored) {
          initial = normalizeStoredData(JSON.parse(stored), identity);
          hasLocalWorkspace = true;
        }
      } catch {
        initial = createEmptyData(identity);
      }
      const metadata = readLocalSyncMetadata(syncMetadataKey);
      const localDirty = metadata.dirty && hasLocalWorkspace;
      const initialJson = JSON.stringify(initial);

      activeStorageKeyRef.current = storageKey;
      writeInFlightRef.current = null;
      dataRef.current = initial;
      dataJsonRef.current = initialJson;
      setData(initial);
      setHydratedKey(storageKey);
      setCloudReadyKey(null);
      lastRemoteJson.current = "";
      dirtyRef.current = localDirty;
      lastCheckedAtRef.current = metadata.lastCheckedAt;
      setSyncError("");
      setLastSyncedAt(
        metadata.lastCheckedAt
          ? new Date(metadata.lastCheckedAt).toISOString()
          : null,
      );

      if (!accountSyncEnabled) {
        setSyncStatus("demo");
        return;
      }

      if (localDirty) {
        lastRemoteJson.current = "__unsynced_local_workspace__";
        setCloudReadyKey(storageKey);
        setSyncStatus("saving");
        return;
      }

      if (
        hasLocalWorkspace &&
        Date.now() - metadata.lastCheckedAt < CLOUD_REFRESH_INTERVAL_MS
      ) {
        lastRemoteJson.current = initialJson;
        setCloudReadyKey(storageKey);
        setSyncStatus("synced");
        return;
      }

      void refreshWorkspaceFromCloud(true);
    }, 0);

    return () => {
      window.clearTimeout(startupId);
      readSequenceRef.current += 1;
    };
  }, [
    accountSyncEnabled,
    identity,
    refreshWorkspaceFromCloud,
    storageKey,
    syncMetadataKey,
  ]);

  useEffect(() => {
    if (hydratedKey === storageKey) {
      try {
        window.localStorage.setItem(storageKey, dataJson);
      } catch {
        // Keep the in-memory workspace usable if storage is full or disabled.
      }
    }
  }, [dataJson, hydratedKey, storageKey]);

  useEffect(() => {
    if (
      !accountSyncEnabled ||
      cloudReadyKey !== storageKey ||
      hydratedKey !== storageKey
    ) {
      return;
    }

    const nextJson = dataJson;
    if (nextJson === lastRemoteJson.current) {
      if (dirtyRef.current) updateSyncMetadata(false, Date.now());
      return;
    }

    updateSyncMetadata(true);
    setSyncStatus("saving");
    const saveTimer = window.setTimeout(() => {
      void persistWorkspace(data, nextJson);
    }, CLOUD_SAVE_DEBOUNCE_MS);

    return () => {
      window.clearTimeout(saveTimer);
    };
  }, [
    accountSyncEnabled,
    cloudReadyKey,
    data,
    dataJson,
    hydratedKey,
    persistWorkspace,
    storageKey,
    updateSyncMetadata,
  ]);

  useEffect(() => {
    if (
      !accountSyncEnabled ||
      hydratedKey !== storageKey ||
      cloudReadyKey !== storageKey
    ) {
      return;
    }

    const refreshIfStale = () => {
      if (
        document.visibilityState === "visible" &&
        !dirtyRef.current &&
        Date.now() - lastCheckedAtRef.current >= CLOUD_REFRESH_INTERVAL_MS
      ) {
        void refreshWorkspaceFromCloud();
      }
    };
    const refreshTimer = window.setInterval(
      refreshIfStale,
      CLOUD_REFRESH_INTERVAL_MS,
    );
    window.addEventListener("focus", refreshIfStale);
    document.addEventListener("visibilitychange", refreshIfStale);
    return () => {
      window.clearInterval(refreshTimer);
      window.removeEventListener("focus", refreshIfStale);
      document.removeEventListener("visibilitychange", refreshIfStale);
    };
  }, [
    accountSyncEnabled,
    cloudReadyKey,
    hydratedKey,
    refreshWorkspaceFromCloud,
    storageKey,
  ]);

  const value = useMemo<ResolveContextValue>(
    () => ({
      ...data,
      storageMode: accountSyncEnabled ? "cloud" : "browser",
      syncStatus,
      syncError,
      lastSyncedAt,
      async syncWorkspaceNow() {
        if (!accountSyncEnabled) return;
        if (dirtyRef.current) {
          await persistWorkspace(
            dataRef.current,
            dataJsonRef.current,
          );
          return;
        }
        await refreshWorkspaceFromCloud(true);
      },
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
      addGoal(goal) {
        mutateData((current) =>
          addGoalToData(current, goal, { identity }),
        );
      },
      updateGoal(goalId, goal) {
        mutateData((current) => updateGoalInData(current, goalId, goal));
      },
      removeGoal(goalId) {
        mutateData((current) => removeGoalFromData(current, goalId));
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
      removeModule(moduleId) {
        mutateData((current) => removeModuleFromData(current, moduleId));
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
      removeAssessment(moduleId, assessmentId) {
        mutateData((current) =>
          removeAssessmentFromData(current, moduleId, assessmentId),
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
      updatePriorities(priorities) {
        mutateData((current) =>
          updatePrioritiesInData(current, priorities),
        );
      },
      resetWorkspace() {
        mutateData(() => createEmptyData(identity));
      },
    }),
    [
      accountSyncEnabled,
      data,
      identity,
      lastSyncedAt,
      mutateData,
      persistWorkspace,
      refreshWorkspaceFromCloud,
      syncError,
      syncStatus,
    ],
  );

  if (hydratedKey !== storageKey) {
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
