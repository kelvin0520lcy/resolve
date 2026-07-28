"use client";

import { RotateCcw, Volume2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { LessonVisualization } from "@/features/guitar-learning/components/lesson-visualization";
import { GUITAR_LESSON_BY_ID } from "@/features/guitar-learning/data/curriculum";
import {
  AUTHORED_GUITAR_TOOL_PRESETS,
  getAuthoredGuitarToolPreset,
} from "@/features/guitar-learning/data/authored-tool-presets";
import { guitarAudioEngine } from "@/features/guitar-learning/lib/audio-engine";
import type { GuitarToolId, VisualSection } from "@/features/guitar-learning/types";

export function GuidedGuitarTool({
  toolId,
  presetId,
  onSelectPreset,
  onOpenLesson,
}: {
  toolId: GuitarToolId;
  presetId?: string;
  onSelectPreset: (presetId: string) => void;
  onOpenLesson: (lessonId: string) => void;
}) {
  const options = AUTHORED_GUITAR_TOOL_PRESETS.filter(
    (preset) => preset.toolId === toolId,
  );
  const selected =
    getAuthoredGuitarToolPreset(presetId) ??
    options[0];
  const lesson = selected ? GUITAR_LESSON_BY_ID.get(selected.lessonId) : undefined;
  const visual = lesson?.sections.find(
    (section): section is VisualSection =>
      "visualData" in section && Boolean(section.visualData),
  );
  const audio = lesson?.sections.find(
    (section) => section.type === "audio-comparison",
  );

  if (!selected || !lesson || !visual) {
    return (
      <div className="rounded-2xl border-2 border-dashed border-border p-5 text-sm text-muted">
        This advanced tool has no guided lesson preset yet. Switch to Sandbox
        to explore its full controls.
      </div>
    );
  }

  return (
    <section aria-labelledby="guided-tool-title" className="space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <Badge variant="accent">Guided example</Badge>
          <h3 id="guided-tool-title" className="font-display mt-2 text-2xl">
            {selected.lessonTitle}
          </h3>
          <p className="mt-1 max-w-2xl text-sm leading-6 text-muted">
            {selected.goal}
          </p>
        </div>
        {options.length > 1 && (
          <label className="text-xs font-black">
            Example
            <select
              className="ml-2 rounded-xl border-2 border-border bg-surface px-3 py-2"
              value={selected.id}
              onChange={(event) => onSelectPreset(event.target.value)}
            >
              {options.map((preset) => (
                <option key={preset.id} value={preset.id}>
                  {preset.lessonTitle}
                </option>
              ))}
            </select>
          </label>
        )}
      </div>

      <LessonVisualization section={visual} conceptTitle={lesson.title} />

      <div className="grid gap-3 sm:grid-cols-2">
        <div className="rounded-xl border border-border bg-surface-muted/45 p-3">
          <p className="text-[10px] font-black uppercase tracking-wide text-accent">
            What to do
          </p>
          <p className="mt-2 text-xs leading-5">{visual.prompt}</p>
        </div>
        <div className="rounded-xl border border-success/25 bg-success/8 p-3">
          <p className="text-[10px] font-black uppercase tracking-wide text-success">
            You have it when
          </p>
          <p className="mt-2 text-xs leading-5">{selected.successCondition}</p>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {audio?.type === "audio-comparison" && (
          <Button
            type="button"
            onClick={() => void guitarAudioEngine.play(audio.correctPattern)}
          >
            <Volume2 className="h-4 w-4" /> Hear the example
          </Button>
        )}
        <Button
          type="button"
          variant="secondary"
          onClick={() => onSelectPreset(options[0]?.id ?? selected.id)}
        >
          <RotateCcw className="h-4 w-4" /> Reset example
        </Button>
        <Button type="button" variant="outline" onClick={() => onOpenLesson(lesson.id)}>
          Open full lesson
        </Button>
      </div>
    </section>
  );
}
