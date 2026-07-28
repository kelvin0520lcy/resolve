import {
  GUITAR_LANGUAGE_COURSE,
  GUITAR_LANGUAGE_LESSONS,
} from "@/features/guitar-learning/data/courses/guitar-language";
import {
  RHYTHM_YOU_CAN_SEE_COURSE,
  RHYTHM_YOU_CAN_SEE_LESSONS,
} from "@/features/guitar-learning/data/courses/rhythm-you-can-see";
import {
  SCALE_TO_PHRASE_COURSE,
  SCALE_TO_PHRASE_LESSONS,
} from "@/features/guitar-learning/data/courses/scale-to-phrase";
import type {
  AuthoredCourseDefinition,
  AuthoredLessonDefinition,
} from "@/features/guitar-learning/data/courses/types";
import { GUITAR_GLOSSARY } from "@/features/guitar-learning/data/glossary";
import {
  ALL_GUITAR_TOOL_PRESET_BY_ID,
  AUTHORED_TOOL_PRESET_BY_LESSON_ID,
} from "@/features/guitar-learning/data/authored-tool-presets";
import type {
  GuitarLearningPath,
  GuitarLesson,
  VisualSection,
} from "@/features/guitar-learning/types";

export const AUTHORED_GUITAR_COURSES: AuthoredCourseDefinition[] = [
  GUITAR_LANGUAGE_COURSE,
  RHYTHM_YOU_CAN_SEE_COURSE,
  SCALE_TO_PHRASE_COURSE,
];

export const AUTHORED_GUITAR_LESSON_DEFINITIONS: AuthoredLessonDefinition[] = [
  ...GUITAR_LANGUAGE_LESSONS,
  ...RHYTHM_YOU_CAN_SEE_LESSONS,
  ...SCALE_TO_PHRASE_LESSONS,
];

function slugFromId(id: string) {
  return id.split(":").slice(1).join(":");
}

function visualSectionType(
  visual: AuthoredLessonDefinition["visual"],
): VisualSection["type"] {
  if (visual.kind === "rhythm-grid") return "rhythm-grid";
  if (visual.kind === "picking") return "picking-animation";
  if (visual.kind === "chord-diagram") return "chord-diagram";
  if (visual.kind === "phrase-timeline") return "song-structure";
  return "fretboard";
}

function buildPublishedLesson(
  definition: AuthoredLessonDefinition,
  nextLessonId?: string,
): GuitarLesson {
  const preset = AUTHORED_TOOL_PRESET_BY_LESSON_ID.get(definition.id);
  if (!preset) {
    throw new Error(
      `Published guitar lesson ${definition.id} has no exact guided preset.`,
    );
  }

  return {
    id: definition.id,
    slug: slugFromId(definition.id),
    pathId: definition.pathId,
    title: definition.title,
    summary: definition.plainEnglishExplanation,
    whyItMatters: definition.whyItMatters,
    category: definition.category,
    difficulty: definition.difficulty,
    prerequisiteIds: definition.prerequisiteIds,
    learningObjectives: [
      definition.experience,
      definition.visualPrompt,
      definition.guidedPractice.success,
    ],
    estimatedMinutes: definition.estimatedMinutes,
    coach: definition.coach,
    sections: [
      {
        id: `${definition.id}:explanation`,
        type: "explanation",
        title: "Experience it, then name it",
        body: `${definition.experience} ${definition.plainEnglishExplanation}`,
        takeaway: definition.whyItMatters,
        required: true,
      },
      {
        id: `${definition.id}:visual`,
        type: visualSectionType(definition.visual),
        title: "See exactly what happens",
        body: definition.analogy
          ? `${definition.analogy} ${definition.visualPrompt}`
          : definition.visualPrompt,
        toolId: preset.toolId,
        toolPresetId: preset.id,
        prompt: definition.visualPrompt,
        observationGuide: definition.visualObservationGuide,
        successCriteria: definition.visualSuccess,
        visualData: definition.visual,
        required: true,
      },
      {
        id: `${definition.id}:audio`,
        type: "audio-comparison",
        title: "Hear the difference",
        body: definition.audio.body,
        correctLabel: definition.audio.correctLabel,
        incorrectLabel: definition.audio.incorrectLabel,
        correctPattern: definition.audio.correctPattern,
        incorrectPattern: definition.audio.incorrectPattern,
        listenFor: definition.audio.listenFor,
        required: true,
      },
      {
        id: `${definition.id}:exercise`,
        type: "guided-exercise",
        title: "Try it on the guitar",
        body: definition.guidedPractice.body,
        steps: definition.guidedPractice.steps,
        completionPrompt: definition.guidedPractice.success,
        required: true,
      },
      {
        id: `${definition.id}:mistakes`,
        type: "common-mistakes",
        title: "Fix the likely problem",
        items: definition.commonMistakes,
      },
      {
        id: `${definition.id}:question`,
        type: "interactive-question",
        title: "Prove the idea",
        prompt: definition.objectiveCheck.prompt,
        options: definition.objectiveCheck.options,
        correctIndex: definition.objectiveCheck.correctIndex,
        explanation: definition.objectiveCheck.explanation,
        required: true,
      },
    ],
    checkpoint: {
      ...definition.checkpoint,
      passingScore: 1,
    },
    applicationActivity: {
      prompt: `${definition.musicalApplication.body} ${definition.musicalApplication.prompt}`,
      options: definition.musicalApplication.options,
      completionMessage: definition.musicalApplication.completionMessage,
    },
    relatedToolIds: [preset.toolId],
    relatedToolPresetIds: [preset.id],
    nextLessonIds: nextLessonId ? [nextLessonId] : [],
    unlocksConceptIds: nextLessonId ? [nextLessonId] : [],
    alternativeExplanation: definition.alternativeExplanation,
    publicationStatus: "published",
    authored: true,
    learnerProblem: definition.learnerProblem,
    skillType: definition.skillType,
    termsIntroduced: definition.termsIntroduced,
    assumedTerms: definition.assumedTerms,
    reviewSchedule: definition.reviewSchedule ?? [1, 3, 7, 14],
  };
}

