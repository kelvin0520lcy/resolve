import { describe, expect, it } from "vitest";
import {
  createRhythmGrid,
  createMultiBeatRhythmGrid,
  cycleRhythmState,
  deconstructStrummingPattern,
  describeRhythmChange,
  describeStringCrossing,
  rhythmCellToSymbol,
  rhythmCountCue,
  transformRhythm,
} from "@/features/guitar-learning/lib/rhythm";

describe("guitar rhythm construction", () => {
  it("generates quarter, eighth, triplet, and sixteenth subdivisions", () => {
    expect(createRhythmGrid(4).map((cell) => cell.count)).toEqual([
      "1",
      "2",
      "3",
      "4",
    ]);
    expect(createRhythmGrid(8).map((cell) => cell.direction)).toEqual([
      "D",
      "U",
      "D",
      "U",
      "D",
      "U",
      "D",
      "U",
    ]);
    expect(createRhythmGrid(12)).toHaveLength(12);
    expect(createRhythmGrid(16)).toHaveLength(16);
  });

  it("keeps multi-bar steps and speaks every eighth-note position", () => {
    expect(createMultiBeatRhythmGrid(8, 2)).toHaveLength(16);
    expect(
      Array.from({ length: 8 }, (_value, step) =>
        rhythmCountCue(step, 2),
      ),
    ).toEqual(["1", "and", "2", "and", "3", "and", "4", "and"]);
  });

  it("deconstructs D D U U D U into continuous hand movement", () => {
    const grid = deconstructStrummingPattern("D D U U D U", 8);
    expect(grid.map(rhythmCellToSymbol)).toEqual([
      "D",
      "–",
      "D",
      "U",
      "–",
      "U",
      "D",
      "U",
    ]);
    expect(grid.map((cell) => cell.direction)).toEqual([
      "D",
      "U",
      "D",
      "U",
      "D",
      "U",
      "D",
      "U",
    ]);
  });

  it("rejects patterns that cannot fit without reversing hand motion", () => {
    expect(() =>
      deconstructStrummingPattern("D D D D D", 8),
    ).toThrow("does not fit");
  });

  it("cycles cell states and applies explainable groove transformations", () => {
    expect(cycleRhythmState("played")).toBe("missed");
    expect(cycleRhythmState("rest")).toBe("played");

    const base = deconstructStrummingPattern("D D U U D U", 8);
    const accented = transformRhythm(base, "accent-backbeat");
    expect(
      accented.filter((cell) => cell.accented).map((cell) => cell.count),
    ).toEqual(["2", "4"]);

    const muted = transformRhythm(base, "add-muted");
    expect(muted[2].state).toBe("muted");
    expect(describeRhythmChange("add-muted")).toContain("percussion");

    const chorus = transformRhythm(
      transformRhythm(base, "palm-mute"),
      "open-chorus",
    );
    expect(chorus.every((cell) => !cell.palmMuted)).toBe(true);
  });

  it("labels inside and outside string crossings", () => {
    expect(
      describeStringCrossing(
        { string: 2, fret: 5, direction: "D" },
        { string: 3, fret: 5, direction: "U" },
      ),
    ).toBe("inside");
    expect(
      describeStringCrossing(
        { string: 2, fret: 5, direction: "U" },
        { string: 3, fret: 5, direction: "D" },
      ),
    ).toBe("outside");
    expect(
      describeStringCrossing(
        { string: 2, fret: 5, direction: "D" },
        { string: 2, fret: 7, direction: "U" },
      ),
    ).toBe("same string");
  });
});
