import { GUITAR_LANGUAGE_LESSONS } from "@/features/guitar-learning/data/courses/guitar-language";
import { RHYTHM_YOU_CAN_SEE_LESSONS } from "@/features/guitar-learning/data/courses/rhythm-you-can-see";
import { SCALE_TO_PHRASE_LESSONS } from "@/features/guitar-learning/data/courses/scale-to-phrase";
import {
  GUITAR_TOOL_PRESET_BY_ID,
  GUITAR_TOOL_PRESETS,
  type GuitarToolPreset,
} from "@/features/guitar-learning/data/tool-presets";

const DEFINITIONS = [
  ...GUITAR_LANGUAGE_LESSONS,
  ...RHYTHM_YOU_CAN_SEE_LESSONS,
  ...SCALE_TO_PHRASE_LESSONS,
];

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
      settings: {
        ...base.settings,
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

export const AUTHORED_TOOL_PRESET_BY_LESSON_ID = new Map(
  AUTHORED_GUITAR_TOOL_PRESETS.map((preset) => [preset.lessonId, preset]),
);
