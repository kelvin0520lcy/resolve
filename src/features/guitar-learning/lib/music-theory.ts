import type {
  FretboardNote,
  GuitarLessonCategory,
} from "@/features/guitar-learning/types";

export const CHROMATIC_NOTES = [
  "C",
  "C#",
  "D",
  "D#",
  "E",
  "F",
  "F#",
  "G",
  "G#",
  "A",
  "A#",
  "B",
] as const;

export type NoteName = (typeof CHROMATIC_NOTES)[number];

export const STANDARD_TUNING = ["E2", "A2", "D3", "G3", "B3", "E4"];
export const TUNINGS = {
  standard: STANDARD_TUNING,
  "drop-d": ["D2", "A2", "D3", "G3", "B3", "E4"],
  "open-g": ["D2", "G2", "D3", "G3", "B3", "D4"],
  "half-step-down": ["D#2", "G#2", "C#3", "F#3", "A#3", "D#4"],
} as const;

export type ScaleType =
  | "major"
  | "natural-minor"
  | "major-pentatonic"
  | "minor-pentatonic"
  | "blues"
  | "harmonic-minor"
  | "dorian"
  | "mixolydian";

export type ChordQuality =
  | "major"
  | "minor"
  | "diminished"
  | "augmented"
  | "power"
  | "sus2"
  | "sus4"
  | "add9"
  | "dominant7"
  | "major7"
  | "minor7";

const FLAT_EQUIVALENTS: Record<string, NoteName> = {
  CB: "B",
  DB: "C#",
  EB: "D#",
  FB: "E",
  GB: "F#",
  AB: "G#",
  BB: "A#",
};

export const SCALE_INTERVALS: Record<ScaleType, number[]> = {
  major: [0, 2, 4, 5, 7, 9, 11],
  "natural-minor": [0, 2, 3, 5, 7, 8, 10],
  "major-pentatonic": [0, 2, 4, 7, 9],
  "minor-pentatonic": [0, 3, 5, 7, 10],
  blues: [0, 3, 5, 6, 7, 10],
  "harmonic-minor": [0, 2, 3, 5, 7, 8, 11],
  dorian: [0, 2, 3, 5, 7, 9, 10],
  mixolydian: [0, 2, 4, 5, 7, 9, 10],
};

export const CHORD_INTERVALS: Record<ChordQuality, number[]> = {
  major: [0, 4, 7],
  minor: [0, 3, 7],
  diminished: [0, 3, 6],
  augmented: [0, 4, 8],
  power: [0, 7],
  sus2: [0, 2, 7],
  sus4: [0, 5, 7],
  add9: [0, 4, 7, 14],
  dominant7: [0, 4, 7, 10],
  major7: [0, 4, 7, 11],
  minor7: [0, 3, 7, 10],
};

export const INTERVAL_NAMES = [
  "root",
  "minor second",
  "major second",
  "minor third",
  "major third",
  "perfect fourth",
  "tritone",
  "perfect fifth",
  "minor sixth",
  "major sixth",
  "minor seventh",
  "major seventh",
] as const;

export function normalizeNote(note: string): NoteName {
  const pitch = note
    .trim()
    .replace("♭", "b")
    .replace("♯", "#")
    .replace(/[0-9-]/g, "")
    .toUpperCase();
  const normalized = FLAT_EQUIVALENTS[pitch] ?? pitch;
  if (!CHROMATIC_NOTES.includes(normalized as NoteName)) {
    throw new Error(`Unsupported note: ${note}`);
  }
  return normalized as NoteName;
}

export function getNoteIndex(note: string): number {
  return CHROMATIC_NOTES.indexOf(normalizeNote(note));
}

export function transposeNote(note: string, semitones: number): NoteName {
  const index = getNoteIndex(note);
  return CHROMATIC_NOTES[
    ((index + semitones) % CHROMATIC_NOTES.length +
      CHROMATIC_NOTES.length) %
      CHROMATIC_NOTES.length
  ];
}

export function getIntervalSemitones(root: string, note: string): number {
  return (
    (getNoteIndex(note) - getNoteIndex(root) + CHROMATIC_NOTES.length) %
    CHROMATIC_NOTES.length
  );
}

export function getIntervalName(root: string, note: string): string {
  return INTERVAL_NAMES[getIntervalSemitones(root, note)];
}

export function buildScale(root: string, scale: ScaleType): NoteName[] {
  return SCALE_INTERVALS[scale].map((interval) =>
    transposeNote(root, interval),
  );
}

export function buildChord(
  root: string,
  quality: ChordQuality,
): NoteName[] {
  return CHORD_INTERVALS[quality].map((interval) =>
    transposeNote(root, interval),
  );
}

