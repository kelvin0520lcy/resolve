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
      "song-structure",
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
      const visual = lesson.sections.find((section) =>
        visualTypes.includes(section.type),
      );
      expect(
        visual && "observationGuide" in visual
          ? visual.observationGuide
          : [],
      ).toHaveLength(3);
      expect(
        visual && "successCriteria" in visual
          ? visual.successCriteria.length
          : 0,
      ).toBeGreaterThan(60);
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

  it("uses path-specific visual and hands-on instructions instead of one generic drill", () => {
    const expectedVisualByPath = {
      rhythm: "rhythm-grid",
      lead: "picking-animation",
      fretboard: "fretboard",
      improvisation: "fretboard",
      chords: "chord-diagram",
      "ear-theory": "scale-comparison",
      application: "song-structure",
    } as const;
    const firstExerciseSteps = new Set<string>();

    for (const path of GUITAR_PATHS) {
      const lesson = GUITAR_LESSONS.find(
        (candidate) => candidate.pathId === path.id,
      )!;
      expect(lesson.sections.map((section) => section.type)).toContain(
        expectedVisualByPath[path.id],
      );
      const exercise = lesson.sections.find(
        (section) => section.type === "guided-exercise",
      );
      expect(exercise?.type).toBe("guided-exercise");
      if (exercise?.type === "guided-exercise") {
        expect(exercise.steps).toHaveLength(4);
        firstExerciseSteps.add(exercise.steps[0]);
      }
    }

    expect(firstExerciseSteps).toHaveLength(7);
  });
});
