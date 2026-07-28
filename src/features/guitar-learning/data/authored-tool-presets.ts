import { GUITAR_LANGUAGE_LESSONS } from "@/features/guitar-learning/data/courses/guitar-language";
import { RHYTHM_YOU_CAN_SEE_LESSONS } from "@/features/guitar-learning/data/courses/rhythm-you-can-see";
import { SCALE_TO_PHRASE_LESSONS } from "@/features/guitar-learning/data/courses/scale-to-phrase";
import {
  GUITAR_TOOL_PRESET_BY_ID,
  GUITAR_TOOL_PRESETS,
  type GuitarToolPreset,
} from "@/features/guitar-learning/data/tool-presets";
import type { ExplicitLessonVisual } from "@/features/guitar-learning/types";

const DEFINITIONS = [
  ...GUITAR_LANGUAGE_LESSONS,
  ...RHYTHM_YOU_CAN_SEE_LESSONS,
  ...SCALE_TO_PHRASE_LESSONS,
];

function settingsFromVisual(
  definition: (typeof DEFINITIONS)[number],
): GuitarToolPreset["settings"] {
  const visual: ExplicitLessonVisual = definition.visual;
  if (visual.kind === "rhythm-grid") {
    const eventsBySlot = new Map(
      visual.events
        .filter((event) => event.chord)
        .map((event) => [event.slot, event.chord!]),
    );
    let currentChord = "";
    const beatChords = Array.from({ length: visual.beats }, (_value, beat) => {
      const chord = eventsBySlot.get(beat * visual.slotsPerBeat);
      if (chord) currentChord = chord;
      return currentChord;
    });
    return {
      beats: visual.beats,
      slotsPerBeat: visual.slotsPerBeat,
      pattern: visual.events
        .filter((event) => event.type === "played" || event.type === "muted")
        .map((event) => event.slot),
      mutedSteps: visual.events
        .filter((event) => event.type === "muted")
        .map((event) => event.slot),
      accentedSteps: visual.events
        .filter((event) => event.accented)
        .map((event) => event.slot),
      beatChords,
      voiceCount: true,
      simplified: true,
    };
  }
  if (visual.kind === "fretboard") {
    const visibleNotes = visual.notes.flatMap((note) => {
      const matches = note.label.match(/[A-G](?:#|♭|b)?/g);
      return matches?.length ? [matches[matches.length - 1]] : [];
    });
    return {
      root: visual.root ?? visibleNotes[0] ?? "A",
      fretCount: visual.fretCount,
      display: visual.root ? "roots" : "notes",
      visibleNotes: [...new Set(visibleNotes)],
      simplified: true,
    };
  }
  if (visual.kind === "chord-diagram") {
    return {
      chordA: visual.chordName,
      seconds: 30,
      simplified: true,
    };
  }
  if (visual.kind === "picking") {
    return {
      pattern: "single-string-alternate",
      bpm: 60,
      shallowDepth: true,
      simplified: true,
    };
  }
  return {};
}

function hasExactGuidedRepresentation(
  definition: (typeof DEFINITIONS)[number],
  base: GuitarToolPreset,
) {
  const kind = definition.visual.kind;
  if (definition.toolPresetId.startsWith("tuner:")) return true;
  if (kind === "chord-diagram") return true;
  if (kind === "rhythm-grid") return base.toolId === "rhythm";
  if (kind === "fretboard") return base.toolId === "fretboard";
  if (kind === "picking") return base.toolId === "picking";
  return false;
}

export const AUTHORED_GUITAR_TOOL_PRESETS: GuitarToolPreset[] =
  DEFINITIONS.map((definition) => {
    const base = GUITAR_TOOL_PRESET_BY_ID.get(definition.toolPresetId);
    if (!base) {
      throw new Error(
        `Cannot create guided preset for ${definition.id}: ${definition.toolPresetId} is missing.`,
      );
    }
    return {
      ...base,
      id: `lesson:${definition.id}`,
      lessonId: definition.id,
      lessonTitle: definition.title,
      goal: definition.guidedPractice.body,
      successCondition: definition.guidedPractice.success,
      exactGuided: hasExactGuidedRepresentation(definition, base),
      settings: {
        ...base.settings,
        ...settingsFromVisual(definition),
        authoredLessonId: definition.id,
      },
    };
  });

export const ALL_GUITAR_TOOL_PRESETS = [
  ...GUITAR_TOOL_PRESETS,
  ...AUTHORED_GUITAR_TOOL_PRESETS,
];

export const ALL_GUITAR_TOOL_PRESET_BY_ID = new Map(
  ALL_GUITAR_TOOL_PRESETS.map((preset) => [preset.id, preset]),
);

export function getAuthoredGuitarToolPreset(presetId?: string) {
  return presetId
    ? ALL_GUITAR_TOOL_PRESET_BY_ID.get(presetId)
    : undefined;
}

export function hasExactGuidedGuitarPreset(presetId?: string) {
  const preset = getAuthoredGuitarToolPreset(presetId);
  return Boolean(preset && preset.exactGuided !== false);
}

export const AUTHORED_TOOL_PRESET_BY_LESSON_ID = new Map(
  AUTHORED_GUITAR_TOOL_PRESETS.map((preset) => [preset.lessonId, preset]),
);
