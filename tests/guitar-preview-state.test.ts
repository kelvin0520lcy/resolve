import { describe, expect, it } from "vitest";
import {
  createPreviewGuitarState,
  GUITAR_PREVIEW_STATES,
  PREVIEW_LESSON,
  PREVIEW_LESSON_ID,
} from "@/features/guitar-learning/data/preview-state";
import { GUITAR_LESSONS } from "@/features/guitar-learning/data/curriculum";
import {
  getLessonCompletionRequirements,
} from "@/features/guitar-learning/lib/learning-state";

describe("Guitar Studio preview data", () => {
  it("provides every documented preview state without account data", () => {
    expect(GUITAR_PREVIEW_STATES).toHaveLength(14);

    for (const option of GUITAR_PREVIEW_STATES) {
      const state = createPreviewGuitarState(option.id);
      expect(state.profile.userId).toBe("guitar-preview");
      expect(JSON.stringify(state)).not.toMatch(
        /@|firebase|firestore|displayName|email/i,
      );
    }
  });

  it("seeds the application state one honest result away from mastery", () => {
    const state = createPreviewGuitarState("lesson-application");
    const progress = state.progress.find(
      (entry) => entry.lessonId === PREVIEW_LESSON_ID,
    );
    const requirements = getLessonCompletionRequirements(
      state,
      PREVIEW_LESSON,
    );

    expect(progress?.checkpointScore).toBe(1);
    expect(requirements.incompleteSectionIds).toEqual([]);
    expect(requirements.applicationCompleted).toBe(false);
    expect(requirements.canMarkUnderstood).toBe(false);
  });

  it("seeds completed learning without unlocking persistence", () => {
    const state = createPreviewGuitarState("completed");
    expect(state.progress).toHaveLength(GUITAR_LESSONS.length);
    expect(state.progress.every((entry) => entry.status === "understood"))
      .toBe(true);
  });

  it("keeps partial progress internally consistent and in review", () => {
    const state = createPreviewGuitarState("partial");
    const progress = state.progress.find(
      (entry) => entry.lessonId === PREVIEW_LESSON_ID,
    );
    const requirements = getLessonCompletionRequirements(
      state,
      PREVIEW_LESSON,
    );

    expect(progress).toMatchObject({
      status: "needs_review",
      applicationCompleted: true,
      applicationResult: "partial",
    });
    expect(requirements.incompleteSectionIds.length).toBeGreaterThan(0);
    expect(requirements.canMarkUnderstood).toBe(false);
  });
});
