"use client";

import { useState } from "react";
import { Eye, LockKeyhole } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { PageIntro, fieldClassName } from "@/components/ui/resolve";
import { GuitarExploreMode } from "@/features/guitar-learning/components/explore-mode";
import { GuitarLearnMode } from "@/features/guitar-learning/components/learn-mode";
import { GuitarLearningMap } from "@/features/guitar-learning/components/learning-map";
import { GuitarPracticeMode } from "@/features/guitar-learning/components/practice-mode";
import {
  GuitarStudioNav,
  type GuitarStudioMode,
} from "@/features/guitar-learning/components/studio-nav";
import {
  createPreviewGuitarState,
  GUITAR_PREVIEW_STATES,
  PREVIEW_LESSON,
  PREVIEW_LESSON_ID,
  type GuitarPreviewStateId,
} from "@/features/guitar-learning/data/preview-state";
import type {
  GuitarLearningState,
  GuitarToolId,
} from "@/features/guitar-learning/types";

type PreviewDescriptor = {
  mode: GuitarStudioMode;
  lessonId?: string;
  lessonStage?: number;
  toolId?: GuitarToolId;
  presetId?: string;
  toolMode?: "guided" | "sandbox";
};

const PREVIEW_DESCRIPTORS: Record<
  GuitarPreviewStateId,
  PreviewDescriptor
> = {
  placement: { mode: "learn" },
  learn: { mode: "learn" },
  "lesson-visual": {
    mode: "learn",
    lessonId: PREVIEW_LESSON_ID,
    lessonStage: 1,
  },
  "lesson-checkpoint": {
    mode: "learn",
    lessonId: PREVIEW_LESSON_ID,
    lessonStage: PREVIEW_LESSON.sections.length,
  },
  "lesson-application": {
    mode: "learn",
    lessonId: PREVIEW_LESSON_ID,
    lessonStage: PREVIEW_LESSON.sections.length + 1,
  },
  "lesson-completed": {
    mode: "learn",
    lessonId: PREVIEW_LESSON_ID,
    lessonStage: PREVIEW_LESSON.sections.length + 1,
  },
  practice: { mode: "practise" },
  "rhythm-guided": {
    mode: "tools",
    toolId: "rhythm",
    presetId: "lesson:rhythm:feeling-and-identifying-the-pulse",
    toolMode: "guided",
  },
  "rhythm-sandbox": {
    mode: "tools",
    toolId: "rhythm",
    toolMode: "sandbox",
  },
  "chord-trainer": { mode: "tools", toolId: "chord-trainer" },
  "sandbox-tool": {
    mode: "tools",
    toolId: "improvisation",
    toolMode: "sandbox",
  },
  progress: { mode: "progress" },
  partial: { mode: "progress" },
  completed: { mode: "progress" },
};

const MODE_COPY: Record<
  GuitarStudioMode,
  { eyebrow: string; title: string; description: string }
> = {
  learn: {
    eyebrow: "Guided learning",
    title: "Understand it, hear it, use it",
    description:
      "This is the real lesson interface with fixed, anonymous preview progress.",
  },
  practise: {
    eyebrow: "Practice room",
    title: "Know exactly what to do next",
    description:
      "Try the real routine, tuner, chord trainer, and problem solver without saving an account record.",
  },
  tools: {
    eyebrow: "Interactive tools",
    title: "Start guided, then explore freely",
    description:
      "Every control below is the production Guitar Studio component. Preview changes remain in this tab only.",
  },
  progress: {
    eyebrow: "Learning evidence",
    title: "See what is becoming reliable",
    description:
      "Inspect course states, prerequisites, and responsive progress layouts using anonymous seeded data.",
  },
};

function descriptorFor(previewId: GuitarPreviewStateId) {
  return PREVIEW_DESCRIPTORS[previewId];
}

