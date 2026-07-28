import { describe, expect, it } from "vitest";
import {
  GUITAR_LESSON_BY_ID,
} from "@/features/guitar-learning/data/curriculum";
import {
  applyPlacementResult,
  calculatePlacementResult,
  completeLessonSection,
  createEmptyGuitarLearningState,
  getEffectiveLessonStatus,
  getLessonCompletionRequirements,
  getLessonProgress,
  markLessonAlreadyKnown,
  markLessonUnderstood,
  normalizeGuitarLearningState,
  openGuitarLesson,
  recordLessonCheckpoint,
  recordLessonApplicationResult,
  setLessonApplicationComplete,
} from "@/features/guitar-learning/lib/learning-state";

describe("guitar learner state", () => {
  it("locks concepts until their direct prerequisite is understood", () => {
    const state = createEmptyGuitarLearningState("learner", "2026-07-25T00:00:00Z");
    const lesson = GUITAR_LESSON_BY_ID.get(
      "rhythm:quarter-note-counting",
    )!;
    expect(getEffectiveLessonStatus(lesson, state)).toBe("locked");
    expect(openGuitarLesson(state, lesson.id)).toBe(state);

    const ready = markLessonAlreadyKnown(
      state,
      "rhythm:feeling-and-identifying-the-pulse",
      "2026-07-25T01:00:00Z",
    );
    expect(getEffectiveLessonStatus(lesson, ready)).toBe("ready");
    expect(getLessonProgress(openGuitarLesson(ready, lesson.id), lesson.id))
      .toMatchObject({ status: "learning" });
  });

  it("requires the lesson, checkpoint, and musical application before mastery", () => {
    const lesson = GUITAR_LESSON_BY_ID.get(
      "rhythm:feeling-and-identifying-the-pulse",
    )!;
    let state = openGuitarLesson(
      createEmptyGuitarLearningState("learner"),
      lesson.id,
    );
    expect(markLessonUnderstood(state, lesson.id)).toBe(state);

    for (const section of lesson.sections.filter(
      (candidate) => candidate.required,
    )) {
      state = completeLessonSection(state, lesson.id, section.id);
    }
    state = recordLessonCheckpoint(state, lesson.id, 1);
    expect(
      getLessonCompletionRequirements(state, lesson).canMarkUnderstood,
    ).toBe(false);
    state = setLessonApplicationComplete(state, lesson.id, true);
    expect(
      getLessonCompletionRequirements(state, lesson).canMarkUnderstood,
    ).toBe(true);
    state = markLessonUnderstood(state, lesson.id, "2026-07-25T02:00:00Z");
    expect(getLessonProgress(state, lesson.id)).toMatchObject({
      status: "understood",
      checkpointScore: 1,
      applicationCompleted: true,
    });
  });

  it("turns failed checkpoints into an explicit review state", () => {
    const lessonId = "rhythm:feeling-and-identifying-the-pulse";
    const state = recordLessonCheckpoint(
      openGuitarLesson(
        createEmptyGuitarLearningState("learner"),
        lessonId,
      ),
      lessonId,
      0,
    );
    expect(getLessonProgress(state, lessonId)).toMatchObject({
      status: "needs_review",
      attempts: 1,
      checkpointScore: 0,
    });
  });

  it("keeps an honest weak application complete but schedules review", () => {
    const lessonId = "rhythm:feeling-and-identifying-the-pulse";
    const lesson = GUITAR_LESSON_BY_ID.get(lessonId)!;
    const state = recordLessonApplicationResult(
      openGuitarLesson(
        createEmptyGuitarLearningState("learner"),
        lessonId,
      ),
      lessonId,
      "not_yet",
      "2026-07-28T00:00:00Z",
    );
    expect(getLessonProgress(state, lessonId)).toMatchObject({
      applicationCompleted: true,
      applicationResult: "not_yet",
      status: "needs_review",
      selfConfidence: 2,
    });
    expect(
      getLessonCompletionRequirements(state, lesson).canMarkUnderstood,
    ).toBe(false);
  });

  it("calculates and applies a deterministic placement result", () => {
    const answers = [
      {
        questionId: "pulse",
        score: 2,
        lessonIds: ["rhythm:feeling-and-identifying-the-pulse"],
      },
      {
        questionId: "eighths",
        score: 0,
        lessonIds: ["rhythm:eighth-note-subdivisions"],
      },
      {
        questionId: "notes",
        score: 1,
        lessonIds: ["fretboard:open-string-names"],
      },
    ];
    const result = calculatePlacementResult(
      answers,
      "rhythm",
      "2026-07-25T03:00:00Z",
    );
    expect(result.recommendedPathId).toBe("rhythm");
    expect(result.recommendedLessonId).toBe(
      "rhythm:eighth-note-subdivisions",
    );
    expect(result.alreadyKnownLessonIds).toContain(
      "rhythm:feeling-and-identifying-the-pulse",
    );
    expect(result.reviewLessonIds).toContain(
      "fretboard:open-string-names",
    );

    const state = applyPlacementResult(
      createEmptyGuitarLearningState("learner"),
      result,
    );
    expect(state.profile.placementCompleted).toBe(true);
    expect(state.profile.currentLessonId).toBe(result.recommendedLessonId);
    expect(
      getLessonProgress(
        state,
        "rhythm:feeling-and-identifying-the-pulse",
      )?.status,
    ).toBe("already_known");
  });

  it("repairs untrusted persisted learner state without keeping stale IDs", () => {
    const lessonId = "rhythm:feeling-and-identifying-the-pulse";
    const lesson = GUITAR_LESSON_BY_ID.get(lessonId)!;
    const normalized = normalizeGuitarLearningState(
      {
        profile: {
          userId: "wrong-user",
          handedness: "sideways",
          preferredTuning: ["E2"],
          selectedPathIds: ["rhythm", "missing"],
          placementCompleted: true,
          currentLessonId: "deleted-lesson",
          bookmarkedLessonIds: [lessonId, "deleted-lesson"],
          confusingConceptIds: [],
          hiddenRecommendationIds: [],
          updatedAt: 123,
        },
        progress: [
          {
            lessonId,
            status: "understood",
            attempts: -12,
            checkpointScore: 7,
            completedSectionIds: [
              lesson.sections[0].id,
              "deleted-section",
            ],
          },
          { lessonId: "deleted-lesson", status: "understood" },
        ],
      },
      "correct-user",
      "2026-07-25T04:00:00Z",
    );
    expect(normalized.profile).toMatchObject({
      userId: "correct-user",
      handedness: "right",
      selectedPathIds: ["rhythm"],
      placementCompleted: false,
      currentLessonId: undefined,
      bookmarkedLessonIds: [lessonId],
      updatedAt: "2026-07-25T04:00:00Z",
    });
    expect(normalized.profile.preferredTuning).toEqual([
      "E2",
      "A2",
      "D3",
      "G3",
      "B3",
      "E4",
    ]);
    expect(normalized.progress).toEqual([
      expect.objectContaining({
        lessonId,
        attempts: 0,
        checkpointScore: 1,
        completedSectionIds: [lesson.sections[0].id],
      }),
    ]);
  });
});
