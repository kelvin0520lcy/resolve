import { describe, expect, it } from "vitest";
import {
  PLACEMENT_QUESTIONS,
  toPlacementAnswers,
} from "@/features/guitar-learning/data/placement";

describe("guitar placement questionnaire", () => {
  it("covers listening, fretboard, rhythm, chords, and practical playing", () => {
    const kinds = new Set(
      PLACEMENT_QUESTIONS.map((question) => question.kind),
    );
    expect(kinds).toEqual(
      new Set([
        "fretboard",
        "chord-diagram",
        "rhythm-grid",
        "practical",
        "listening",
        "multiple-choice",
      ]),
    );
    expect(PLACEMENT_QUESTIONS).toHaveLength(12);
    expect(
      PLACEMENT_QUESTIONS.every(
        (question) =>
          question.options.length === 3 &&
          question.lessonIds.length > 0,
      ),
    ).toBe(true);
  });

  it("creates bounded answers and ignores unanswered questions", () => {
    const answers = toPlacementAnswers({
      "strings-and-natural-notes": 9,
      "eighth-motion": 1,
    });
    expect(answers).toHaveLength(2);
    expect(answers[0]).toMatchObject({
      questionId: "strings-and-natural-notes",
      score: 2,
    });
    expect(answers[1]).toMatchObject({
      questionId: "eighth-motion",
      score: 1,
    });
  });
});
