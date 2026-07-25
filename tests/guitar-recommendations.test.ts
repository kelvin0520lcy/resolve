import { describe, expect, it } from "vitest";
import {
  createEmptyGuitarLearningState,
  hideLessonRecommendation,
  markLessonAlreadyKnown,
  recordLessonCheckpoint,
  setSelectedGuitarPaths,
} from "@/features/guitar-learning/lib/learning-state";
import { getLessonRecommendations } from "@/features/guitar-learning/lib/recommendations";

describe("guitar recommendations", () => {
  it("is deterministic and prioritises an actionable failed checkpoint", () => {
    const firstLessonId =
      "rhythm:feeling-and-identifying-the-pulse";
    let state = setSelectedGuitarPaths(
      createEmptyGuitarLearningState("learner"),
      ["rhythm"],
    );
    state = recordLessonCheckpoint(state, firstLessonId, 0);

    const first = getLessonRecommendations({
      state,
      now: "2026-07-25T00:00:00Z",
    });
    const second = getLessonRecommendations({
      state,
      now: "2026-07-25T00:00:00Z",
    });
    expect(first).toEqual(second);
    expect(first[0]).toMatchObject({
      lessonId: firstLessonId,
      source: "checkpoint",
      missingPrerequisiteIds: [],
    });
    expect(first[0].reasons.join(" ")).toContain("checkpoint");
  });

  it("never recommends hidden or already-known concepts", () => {
    const firstLessonId =
      "rhythm:feeling-and-identifying-the-pulse";
    const secondLessonId = "lead:relaxed-pick-grip";
    let state = markLessonAlreadyKnown(
      createEmptyGuitarLearningState("learner"),
      firstLessonId,
    );
    state = hideLessonRecommendation(state, secondLessonId);
    const recommendations = getLessonRecommendations({ state, limit: 20 });
    expect(
      recommendations.map((recommendation) => recommendation.lessonId),
    ).not.toContain(firstLessonId);
    expect(
      recommendations.map((recommendation) => recommendation.lessonId),
    ).not.toContain(secondLessonId);
  });

  it("explains missing prerequisites rather than pretending a lesson is ready", () => {
    const state = setSelectedGuitarPaths(
      createEmptyGuitarLearningState("learner"),
      ["improvisation"],
    );
    const recommendation = getLessonRecommendations({
      state,
      limit: 50,
    }).find(
      (candidate) =>
        candidate.lessonId ===
        "improvisation:minor-pentatonic-position-one",
    );
    expect(recommendation?.missingPrerequisiteIds).toEqual([
      "improvisation:root-note-targeting",
    ]);
    expect(recommendation?.reasons.join(" ")).toContain("Complete");
  });

  it("always presents an actionable lesson before locked recommendations", () => {
    const state = setSelectedGuitarPaths(
      createEmptyGuitarLearningState("learner"),
      ["improvisation"],
    );
    const recommendations = getLessonRecommendations({
      state,
      limit: 10,
    });
    expect(recommendations[0].missingPrerequisiteIds).toEqual([]);
    expect(
      recommendations.findIndex(
        (recommendation) =>
          recommendation.missingPrerequisiteIds.length > 0,
      ),
    ).toBeGreaterThan(0);
  });
});
