export type GuitarCoach = "bocchi" | "nijika" | "ryo" | "kita";

export type GuitarLessonCategory =
  | "rhythm"
  | "lead"
  | "fretboard"
  | "improvisation"
  | "chords"
  | "ear"
  | "theory"
  | "application";

export type GuitarPathId =
  | "rhythm"
  | "lead"
  | "fretboard"
  | "improvisation"
  | "chords"
  | "ear-theory"
  | "application";

export type GuitarToolId =
  | "fretboard"
  | "scales"
  | "rhythm"
  | "picking"
  | "chords"
  | "triads"
  | "arpeggios"
  | "progressions"
  | "emotional"
  | "improvisation"
  | "phrase-builder"
  | "ear-training"
  | "theory"
  | "metronome"
  | "drone";

export type GuitarMasteryStatus =
  | "not_assessed"
  | "locked"
  | "ready"
  | "learning"
  | "understood"
  | "needs_review"
  | "already_known";

export type AudioPattern =
  | {
      kind: "notes";
      midiNotes: number[];
      beatSeconds?: number;
    }
  | {
      kind: "chord";
      midiNotes: number[];
      durationSeconds?: number;
    }
  | {
      kind: "rhythm";
      subdivisions: 4 | 8 | 12 | 16;
      activeSteps: number[];
      accentedSteps?: number[];
      mutedSteps?: number[];
      bpm?: number;
    };

type LessonSectionBase = {
  id: string;
  title: string;
  required?: boolean;
};

export type ExplanationSection = LessonSectionBase & {
  type: "explanation";
  body: string;
  takeaway: string;
};

export type ConnectionSection = LessonSectionBase & {
  type: "connection";
  knownConcept: string;
  body: string;
};

export type VisualSection = LessonSectionBase & {
  type:
    | "fretboard"
    | "rhythm-grid"
    | "picking-animation"
    | "chord-diagram"
    | "scale-comparison"
    | "song-structure";
  body: string;
  toolId: GuitarToolId;
  prompt: string;
  observationGuide: string[];
  successCriteria: string;
};

export type AudioComparisonSection = LessonSectionBase & {
  type: "audio-comparison";
  body: string;
  correctLabel: string;
  incorrectLabel: string;
  correctPattern: AudioPattern;
  incorrectPattern: AudioPattern;
  listenFor: string;
};

export type GuidedExerciseSection = LessonSectionBase & {
  type: "guided-exercise";
  body: string;
  steps: string[];
  completionPrompt: string;
};

export type CorrectVsIncorrectSection = LessonSectionBase & {
  type: "correct-vs-incorrect";
  incorrect: string;
  correct: string;
  listenFor: string;
};

export type CommonMistakesSection = LessonSectionBase & {
  type: "common-mistakes";
  items: Array<{ mistake: string; fix: string }>;
};

export type InteractiveQuestionSection = LessonSectionBase & {
  type: "interactive-question";
  prompt: string;
  options: string[];
  correctIndex: number;
  explanation: string;
};

export type MusicalApplicationSection = LessonSectionBase & {
  type: "musical-application";
  body: string;
  prompt: string;
  options: string[];
};

export type ReflectionPromptSection = LessonSectionBase & {
  type: "reflection";
  prompt: string;
};

export type GuitarLessonSection =
  | ExplanationSection
  | ConnectionSection
  | VisualSection
  | AudioComparisonSection
  | GuidedExerciseSection
  | CorrectVsIncorrectSection
  | CommonMistakesSection
  | InteractiveQuestionSection
  | MusicalApplicationSection
  | ReflectionPromptSection;

export type LessonCheckpoint = {
  prompt: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  passingScore: number;
};

export type ApplicationActivity = {
  prompt: string;
  options: string[];
  completionMessage: string;
};

export type GuitarLesson = {
  id: string;
  slug: string;
  pathId: GuitarPathId;
  title: string;
  summary: string;
  whyItMatters: string;
  category: GuitarLessonCategory;
  difficulty: 1 | 2 | 3 | 4 | 5;
  prerequisiteIds: string[];
  learningObjectives: string[];
  estimatedMinutes: number;
  coach: GuitarCoach;
  sections: GuitarLessonSection[];
  checkpoint: LessonCheckpoint;
  applicationActivity: ApplicationActivity;
  relatedToolIds: GuitarToolId[];
  nextLessonIds: string[];
  reviewLessonIds?: string[];
  unlocksConceptIds: string[];
  alternativeExplanation: string;
};

export type GuitarLearningPath = {
  id: GuitarPathId;
  title: string;
  description: string;
  coach: GuitarCoach;
  lessonIds: string[];
};

export type GuitarLessonProgress = {
  lessonId: string;
  status: GuitarMasteryStatus;
  checkpointScore?: number;
  attempts: number;
  confusingSectionIds?: string[];
  completedSectionIds?: string[];
  applicationCompleted?: boolean;
  lastOpenedAt?: string;
  lastReviewedAt?: string;
  understoodAt?: string;
  selfConfidence?: 1 | 2 | 3 | 4 | 5;
};

export type PlacementAnswer = {
  questionId: string;
  score: number;
  lessonIds: string[];
};

export type PlacementResult = {
  recommendedPathId: GuitarPathId;
  recommendedLessonId: string;
  alreadyKnownLessonIds: string[];
  reviewLessonIds: string[];
  missingPrerequisiteIds: string[];
  relevantToolIds: GuitarToolId[];
  explanation: string;
  completedAt: string;
};

export type GuitarLearningProfile = {
  userId: string;
  preferredTuning: string[];
  handedness: "right" | "left";
  selectedPathIds: GuitarPathId[];
  placementCompleted: boolean;
  placementResult?: PlacementResult;
  currentLessonId?: string;
  confusingConceptIds: string[];
  bookmarkedLessonIds: string[];
  hiddenRecommendationIds: string[];
  updatedAt: string;
};

export type GuitarLearningState = {
  profile: GuitarLearningProfile;
  progress: GuitarLessonProgress[];
};

export type LessonRecommendation = {
  lessonId: string;
  score: number;
  reasons: string[];
  missingPrerequisiteIds: string[];
  source:
    | "goal"
    | "focus_area"
    | "assessment"
    | "checkpoint"
    | "knowledge_gap"
    | "path_progression"
    | "review";
};

export type RhythmStrokeState =
  | "played"
  | "missed"
  | "muted"
  | "rest";

export type RhythmCell = {
  index: number;
  count: string;
  direction: "D" | "U";
  state: RhythmStrokeState;
  accented: boolean;
  palmMuted: boolean;
  chordChange?: string;
};

export type FretboardNote = {
  stringIndex: number;
  stringName: string;
  fret: number;
  note: string;
  octave: number;
  midi: number;
  interval: number;
};