export const AUTHORED_GUITAR_LESSONS: GuitarLesson[] =
  AUTHORED_GUITAR_COURSES.flatMap((course) =>
    course.lessonIds.map((lessonId, index) => {
      const definition = AUTHORED_GUITAR_LESSON_DEFINITIONS.find(
        (candidate) => candidate.id === lessonId,
      );
      if (!definition) {
        throw new Error(
          `Authored guitar course ${course.id} references missing lesson ${lessonId}.`,
        );
      }
      return buildPublishedLesson(
        definition,
        course.lessonIds[index + 1],
      );
    }),
  );

export const AUTHORED_GUITAR_PATHS: GuitarLearningPath[] =
  AUTHORED_GUITAR_COURSES.map((course) => ({
    id: course.id,
    title: course.title,
    description: course.description,
    coach: course.coach,
    lessonIds: course.lessonIds,
  }));

function prerequisiteClosure(
  lessonId: string,
  byId: Map<string, GuitarLesson>,
  visited = new Set<string>(),
): Set<string> {
  if (visited.has(lessonId)) return visited;
  visited.add(lessonId);
  for (const prerequisiteId of byId.get(lessonId)?.prerequisiteIds ?? []) {
    prerequisiteClosure(prerequisiteId, byId, visited);
  }
  return visited;
}

