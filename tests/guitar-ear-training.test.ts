import { describe, expect, it } from "vitest";
import {
  createEarQuestion,
  type EarExerciseId,
} from "@/features/guitar-learning/lib/ear-training";

describe("ear-training question generator", () => {
  it("is deterministic for the same exercise, index, and root", () => {
    expect(createEarQuestion("interval", 3, "C")).toEqual(
      createEarQuestion("interval", 3, "C"),
    );
    expect(createEarQuestion("interval", 3, "C")).toMatchObject({
      correctIndex: 3,
      explanation: "Perfect fifth spans 7 semitones.",
    });
  });

  it("provides playable, answerable questions for every laboratory mode", () => {
    const modes: EarExerciseId[] = [
      "higher-lower",
      "same-different",
      "interval",
      "major-minor",
      "chord-quality",
      "tension-resolution",
      "note-matching",
      "rhythm-imitation",
      "phrase-ending",
    ];
    for (const mode of modes) {
      const question = createEarQuestion(mode, 2, "A");
      expect(question.options.length).toBeGreaterThanOrEqual(2);
      expect(question.correctIndex).toBeGreaterThanOrEqual(0);
      expect(question.correctIndex).toBeLessThan(question.options.length);
      expect(question.targetPattern).toBeDefined();
      expect(question.listenFor.length).toBeGreaterThan(30);
    }
  });
});
