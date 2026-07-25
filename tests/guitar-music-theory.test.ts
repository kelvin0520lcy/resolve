import { describe, expect, it } from "vitest";
import {
  buildChord,
  buildScale,
  compareScales,
  convertRomanProgression,
  generateFretboard,
  getFretboardNote,
  getIntervalName,
  getIntervalSemitones,
  getTriadInversions,
  midiToFrequency,
  normalizeNote,
  STANDARD_TUNING,
  transposeNote,
} from "@/features/guitar-learning/lib/music-theory";

describe("guitar music theory", () => {
  it("normalizes notes and transposes across octave boundaries", () => {
    expect(normalizeNote("Db")).toBe("C#");
    expect(normalizeNote("E♭")).toBe("D#");
    expect(transposeNote("B", 1)).toBe("C");
    expect(transposeNote("C", -1)).toBe("B");
    expect(() => normalizeNote("H")).toThrow("Unsupported note");
  });

  it("calculates intervals in either direction", () => {
    expect(getIntervalSemitones("A", "C")).toBe(3);
    expect(getIntervalName("A", "E")).toBe("perfect fifth");
    expect(getIntervalSemitones("C", "B")).toBe(11);
  });

  it("constructs the supported priority scales", () => {
    expect(buildScale("C", "major")).toEqual([
      "C",
      "D",
      "E",
      "F",
      "G",
      "A",
      "B",
    ]);
    expect(buildScale("A", "natural-minor")).toEqual([
      "A",
      "B",
      "C",
      "D",
      "E",
      "F",
      "G",
    ]);
    expect(buildScale("A", "minor-pentatonic")).toEqual([
      "A",
      "C",
      "D",
      "E",
      "G",
    ]);
  });

  it("constructs chords and extended colours", () => {
    expect(buildChord("A", "minor")).toEqual(["A", "C", "E"]);
    expect(buildChord("C", "major")).toEqual(["C", "E", "G"]);
    expect(buildChord("D", "power")).toEqual(["D", "A"]);
    expect(buildChord("C", "add9")).toEqual(["C", "E", "G", "D"]);
  });

  it("maps standard and alternate guitar tunings across the fretboard", () => {
    expect(getFretboardNote(STANDARD_TUNING, 0, 0, "E")).toMatchObject({
      note: "E",
      octave: 2,
      midi: 40,
      interval: 0,
    });
    expect(getFretboardNote(STANDARD_TUNING, 0, 12, "E")).toMatchObject({
      note: "E",
      octave: 3,
      midi: 52,
    });
    expect(
      getFretboardNote(["D2", "A2", "D3", "G3", "B3", "E4"], 0, 0),
    ).toMatchObject({ note: "D", midi: 38 });
    expect(generateFretboard(STANDARD_TUNING, 24)).toHaveLength(150);
    expect(() => generateFretboard(["E2"], 24)).toThrow(
      "six strings",
    );
  });

  it("generates root position and both triad inversions", () => {
    expect(getTriadInversions("C", "major")).toEqual([
      {
        name: "Root position",
        notes: ["C", "E", "G"],
        intervals: ["root", "major third", "perfect fifth"],
      },
      {
        name: "First inversion",
        notes: ["E", "G", "C"],
        intervals: ["major third", "perfect fifth", "root"],
      },
      {
        name: "Second inversion",
        notes: ["G", "C", "E"],
        intervals: ["perfect fifth", "root", "major third"],
      },
    ]);
  });

  it("converts Roman numerals while preserving harmonic function", () => {
    const progression = convertRomanProgression(
      "C",
      "major",
      ["I", "V", "vi", "IV"],
    );
    expect(progression.map((chord) => chord.root)).toEqual([
      "C",
      "G",
      "A",
      "F",
    ]);
    expect(progression.map((chord) => chord.quality)).toEqual([
      "major",
      "major",
      "minor",
      "major",
    ]);
    expect(progression.map((chord) => chord.function)).toEqual([
      "tonic",
      "dominant",
      "tonic",
      "predominant",
    ]);
  });

  it("compares scale vocabularies and calculates playable frequencies", () => {
    expect(
      compareScales("A", "minor-pentatonic", "natural-minor"),
    ).toEqual({
      shared: ["A", "C", "D", "E", "G"],
      onlyFirst: [],
      onlySecond: ["B", "F"],
    });
    expect(midiToFrequency(69)).toBeCloseTo(440, 5);
  });
});