export function getAuthoredCurriculumIssues(
  lessons: GuitarLesson[] = AUTHORED_GUITAR_LESSONS,
): string[] {
  const issues: string[] = [];
  const byId = new Map(lessons.map((lesson) => [lesson.id, lesson]));
  if (byId.size !== lessons.length) {
    issues.push("Published guitar lesson IDs must be unique.");
  }

  for (const lesson of lessons) {
    if (!lesson.authored || lesson.publicationStatus !== "published") {
      issues.push(`${lesson.id} is exposed without authored published content.`);
    }
    if (!lesson.summary.trim() || !lesson.whyItMatters.trim()) {
      issues.push(`${lesson.id} is missing authored explanation.`);
    }
    const visual = lesson.sections.find(
      (section): section is VisualSection =>
        "toolId" in section && "observationGuide" in section,
    );
    if (!visual?.visualData) {
      issues.push(`${lesson.id} is missing explicit visual data.`);
    }
    if (!lesson.sections.some((section) => section.type === "interactive-question")) {
      issues.push(`${lesson.id} is missing an objective knowledge check.`);
    }
    if (!lesson.applicationActivity.prompt.trim()) {
      issues.push(`${lesson.id} is missing a practical application.`);
    }
    for (const termId of [
      ...(lesson.termsIntroduced ?? []),
      ...(lesson.assumedTerms ?? []),
    ]) {
      if (!GUITAR_GLOSSARY.has(termId)) {
        issues.push(`${lesson.id} references unknown glossary term ${termId}.`);
      }
    }
    for (const prerequisiteId of lesson.prerequisiteIds) {
      if (!byId.has(prerequisiteId)) {
        issues.push(`${lesson.id} references missing prerequisite ${prerequisiteId}.`);
      }
    }
    for (const presetId of lesson.relatedToolPresetIds ?? []) {
      const preset = ALL_GUITAR_TOOL_PRESET_BY_ID.get(presetId);
      if (!preset) {
        issues.push(`${lesson.id} references missing tool preset ${presetId}.`);
      }
    }
    const audio = lesson.sections.find(
      (section) => section.type === "audio-comparison",
    );
    if (audio?.type === "audio-comparison") {
      for (const [label, pattern] of [
        ["correct", audio.correctPattern],
        ["incorrect", audio.incorrectPattern],
      ] as const) {
        if (
          pattern.kind === "timed-rhythm" &&
          pattern.events.some(
            (event, index) =>
              !Number.isFinite(event.timeBeats) ||
              event.timeBeats < 0 ||
              (index > 0 &&
                event.timeBeats < pattern.events[index - 1].timeBeats),
          )
        ) {
          issues.push(`${lesson.id} has invalid ${label} explicit timing.`);
        }
        if (
          pattern.kind === "rhythm" &&
          pattern.activeSteps.some(
            (step) =>
              !Number.isInteger(step) ||
              step < 0 ||
              step >= pattern.subdivisions,
          )
        ) {
          issues.push(`${lesson.id} has invalid ${label} rhythm steps.`);
        }
      }
    }
    if (visual?.visualData?.kind === "rhythm-grid") {
      const slots = visual.visualData.beats * visual.visualData.slotsPerBeat;
      if (
        visual.visualData.countLabels.length !== slots ||
        visual.visualData.handDirections.length !== slots ||
        visual.visualData.events.some(
          (event) => event.slot < 0 || event.slot >= slots,
        )
      ) {
        issues.push(`${lesson.id} has invalid explicit rhythm placement.`);
      }
    }
    if (visual?.visualData?.kind === "fretboard") {
      const fretboard = visual.visualData;
      if (
        fretboard.notes.some(
          (note) =>
            note.string < 1 ||
            note.string > 6 ||
            note.fret < 0 ||
            note.fret > fretboard.fretCount,
        )
      ) {
        issues.push(`${lesson.id} has an invalid fretboard note position.`);
      }
    }
    if (visual?.visualData?.kind === "chord-diagram") {
      const stringIds = visual.visualData.strings.map((string) => string.string);
      if (
        stringIds.length !== 6 ||
        new Set(stringIds).size !== 6 ||
        visual.visualData.strings.some(
          (string) =>
            typeof string.fret === "number" &&
            (string.fret < 0 || string.fret > 24),
        )
      ) {
        issues.push(`${lesson.id} has an invalid chord voicing.`);
      }
    }
  }

  for (const lesson of lessons) {
    const introducedBefore = new Set(
      [...prerequisiteClosure(lesson.id, byId)]
        .filter((id) => id !== lesson.id)
        .flatMap((id) => byId.get(id)?.termsIntroduced ?? []),
    );
    for (const termId of lesson.assumedTerms ?? []) {
      if (!introducedBefore.has(termId)) {
        issues.push(`${lesson.id} assumes ${termId} before it is introduced.`);
      }
    }
  }

  const visiting = new Set<string>();
  const visited = new Set<string>();
  const visit = (lessonId: string): boolean => {
    if (visiting.has(lessonId)) return true;
    if (visited.has(lessonId)) return false;
    visiting.add(lessonId);
    const cycle = (byId.get(lessonId)?.prerequisiteIds ?? []).some(visit);
    visiting.delete(lessonId);
    visited.add(lessonId);
    return cycle;
  };
  if (lessons.some((lesson) => visit(lesson.id))) {
    issues.push("Published guitar prerequisite graph contains a cycle.");
  }

  return [...new Set(issues)];
}
