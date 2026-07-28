import type {
  GuitarLearnerRoute,
  GuitarPathId,
  PlacementAnswer,
  PlacementResult,
} from "@/features/guitar-learning/types";

export type PlacementOption = {
  label: string;
  detail: string;
  score: 0 | 1 | 2;
};

export type PlacementQuestion = {
  id: string;
  eyebrow: string;
  prompt: string;
  kind:
    | "self-assessment"
    | "multiple-choice"
    | "fretboard"
    | "rhythm-grid"
    | "chord-diagram"
    | "listening"
    | "practical";
  lessonIds: string[];
  options: PlacementOption[];
};

const CONFIDENCE_OPTIONS: PlacementOption[] = [
  {
    label: "Not yet",
    detail: "I would be guessing or need a diagram.",
    score: 0,
  },
  {
    label: "Sometimes",
    detail: "I can do it slowly, but it is not reliable.",
    score: 1,
  },
  {
    label: "Comfortably",
    detail: "I can explain it and use it without prompting.",
    score: 2,
  },
];

export const PLACEMENT_QUESTIONS: PlacementQuestion[] = [
  {
    id: "strings-and-natural-notes",
    eyebrow: "Fretboard check",
    prompt:
      "Without a diagram, can you name all open strings and quickly find natural notes on the low E and A strings?",
    kind: "fretboard",
    lessonIds: [
      "fretboard:open-string-names",
      "fretboard:natural-notes-on-the-sixth-string",
      "fretboard:natural-notes-on-the-fifth-string",
    ],
    options: CONFIDENCE_OPTIONS,
  },
  {
    id: "roots-octaves-intervals",
    eyebrow: "Map connection",
    prompt:
      "Can you use octave shapes to locate another root and describe the interval between two notes?",
    kind: "fretboard",
    lessonIds: [
      "fretboard:octave-shapes",
      "fretboard:finding-root-notes",
      "fretboard:intervals",
    ],
    options: CONFIDENCE_OPTIONS,
  },
  {
    id: "chord-literacy",
    eyebrow: "Chord check",
    prompt:
      "Can you read a chord diagram and explain how open, barre, and power chords differ?",
    kind: "chord-diagram",
    lessonIds: [
      "chords:power-chords",
      "chords:open-chord-construction",
      "chords:barre-chord-construction",
    ],
    options: CONFIDENCE_OPTIONS,
  },
  {
    id: "eighth-motion",
    eyebrow: "Groove check",
    prompt:
      "While counting 1-and-2-and, can your hand keep moving down-up through both played and missed strokes?",
    kind: "rhythm-grid",
    lessonIds: [
      "rhythm:eighth-note-subdivisions",
      "rhythm:continuous-strumming-hand-movement",
      "rhythm:missed-strokes",
    ],
    options: CONFIDENCE_OPTIONS,
  },
  {
    id: "sixteenth-groove",
    eyebrow: "Groove detail",
    prompt:
      "Can you place accents, muted strokes, and syncopated attacks on a 1-e-and-a grid?",
    kind: "rhythm-grid",
    lessonIds: [
      "rhythm:sixteenth-note-subdivisions",
      "rhythm:accents",
      "rhythm:muted-strokes",
      "rhythm:syncopation",
    ],
    options: CONFIDENCE_OPTIONS,
  },
  {
    id: "picking-control",
    eyebrow: "Lead mechanics",
    prompt:
      "Can you alternate-pick evenly and cross strings without resetting to a downstroke?",
    kind: "practical",
    lessonIds: [
      "lead:alternate-picking",
      "lead:string-crossing",
    ],
    options: CONFIDENCE_OPTIONS,
  },
  {
    id: "expressive-technique",
    eyebrow: "Expression check",
    prompt:
      "Can you bend to a target pitch and add controlled vibrato after the note arrives?",
    kind: "listening",
    lessonIds: [
      "lead:basic-bends",
      "lead:bend-pitch-targeting",
      "lead:vibrato",
    ],
    options: CONFIDENCE_OPTIONS,
  },
  {
    id: "pentatonic-phrasing",
    eyebrow: "Improvisation check",
    prompt:
      "Inside minor pentatonic position one, can you find the roots and build a phrase with a clear ending and a rest?",
    kind: "practical",
    lessonIds: [
      "improvisation:minor-pentatonic-position-one",
      "improvisation:root-note-targeting",
      "improvisation:phrase-endings",
      "improvisation:phrasing-with-rests",
    ],
    options: CONFIDENCE_OPTIONS,
  },
  {
    id: "scale-construction",
    eyebrow: "Scale logic",
    prompt:
      "Can you construct major and natural-minor scales from whole- and half-step formulas?",
    kind: "multiple-choice",
    lessonIds: [
      "improvisation:major-scale-construction",
      "improvisation:natural-minor-construction",
    ],
    options: CONFIDENCE_OPTIONS,
  },
  {
    id: "chord-construction",
    eyebrow: "Harmony check",
    prompt:
      "Can you build major and minor chords from root, third, and fifth and identify their inversions?",
    kind: "multiple-choice",
    lessonIds: [
      "chords:major-and-minor-chord-construction",
      "fretboard:major-triads",
      "fretboard:minor-triads",
      "fretboard:triad-inversions",
    ],
    options: CONFIDENCE_OPTIONS,
  },
  {
    id: "chord-tone-application",
    eyebrow: "Harmony in motion",
    prompt:
      "Can you distinguish a scale from an arpeggio and target changing chord tones in a progression?",
    kind: "practical",
    lessonIds: [
      "chords:scale-versus-arpeggio",
      "chords:chord-tones",
      "improvisation:chord-tone-targeting-over-a-progression",
    ],
    options: CONFIDENCE_OPTIONS,
  },
  {
    id: "ear-baseline",
    eyebrow: "Listening check",
    prompt:
      "By ear, can you compare higher/lower pitch, major/minor colour, and tension resolving to a stable note?",
    kind: "listening",
    lessonIds: [
      "ear-theory:higher-and-lower-pitch",
      "ear-theory:major-versus-minor",
      "improvisation:tension-and-resolution",
    ],
    options: CONFIDENCE_OPTIONS,
  },
];

