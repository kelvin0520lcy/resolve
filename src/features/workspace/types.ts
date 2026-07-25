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
  guitarLearning: GuitarLearningState;
  reflections: Reflection[];
  modules: AcademicModule[];
  algorithmLogs: AlgorithmLog[];
  applications: JobApplication[];
  weeklyPriorities: string[];
};
