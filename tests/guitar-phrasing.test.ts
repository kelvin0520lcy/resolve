import { describe, expect, it } from "vitest";
import {
  analyzePhrase,
  buildResponsePhrase,
  createCallPhrase,
  phraseEventsToMidi,
} from "@/features/guitar-learning/lib/phrasing";

describe("guitar phrasing helpers", () => {
  it("generates deterministic calls with an intentional rest", () => {
    const call = createCallPhrase("A", "minor-pentatonic", 0);
    expect(call.map((event) => event.note ?? "rest")).toEqual([
      "A",
      "D",
      "C",
      "rest",
      "A",
    ]);
    expect(phraseEventsToMidi(call)).toHaveLength(4);
  });

  it("creates echo, answering, and contrasting responses", () => {
    const call = createCallPhrase("A", "minor-pentatonic", 0);
    expect(buildResponsePhrase(call, "A", "echo")[0].note).toBe("A");
    expect(buildResponsePhrase(call, "A", "answer").at(-1)?.note).toBe(
      "A",
    );
    expect(
      buildResponsePhrase(call, "A", "contrast")[0].octave,
    ).toBe(5);
  });

  it("analyses musical evidence instead of mere note count", () => {
    const phrase = createCallPhrase("A", "minor-pentatonic", 0);
    const analysis = analyzePhrase(phrase, "A", "minor");
    expect(analysis).toMatchObject({
      finalNote: "A",
      restCount: 1,
    });
    expect(analysis.chordToneCount).toBeGreaterThan(0);
    expect(analysis.feedback.join(" ")).toContain("settled ending");

    const crowded = analyzePhrase(
      phrase.map((event) => ({ ...event, rest: false, note: "G" })),
      "A",
      "minor",
    );
    expect(crowded.feedback.join(" ")).toContain("Add a measured rest");
  });
});
