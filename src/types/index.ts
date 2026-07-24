export type User = {
  id: string;
  displayName: string;
  email: string;
  photoURL?: string;
  activeSemesterId?: string;
  createdAt: string;
  updatedAt: string;
};

export type Semester = {
  id: string;
  userId: string;
  name: string;
  academicYear: string;
  startDate: string;
  endDate: string;
  recessWeekStart?: string;
  readingWeekStart?: string;
  examPeriodStart?: string;
  theme?: string;
  mainResolution?: string;
  targetGpa?: number;
  description?: string;
  status: "upcoming" | "active" | "completed";
};

export type GoalCategory =
  | "academics"
  | "career"
  | "technical"
  | "guitar"
  | "health"
  | "personal"
  | "finance"
  | "social"
  | "custom";

export type Goal = {
  id: string;
  userId: string;
  semesterId: string;
  title: string;
  description: string;
  motivation?: string;
  category: GoalCategory | string;
  priority: "low" | "medium" | "high";
  measurementType:
    | "percentage"
    | "count"
    | "duration"
    | "milestone"
    | "manual";
  targetValue?: number;
  currentValue?: number;
  unit?: string;
  startDate: string;
  deadline?: string;
  status:
    | "not_started"
    | "active"
    | "at_risk"
    | "paused"
    | "completed"
    | "abandoned";
  createdAt: string;
  updatedAt: string;
};

export type Milestone = {
  id: string;
  goalId: string;
  title: string;
  description?: string;
  deadline?: string;
  completed: boolean;
  completedAt?: string;
  order: number;
};

export type Task = {
  id: string;
  userId: string;
  semesterId: string;
  goalId?: string;
  milestoneId?: string;
  title: string;
  description?: string;
  category: string;
  scheduledDate?: string;
  deadline?: string;
  estimatedMinutes?: number;
  actualMinutes?: number;
  priority: "low" | "medium" | "high";
  difficulty?: 1 | 2 | 3 | 4 | 5;
  status:
    | "planned"
    | "in_progress"
    | "completed"
    | "skipped"
    | "rescheduled"
    | "cancelled";
  recurrenceRule?: string;
  completedAt?: string;
  createdAt: string;
  updatedAt: string;
};

export type Habit = {
  id: string;
  userId: string;
  semesterId: string;
  title: string;
  category: string;
  measurementType: "boolean" | "count" | "duration" | "rating";
  targetValue?: number;
  unit?: string;
  targetDays: number[];
  isActive: boolean;
};

export type HabitLog = {
  id: string;
  habitId: string;
  userId: string;
  date: string;
  completed: boolean;
  value?: number;
  notes?: string;
};

export type GuitarPracticeSession = {
  id: string;
  userId: string;
  semesterId: string;
  date: string;
  durationMinutes: number;
  instrument?: string;
  category: string;
  techniques: string[];
  song?: string;
  exercise?: string;
  startingBpm?: number;
  endingBpm?: number;
  cleanBpm?: number;
  difficulty?: number;
  confidence?: number;
  notes?: string;
  recordingURL?: string;
  nextFocus?: string;
};

export type Reflection = {
  id: string;
  userId: string;
  semesterId: string;
  type: "daily" | "weekly" | "monthly" | "semester";
  periodStart: string;
  periodEnd: string;
  wins?: string;
  difficulties?: string;
  lessons?: string;
  neglectedAreas?: string;
  nextChanges?: string;
  mood?: number;
  energy?: number;
  createdAt: string;
};

export type CharacterExpression =
  | "neutral"
  | "happy"
  | "proud"
  | "excited"
  | "nervous"
  | "tired"
  | "overwhelmed"
  | "concerned"
  | "encouraging"
  | "celebrating";

export type CharacterState = {
  expression: CharacterExpression;
  dialogue: string;
  scene: string;
  triggerReason: string;
};
