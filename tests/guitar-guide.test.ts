import { describe, expect, it } from "vitest";
import {
  findGuitarGuideEntries,
  GUITAR_GUIDE_ENTRIES,
} from "@/features/guitar-learning/data/guide";

describe("contextual guitar guide", () => {
  it("returns deterministic concept-specific help", () => {
    const first = findGuitarGuideEntries(
      "My strumming hand stops on missed strokes",
    );
    const second = findGuitarGuideEntries(
      "My strumming hand stops on missed strokes",
    );
    expect(first).toEqual(second);
    expect(first[0]).toMatchObject({
      id: "strumming-pattern",
      toolId: "rhythm",
    });
    expect(first[0].answer).toContain("every subdivision");
  });

  it("links every guide answer to a tool and curriculum concept", () => {
    expect(GUITAR_GUIDE_ENTRIES.length).toBeGreaterThanOrEqual(8);
    expect(
      GUITAR_GUIDE_ENTRIES.every(
        (entry) =>
          entry.toolId &&
          entry.lessonIds.length > 0 &&
          entry.tryNext.length > 30,
      ),
    ).toBe(true);
    expect(findGuitarGuideEntries("")).toEqual([]);
  });
});