export const PLACEMENT_PATH_OPTIONS: Array<{
  id: GuitarPathId;
  label: string;
}> = [
  { id: "rhythm", label: "Tighter rhythm" },
  { id: "lead", label: "Cleaner lead playing" },
  { id: "fretboard", label: "Know the fretboard" },
  { id: "improvisation", label: "Improvise musically" },
  { id: "chords", label: "Richer chords" },
  { id: "ear-theory", label: "Train my ear & theory" },
  { id: "application", label: "Learn and arrange songs" },
];

export function toPlacementAnswers(
  selectedScores: Record<string, number>,
): PlacementAnswer[] {
  return PLACEMENT_QUESTIONS.flatMap((question) => {
    const score = selectedScores[question.id];
    return Number.isFinite(score)
      ? [
          {
            questionId: question.id,
            score: Math.max(0, Math.min(2, score)),
            lessonIds: question.lessonIds,
          },
        ]
      : [];
  });
}

export function createPlacementResultForRoute(
  learnerRoute: GuitarLearnerRoute,
  now = new Date().toISOString(),
): PlacementResult {
  if (learnerRoute === "new-to-guitar") {
    return {
      recommendedPathId: "guitar-language",
      recommendedLessonId: "guitar-language:guitar-orientation",
      alreadyKnownLessonIds: [],
      reviewLessonIds: [],
      missingPrerequisiteIds: [],
      relevantToolIds: ["tuner", "chord-trainer"],
      explanation:
        "Start with the physical map and reading language of the guitar. You can test out of any familiar lesson later.",
      completedAt: now,
      learnerRoute,
    };
  }
  if (learnerRoute === "songs-and-tabs") {
    return {
      recommendedPathId: "rhythm",
      recommendedLessonId: "rhythm:feeling-and-identifying-the-pulse",
      alreadyKnownLessonIds: [],
      reviewLessonIds: [],
      missingPrerequisiteIds: [],
      relevantToolIds: ["rhythm", "metronome", "fretboard"],
      explanation:
        "You already know how to copy material. Start with the beginner bridge that turns timing and scale shapes into ideas you understand.",
      completedAt: now,
      learnerRoute,
    };
  }
  return {
    recommendedPathId: "improvisation",
    recommendedLessonId: "improvisation:tonal-centre",
    alreadyKnownLessonIds: [],
    reviewLessonIds: [],
    missingPrerequisiteIds: [],
    relevantToolIds: ["fretboard", "scales", "ear-training"],
    explanation:
      "Start with a short objective bridge from home note to phrase, then use the advanced tools for targeted practice.",
    completedAt: now,
    learnerRoute,
  };
}
