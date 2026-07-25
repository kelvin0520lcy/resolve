import type {
  GuitarCoach,
  GuitarToolId,
} from "@/features/guitar-learning/types";

export type GuitarGuideEntry = {
  id: string;
  title: string;
  keywords: string[];
  answer: string;
  tryNext: string;
  toolId: GuitarToolId;
  lessonIds: string[];
  coach: GuitarCoach;
};

export const GUITAR_GUIDE_ENTRIES: GuitarGuideEntry[] = [
  {
    id: "strumming-pattern",
    title: "A strumming pattern is a selected motion grid",
    keywords: [
      "strumming",
      "pattern",
      "down",
      "up",
      "missed stroke",
      "hand stops",
      "rhythm",
    ],
    answer:
      "Keep the hand moving through every subdivision, then decide which passes touch the strings. A written D/U pattern hides the silent passes, so place it on the full count before increasing speed.",
    tryNext:
      "Enter the pattern in the Rhythm Lab and check whether it fits continuous hand motion.",
    toolId: "rhythm",
    lessonIds: [
      "rhythm:continuous-strumming-hand-movement",
      "rhythm:missed-strokes",
    ],
    coach: "nijika",
  },
  {
    id: "chord-buzz",
    title: "A buzzing chord needs a smaller diagnosis",
    keywords: [
      "buzz",
      "chord",
      "clean",
      "fret",
      "muted string",
      "finger",
    ],
    answer:
      "Test one string at a time. Fret close behind the wire, curve the finger enough to clear adjacent strings, and use only the pressure needed for a clean note. If one note fails, adjust that contact instead of squeezing the entire hand.",
    tryNext:
      "Use Chord Explorer to isolate the chord tones, then rebuild the voicing from the lowest sounding string.",
    toolId: "chords",
    lessonIds: ["chords:open-chord-construction"],
    coach: "kita",
  },
  {
    id: "scale-box",
    title: "A scale shape needs roots and destinations",
    keywords: [
      "scale",
      "box",
      "pentatonic",
      "stuck",
      "improvise",
      "position",
    ],
    answer:
      "Stop treating every dot equally. Locate the roots, limit yourself to two or three notes, and compose an ending before expanding the shape. Then connect one adjacent position with a slide.",
    tryNext:
      "Open Improvisation Coach with the root-targeting or two-note constraint.",
    toolId: "improvisation",
    lessonIds: [
      "improvisation:root-note-targeting",
      "improvisation:connecting-pentatonic-positions",
    ],
    coach: "bocchi",
  },
  {
    id: "bend-intonation",
    title: "A bend is a pitch-target exercise",
    keywords: [
      "bend",
      "flat",
      "sharp",
      "intonation",
      "target pitch",
      "vibrato",
    ],
    answer:
      "Play the destination note normally, let it remain in auditory memory, then bend from below and compare. Support the bend with adjacent fingers and add vibrato only after the centre pitch is stable.",
    tryNext:
      "Sound a Drone target, then review Bend pitch targeting before adding vibrato.",
    toolId: "drone",
    lessonIds: [
      "lead:bend-pitch-targeting",
      "lead:vibrato",
    ],
    coach: "kita",
  },
  {
    id: "picking-speed",
    title: "Picking speed is usually a motion-quality problem",
    keywords: [
      "picking",
      "speed",
      "alternate",
      "string crossing",
      "stuck",
      "tension",
    ],
    answer:
      "Expose less pick, reduce depth, and make down/up volume equal on one string. At a crossing, prepare whether the pick approaches from inside or outside; do not solve it with a larger hop.",
    tryNext:
      "Slow the Picking Visualiser to 0.5× and compare efficient with excessive motion.",
    toolId: "picking",
    lessonIds: [
      "lead:alternate-picking",
      "lead:string-crossing",
    ],
    coach: "bocchi",
  },
  {
    id: "theory-to-fretboard",
    title: "Theory becomes useful when it changes a note choice",
    keywords: [
      "theory",
      "fretboard",
      "interval",
      "chord tone",
      "roman numeral",
      "understand",
    ],
    answer:
      "Keep one root fixed, build its interval formula, and locate the result in more than one position. Then change one interval and listen to the new chord or scale colour. The label should predict an audible and playable difference.",
    tryNext:
      "Use Theory Visualisers, then show the same notes on the Fretboard Explorer.",
    toolId: "theory",
    lessonIds: [
      "fretboard:intervals",
      "ear-theory:roman-numeral-progressions",
    ],
    coach: "ryo",
  },
  {
    id: "phrases-wander",
    title: "A wandering phrase needs punctuation",
    keywords: [
      "phrase",
      "wandering",
      "solo",
      "random",
      "rest",
      "ending",
      "motif",
    ],
    answer:
      "Use a short motif, repeat it accurately, leave a measured rest, and choose a destination note. Change only one feature in the response so the listener can follow the idea.",
    tryNext:
      "Build an A–A–B–A idea in Phrase Builder and analyse its ending, rests, and repetition.",
    toolId: "phrase-builder",
    lessonIds: [
      "improvisation:motif-development",
      "improvisation:phrase-endings",
    ],
    coach: "bocchi",
  },
  {
    id: "practice-time",
    title: "Separate learning time from evidence time",
    keywords: [
      "practice",
      "routine",
      "what next",
      "time",
      "session",
      "plan",
    ],
    answer:
      "Choose one concept, one measurable musical application, and one honest stopping condition. Explore the idea first; log a practice session only after you have evidence and a precise starting point for next time.",
    tryNext:
      "Return to Learn for one recommendation, then use Overview to log the result.",
    toolId: "metronome",
    lessonIds: ["application:learning-a-riff-efficiently"],
    coach: "nijika",
  },
];

export const GUITAR_GUIDE_SUGGESTIONS = [
  "Why does my strumming hand stop?",
  "Why do my bends sound flat?",
  "How do I stop running scale boxes?",
  "Why is my alternate picking tense?",
  "How do chord tones help a solo?",
  "How should I structure a short practice session?",
];

export function findGuitarGuideEntries(query: string, limit = 3) {
  const normalized = query.trim().toLowerCase();
  if (!normalized) return [];
  const tokens = normalized
    .split(/[^a-z0-9]+/)
    .filter((token) => token.length >= 3);
  return GUITAR_GUIDE_ENTRIES.map((entry, index) => {
    const searchable = `${entry.title} ${entry.keywords.join(" ")} ${
      entry.answer
    }`.toLowerCase();
    const score =
      entry.keywords.reduce(
        (sum, keyword) =>
          sum + (normalized.includes(keyword) ? 7 : 0),
        0,
      ) +
      tokens.reduce(
        (sum, token) => sum + (searchable.includes(token) ? 2 : 0),
        0,
      );
    return { entry, score, index };
  })
    .filter((candidate) => candidate.score > 0)
    .sort((a, b) => b.score - a.score || a.index - b.index)
    .slice(0, Math.max(1, limit))
    .map((candidate) => candidate.entry);
}
