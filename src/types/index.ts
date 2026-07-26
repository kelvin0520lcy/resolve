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
  resolutions?: SemesterResolution[];
  /** Legacy single-resolution field retained for storage migration. */
  mainResolution?: string;
  targetGpa?: number;
  description?: string;
  status: "upcoming" | "active" | "completed";
};

export type SemesterResolution = {
  id: string;
  title: string;
  completed: boolean;
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
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
  deadlineInfo?: DeadlineValue;
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
  deadlineInfo?: DeadlineValue;
  completed: boolean;
  completedAt?: string;
  order: number;
  completionMode?: MilestoneCompletionMode;
};

export type LocalDateDeadline = {
  kind: "date";
  date: string;
};

export type ExactDeadline = {
  kind: "dateTime";
  at: string;
  timeZone: string;
};

export type DeadlineValue = LocalDateDeadline | ExactDeadline;

export type TaskSchedule = {
  date: string;
  startTime?: string;
  estimatedMinutes?: number;
  timeZone: string;
};

export type TaskDeferralSummary = {
  deferCount: number;
  lastDeferredFrom?: string;
  lastDeferredTo?: string;
  lastDeferredAt?: string;
  lastReason?: string;
};

export type TaskOrigin =
  | {
      kind: "assessment-preparation";
      assessmentId: string;
      moduleId: string;
      templateId: string;
    }
  | {
      kind: "guitar-lesson";
      lessonId: string;
    }
  | {
      kind: "quick-capture";
    }
  | {
      kind: "reflection-action";
      reflectionDate: string;
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
  schedule?: TaskSchedule;
  deadlineInfo?: DeadlineValue;
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
  prerequisiteTaskIds?: string[];
  requiredForMilestone?: boolean;
  dailyPriorityRank?: 1 | 2 | 3;
  origin?: TaskOrigin;
  deferral?: TaskDeferralSummary;
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
  scheduleType: "days_of_week" | "times_per_week";
  targetDays: number[];
  targetFrequency: number;
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

export type Assessment = {
  id: string;
  moduleId: string;
  title: string;
  type: "assignment" | "project" | "quiz" | "midterm" | "presentation" | "exam";
  weight: number;
  deadline: string;
  deadlineInfo?: DeadlineValue;
  progress: number;
  status: "not_started" | "in_progress" | "submitted" | "graded";
  score?: number;
  targetScore?: number;
  preparation?: {
    templateId?: string;
    generatedTaskIds: string[];
    generatedAt?: string;
  };
};

export type AcademicModule = {
  id: string;
  userId: string;
  semesterId: string;
  code: string;
  name: string;
  lecturer?: string;
  credits: number;
  targetGrade: string;
  estimatedGrade?: string;
  color: string;
  weeklyStudyMinutes: number;
  assessments: Assessment[];
};

export type AlgorithmLog = {
  id: string;
  userId: string;
  semesterId: string;
  platform: string;
  problemName: string;
  topic: string;
  difficulty: "Easy" | "Medium" | "Hard";
  completedDate: string;
  minutes: number;
  usedHints: boolean;
  confidence: number;
  lesson: string;
};

export type JobApplication = {
  id: string;
  userId: string;
  company: string;
  role: string;
  applicationDate: string;
  stage: "saved" | "applied" | "assessment" | "interview" | "offer" | "closed";
  nextAction?: string;
  nextActionDate?: string;
  nextActionDeadline?: DeadlineValue;
};

export type MilestoneCompletionMode = "manual" | "required_tasks";

export type EventRecurrence =
  | { kind: "none" }
  | {
      kind: "weekly" | "fortnightly" | "selected_weekdays";
      weekdays: number[];
      startsOn: string;
      endsOn?: string;
      excludedDates?: string[];
    };

export type WorkspaceEvent = {
  id: string;
  userId: string;
  semesterId: string;
  title: string;
  category: string;
  date: string;
  startTime?: string;
  durationMinutes?: number;
  timeZone: string;
  recurrence: EventRecurrence;
  createdAt: string;
  updatedAt: string;
};

export type WorkspacePreferences = {
  timeZone: string;
  dailyCapacityMinutes: number;
  autoNextAction: boolean;
  pinnedTaskId?: string;
  hiddenRecommendationDate?: string;
};

export type SemesterArchiveSummary = {
  id: string;
  semesterId: string;
  semesterName: string;
  archivedAt: string;
  completedTasks: number;
  completedGoals: number;
  habitCompletions: number;
  reflectionCount: number;
};

export type SemesterEvent = {
  id: string;
  title: string;
  date: string;
  category: string;
  type: "semester" | "deadline" | "break" | "exam" | "milestone";
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
