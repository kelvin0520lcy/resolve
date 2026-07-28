import type { GuitarToolId } from "@/features/guitar-learning/types";

export type GuitarToolPreset = {
  id: string;
  toolId: GuitarToolId;
  lessonId: string;
  lessonTitle: string;
  goal: string;
  successCondition: string;
  exactGuided?: boolean;
  settings: Record<string, string | number | boolean | string[] | number[]>;
};

export const GUITAR_TOOL_PRESETS: GuitarToolPreset[] = [
  {
    id: "rhythm:pulse-at-60",
    toolId: "rhythm",
    lessonId: "rhythm:feeling-and-identifying-the-pulse",
    lessonTitle: "Find the repeating pulse",
    goal: "Tap with the large circle for three complete groups of four.",
    successCondition: "Your tap lands with the flash 12 times without chasing it.",
    settings: {
      bpm: 60,
      beats: 4,
      slotsPerBeat: 1,
      level: 1,
      voiceCount: true,
      simplified: true,
    },
  },
  {
    id: "rhythm:four-count",
    toolId: "rhythm",
    lessonId: "rhythm:quarter-note-counting",
    lessonTitle: "Count four beats",
    goal: "Say 1, 2, 3, 4 with the pulse, then restart at 1.",
    successCondition: "Beat one feels like a clear restart instead of a surprise.",
    settings: {
      bpm: 60,
      beats: 4,
      slotsPerBeat: 1,
      level: 1,
      voiceCount: true,
      simplified: true,
    },
  },
  {
    id: "rhythm:eighth-split",
    toolId: "rhythm",
    lessonId: "rhythm:eighth-note-subdivisions",
    lessonTitle: "Split each beat into two",
    goal: "Count 1 and 2 and 3 and 4 and evenly for three bars.",
    successCondition: "Every number-to-and gap matches every and-to-number gap.",
    settings: {
      bpm: 60,
      beats: 4,
      slotsPerBeat: 2,
      level: 2,
      voiceCount: true,
      simplified: true,
    },
  },
  {
    id: "rhythm:continuous-hand",
    toolId: "rhythm",
    lessonId: "rhythm:continuous-strumming-hand-movement",
    lessonTitle: "Keep the hand moving",
    goal: "Air-strum Down on numbers and Up on ands without stopping.",
    successCondition: "The hand reverses direction at every timing point.",
    settings: {
      bpm: 60,
      beats: 4,
      slotsPerBeat: 2,
      level: 3,
      voiceCount: true,
      simplified: true,
    },
  },
  {
    id: "rhythm:missed-strokes",
    toolId: "rhythm",
    lessonId: "rhythm:missed-strokes",
    lessonTitle: "Move through silent passes",
    goal: "Keep all eight hand movements while sounding only six.",
    successCondition: "The stroke after each missed pass arrives without a lurch.",
    settings: {
      bpm: 60,
      beats: 4,
      slotsPerBeat: 2,
      level: 4,
      pattern: [0, 2, 3, 5, 6, 7],
      voiceCount: true,
      simplified: true,
    },
  },
  {
    id: "rhythm:dduudu",
    toolId: "rhythm",
    lessonId: "rhythm:constructing-strumming-patterns",
    lessonTitle: "Build D D U U D U",
    goal: "Loop D – D U – U D U with the hand moving through both gaps.",
    successCondition: "Three bars have the same spacing and the gaps stay visible.",
    settings: {
      bpm: 60,
      beats: 4,
      slotsPerBeat: 2,
      level: 4,
      pattern: [0, 2, 3, 5, 6, 7],
      voiceCount: true,
      simplified: true,
    },
  },
  {
    id: "fretboard:a-home",
    toolId: "fretboard",
    lessonId: "improvisation:tonal-centre",
    lessonTitle: "Find the home note",
    goal: "Find both visible A notes and finish every short idea on one of them.",
    successCondition: "You can predict which A will sound finished before playing it.",
    settings: {
      root: "A",
      fretCount: 8,
      display: "roots",
      scale: "minor-pentatonic",
      guided: true,
    },
  },
  {
    id: "scales:a-minor-pentatonic-three-notes",
    toolId: "scales",
    lessonId: "improvisation:playing-with-only-two-or-three-notes",
    lessonTitle: "Make a three-note phrase",
    goal: "Use only A, C, and D, then stop before answering.",
    successCondition: "A listener can sing the short idea back after one repeat.",
    settings: {
      root: "A",
      scale: "minor-pentatonic",
      visibleNotes: ["A", "C", "D"],
      bpm: 60,
      guided: true,
    },
  },
  {
    id: "chords:g-to-c-change",
    toolId: "chord-trainer",
    lessonId: "guitar-language:first-two-chord-groove",
    lessonTitle: "Your first complete two-chord groove",
    goal: "Change between G and C without stopping the four-count.",
    successCondition: "Complete five clean changes in 30 seconds without squeezing.",
    settings: {
      chordA: "G",
      chordB: "C",
      seconds: 30,
      bpm: 60,
    },
  },
  {
    id: "tuner:standard",
    toolId: "tuner",
    lessonId: "guitar-language:standard-tuning-and-tuner",
    lessonTitle: "Standard tuning and the tuner",
    goal: "Tune each string to E A D G B E using the direction display.",
    successCondition: "Every string stays inside ±5 cents for one second.",
    settings: {
      tuning: ["E2", "A2", "D3", "G3", "B3", "E4"],
      toleranceCents: 5,
    },
  },
  {
    id: "picking:pick-depth",
    toolId: "picking",
    lessonId: "guitar-language:pick-grip-and-depth",
    lessonTitle: "Use a shallow, relaxed pick stroke",
    goal: "Expose a small pick tip and brush one muted string down and up.",
    successCondition:
      "Both strokes clear the string without a catch or a rigid grip.",
    settings: {
      pattern: "single-string-alternate",
      string: 3,
      bpm: 60,
      shallowDepth: true,
      simplified: true,
    },
  },
  {
    id: "tuner:bend-target-a4",
    toolId: "tuner",
    lessonId: "improvisation:bend-to-a-heard-target",
    lessonTitle: "Match a bend to a heard target",
    goal:
      "Hear A4 first, then bend from G4 until the tuner centres on the same A.",
    successCondition:
      "The bent note holds within ±5 cents of A4 without overshooting.",
    settings: {
      mode: "bend-target",
      sourceMidi: 67,
      targetMidi: 69,
      toleranceCents: 5,
      simplified: true,
    },
  },
];

export const GUITAR_TOOL_PRESET_BY_ID = new Map(
  GUITAR_TOOL_PRESETS.map((preset) => [preset.id, preset]),
);

export function getGuitarToolPreset(presetId?: string) {
  return presetId ? GUITAR_TOOL_PRESET_BY_ID.get(presetId) : undefined;
}
