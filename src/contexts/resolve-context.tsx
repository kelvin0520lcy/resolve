"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
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
  addGoalToData,
  addGuitarSessionToData,
  addTaskToData,
  moveTaskInData,
  saveReflectionToData,
  toggleHabitInData,
  toggleTaskInData,
  updateGoalProgressInData,
  updatePrioritiesInData,
  updateSemesterInData,
  type NewGoalInput,
  type NewTaskInput,
} from "@/lib/resolve-actions";
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
  storageMode: "browser-demo" | "account-browser";
  addTask: (task: NewTaskInput) => void;
  toggleTask: (taskId: string) => void;
  moveTask: (taskId: string, scheduledDate: string) => void;
  addGoal: (goal: NewGoalInput) => void;
  updateGoalProgress: (goalId: string, value: number) => void;
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
  resetDemo: () => void;
};

const ResolveContext = createContext<ResolveContextValue | null>(null);

export { getWeekDateKeys, offsetDate, toDateKey };

export function createSeedData(userId = "demo-user"): ResolveData {
  const now = new Date().toISOString();
  const semesterId = "semester-2026-s1";

  return {
    semester: {
      id: semesterId,
      userId,
      name: "AY2026/2027 Semester 1",
      academicYear: "2026/2027",
      startDate: offsetDate(-24),
      endDate: offsetDate(94),
      recessWeekStart: offsetDate(31),
      readingWeekStart: offsetDate(80),
      examPeriodStart: offsetDate(87),
      theme: "Building consistency",
      mainResolution:
        "Show up deliberately for academics, career preparation, music, and health.",
      targetGpa: 4.5,
      status: "active",
    },
    goals: [
      {
        id: "goal-academics",
        userId,
        semesterId,
        title: "Stay ahead in every module",
        description: "Complete every weekly review before Sunday evening.",
        motivation: "Make assessment weeks feel prepared, not panicked.",
        category: "academics",
        priority: "high",
        measurementType: "count",
        targetValue: 13,
        currentValue: 4,
        unit: "weekly reviews",
        startDate: offsetDate(-24),
        deadline: offsetDate(78),
        status: "active",
        createdAt: now,
        updatedAt: now,
      },
      {
        id: "goal-career",
        userId,
        semesterId,
        title: "Solve 60 interview problems",
        description: "Build repeatable pattern recognition across core topics.",
        motivation: "Be interview-ready before application season peaks.",
        category: "career",
        priority: "high",
        measurementType: "count",
        targetValue: 60,
        currentValue: 18,
        unit: "problems",
        startDate: offsetDate(-24),
        deadline: offsetDate(88),
        status: "active",
        createdAt: now,
        updatedAt: now,
      },
      {
        id: "goal-guitar",
        userId,
        semesterId,
        title: "Record a complete guitar solo",
        description: "Play cleanly at full tempo with controlled bends and vibrato.",
        motivation: "Turn practice fragments into one finished performance.",
        category: "guitar",
        priority: "medium",
        measurementType: "percentage",
        targetValue: 100,
        currentValue: 42,
        unit: "%",
        startDate: offsetDate(-20),
        deadline: offsetDate(70),
        status: "active",
        createdAt: now,
        updatedAt: now,
      },
      {
        id: "goal-health",
        userId,
        semesterId,
        title: "Exercise three times each week",
        description: "Protect energy and sleep through consistent movement.",
        category: "health",
        priority: "medium",
        measurementType: "count",
        targetValue: 30,
        currentValue: 9,
        unit: "sessions",
        startDate: offsetDate(-24),
        deadline: offsetDate(80),
        status: "at_risk",
        createdAt: now,
        updatedAt: now,
      },
    ],
    milestones: [
      {
        id: "milestone-guitar-1",
        goalId: "goal-guitar",
        title: "Clean bends at 90 BPM",
        completed: true,
        completedAt: offsetDate(-7),
        order: 1,
      },
      {
        id: "milestone-guitar-2",
        goalId: "goal-guitar",
        title: "Learn the full solo",
        deadline: offsetDate(28),
        completed: false,
        order: 2,
      },
      {
        id: "milestone-guitar-3",
        goalId: "goal-guitar",
        title: "Record final performance",
        deadline: offsetDate(70),
        completed: false,
        order: 3,
      },
    ],
    tasks: [
      {
        id: "task-review",
        userId,
        semesterId,
        goalId: "goal-academics",
        title: "Review CS2040 lecture notes",
        category: "academics",
        scheduledDate: offsetDate(0),
        deadline: offsetDate(0),
        estimatedMinutes: 60,
        priority: "high",
        difficulty: 3,
        status: "planned",
        createdAt: now,
        updatedAt: now,
      },
      {
        id: "task-leetcode",
        userId,
        semesterId,
        goalId: "goal-career",
        title: "Solve two graph problems",
        category: "career",
        scheduledDate: offsetDate(0),
        estimatedMinutes: 75,
        actualMinutes: 68,
        priority: "high",
        difficulty: 4,
        status: "completed",
        completedAt: now,
        createdAt: now,
        updatedAt: now,
      },
      {
        id: "task-guitar",
        userId,
        semesterId,
        goalId: "goal-guitar",
        title: "Alternate picking at 100 BPM",
        category: "guitar",
        scheduledDate: offsetDate(0),
        estimatedMinutes: 35,
        priority: "medium",
        difficulty: 3,
        status: "planned",
        createdAt: now,
        updatedAt: now,
      },
      {
        id: "task-assignment",
        userId,
        semesterId,
        goalId: "goal-academics",
        title: "Finish CS2103T user stories",
        category: "academics",
        scheduledDate: offsetDate(1),
        deadline: offsetDate(3),
        estimatedMinutes: 120,
        priority: "high",
        difficulty: 4,
        status: "planned",
        createdAt: now,
        updatedAt: now,
      },
      {
        id: "task-portfolio",
        userId,
        semesterId,
        goalId: "goal-career",
        title: "Polish portfolio case study",
        category: "career",
        scheduledDate: offsetDate(2),
        deadline: offsetDate(6),
        estimatedMinutes: 90,
        priority: "medium",
        difficulty: 3,
        status: "planned",
        createdAt: now,
        updatedAt: now,
      },
      {
        id: "task-exercise",
        userId,
        semesterId,
        goalId: "goal-health",
        title: "30-minute easy run",
        category: "health",
        scheduledDate: offsetDate(4),
        estimatedMinutes: 30,
        priority: "medium",
        difficulty: 2,
        status: "planned",
        createdAt: now,
        updatedAt: now,
      },
    ],
    habits: [
      {
        id: "habit-plan",
        userId,
        semesterId,
        title: "Plan tomorrow",
        category: "personal",
        measurementType: "boolean",
        targetDays: [0, 1, 2, 3, 4, 5, 6],
        isActive: true,
      },
      {
        id: "habit-sleep",
        userId,
        semesterId,
        title: "Sleep before 12:30",
        category: "health",
        measurementType: "boolean",
        targetDays: [0, 1, 2, 3, 4, 5, 6],
        isActive: true,
      },
      {
        id: "habit-guitar",
        userId,
        semesterId,
        title: "Guitar practice",
        category: "guitar",
        measurementType: "duration",
        targetValue: 30,
        unit: "min",
        targetDays: [1, 3, 5, 6],
        isActive: true,
      },
      {
        id: "habit-review",
        userId,
        semesterId,
        title: "Lecture review",
        category: "academics",
        measurementType: "boolean",
        targetDays: [1, 2, 3, 4, 5],
        isActive: true,
      },
    ],
    habitLogs: [
      ...[-6, -5, -4, -3, -2, -1].map((day) => ({
        id: `habit-plan-${day}`,
        habitId: "habit-plan",
        userId,
        date: offsetDate(day),
        completed: day !== -3,
      })),
      ...[-6, -5, -4, -3, -2, -1].map((day) => ({
        id: `habit-sleep-${day}`,
        habitId: "habit-sleep",
        userId,
        date: offsetDate(day),
        completed: day !== -2 && day !== -5,
      })),
      ...[-5, -3, -1].map((day) => ({
        id: `habit-guitar-${day}`,
        habitId: "habit-guitar",
        userId,
        date: offsetDate(day),
        completed: true,
        value: 35,
      })),
    ],
    guitarSessions: [
      {
        id: "guitar-1",
        userId,
        semesterId,
        date: offsetDate(-5),
        durationMinutes: 35,
        instrument: "Electric guitar",
        category: "Lead guitar",
        techniques: ["Alternate picking", "Bends"],
        song: "Original solo study",
        startingBpm: 84,
        endingBpm: 92,
        cleanBpm: 88,
        difficulty: 4,
        confidence: 3,
        notes: "Bends are landing more consistently.",
        nextFocus: "Relax the picking hand above 90 BPM.",
      },
      {
        id: "guitar-2",
        userId,
        semesterId,
        date: offsetDate(-2),
        durationMinutes: 42,
        instrument: "Electric guitar",
        category: "Repertoire",
        techniques: ["Vibrato", "Slides"],
        song: "Original solo study",
        startingBpm: 88,
        endingBpm: 96,
        cleanBpm: 92,
        difficulty: 3,
        confidence: 4,
        notes: "First half is now memorised.",
        nextFocus: "Connect the transition into phrase three.",
      },
    ],
    reflections: [],
    modules: [
      {
        id: "module-cs2040",
        userId,
        semesterId,
        code: "CS2040",
        name: "Data Structures and Algorithms",
        lecturer: "Dr Lim",
        credits: 4,
        targetGrade: "A",
        estimatedGrade: "A-",
        color: "#7c83fd",
        weeklyStudyMinutes: 270,
        assessments: [
          {
            id: "assessment-cs2040-quiz",
            moduleId: "module-cs2040",
            title: "Graph Algorithms Quiz",
            type: "quiz",
            weight: 15,
            deadline: offsetDate(8),
            progress: 65,
            status: "in_progress",
            targetScore: 85,
          },
        ],
      },
      {
        id: "module-cs2103t",
        userId,
        semesterId,
        code: "CS2103T",
        name: "Software Engineering",
        lecturer: "Prof Tan",
        credits: 4,
        targetGrade: "A-",
        estimatedGrade: "B+",
        color: "#ff6b9d",
        weeklyStudyMinutes: 220,
        assessments: [
          {
            id: "assessment-cs2103t-project",
            moduleId: "module-cs2103t",
            title: "Team Project Milestone",
            type: "project",
            weight: 30,
            deadline: offsetDate(3),
            progress: 72,
            status: "in_progress",
            targetScore: 80,
          },
        ],
      },
      {
        id: "module-is1108",
        userId,
        semesterId,
        code: "IS1108",
        name: "Digital Ethics and Society",
        lecturer: "Dr Wong",
        credits: 4,
        targetGrade: "A-",
        estimatedGrade: "A-",
        color: "#34c88a",
        weeklyStudyMinutes: 120,
        assessments: [
          {
            id: "assessment-is1108-essay",
            moduleId: "module-is1108",
            title: "Position Paper",
            type: "assignment",
            weight: 25,
            deadline: offsetDate(15),
            progress: 20,
            status: "in_progress",
            targetScore: 82,
          },
        ],
      },
    ],
    algorithmLogs: [
      {
        id: "algorithm-1",
        userId,
        semesterId,
        platform: "LeetCode",
        problemName: "Number of Islands",
        topic: "Graphs",
        difficulty: "Medium",
        completedDate: offsetDate(-1),
        minutes: 38,
        usedHints: false,
        confidence: 4,
        lesson: "Mark nodes as visited when enqueued, not when dequeued.",
      },
      {
        id: "algorithm-2",
        userId,
        semesterId,
        platform: "LeetCode",
        problemName: "Course Schedule",
        topic: "Topological sort",
        difficulty: "Medium",
        completedDate: offsetDate(-4),
        minutes: 52,
        usedHints: true,
        confidence: 3,
        lesson: "Indegree is the cleanest signal for Kahn's algorithm.",
      },
    ],
    applications: [
      {
        id: "application-1",
        userId,
        company: "Northstar Labs",
        role: "Software Engineering Intern",
        applicationDate: offsetDate(-6),
        stage: "assessment",
        nextAction: "Complete coding assessment",
        nextActionDate: offsetDate(5),
      },
      {
        id: "application-2",
        userId,
        company: "Orbit AI",
        role: "Machine Learning Intern",
        applicationDate: offsetDate(-2),
        stage: "applied",
        nextAction: "Send portfolio follow-up",
        nextActionDate: offsetDate(7),
      },
    ],
    weeklyPriorities: [
      "Ship the CS2103T project milestone",
      "Complete two graph-problem sessions",
      "Practise the full guitar solo at 92 BPM",
    ],
  };
}

