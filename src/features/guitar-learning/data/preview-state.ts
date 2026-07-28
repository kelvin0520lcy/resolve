import {
  GUITAR_LESSONS,
} from "@/features/guitar-learning/data/curriculum";
import {
  createEmptyGuitarLearningState,
} from "@/features/guitar-learning/lib/learning-state";
import type {
  GuitarLearningState,
  GuitarLessonProgress,
} from "@/features/guitar-learning/types";

export type GuitarPreviewStateId =
  | "placement"
  | "learn"
  | "lesson-visual"
  | "lesson-checkpoint"
  | "lesson-application"
  | "lesson-completed"
  | "practice"
  | "rhythm-guided"
  | "rhythm-sandbox"
  | "chord-trainer"
  | "sandbox-tool"
  | "progress"
  | "partial"
  | "completed";

export const GUITAR_PREVIEW_STATES: Array<{
  id: GuitarPreviewStateId;
  label: string;
}> = [
  { id: "placement", label: "New learner · placement" },
  { id: "learn", label: "Learn dashboard" },
  { id: "lesson-visual", label: "Lesson · visual stage" },
  { id: "lesson-checkpoint", label: "Lesson · checkpoint" },
  { id: "lesson-application", label: "Lesson · application" },
  { id: "lesson-completed", label: "Lesson · completed" },
  { id: "practice", label: "Practice routine" },
  { id: "rhythm-guided", label: "Rhythm · guided" },
  { id: "rhythm-sandbox", label: "Rhythm · sandbox" },
  { id: "chord-trainer", label: "Chord Change Trainer" },
  { id: "sandbox-tool", label: "Sandbox-only tool" },
  { id: "progress", label: "Progress map" },
  { id: "partial", label: "Partial-progress learner" },
  { id: "completed", label: "Fully completed learner" },
];

export const PREVIEW_LESSON_ID =
  "rhythm:feeling-and-identifying-the-pulse";
export const PREVIEW_LESSON =
  GUITAR_LESSONS.find((lesson) => lesson.id === PREVIEW_LESSON_ID)!;

function completedProgress(
  lessonId: string,
  status: GuitarLessonProgress["status"] = "understood",
): GuitarLessonProgress {
  const lesson = GUITAR_LESSONS.find(
    (candidate) => candidate.id === lessonId,
  )!;
  return {
    lessonId,
    status,
    attempts: 1,
    completedSectionIds: lesson.sections
      .filter((section) => section.required)
      .map((section) => section.id),
    checkpointScore: 1,
    applicationCompleted: true,
    applicationResult: "achieved",
    understoodAt:
      status === "understood" ? "2026-07-28T10:00:00.000Z" : undefined,
    lastOpenedAt: "2026-07-28T09:45:00.000Z",
    lastReviewedAt: "2026-07-28T10:00:00.000Z",
  };
}

export function createPreviewGuitarState(
  previewId: GuitarPreviewStateId,
): GuitarLearningState {
  const state = createEmptyGuitarLearningState(
    "guitar-preview",
    "2026-07-28T09:00:00.000Z",
  );
  if (previewId === "placement") return state;

  state.profile.placementCompleted = true;
  state.profile.selectedPathIds = [
    "guitar-language",
    "rhythm",
    "improvisation",
  ];
  state.profile.currentLessonId = PREVIEW_LESSON_ID;

  if (previewId === "lesson-checkpoint") {
    state.progress = [
      {
        lessonId: PREVIEW_LESSON_ID,
        status: "learning",
        attempts: 0,
        completedSectionIds: PREVIEW_LESSON.sections
          .filter((section) => section.required)
          .map((section) => section.id),
      },
    ];
  } else if (previewId === "lesson-application") {
    state.progress = [
      {
        lessonId: PREVIEW_LESSON_ID,
        status: "learning",
        attempts: 1,
        completedSectionIds: PREVIEW_LESSON.sections
          .filter((section) => section.required)
          .map((section) => section.id),
        checkpointScore: 1,
      },
    ];
  } else if (previewId === "lesson-completed") {
    state.progress = [completedProgress(PREVIEW_LESSON_ID)];
  } else if (previewId === "partial") {
    state.progress = [
      completedProgress(GUITAR_LESSONS[0].id),
      {
        lessonId: PREVIEW_LESSON_ID,
        status: "needs_review",
        attempts: 2,
        completedSectionIds: PREVIEW_LESSON.sections
          .filter((section) => section.required)
          .slice(0, 3)
          .map((section) => section.id),
        checkpointScore: 0.5,
        applicationCompleted: true,
        applicationResult: "partial",
        lastOpenedAt: "2026-07-28T09:45:00.000Z",
        lastReviewedAt: "2026-07-28T10:00:00.000Z",
      },
    ];
  } else if (previewId === "completed") {
    state.progress = GUITAR_LESSONS.map((lesson) =>
      completedProgress(lesson.id),
    );
  }

  return state;
}
