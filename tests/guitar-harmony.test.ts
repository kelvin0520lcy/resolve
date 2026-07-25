import { describe, expect, it } from "vitest";
import {
  buildEmotionalGuitarRecipe,
  chromaticDistanceLabel,
  getChordToneRoles,
  harmonizeMajorScale,
  intervalFormula,
  scaleStepFormula,
  transposeNotes,
} from "@/features/guitar-learning/lib/harmony";

describe("guitar harmony helpers", () => {
  it("labels intervals and scale steps", () => {
    expect(intervalFormula([0, 3, 7, 10])).toEqual([
      "R",
      "♭3",
      "5",
      "♭7",
    ]);
    expect(scaleStepFormula("C", "major")).toEqual([
      "W",
      "W",
      "H",
      "W",
      "W",
      "W",
      "H",
    ]);
  });

  it("harmonizes a major scale with correct chord qualities", () => {
    const chords = harmonizeMajorScale("C");
    expect(chords.map((chord) => chord.roman)).toEqual([
      "I",
      "ii",
      "iii",
      "IV",
      "V",
      "vi",
      "vii°",
    ]);
    expect(chords[4]).toMatchObject({
      root: "G",
      quality: "major",
      function: "dominant",
    });
    expect(chords[6].notes).toEqual(["B", "D", "F"]);
  });

  it("describes chord-tone roles and transposes note sets", () => {
    expect(getChordToneRoles("sus4").map((tone) => tone.role)).toEqual([
      "root",
      "perfect fourth",
      "perfect fifth",
    ]);
    expect(transposeNotes(["C", "E", "G"], 2)).toEqual(["D", "F#", "A"]);
    expect(chromaticDistanceLabel("B", "C")).toMatchObject({
      semitones: 1,
      direction: "up",
    });
  });

  it("builds deterministic emotional recipes with bounded controls", () => {
    expect(
      buildEmotionalGuitarRecipe({
        brightness: 85,
        tension: 20,
        movement: 80,
        intensity: 90,
      }),
    ).toMatchObject({
      root: "E",
      scale: "major-pentatonic",
      chordQuality: "add9",
      subdivision: 16,
      articulation: "wide accents and open sustain",
    });
    const dark = buildEmotionalGuitarRecipe({
      brightness: -20,
      tension: 90,
      movement: 10,
      intensity: 20,
    });
    expect(dark).toMatchObject({
      brightness: 0,
      scale: "harmonic-minor",
      chordQuality: "sus4",
      subdivision: 4,
    });
  });
});
