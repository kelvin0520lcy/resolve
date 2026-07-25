"use client";

import {
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
  saveWorkspace,
  subscribeToWorkspace,
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
  const writeSequence = useRef(0);

  useEffect(() => {
    dataRef.current = data;
    dataJsonRef.current = dataJson;
  }, [data, dataJson]);

  useEffect(() => {
    let unsubscribe = () => {};
    let disposed = false;
    let missingHandled = false;

    const startupId = window.setTimeout(() => {
      let initial = createEmptyData(identity);
      try {
        const stored = window.localStorage.getItem(storageKey);
        if (stored) {
          initial = normalizeStoredData(JSON.parse(stored), identity);
        }
      } catch {
        initial = createEmptyData(identity);
      }

      dataRef.current = initial;
      dataJsonRef.current = JSON.stringify(initial);
      setData(initial);
      setHydratedKey(storageKey);
      setCloudReadyKey(null);
      lastRemoteJson.current = "";
      setSyncError("");
      setLastSyncedAt(null);

      if (!accountSyncEnabled) {
        setSyncStatus("demo");
        return;
      }

      setSyncStatus("connecting");
      unsubscribe = subscribeToWorkspace<ResolveData>(
        identity,
        ({
          data: remoteData,
          schemaVersion,
          hasPendingWrites,
          fromCache,
        }) => {
          if (disposed) return;

          const compatibility =
            getWorkspaceSchemaCompatibility(schemaVersion);
          if (compatibility === "unsupported") {
            setCloudReadyKey(null);
            setSyncStatus("error");
            setSyncError(
              "This workspace was saved by a newer Resolve version. Update the app before editing it.",
            );
            return;
          }

          const normalized = normalizeStoredData(remoteData, identity);
          const remoteJson = JSON.stringify(normalized);
          lastRemoteJson.current = remoteJson;
          if (remoteJson !== dataJsonRef.current) {
            dataRef.current = normalized;
            dataJsonRef.current = remoteJson;
            setData(normalized);
          }
          setCloudReadyKey(storageKey);
          const shouldUpgrade =
            compatibility === "upgrade" &&
            !hasPendingWrites &&
            !fromCache;
          setSyncStatus(
            shouldUpgrade
              ? "saving"
              : hasPendingWrites
                ? "saving"
                : fromCache
                  ? "offline"
                  : "synced",
          );
          setSyncError("");
          if (!hasPendingWrites && !fromCache) {
            setLastSyncedAt(new Date().toISOString());
          }
          if (shouldUpgrade) {
            void saveWorkspace(identity, normalized)
              .then(() => {
                if (disposed) return;
                setSyncStatus("synced");
                setLastSyncedAt(new Date().toISOString());
              })
              .catch((error: unknown) => {
                if (disposed) return;
                setSyncStatus("offline");
                setSyncError(
                  error instanceof Error
                    ? error.message
                    : "Could not upgrade the cloud workspace.",
                );
              });
          }
        },
        () => {
          if (disposed || missingHandled) return;
          missingHandled = true;
          const initialData = dataRef.current;
          const initialJson = JSON.stringify(initialData);
          setSyncStatus("saving");
          void saveWorkspace(identity, initialData)
            .then(() => {
              if (disposed) return;
              lastRemoteJson.current = initialJson;
              setCloudReadyKey(storageKey);
              setSyncStatus("synced");
              setLastSyncedAt(new Date().toISOString());
            })
            .catch((error: unknown) => {
              if (disposed) return;
              setCloudReadyKey(storageKey);
              setSyncStatus("error");
              setSyncError(
                error instanceof Error
                  ? error.message
                  : "Could not create the cloud workspace.",
              );
            });
        },
        (error) => {
          if (disposed) return;
          setSyncStatus("offline");
          setSyncError(error.message);
        },
      );
    }, 0);

    return () => {
      disposed = true;
      window.clearTimeout(startupId);
      unsubscribe();
    };
  }, [accountSyncEnabled, identity, storageKey]);

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
    if (nextJson === lastRemoteJson.current) return;

    const sequence = ++writeSequence.current;
    let cancelled = false;
    const saveTimer = window.setTimeout(() => {
      setSyncStatus("saving");
      setSyncError("");
      void saveWorkspace(identity, data)
        .then(() => {
          if (cancelled || sequence !== writeSequence.current) return;
          lastRemoteJson.current = nextJson;
          setSyncStatus("synced");
          setLastSyncedAt(new Date().toISOString());
        })
        .catch((error: unknown) => {
          if (cancelled || sequence !== writeSequence.current) return;
          setSyncStatus("offline");
          setSyncError(
            error instanceof Error
              ? error.message
              : "Cloud sync failed. Changes remain saved in this browser.",
          );
        });
    }, 450);

    return () => {
      cancelled = true;
      window.clearTimeout(saveTimer);
    };
  }, [
    accountSyncEnabled,
    cloudReadyKey,
    data,
    dataJson,
    hydratedKey,
    identity,
    storageKey,
  ]);

  const value = useMemo<ResolveContextValue>(
    () => ({
      ...data,
      storageMode: accountSyncEnabled ? "cloud" : "browser",
      syncStatus,
      syncError,
      lastSyncedAt,
      addTask(task) {
        setData((current) =>
          addTaskToData(current, task, { identity }),
        );
      },
      updateTask(taskId, task) {
        setData((current) => updateTaskInData(current, taskId, task));
      },
      toggleTask(taskId) {
        setData((current) => toggleTaskInData(current, taskId));
      },
      removeTask(taskId) {
        setData((current) => removeTaskFromData(current, taskId));
      },
      moveTask(taskId, scheduledDate) {
        setData((current) =>
          moveTaskInData(current, taskId, scheduledDate),
        );
      },
      addGoal(goal) {
        setData((current) =>
          addGoalToData(current, goal, { identity }),
        );
      },
      updateGoal(goalId, goal) {
        setData((current) => updateGoalInData(current, goalId, goal));
      },
      removeGoal(goalId) {
        setData((current) => removeGoalFromData(current, goalId));
      },
      addMilestone(goalId, milestone) {
        setData((current) =>
          addMilestoneToData(current, goalId, milestone, { identity }),
        );
      },
      updateMilestone(milestoneId, milestone) {
        setData((current) =>
          updateMilestoneInData(current, milestoneId, milestone),
        );
      },
      toggleMilestone(milestoneId) {
        setData((current) =>
          toggleMilestoneInData(current, milestoneId),
        );
      },
      removeMilestone(milestoneId) {
        setData((current) =>
          removeMilestoneFromData(current, milestoneId),
        );
      },
      setGoalCompleted(goalId, completed) {
        setData((current) =>
          setGoalCompletedInData(current, goalId, completed),
        );
      },
      addHabit(habit) {
        setData((current) =>
          addHabitToData(current, habit, { identity }),
        );
      },
      updateHabit(habitId, habit) {
        setData((current) => updateHabitInData(current, habitId, habit));
      },
      removeHabit(habitId) {
        setData((current) => removeHabitFromData(current, habitId));
      },
      addModule(module) {
        setData((current) =>
          addModuleToData(current, module, { identity }),
        );
      },
      updateModule(moduleId, module) {
        setData((current) =>
          updateModuleInData(current, moduleId, module),
        );
      },
      removeModule(moduleId) {
        setData((current) => removeModuleFromData(current, moduleId));
      },
      addAssessment(assessment) {
        setData((current) =>
          addAssessmentToData(current, assessment, { identity }),
        );
      },
      updateAssessment(assessmentId, assessment) {
        setData((current) =>
          updateAssessmentInData(current, assessmentId, assessment),
        );
      },
      removeAssessment(moduleId, assessmentId) {
        setData((current) =>
          removeAssessmentFromData(current, moduleId, assessmentId),
        );
      },
      addAlgorithmLog(log) {
        setData((current) =>
          addAlgorithmLogToData(current, log, { identity }),
        );
      },
      updateAlgorithmLog(logId, log) {
        setData((current) =>
          updateAlgorithmLogInData(current, logId, log),
        );
      },
      removeAlgorithmLog(logId) {
        setData((current) =>
          removeAlgorithmLogFromData(current, logId),
        );
      },
      addApplication(application) {
        setData((current) =>
          addApplicationToData(current, application, { identity }),
        );
      },
      updateApplication(applicationId, application) {
        setData((current) =>
          updateApplicationInData(current, applicationId, application),
        );
      },
      removeApplication(applicationId) {
        setData((current) =>
          removeApplicationFromData(current, applicationId),
        );
      },
      updateApplicationStage(applicationId, stage) {
        setData((current) =>
          updateApplicationStageInData(current, applicationId, stage),
        );
      },
      updateAssessmentProgress(moduleId, assessmentId, progress) {
        setData((current) =>
          updateAssessmentProgressInData(
            current,
            moduleId,
            assessmentId,
            progress,
          ),
        );
      },
      updateModuleStudyMinutes(moduleId, minutes) {
        setData((current) =>
          updateModuleStudyMinutesInData(current, moduleId, minutes),
        );
      },
      toggleHabit(habitId, date) {
        setData((current) =>
          toggleHabitInData(current, habitId, date, { identity }),
        );
      },
      updateTaskActualMinutes(taskId, minutes) {
        setData((current) =>
          updateTaskActualMinutesInData(current, taskId, minutes),
        );
      },
      addGuitarSession(session) {
        setData((current) =>
          addGuitarSessionToData(current, session, { identity }),
        );
      },
      updateGuitarSession(sessionId, session) {
        setData((current) =>
          updateGuitarSessionInData(current, sessionId, session),
        );
      },
      removeGuitarSession(sessionId) {
        setData((current) =>
          removeGuitarSessionFromData(current, sessionId),
        );
      },
      updateGuitarLearning(updater) {
        setData((current) => ({
          ...current,
          guitarLearning: normalizeGuitarLearningState(
            updater(current.guitarLearning),
            identity,
          ),
        }));
      },
      saveReflection(reflection) {
        setData((current) =>
          saveReflectionToData(current, reflection, { identity }),
        );
      },
      removeReflection(reflectionId) {
        setData((current) =>
          removeReflectionFromData(current, reflectionId),
        );
      },
      addSemesterResolution(resolution) {
        setData((current) =>
          addSemesterResolutionToData(current, resolution, { identity }),
        );
      },
      updateSemesterResolution(resolutionId, resolution) {
        setData((current) =>
          updateSemesterResolutionInData(
            current,
            resolutionId,
            resolution,
          ),
        );
      },
      toggleSemesterResolution(resolutionId) {
        setData((current) =>
          toggleSemesterResolutionInData(current, resolutionId),
        );
      },
      removeSemesterResolution(resolutionId) {
        setData((current) =>
          removeSemesterResolutionFromData(current, resolutionId),
        );
      },
      updateSemester(semester) {
        setData((current) =>
          updateSemesterInData(current, semester, identity),
        );
      },
      updatePriorities(priorities) {
        setData((current) =>
          updatePrioritiesInData(current, priorities),
        );
      },
      resetWorkspace() {
        setData(createEmptyData(identity));
      },
    }),
    [
      accountSyncEnabled,
      data,
      identity,
      lastSyncedAt,
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
