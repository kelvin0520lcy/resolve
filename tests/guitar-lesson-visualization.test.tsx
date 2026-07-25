import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { LessonVisualization } from "@/features/guitar-learning/components/lesson-visualization";
import { GUITAR_LESSONS } from "@/features/guitar-learning/data/curriculum";
import type {
  GuitarPathId,
  VisualSection,
} from "@/features/guitar-learning/types";

const EXPECTED_BY_PATH: Record<
  GuitarPathId,
  { type: VisualSection["type"]; name: RegExp }
> = {
  rhythm: { type: "rhythm-grid", name: /Count, hand direction/ },
  lead: { type: "picking-animation", name: /Pick direction and string path/ },
  fretboard: { type: "fretboard", name: /Seven-fret interval map/ },
  improvisation: { type: "fretboard", name: /Seven-fret interval map/ },
  chords: { type: "chord-diagram", name: /Chord formula and interval voicing/ },
  "ear-theory": {
    type: "scale-comparison",
    name: /Sound, theory, and guitar relationship/,
  },
  application: {
    type: "song-structure",
    name: /Song-section timeline/,
  },
};

describe("LessonVisualization", () => {
  it.each(Object.entries(EXPECTED_BY_PATH))(
    "renders an accessible, path-specific diagram for %s",
    (pathId, expected) => {
      const lesson = GUITAR_LESSONS.find(
        (candidate) => candidate.pathId === pathId,
      )!;
      const section = lesson.sections.find(
        (candidate): candidate is VisualSection =>
          candidate.type === expected.type,
      )!;
      render(
        <LessonVisualization
          section={section}
          conceptTitle={lesson.title}
        />,
      );
      expect(
        screen.getByRole("img", { name: expected.name }),
      ).toBeInTheDocument();
    },
  );
});
