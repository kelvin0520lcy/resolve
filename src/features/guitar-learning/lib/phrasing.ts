import {
  buildChord,
  buildScale,
  getNoteIndex,
  transposeNote,
  type ScaleType,
} from "@/features/guitar-learning/lib/music-theory";

export type PhraseArticulation =
  | "pick"
  | "slide"
  | "hammer"
  | "pull"
  | "bend"
  | "vibrato"
  | "mute";

export type PhraseEvent = {
  id: string;
  note?: string;
  octave?: number;
  durationSteps: 1 | 2 | 4;
  articulation: PhraseArticulation;
  accented?: boolean;
  rest?: boolean;
};

export type PhraseConstraint =
  | "two-notes"
  | "three-notes"
  | "roots-only"
  | "chord-tones"
  | "phrase-endings"
  | "rests"
  | "motif"
  | "variation"
  | "horizontal"
  | "connect-positions";

export const PHRASE_CONSTRAINTS: Array<{
  id: PhraseConstraint;
  label: string;
  instruction: string;
}> = [
  {
    id: "two-notes",
    label: "Two-note solo",
    instruction:
      "Use only the root and minor/major third; make rhythm and articulation carry the phrase.",
  },
  {
    id: "three-notes",
    label: "Three-note solo",
    instruction:
      "Use the first three selected scale tones and create contrast through rests.",
  },
  {
    id: "roots-only",
    label: "Root-note targeting",
    instruction:
      "Wander briefly, but make every second phrase resolve to a root.",
  },
  {
    id: "chord-tones",
    label: "Chord-tone targeting",
    instruction:
      "Land on a root, third, or fifth when the backing chord changes.",
  },
  {
    id: "phrase-endings",
    label: "Phrase endings",
    instruction:
      "Compose one settled ending and one open ending that asks for a response.",
  },
  {
    id: "rests",
    label: "Phrasing with rests",
    instruction:
      "Leave at least half of the grid silent and keep counting through every gap.",
  },
  {
    id: "motif",
    label: "Motif development",
    instruction:
      "State one three-note cell twice, then change only its final note.",
  },
  {
    id: "variation",
    label: "Repetition and variation",
    instruction:
      "Use an A–A–B–A plan and make the changed B phrase clearly traceable to A.",
  },
  {
    id: "horizontal",
    label: "Horizontal movement",
    instruction:
      "Move along one or two strings instead of climbing a vertical box.",
  },
  {
    id: "connect-positions",
    label: "Connect scale positions",
    instruction:
      "Use a slide to cross into an adjacent shape, then locate the same root in the new position.",
  },
];

export function createCallPhrase(
  root: string,
  scale: ScaleType,
  variant = 0,
): PhraseEvent[] {
  const notes = buildScale(root, scale);
  const patterns = [
    [0, 2, 1, -1, 0],
    [0, 1, 2, 1, -1],
    [2, 1, 0, -1, 1],
  ];
  const pattern = patterns[
    ((variant % patterns.length) + patterns.length) % patterns.length
  ];
  return pattern.map((degree, index) =>
    degree < 0
      ? {
          id: `call-${variant}-${index}`,
          durationSteps: 1 as const,
          articulation: "pick" as const,
          rest: true,
        }
      : {
          id: `call-${variant}-${index}`,
          note: notes[degree % notes.length],
          octave: 4,
          durationSteps: index === pattern.length - 1 ? (2 as const) : (1 as const),
          articulation:
            index === 1 ? ("slide" as const) : ("pick" as const),
          accented: index === 0,
        },
  );
}

export function buildResponsePhrase(
  call: PhraseEvent[],
  root: string,
  response: "echo" | "answer" | "contrast",
): PhraseEvent[] {
  return call.map((event, index) => {
    if (event.rest || !event.note) {
      return {
        ...event,
        id: `response-${index}`,
        rest: response !== "contrast",
        note: response === "contrast" ? root : undefined,
      };
    }
    return {
      ...event,
      id: `response-${index}`,
      note:
        response === "echo"
          ? event.note
          : response === "answer"
            ? index === call.length - 1
              ? root
              : transposeNote(event.note, -2)
            : transposeNote(event.note, 3),
      octave: response === "contrast" ? (event.octave ?? 4) + 1 : event.octave,
      articulation:
        response === "echo"
          ? event.articulation
          : response === "answer"
            ? "vibrato"
            : "bend",
    };
  });
}

export function phraseEventsToMidi(events: PhraseEvent[]) {
  return events.flatMap((event) => {
    if (event.rest || !event.note) return [];
    const octave = event.octave ?? 4;
    return [(octave + 1) * 12 + getNoteIndex(event.note)];
  });
}

export function analyzePhrase(
  events: PhraseEvent[],
  root: string,
  chordQuality: "major" | "minor" = "minor",
) {
  const sounding = events.filter(
    (event) => !event.rest && Boolean(event.note),
  );
  const rests = events.filter((event) => event.rest).length;
  const finalNote = sounding.at(-1)?.note;
  const chordTones = new Set(buildChord(root, chordQuality));
  const chordToneCount = sounding.filter((event) =>
    chordTones.has(event.note as never),
  ).length;
  const pitchIndexes = sounding.map((event) => getNoteIndex(event.note!));
  const changes = pitchIndexes.slice(1).map((pitch, index) => {
    const difference = pitch - pitchIndexes[index];
    return difference === 0 ? 0 : difference > 0 ? 1 : -1;
  });
  const contourChanges = changes.filter(
    (direction, index) => index === 0 || direction !== changes[index - 1],
  ).length;
  const repeatedPairs = sounding.reduce(
    (count, event, index) =>
      index >= 2 &&
      event.note === sounding[index - 2].note
        ? count + 1
        : count,
    0,
  );
  const score =
    Math.min(30, sounding.length * 4) +
    Math.min(20, rests * 7) +
    (finalNote === root ? 20 : 5) +
    Math.min(15, chordToneCount * 3) +
    Math.min(15, (contourChanges + repeatedPairs) * 3);

  const feedback = [
    rests > 0
      ? `${rests} deliberate rest${rests === 1 ? "" : "s"} give the backing groove room.`
      : "Add a measured rest so the line has punctuation.",
    finalNote === root
      ? `The final ${root} creates a settled ending.`
      : `The final ${finalNote ?? "silence"} stays open; target ${root} when you want stronger closure.`,
    chordToneCount > 0
      ? `${chordToneCount} chord-tone arrival${chordToneCount === 1 ? "" : "s"} connect the phrase to the harmony.`
      : "Target a root, third, or fifth on a strong beat to reveal the backing chord.",
    repeatedPairs > 0
      ? "A repeated pitch relationship gives the phrase motif identity."
      : "Repeat one small interval or rhythm before varying it.",
  ];

  return {
    score: Math.min(100, score),
    finalNote,
    restCount: rests,
    chordToneCount,
    contourChanges,
    repeatedPairs,
    feedback,
  };
}
