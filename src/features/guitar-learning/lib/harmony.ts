import {
  buildChord,
  buildScale,
  CHROMATIC_NOTES,
  getNoteIndex,
  transposeNote,
  type ChordQuality,
  type NoteName,
  type ScaleType,
} from "@/features/guitar-learning/lib/music-theory";

export function intervalFormula(intervals: number[]) {
  return intervals.map((interval, index) => {
    if (index === 0) return "R";
    const labels: Record<number, string> = {
      1: "♭2",
      2: "2",
      3: "♭3",
      4: "3",
      5: "4",
      6: "♭5",
      7: "5",
      8: "♭6",
      9: "6",
      10: "♭7",
      11: "7",
      14: "9",
    };
    return labels[interval] ?? `${interval} semitones`;
  });
}

export function scaleStepFormula(root: string, scale: ScaleType) {
  const notes = buildScale(root, scale);
  return notes.map((note, index) => {
    const next = notes[(index + 1) % notes.length];
    let semitones =
      (getNoteIndex(next) - getNoteIndex(note) + 12) % 12;
    if (index === notes.length - 1 && semitones === 0) semitones = 12;
    return semitones === 1
      ? "H"
      : semitones === 2
        ? "W"
        : `${semitones} st`;
  });
}

export function getChordToneRoles(
  quality: ChordQuality,
): Array<{ role: string; interval: number }> {
  const roles: Record<ChordQuality, string[]> = {
    major: ["root", "major third", "perfect fifth"],
    minor: ["root", "minor third", "perfect fifth"],
    diminished: ["root", "minor third", "diminished fifth"],
    augmented: ["root", "major third", "augmented fifth"],
    power: ["root", "perfect fifth"],
    sus2: ["root", "major second", "perfect fifth"],
    sus4: ["root", "perfect fourth", "perfect fifth"],
    add9: ["root", "major third", "perfect fifth", "major ninth"],
    dominant7: [
      "root",
      "major third",
      "perfect fifth",
      "minor seventh",
    ],
    major7: [
      "root",
      "major third",
      "perfect fifth",
      "major seventh",
    ],
    minor7: [
      "root",
      "minor third",
      "perfect fifth",
      "minor seventh",
    ],
  };
  const intervals: Record<ChordQuality, number[]> = {
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
  return intervals[quality].map((interval, index) => ({
    role: roles[quality][index],
    interval,
  }));
}

export function harmonizeMajorScale(root: string) {
  const notes = buildScale(root, "major");
  const qualities: Array<
    "major" | "minor" | "diminished"
  > = [
    "major",
    "minor",
    "minor",
    "major",
    "major",
    "minor",
    "diminished",
  ];
  const numerals = ["I", "ii", "iii", "IV", "V", "vi", "vii°"];
  return notes.map((note, index) => ({
    degree: index + 1,
    roman: numerals[index],
    root: note,
    quality: qualities[index],
    notes: buildChord(note, qualities[index]),
    function:
      index === 0 || index === 2 || index === 5
        ? ("tonic" as const)
        : index === 1 || index === 3
          ? ("predominant" as const)
          : ("dominant" as const),
  }));
}

export function transposeNotes(
  notes: string[],
  semitones: number,
): NoteName[] {
  return notes.map((note) => transposeNote(note, semitones));
}

export type EmotionalControls = {
  brightness: number;
  tension: number;
  movement: number;
  intensity: number;
};

export function buildEmotionalGuitarRecipe({
  brightness,
  tension,
  movement,
  intensity,
}: EmotionalControls) {
  const clamp = (value: number) => Math.max(0, Math.min(100, value));
  const values = {
    brightness: clamp(brightness),
    tension: clamp(tension),
    movement: clamp(movement),
    intensity: clamp(intensity),
  };
  const root = values.brightness >= 55 ? "E" : "A";
  const scale: ScaleType =
    values.brightness >= 70
      ? "major-pentatonic"
      : values.tension >= 70
        ? "harmonic-minor"
        : values.brightness >= 45
          ? "dorian"
          : "natural-minor";
  const chordQuality: ChordQuality =
    values.tension >= 72
      ? "sus4"
      : values.brightness >= 58
        ? "add9"
        : "minor7";
  const subdivision =
    values.movement >= 70 ? 16 : values.movement >= 35 ? 8 : 4;
  const articulation =
    values.intensity >= 72
      ? "wide accents and open sustain"
      : values.intensity >= 38
        ? "controlled accents with selective palm muting"
        : "soft attacks, long rests, and narrow vibrato";
  const contour =
    values.movement >= 55
      ? "rising sequence with one repeated motif"
      : "small-register call and response";
  return {
    ...values,
    root,
    scale,
    chordQuality,
    subdivision,
    articulation,
    contour,
    notes: buildScale(root, scale),
    chordNotes: buildChord(root, chordQuality),
  };
}

export function chromaticDistanceLabel(
  first: string,
  second: string,
) {
  const semitones =
    (getNoteIndex(second) - getNoteIndex(first) + 12) % 12;
  return {
    semitones,
    direction:
      semitones === 0
        ? "same pitch class"
        : semitones <= 6
          ? "up"
          : "down",
    chromaticPath: Array.from(
      { length: semitones + 1 },
      (_value, index) =>
        CHROMATIC_NOTES[(getNoteIndex(first) + index) % 12],
    ),
  };
}