export function getTriadInversions(
  root: string,
  quality: "major" | "minor",
): Array<{ name: string; notes: NoteName[]; intervals: string[] }> {
  const notes = buildChord(root, quality);
  const roles =
    quality === "major"
      ? ["root", "major third", "perfect fifth"]
      : ["root", "minor third", "perfect fifth"];
  return [
    { name: "Root position", notes, intervals: roles },
    {
      name: "First inversion",
      notes: [notes[1], notes[2], notes[0]],
      intervals: [roles[1], roles[2], roles[0]],
    },
    {
      name: "Second inversion",
      notes: [notes[2], notes[0], notes[1]],
      intervals: [roles[2], roles[0], roles[1]],
    },
  ];
}

export function parsePitchedNote(value: string): {
  note: NoteName;
  octave: number;
  midi: number;
} {
  const match = /^([A-Ga-g])([#b♯♭]?)(-?\d+)$/.exec(value.trim());
  if (!match) throw new Error(`Invalid pitched note: ${value}`);
  const note = normalizeNote(`${match[1]}${match[2]}`);
  const octave = Number(match[3]);
  return {
    note,
    octave,
    midi: (octave + 1) * 12 + getNoteIndex(note),
  };
}

export function midiToNote(midi: number): {
  note: NoteName;
  octave: number;
} {
  const rounded = Math.round(midi);
  return {
    note: CHROMATIC_NOTES[
      ((rounded % 12) + CHROMATIC_NOTES.length) % CHROMATIC_NOTES.length
    ],
    octave: Math.floor(rounded / 12) - 1,
  };
}

export function midiToFrequency(midi: number): number {
  return 440 * 2 ** ((midi - 69) / 12);
}

export function getFretboardNote(
  tuning: string[],
  stringIndex: number,
  fret: number,
  root = "C",
): FretboardNote {
  if (
    stringIndex < 0 ||
    stringIndex >= tuning.length ||
    !Number.isInteger(fret) ||
    fret < 0
  ) {
    throw new Error("String and fret must identify a playable position.");
  }
  const open = parsePitchedNote(tuning[stringIndex]);
  const midi = open.midi + fret;
  const pitch = midiToNote(midi);
  return {
    stringIndex,
    stringName: open.note,
    fret,
    note: pitch.note,
    octave: pitch.octave,
    midi,
    interval: getIntervalSemitones(root, pitch.note),
  };
}

export function generateFretboard(
  tuning: string[] = STANDARD_TUNING,
  fretCount = 24,
  root = "C",
): FretboardNote[] {
  if (tuning.length !== 6) {
    throw new Error("A guitar tuning must contain six strings.");
  }
  if (!Number.isInteger(fretCount) || fretCount < 1 || fretCount > 36) {
    throw new Error("Fret count must be between 1 and 36.");
  }
  return tuning.flatMap((_, stringIndex) =>
    Array.from({ length: fretCount + 1 }, (_unused, fret) =>
      getFretboardNote(tuning, stringIndex, fret, root),
    ),
  );
}

export function compareScales(
  root: string,
  first: ScaleType,
  second: ScaleType,
) {
  const firstNotes = buildScale(root, first);
  const secondNotes = buildScale(root, second);
  return {
    shared: firstNotes.filter((note) => secondNotes.includes(note)),
    onlyFirst: firstNotes.filter((note) => !secondNotes.includes(note)),
    onlySecond: secondNotes.filter((note) => !firstNotes.includes(note)),
  };
}

function romanDegree(roman: string): number {
  const normalized = roman.replace(/[°+]/g, "").toUpperCase();
  const degrees: Record<string, number> = {
    I: 1,
    II: 2,
    III: 3,
    IV: 4,
    V: 5,
    VI: 6,
    VII: 7,
  };
  const degree = degrees[normalized];
  if (!degree) throw new Error(`Unsupported Roman numeral: ${roman}`);
  return degree;
}

export function convertRomanProgression(
  root: string,
  tonality: "major" | "minor",
  numerals: string[],
) {
  const scale = buildScale(
    root,
    tonality === "major" ? "major" : "natural-minor",
  );
  return numerals.map((roman) => {
    const degree = romanDegree(roman);
    const isDiminished = roman.includes("°");
    const isUppercase =
      roman.replace(/[°+]/g, "") === roman.replace(/[°+]/g, "").toUpperCase();
    const quality: ChordQuality = isDiminished
      ? "diminished"
      : isUppercase
        ? "major"
        : "minor";
    return {
      roman,
      degree,
      root: scale[degree - 1],
      quality,
      notes: buildChord(scale[degree - 1], quality),
      function:
        degree === 1 || degree === 3 || degree === 6
          ? "tonic"
          : degree === 2 || degree === 4
            ? "predominant"
            : "dominant",
    };
  });
}

export function categoryDefaultMidi(
  category: GuitarLessonCategory,
): number[] {
  if (category === "rhythm") return [45, 52, 57];
  if (category === "chords" || category === "theory")
    return [57, 60, 64];
  if (category === "ear") return [57, 61];
  return [57, 60, 62, 64];
}
