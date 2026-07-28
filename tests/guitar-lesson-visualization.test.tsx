import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { LessonVisualization } from "@/features/guitar-learning/components/lesson-visualization";
import { GUITAR_LESSON_BY_ID } from "@/features/guitar-learning/data/curriculum";
import type { VisualSection } from "@/features/guitar-learning/types";

const CASES = [
  ["rhythm:constructing-strumming-patterns", /Explicit 4-beat rhythm with 2 timing positions/],
  ["improvisation:tonal-centre", /Explicit beginner fretboard/],
  ["guitar-language:read-a-chord-diagram", /Playable C major chord diagram/],
  ["guitar-language:read-basic-tab", /Six-line tablature/],
  ["improvisation:phrasing-with-rests", /Explicit 4-beat phrase timeline/],
] as const;

describe("LessonVisualization", () => {
  it.each(CASES)("renders the authored visual for %s", (lessonId, name) => {
    const lesson = GUITAR_LESSON_BY_ID.get(lessonId)!;
    const section = lesson.sections.find(
      (candidate): candidate is VisualSection =>
        "visualData" in candidate && Boolean(candidate.visualData),
    )!;
    render(<LessonVisualization section={section} conceptTitle={lesson.title} />);
    expect(screen.getByRole("img", { name })).toBeInTheDocument();
  });
});
