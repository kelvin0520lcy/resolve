import type { GuitarLearningState } from "@/features/guitar-learning/types";
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
  SemesterArchiveSummary,
  Semester,
  Task,
  WorkspaceEvent,
  WorkspacePreferences,
} from "@/types";

export type ResolveData = {
  semester: Semester;
  goals: Goal[];
  milestones: Milestone[];
  tasks: Task[];
  habits: Habit[];
  habitLogs: HabitLog[];
  guitarSessions: GuitarPracticeSession[];
  guitarLearning: GuitarLearningState;
  reflections: Reflection[];
  modules: AcademicModule[];
  algorithmLogs: AlgorithmLog[];
  applications: JobApplication[];
  events: WorkspaceEvent[];
  weeklyPriorities: string[];
  preferences: WorkspacePreferences;
  archiveSummaries: SemesterArchiveSummary[];
};
