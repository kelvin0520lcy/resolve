import { describe, expect, it } from "vitest";
import {
  GUITAR_LEARNING_AREAS,
  getGuitarLearningStats,
  getSuggestedGuitarArea,
} from "@/lib/guitar-learning";
import type { GuitarPracticeSession } from "@/types";

function session(
  overrides: Partial<GuitarPracticeSession>,
): GuitarPracticeSession {
  return {
    id: "session-1",
    userId: "user-1",
    semesterId: "semester-1",
    date: "2026-07-25",
    durationMinutes: 30,
    category: "Lead guitar",
    techniques: ["Vibrato"],
    ...overrides,
  };
}

describe("guitar learning map", () => {
  it("covers a broad curriculum with concrete practice topics", () => {
    expect(GUITAR_LEARNING_AREAS.length).toBeGreaterThanOrEqual(10);
    expect(
      GUITAR_LEARNING_AREAS.every((area) => area.topics.length >= 5),
    ).toBe(true);
  });

  it("summarizes minutes and topic coverage from practice evidence", () => {
    const stats = getGuitarLearningStats([
      session({ id: "one", techniques: ["Vibrato"] }),
      session({
        id: "two",
        durationMinutes: 20,
        techniques: ["Bends and intonation"],
      }),
      session({
        id: "three",
        category: "Scales",
        techniques: ["Intervals"],
      }),
    ]);

    expect(stats.find((area) => area.name === "Lead guitar")).toMatchObject({
      minutes: 50,
      sessionCount: 2,
      practisedTopics: ["Bends and intonation", "Vibrato"],
    });
    expect(
      stats.find((area) => area.name === "Fretboard & scales"),
    ).toMatchObject({
      minutes: 30,
      sessionCount: 1,
      practisedTopics: ["Intervals"],
    });
  });

  it("suggests an area with the least practice evidence", () => {
    expect(getSuggestedGuitarArea([]).name).toBe("Foundations");

    const suggestion = getSuggestedGuitarArea([
      session({ category: "Foundations", techniques: ["Metronome timing"] }),
    ]);

    expect(suggestion.name).not.toBe("Foundations");
    expect(suggestion.sessionCount).toBe(0);
  });
});