export function GuitarStudioPreview() {
  const [previewId, setPreviewId] =
    useState<GuitarPreviewStateId>("learn");
  const [state, setState] = useState<GuitarLearningState>(() =>
    createPreviewGuitarState("learn"),
  );
  const [descriptor, setDescriptor] = useState<PreviewDescriptor>(() =>
    descriptorFor("learn"),
  );
  const [mode, setMode] = useState<GuitarStudioMode>("learn");
  const [selectedToolId, setSelectedToolId] =
    useState<GuitarToolId>("fretboard");
  const [selectedPresetId, setSelectedPresetId] = useState<string>();
  const [lessonId, setLessonId] = useState<string>();
  const copy = MODE_COPY[mode];

  function selectPreview(nextId: GuitarPreviewStateId) {
    const nextDescriptor = descriptorFor(nextId);
    setPreviewId(nextId);
    setState(createPreviewGuitarState(nextId));
    setDescriptor(nextDescriptor);
    setMode(nextDescriptor.mode);
    setLessonId(nextDescriptor.lessonId);
    setSelectedToolId(nextDescriptor.toolId ?? "fretboard");
    setSelectedPresetId(nextDescriptor.presetId);
  }

  function openLesson(nextLessonId: string) {
    setDescriptor({
      mode: "learn",
      lessonId: nextLessonId,
    });
    setLessonId(nextLessonId);
    setMode("learn");
  }

  function openTool(toolId: GuitarToolId, presetId?: string) {
    setDescriptor({
      mode: "tools",
      toolId,
      presetId,
      toolMode: presetId ? "guided" : undefined,
    });
    setSelectedToolId(toolId);
    setSelectedPresetId(presetId);
    setMode("tools");
  }

  function trackActiveLesson(nextLessonId?: string) {
    if (nextLessonId !== lessonId) {
      setDescriptor({
        mode: "learn",
        lessonId: nextLessonId,
      });
    }
    setLessonId(nextLessonId);
  }

  return (
    <main className="page-theme theme-bocchi min-h-screen bg-background px-3 py-4 text-foreground sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-5">
        <header className="manga-panel sticky top-2 z-40 rounded-[22px] border-2 border-border bg-surface-elevated/95 p-4 shadow-lg backdrop-blur">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <label className="min-w-64 flex-1 text-sm font-black">
              Preview state
              <select
                aria-label="Preview state"
                className={`${fieldClassName} mt-2`}
                value={previewId}
                onChange={(event) =>
                  selectPreview(
                    event.target.value as GuitarPreviewStateId,
                  )
                }
              >
                {GUITAR_PREVIEW_STATES.map((option) => (
                  <option key={option.id} value={option.id}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>
            <div className="flex flex-wrap gap-2">
              <Badge variant="accent">
                <Eye className="mr-1 h-3.5 w-3.5" />
                Real components
              </Badge>
              <Badge>
                <LockKeyhole className="mr-1 h-3.5 w-3.5" />
                Anonymous · memory only
              </Badge>
            </div>
          </div>
          <p className="mt-3 text-xs leading-5 text-muted">
            This audit route never reads an account or writes to Firebase.
            Refreshing restores the seeded preview.
          </p>
        </header>

        <GuitarStudioNav mode={mode} onChange={setMode} />

        <section
          key={`${previewId}:${mode}`}
          id={`guitar-${mode}-panel`}
          role="tabpanel"
          aria-label={`${mode} Guitar Studio preview`}
          data-testid="guitar-preview-stage"
          className="min-w-0"
        >
          <PageIntro
            eyebrow={copy.eyebrow}
            title={copy.title}
            description={copy.description}
          />
          <div className="mt-6">
            {mode === "learn" && (
              <GuitarLearnMode
                key={`${previewId}:${lessonId ?? "learn"}`}
                state={state}
                updateState={setState}
                goals={[]}
                sessions={[]}
                onOpenTool={openTool}
                initialLessonId={lessonId}
                initialLessonStage={descriptor.lessonStage}
                onActiveLessonChange={trackActiveLesson}
              />
            )}
            {mode === "practise" && (
              <GuitarPracticeMode
                state={state}
                updateState={setState}
                onOpenLesson={openLesson}
                onOpenTool={openTool}
              />
            )}
            {mode === "tools" && (
              <GuitarExploreMode
                key={`${previewId}:${selectedToolId}`}
                selectedToolId={selectedToolId}
                selectedPresetId={selectedPresetId}
                initialToolMode={descriptor.toolMode}
                onSelectTool={setSelectedToolId}
                onSelectPreset={setSelectedPresetId}
                onOpenLesson={openLesson}
                state={state}
                updateState={setState}
              />
            )}
            {mode === "progress" && (
              <GuitarLearningMap
                state={state}
                updateState={setState}
                onOpenLesson={openLesson}
              />
            )}
          </div>
        </section>
      </div>
    </main>
  );
}
