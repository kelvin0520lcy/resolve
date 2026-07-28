import { describe, expect, it } from "vitest";
import {
  GUITAR_LEGACY_LESSONS,
  GUITAR_LESSON_BY_ID,
  GUITAR_LESSONS,
  GUITAR_PATHS,
  getGuitarLesson,
} from "@/features/guitar-learning/data/curriculum";
import {
  AUTHORED_GUITAR_COURSES,
  getAuthoredCurriculumIssues,
} from "@/features/guitar-learning/data/authored-curriculum";
import { GUITAR_GLOSSARY } from "@/features/guitar-learning/data/glossary";
import { ALL_GUITAR_TOOL_PRESET_BY_ID } from "@/features/guitar-learning/data/authored-tool-presets";
import { PRACTICE_TROUBLESHOOTER_PROBLEMS } from "@/features/guitar-learning/components/practice-troubleshooter";
import type { VisualSection } from "@/features/guitar-learning/types";

describe("published guitar curriculum", () => {
  it("publishes only authored beginner courses while retaining legacy IDs", () => {
    expect(GUITAR_PATHS).toHaveLength(3);
    expect(GUITAR_LESSONS).toHaveLength(25);
    expect(AUTHORED_GUITAR_COURSES.map((course) => course.id)).toEqual([
      "guitar-language",
      "rhythm",
      "improvisation",
    ]);
    expect(GUITAR_LESSONS.every((lesson) => lesson.authored)).toBe(true);
    expect(
      GUITAR_LESSONS.every(
        (lesson) => lesson.publicationStatus === "published",
      ),
    ).toBe(true);
    expect(GUITAR_LEGACY_LESSONS.length).toBeGreaterThan(150);
    expect(
      GUITAR_LEGACY_LESSONS.every((lesson) =>
        GUITAR_LESSON_BY_ID.has(lesson.id),
      ),
    ).toBe(true);
    const legacyOnlyLesson = GUITAR_LEGACY_LESSONS.find(
      (lesson) => !GUITAR_LESSONS.some((published) => published.id === lesson.id),
    )!;
    expect(getGuitarLesson(legacyOnlyLesson.id)).toBeUndefined();
  });

  it("contains explicit teaching evidence instead of generic fallback copy", () => {
    for (const lesson of GUITAR_LESSONS) {
      const visual = lesson.sections.find(
        (section): section is VisualSection =>
          "visualData" in section && Boolean(section.visualData),
      );
      expect(visual?.visualData, `${lesson.id} needs explicit visual data`).toBeDefined();
      expect(visual?.observationGuide.length).toBeGreaterThanOrEqual(2);
      expect(lesson.learnerProblem?.length).toBeGreaterThan(20);
      expect(lesson.summary.length).toBeGreaterThan(30);
      expect(lesson.alternativeExplanation.length).toBeGreaterThan(40);
      expect(
        lesson.sections.some((section) => section.type === "audio-comparison"),
      ).toBe(true);
      expect(
        lesson.sections.some((section) => section.type === "guided-exercise"),
      ).toBe(true);
      expect(
        lesson.sections.some((section) => section.type === "interactive-question"),
      ).toBe(true);
      expect(lesson.applicationActivity.prompt.length).toBeGreaterThan(30);
      expect(lesson.applicationActivity.outcomes).toHaveLength(
        lesson.applicationActivity.options.length,
      );
    }
  });

  it("has valid prerequisites, glossary terms, visuals, and exact tool presets", () => {
    expect(getAuthoredCurriculumIssues()).toEqual([]);
    for (const lesson of GUITAR_LESSONS) {
      for (const term of [
        ...(lesson.termsIntroduced ?? []),
        ...(lesson.assumedTerms ?? []),
      ]) {
        expect(GUITAR_GLOSSARY.has(term)).toBe(true);
      }
      for (const presetId of lesson.relatedToolPresetIds ?? []) {
        expect(ALL_GUITAR_TOOL_PRESET_BY_ID.get(presetId)?.lessonId).toBe(lesson.id);
      }
    }
  });

  it("ships both requested end-to-end skill paths in order", () => {
    const rhythm = GUITAR_PATHS.find((path) => path.id === "rhythm")!;
    expect(rhythm.lessonIds).toEqual([
      "rhythm:feeling-and-identifying-the-pulse",
      "rhythm:quarter-note-counting",
      "rhythm:eighth-note-subdivisions",
      "rhythm:continuous-strumming-hand-movement",
      "rhythm:missed-strokes",
      "rhythm:constructing-strumming-patterns",
      "rhythm:beginner-jrock-groove-project",
    ]);
    const phrase = GUITAR_PATHS.find((path) => path.id === "improvisation")!;
    expect(phrase.lessonIds).toEqual([
      "improvisation:tonal-centre",
      "improvisation:minor-pentatonic-position-one",
      "improvisation:playing-with-only-two-or-three-notes",
      "improvisation:phrasing-with-rests",
      "improvisation:phrase-endings",
      "improvisation:motif-development",
      "improvisation:call-and-response",
    ]);
    const bend = GUITAR_LESSONS.find(
      (lesson) => lesson.id === "improvisation:bend-to-a-heard-target",
    )!;
    expect(bend.optional).toBe(true);
    expect(bend.prerequisiteIds).toContain("improvisation:phrase-endings");
    expect(phrase.lessonIds).not.toContain(bend.id);
  });

  it("classifies honest application outcomes instead of treating every answer as success", () => {
    const pulse = GUITAR_LESSON_BY_ID.get(
      "rhythm:feeling-and-identifying-the-pulse",
    )!;
    expect(pulse.applicationActivity.outcomes).toEqual([
      "achieved",
      "partial",
      "not_yet",
    ]);
    const phrase = GUITAR_LESSON_BY_ID.get(
      "improvisation:playing-with-only-two-or-three-notes",
    )!;
    expect(
      phrase.applicationActivity.outcomes?.[
        phrase.applicationActivity.options.indexOf("Both")
      ],
    ).toBe("achieved");
  });

  it("authors project evidence outcomes explicitly while retaining inference as a fallback", () => {
    for (const lessonId of [
      "guitar-language:first-two-chord-groove",
      "rhythm:beginner-jrock-groove-project",
      "improvisation:call-and-response",
    ]) {
      expect(
        GUITAR_LESSON_BY_ID.get(lessonId)?.applicationActivity.outcomes,
      ).toEqual(["partial", "partial", "achieved"]);
    }

    const inferredLesson = GUITAR_LESSON_BY_ID.get(
      "improvisation:playing-with-only-two-or-three-notes",
    )!;
    expect(inferredLesson.applicationActivity.outcomes).toHaveLength(
      inferredLesson.applicationActivity.options.length,
    );
  });

  it("keeps every troubleshooter destination valid and tool-compatible", () => {
    for (const problem of PRACTICE_TROUBLESHOOTER_PROBLEMS) {
      expect(
        GUITAR_LESSONS.some((lesson) => lesson.id === problem.lessonId),
        `${problem.id} must open a published lesson`,
      ).toBe(true);
      const preset = ALL_GUITAR_TOOL_PRESET_BY_ID.get(problem.presetId);
      expect(preset, `${problem.id} must open a real preset`).toBeDefined();
      expect(preset?.toolId).toBe(problem.toolId);
    }
  });
});