export function normalizeStoredData(
  value: unknown,
  userId: string,
): ResolveData {
  const seed = createSeedData(userId);
  if (!value || typeof value !== "object" || Array.isArray(value)) return seed;

  const stored = value as Partial<ResolveData>;
  const arrayOrSeed = <T,>(candidate: unknown, fallback: T[]): T[] =>
    Array.isArray(candidate) ? (candidate as T[]) : fallback;
  const priorities =
    Array.isArray(stored.weeklyPriorities) &&
    stored.weeklyPriorities.length === 3 &&
    stored.weeklyPriorities.every(
      (priority) => typeof priority === "string" && priority.trim(),
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
  const storageKey = `resolve-data-v1:${identity}`;
  const [data, setData] = useState<ResolveData>(() => createSeedData(identity));
  const [hydratedKey, setHydratedKey] = useState<string | null>(null);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      try {
        const stored = window.localStorage.getItem(storageKey);
        if (stored) {
          setData(normalizeStoredData(JSON.parse(stored), identity));
        } else {
          setData(createSeedData(identity));
        }
      } catch {
        setData(createSeedData(identity));
      } finally {
        setHydratedKey(storageKey);
      }
    }, 0);
    return () => window.clearTimeout(timeoutId);
  }, [identity, storageKey]);

  useEffect(() => {
    if (hydratedKey === storageKey) {
      try {
        window.localStorage.setItem(storageKey, JSON.stringify(data));
      } catch {
        // Keep the in-memory workspace usable if storage is full or disabled.
      }
    }
  }, [data, hydratedKey, storageKey]);

  const value = useMemo<ResolveContextValue>(
    () => ({
      ...data,
      storageMode: isConfigured ? "account-browser" : "browser-demo",
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
      resetDemo() {
        setData(createSeedData(identity));
      },
    }),
    [data, identity, isConfigured],
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
