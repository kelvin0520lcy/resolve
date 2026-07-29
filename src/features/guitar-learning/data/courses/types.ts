import type {
  AudioPattern,
  ExplicitLessonVisual,
  GlossaryTermId,
  GuitarCoach,
  GuitarLessonCategory,
  GuitarLessonSkillType,
  GuitarApplicationResult,
  GuitarPathId,
} from "@/features/guitar-learning/types";

export type AuthoredLessonCheck = {
  prompt: string;
  options: [string, string, ...string[]];
  correctIndex: number;
  explanation: string;
};

export type AuthoredLessonDefinition = {
  id: string;
  pathId: GuitarPathId;
  title: string;
  learnerProblem: string;
  category: GuitarLessonCategory;
  skillType: GuitarLessonSkillType;
  difficulty: 1 | 2 | 3 | 4 | 5;
  coach: GuitarCoach;
  prerequisiteIds: string[];
  termsIntroduced: GlossaryTermId[];
  assumedTerms: GlossaryTermId[];
  estimatedMinutes: number;
  experience: string;
  plainEnglishExplanation: string;
  analogy?: string;
  whyItMatters: string;
  visual: ExplicitLessonVisual;
  visualPrompt: string;
  visualObservationGuide: [string, string, string];
  visualSuccess: string;
  audio: {
    body: string;
    correctLabel: string;
    incorrectLabel: string;
    correctPattern: AudioPattern;
    incorrectPattern: AudioPattern;
    listenFor: string;
  };
  guidedPractice: {
    body: string;
    steps: [string, string, ...string[]];
    success: string;
  };
  objectiveCheck: AuthoredLessonCheck;
  checkpoint: AuthoredLessonCheck;
  commonMistakes: Array<{ mistake: string; fix: string }>;
  musicalApplication: {
    body: string;
    prompt: string;
    options: [string, string, ...string[]];
    outcomes: [
      GuitarApplicationResult,
      GuitarApplicationResult,
      ...GuitarApplicationResult[],
    ];
    completionMessage: string;
  };
  alternativeExplanation: string;
  toolPresetId: string;
  reviewSchedule?: number[];
};

export type AuthoredCourseDefinition = {
  id: GuitarPathId;
  title: string;
  description: string;
  coach: GuitarCoach;
  learnerPromise: string;
  lessonIds: string[];
};
