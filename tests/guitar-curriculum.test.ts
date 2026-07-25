import { describe, expect, it } from "vitest";
import {
  GUITAR_LESSONS,
  GUITAR_PATHS,
  REQUIRED_SEED_LESSON_IDS,
  REQUIRED_SEED_TITLES,
} from "@/features/guitar-learning/data/curriculum";
import { getCurriculumIntegrityIssues } from "@/features/guitar-learning/lib/learning-state";

describe("guitar curriculum", () => {
  it("contains every required seed lesson exactly once", () => {
    expect(REQUIRED_SEED_TITLES).toHaveLength(40);
    expect(REQUIRED_SEED_LESSON_IDS).toHaveLength(40);
    expect(new Set(REQUIRED_SEED_LESSON_IDS)).toHaveLength(40);
    for (const title of REQUIRED_SEED_TITLES) {
      expect(
        GUITAR_LESSONS.filter((lesson) => lesson.title === title),
      ).toHaveLength(1);
    }
  });

  it("provides a complete interactive teaching sequence for each seed", () => {
    const requiredSectionTypes = [
      "explanation",
      "connection",
      "audio-comparison",
      "guided-exercise",
      "correct-vs-incorrect",
      "common-mistakes",
      "musical-application",
      "interactive-question",
    ];
    const visualTypes = [
      "fretboard",
      "rhythm-grid",
      "picking-animation",
      "chord-diagram",
      "scale-comparison",
    ];

    for (const lessonId of REQUIRED_SEED_LESSON_IDS) {
      const lesson = GUITAR_LESSONS.find(
        (candidate) => candidate.id === lessonId,
      )!;
      const types = lesson.sections.map((section) => section.type);
      for (const type of requiredSectionTypes) {
        expect(types, `${lesson.title} is missing ${type}`).toContain(type);
      }
      expect(
        types.some((type) => visualTypes.includes(type)),
        `${lesson.title} needs an interactive visual`,
      ).toBe(true);
      expect(lesson.learningObjectives).toHaveLength(3);
      expect(lesson.summary.length).toBeGreaterThan(80);
      expect(lesson.alternativeExplanation.length).toBeGreaterThan(100);
      expect(lesson.relatedToolIds.length).toBeGreaterThan(0);
      expect(lesson.checkpoint.options.length).toBeGreaterThanOrEqual(3);
      expect(lesson.applicationActivity.prompt.length).toBeGreaterThan(30);
    }
  });

  it("covers all seven paths with valid, acyclic relationships", () => {
    expect(GUITAR_PATHS).toHaveLength(7);
    expect(GUITAR_LESSONS.length).toBeGreaterThanOrEqual(160);
    expect(getCurriculumIntegrityIssues()).toEqual([]);
    for (const path of GUITAR_PATHS) {
      expect(path.lessonIds.length).toBeGreaterThanOrEqual(18);
    }
  });
});
