import { describe, expect, it } from "vitest";
import { GUITAR_TOOLS } from "@/features/guitar-learning/components/explore-mode";
import type { GuitarToolId } from "@/features/guitar-learning/types";

describe("guitar Explore registry", () => {
  it("maps every required tool ID to one unique, described station", () => {
    const expected: GuitarToolId[] = [
      "fretboard",
      "scales",
      "rhythm",
      "picking",
      "chords",
      "triads",
      "arpeggios",
      "progressions",
      "emotional",
      "improvisation",
      "phrase-builder",
      "ear-training",
      "theory",
      "metronome",
      "drone",
    ];
    expect(GUITAR_TOOLS.map((tool) => tool.id).sort()).toEqual(
      expected.sort(),
    );
    expect(new Set(GUITAR_TOOLS.map((tool) => tool.id))).toHaveLength(
      expected.length,
    );
    expect(
      GUITAR_TOOLS.every(
        (tool) => tool.description.length > 70 && tool.coach,
      ),
    ).toBe(true);
  });
});
