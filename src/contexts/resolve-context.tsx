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
  addAssessmentToData,
  addAlgorithmLogToData,
  addApplicationToData,
  addGoalToData,
  addGuitarSessionToData,
  addHabitToData,
  addModuleToData,
  addTaskToData,
  moveTaskInData,
  saveReflectionToData,
  toggleHabitInData,
  toggleTaskInData,
  updateApplicationStageInData,
  updateAssessmentProgressInData,
  updateGoalProgressInData,
  updateModuleStudyMinutesInData,
  updatePrioritiesInData,
  updateSemesterInData,
  updateTaskActualMinutesInData,
  type NewAlgorithmLogInput,
  type NewApplicationInput,
  type NewAssessmentInput,
  type NewGoalInput,
  type NewHabitInput,
  type NewModuleInput,
  type NewTaskInput,
} from "@/lib/resolve-actions";
import {
  saveWorkspace,
  subscribeToWorkspace,
  WORKSPACE_SCHEMA_VERSION,
} from "@/lib/firebase/workspace";
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
  Task,
} from "@/types";

export type ResolveData = {
  semester: Semester;
  goals: Goal[];
  milestones: Milestone[];
  tasks: Task[];
  habits: Habit[];
  habitLogs: HabitLog[];
  guitarSessions: GuitarPracticeSession[];
  reflections: Reflection[];
  modules: AcademicModule[];
  algorithmLogs: AlgorithmLog[];
  applications: JobApplication[];
  weeklyPriorities: string[];
};

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
  toggleTask: (taskId: string) => void;
  moveTask: (taskId: string, scheduledDate: string) => void;
  addGoal: (goal: NewGoalInput) => void;
  addHabit: (habit: NewHabitInput) => void;
  addModule: (module: NewModuleInput) => void;
  addAssessment: (assessment: NewAssessmentInput) => void;
  addAlgorithmLog: (log: NewAlgorithmLogInput) => void;
  addApplication: (application: NewApplicationInput) => void;
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
  updateGoalProgress: (goalId: string, value: number) => void;
  updateTaskActualMinutes: (taskId: string, minutes: number) => void;
  toggleHabit: (habitId: string, date: string) => void;
  addGuitarSession: (
    session: Omit<GuitarPracticeSession, "id" | "userId" | "semesterId">,
  ) => void;
  saveReflection: (
    reflection: Omit<
      Reflection,
      "id" | "userId" | "semesterId" | "createdAt"
    >,
  ) => void;
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
      status: "active",
    },
    goals: [],
    milestones: [],
    tasks: [],
    habits: [],
    habitLogs: [],
    guitarSessions: [],
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
  const arrayOrSeed = <T,>(candidate: unknown, fallback: T[]): T[] =>
    Array.isArray(candidate) ? (candidate as T[]) : fallback;
  const priorities =
    Array.isArray(stored.weeklyPriorities) &&
    stored.weeklyPriorities.length === 3 &&
    stored.weeklyPriorities.every(
      (priority) => typeof priority === "string",
    )
      ? stored.weeklyPriorities.map((priority) => priority.trim())
      : seed.weeklyPriorities;

  return {
    semester:
      stored.semester &&
      typeof stored.semester === "object" &&
      isDateKey(stored.semester.startDate) &&
      isDateKey(stored.semester.endDate) &&
      stored.semester.endDate > stored.semester.startDate
        ? { ...seed.semester, ...stored.semester, userId }
        : seed.semester,
    goals: arrayOrSeed(stored.goals, seed.goals),
    milestones: arrayOrSeed(stored.milestones, seed.milestones),
    tasks: arrayOrSeed(stored.tasks, seed.tasks),
    habits: arrayOrSeed(stored.habits, seed.habits),
    habitLogs: arrayOrSeed(stored.habitLogs, seed.habitLogs),
    guitarSessions: arrayOrSeed(
      stored.guitarSessions,
      seed.guitarSessions,
    ),
    reflections: arrayOrSeed(stored.reflections, seed.reflections),
    modules: arrayOrSeed(stored.modules, seed.modules),
    algorithmLogs: arrayOrSeed(stored.algorithmLogs, seed.algorithmLogs),
    applications: arrayOrSeed(stored.applications, seed.applications),
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
  const dataRef = useRef(data);
  const lastRemoteJson = useRef("");
  const writeSequence = useRef(0);

  useEffect(() => {
    dataRef.current = data;
  }, [data]);

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

          if (schemaVersion !== WORKSPACE_SCHEMA_VERSION) {
            const freshData = createEmptyData(identity);
            const freshJson = JSON.stringify(freshData);
            dataRef.current = freshData;
            lastRemoteJson.current = freshJson;
            setData(freshData);
            setCloudReadyKey(storageKey);
            setSyncStatus("saving");
            setSyncError("");
            void saveWorkspace(identity, freshData)
              .then(() => {
                if (disposed) return;
                setSyncStatus("synced");
                setLastSyncedAt(new Date().toISOString());
              })
              .catch((error: unknown) => {
                if (disposed) return;
                setSyncStatus("error");
                setSyncError(
                  error instanceof Error
                    ? error.message
                    : "Could not reset the cloud workspace.",
                );
              });
            return;
          }

          const normalized = normalizeStoredData(remoteData, identity);
          const remoteJson = JSON.stringify(normalized);
          lastRemoteJson.current = remoteJson;
          dataRef.current = normalized;
          setData(normalized);
          setCloudReadyKey(storageKey);
          setSyncStatus(
            hasPendingWrites ? "saving" : fromCache ? "offline" : "synced",
          );
          if (!hasPendingWrites && !fromCache) {
            setLastSyncedAt(new Date().toISOString());
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
          setCloudReadyKey(storageKey);
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
        window.localStorage.setItem(storageKey, JSON.stringify(data));
      } catch {
        // Keep the in-memory workspace usable if storage is full or disabled.
      }
    }
  }, [data, hydratedKey, storageKey]);

  useEffect(() => {
    if (
      !accountSyncEnabled ||
      cloudReadyKey !== storageKey ||
      hydratedKey !== storageKey
    ) {
      return;
    }

    const nextJson = JSON.stringify(data);
    if (nextJson === lastRemoteJson.current) return;

    const sequence = ++writeSequence.current;
    const saveTimer = window.setTimeout(() => {
      setSyncStatus("saving");
      setSyncError("");
      void saveWorkspace(identity, data)
        .then(() => {
          if (sequence !== writeSequence.current) return;
          lastRemoteJson.current = nextJson;
          setSyncStatus("synced");
          setLastSyncedAt(new Date().toISOString());
        })
        .catch((error: unknown) => {
          if (sequence !== writeSequence.current) return;
          setSyncStatus("offline");
          setSyncError(
            error instanceof Error
              ? error.message
              : "Cloud sync failed. Changes remain saved in this browser.",
          );
        });
    }, 450);

    return () => window.clearTimeout(saveTimer);
  }, [
    accountSyncEnabled,
    cloudReadyKey,
    data,
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
      toggleTask(taskId) {
        setData((current) => toggleTaskInData(current, taskId));
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
      addHabit(habit) {
        setData((current) =>
          addHabitToData(current, habit, { identity }),
        );
      },
      addModule(module) {
        setData((current) =>
          addModuleToData(current, module, { identity }),
        );
      },
      addAssessment(assessment) {
        setData((current) =>
          addAssessmentToData(current, assessment, { identity }),
        );
      },
      addAlgorithmLog(log) {
        setData((current) =>
          addAlgorithmLogToData(current, log, { identity }),
        );
      },
      addApplication(application) {
        setData((current) =>
          addApplicationToData(current, application, { identity }),
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
      updateGoalProgress(goalId, progress) {
        setData((current) =>
          updateGoalProgressInData(current, goalId, progress),
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
      saveReflection(reflection) {
        setData((current) =>
          saveReflectionToData(current, reflection, { identity }),
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
