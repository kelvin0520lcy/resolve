import {
  buildChord,
  getNoteIndex,
  transposeNote,
  type ChordQuality,
} from "@/features/guitar-learning/lib/music-theory";
import type { AudioPattern } from "@/features/guitar-learning/types";

export type EarExerciseId =
  | "higher-lower"
  | "same-different"
  | "interval"
  | "major-minor"
  | "chord-quality"
  | "tension-resolution"
  | "note-matching"
  | "rhythm-imitation"
  | "phrase-ending";

export type EarQuestion = {
  id: string;
  exerciseId: EarExerciseId;
  prompt: string;
  referenceLabel?: string;
  referencePattern?: AudioPattern;
  targetLabel: string;
  targetPattern: AudioPattern;
  options: string[];
  correctIndex: number;
  explanation: string;
  listenFor: string;
};

function rootMidi(root: string, octave = 4) {
  return (octave + 1) * 12 + getNoteIndex(root);
}

export function createEarQuestion(
  exerciseId: EarExerciseId,
  questionIndex: number,
  root = "A",
): EarQuestion {
  const variant = Math.abs(questionIndex) % 4;
  const base = rootMidi(root);
  const id = `${exerciseId}-${questionIndex}-${root}`;

  if (exerciseId === "higher-lower") {
    const shifts = [4, -3, 7, -5];
    const shift = shifts[variant];
    return {
      id,
      exerciseId,
      prompt: "Is the second note higher or lower than the reference?",
      referenceLabel: "Reference note",
      referencePattern: { kind: "notes", midiNotes: [base] },
      targetLabel: "Second note",
      targetPattern: { kind: "notes", midiNotes: [base + shift] },
      options: ["Higher", "Lower", "Same"],
      correctIndex: shift > 0 ? 0 : 1,
      explanation:
        "Pitch direction is independent of note name: follow whether the sound rises or falls.",
      listenFor: "Track the vertical direction between the two attacks.",
    };
  }

  if (exerciseId === "same-different") {
    const shift = [0, 2, 0, -1][variant];
    return {
      id,
      exerciseId,
      prompt: "Do both buttons play the same pitch class?",
      referenceLabel: "Note A",
      referencePattern: { kind: "notes", midiNotes: [base] },
      targetLabel: "Note B",
      targetPattern: { kind: "notes", midiNotes: [base + shift] },
      options: ["Same", "Different"],
      correctIndex: shift === 0 ? 0 : 1,
      explanation:
        shift === 0
          ? "The frequency and pitch centre match."
          : "The second frequency has moved, even if the difference is small.",
      listenFor: "Let the first note continue in memory under the second.",
    };
  }

  if (exerciseId === "interval") {
    const intervals = [3, 4, 5, 7];
    const interval = intervals[variant];
    const labels = [
      "Minor third",
      "Major third",
      "Perfect fourth",
      "Perfect fifth",
    ];
    return {
      id,
      exerciseId,
      prompt: "Which interval rises from the first note to the second?",
      referenceLabel: "Reference",
      referencePattern: { kind: "notes", midiNotes: [base] },
      targetLabel: "Interval",
      targetPattern: {
        kind: "notes",
        midiNotes: [base, base + interval],
        beatSeconds: 0.55,
      },
      options: labels,
      correctIndex: variant,
      explanation: `${labels[variant]} spans ${interval} semitones.`,
      listenFor:
        "Compare the interval’s width and sing the first note internally before the second arrives.",
    };
  }

  if (exerciseId === "major-minor") {
    const quality = variant % 2 === 0 ? "major" : "minor";
    return {
      id,
      exerciseId,
      prompt: "Does this triad use a major or minor third?",
      targetLabel: "Play triad",
      targetPattern: {
        kind: "chord",
        midiNotes: buildChord(root, quality).map((note) =>
          rootMidi(note),
        ),
      },
      options: ["Major", "Minor"],
      correctIndex: quality === "major" ? 0 : 1,
      explanation:
        quality === "major"
          ? "The root-to-third distance is four semitones."
          : "The root-to-third distance is three semitones.",
      listenFor: "Focus on the third rather than overall brightness or volume.",
    };
  }

  if (exerciseId === "chord-quality") {
    const qualities: ChordQuality[] = [
      "major7",
      "minor7",
      "sus4",
      "dominant7",
    ];
    const quality = qualities[variant];
    return {
      id,
      exerciseId,
      prompt: "Which chord quality is sounding?",
      targetLabel: "Play chord",
      targetPattern: {
        kind: "chord",
        midiNotes: buildChord(root, quality).map((note) =>
          rootMidi(note),
        ),
      },
      options: ["Major 7", "Minor 7", "Suspended 4", "Dominant 7"],
      correctIndex: variant,
      explanation: `The interval recipe matches ${quality.replace("7", " 7")}.`,
      listenFor:
        "Listen for the third first, then identify whether a seventh or suspended fourth changes the colour.",
    };
  }

  if (exerciseId === "tension-resolution") {
    const resolves = variant % 2 === 0;
    return {
      id,
      exerciseId,
      prompt: "Does the phrase settle on the tonal centre or stay open?",
      targetLabel: "Play phrase ending",
      targetPattern: {
        kind: "notes",
        midiNotes: [base + 3, base + 2, resolves ? base : base + 2],
        beatSeconds: 0.48,
      },
      options: ["Resolves", "Stays tense"],
      correctIndex: resolves ? 0 : 1,
      explanation: resolves
        ? `The final note returns to ${root}, the tonal centre.`
        : "The final second remains close to the tonal centre without arriving.",
      listenFor: "Notice whether the ending feels complete without another note.",
    };
  }

  if (exerciseId === "note-matching") {
    const shift = [0, 2, 5, 7][variant];
    const target = transposeNote(root, shift);
    return {
      id,
      exerciseId,
      prompt: `Which note matches the generated target in the key area around ${root}?`,
      targetLabel: "Play target note",
      targetPattern: { kind: "notes", midiNotes: [base + shift] },
      options: [
        root,
        transposeNote(root, 2),
        transposeNote(root, 5),
        transposeNote(root, 7),
      ],
      correctIndex: [0, 2, 5, 7].indexOf(shift),
      explanation: `The target pitch class is ${target}. Find the same sound in another octave on the fretboard.`,
      listenFor:
        "Hum the target briefly, then compare each candidate against that internal note.",
    };
  }

  if (exerciseId === "rhythm-imitation") {
    const activePatterns = [
      [0, 2, 3, 6],
      [0, 3, 4, 7],
      [0, 2, 5, 6],
      [0, 1, 4, 6],
    ];
    return {
      id,
      exerciseId,
      prompt: "Which written attack pattern matches the played bar?",
      targetLabel: "Play rhythm",
      targetPattern: {
        kind: "rhythm",
        subdivisions: 8,
        activeSteps: activePatterns[variant],
        accentedSteps: [0],
        bpm: 84,
      },
      options: [
        "1 · 2 · & · 4",
        "1 · & of 2 · 3 · & of 4",
        "1 · 2 · & of 3 · 4",
        "1 · & of 1 · 3 · 4",
      ],
      correctIndex: variant,
      explanation:
        "Count every 1-and location while tracking only the sounding attacks.",
      listenFor: "Keep the eighth-note grid running underneath the gaps.",
    };
  }

  const settled = variant % 2 === 0;
  return {
    id,
    exerciseId,
    prompt: "Does this phrase ending sound like a full stop or a comma?",
    targetLabel: "Play ending",
    targetPattern: {
      kind: "notes",
      midiNotes: settled
        ? [base + 7, base + 3, base]
        : [base, base + 3, base + 10],
      beatSeconds: 0.5,
    },
    options: ["Full stop", "Comma / needs an answer"],
    correctIndex: settled ? 0 : 1,
    explanation: settled
      ? `The contour arrives on the ${root} root.`
      : "The final minor seventh leaves harmonic and melodic energy unresolved.",
    listenFor:
      "Imagine silence after the final note: does the silence feel complete or expectant?",
  };
}
