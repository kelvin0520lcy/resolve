import { describe, expect, it } from "vitest";
import {
  GUITAR_TOOL_QUICK_START,
  GUITAR_TOOLS,
} from "@/features/guitar-learning/components/explore-mode";
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
      "tuner",
      "chord-trainer",
    ];
    expect(GUITAR_TOOLS.map((tool) => tool.id).sort()).toEqual(
      expected.sort(),
    );
    expect(new Set(GUITAR_TOOLS.map((tool) => tool.id))).toHaveLength(
      expected.length,
    );
    expect(
      GUITAR_TOOLS.every(
        (tool) => tool.description.length > 40 && tool.coach,
      ),
    ).toBe(true);
    expect(Object.keys(GUITAR_TOOL_QUICK_START).sort()).toEqual(
      expected.sort(),
    );
    for (const guide of Object.values(GUITAR_TOOL_QUICK_START)) {
      expect(guide.setup.length).toBeGreaterThan(45);
      expect(guide.action.length).toBeGreaterThan(45);
      expect(guide.success.length).toBeGreaterThan(45);
    }
  });
});
