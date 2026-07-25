"use client";

import { ArrowDown, ArrowRight, ArrowUp, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { PlacementQuestion } from "@/features/guitar-learning/data/placement";
import { guitarAudioEngine } from "@/features/guitar-learning/lib/audio-engine";
import type { AudioPattern } from "@/features/guitar-learning/types";

const LISTENING_CUES: Record<
  string,
  {
    first: AudioPattern;
    second: AudioPattern;
    firstLabel: string;
    secondLabel: string;
    prompt: string;
  }
> = {
  "expressive-technique": {
    first: { kind: "notes", midiNotes: [57, 59], beatSeconds: 0.72 },
    second: { kind: "notes", midiNotes: [57, 60], beatSeconds: 0.72 },
    firstLabel: "Below target",
    secondLabel: "Target pitch",
    prompt:
      "Play both. Can you match the second pitch from the first note, then keep it centred?",
  },
  "ear-baseline": {
    first: { kind: "chord", midiNotes: [57, 61, 64] },
    second: { kind: "chord", midiNotes: [57, 60, 64] },
    firstLabel: "Example A",
    secondLabel: "Example B",
    prompt:
      "Before naming them, describe which chord sounds brighter and which sounds darker.",
  },
};

function RhythmCue({ advanced }: { advanced: boolean }) {
  const counts = advanced
    ? ["1", "e", "&", "a", "2", "e", "&", "a"]
    : ["1", "&", "2", "&", "3", "&", "4", "&"];
  return (
    <div
      role="img"
      aria-label="Count and continuous down-up strumming grid"
      className="grid grid-cols-8 gap-1"
    >
      {counts.map((count, index) => (
        <div key={`${count}-${index}`} className="text-center">
          <span className="text-[10px] font-black">{count}</span>
          <span className="mt-1 flex min-h-9 items-center justify-center rounded-lg border border-border bg-surface">
            {index % 2 === 0 ? (
              <ArrowDown className="h-4 w-4 text-accent" />
            ) : (
              <ArrowUp className="h-4 w-4 text-cyan" />
            )}
          </span>
          <span className="mt-1 block text-[9px] font-black text-muted">
            {advanced && [2, 6].includes(index)
              ? "X"
              : [0, 2, 3, 6].includes(index)
                ? "●"
                : "—"}
          </span>
        </div>
      ))}
    </div>
  );
}

function FretboardCue({ octave }: { octave: boolean }) {
  return (
    <div
      role="img"
      aria-label={
        octave
          ? "Root and octave location test"
          : "Open strings and natural note location test"
      }
      className="space-y-2"
    >
      <div className="grid grid-cols-6 gap-1">
        {["E", "A", "D", "G", "B", "E"].map((string, index) => (
          <span
            key={`${string}-${index}`}
            className="rounded-lg border border-border bg-surface p-2 text-center text-xs font-black"
          >
            {string}
          </span>
        ))}
      </div>
      <div className="flex items-center gap-2 rounded-xl bg-surface p-3 text-xs font-bold">
        <span className="rounded-lg bg-warning px-2 py-1 text-[#18121f]">
          Root
        </span>
        <ArrowRight className="h-4 w-4 text-muted" />
        <span>
          {octave
            ? "Try locating the same note two strings higher and two frets forward."
            : "Say E–A–D–G–B–E, then point to one natural note on each bass string."}
        </span>
      </div>
    </div>
  );
}

function ChordCue() {
  return (
    <div
      role="img"
      aria-label="Chord interval recipe and diagram-reading check"
      className="grid gap-3 sm:grid-cols-[1fr_auto_1fr] sm:items-center"
    >
      <div className="rounded-xl border border-border bg-surface p-3 text-center">
        <p className="text-[9px] font-black text-muted">POWER CHORD</p>
        <p className="mt-1 font-black">R · 5 · R</p>
      </div>
      <ArrowRight className="mx-auto h-4 w-4 rotate-90 text-muted sm:rotate-0" />
      <div className="rounded-xl border border-border bg-surface p-3 text-center">
        <p className="text-[9px] font-black text-muted">MAJOR / MINOR</p>
        <p className="mt-1 font-black">R · 3 / ♭3 · 5</p>
      </div>
    </div>
  );
}

function PracticalCue({ questionId }: { questionId: string }) {
  const steps =
    questionId === "picking-control"
      ? [
          "Mute the strings.",
          "Play D U D U on one string.",
          "Cross strings without restarting D.",
        ]
      : questionId === "pentatonic-phrasing"
        ? [
            "Find one root.",
            "Play no more than three notes.",
            "End on the root, then leave a rest.",
          ]
        : [
            "Choose one scale position.",
            "Name the current chord tone.",
            "Make the phrase land on that tone.",
          ];
  return (
    <ol className="grid gap-2 sm:grid-cols-3">
      {steps.map((step, index) => (
        <li
          key={step}
          className="rounded-xl border border-border bg-surface p-3 text-xs leading-5"
        >
          <strong className="mr-1 text-accent">{index + 1}.</strong>
          {step}
        </li>
      ))}
    </ol>
  );
}

function TheoryCue({ questionId }: { questionId: string }) {
  return (
    <div
      role="img"
      aria-label="Theory formula recall check"
      className="grid gap-2 sm:grid-cols-2"
    >
      {(questionId === "scale-construction"
        ? [
            ["Major", "W · W · H · W · W · W · H"],
            ["Natural minor", "W · H · W · W · H · W · W"],
          ]
        : [
            ["Major triad", "R · 3 · 5"],
            ["Minor triad", "R · ♭3 · 5"],
          ]
      ).map(([label, formula]) => (
        <div
          key={label}
          className="rounded-xl border border-border bg-surface p-3 text-center"
        >
          <p className="text-[9px] font-black text-muted">{label}</p>
          <p className="mt-1 text-xs font-black">{formula}</p>
        </div>
      ))}
    </div>
  );
}

export function PlacementCue({
  question,
}: {
  question: PlacementQuestion;
}) {
  const listening = LISTENING_CUES[question.id];
  return (
    <div className="mb-5 rounded-2xl border-2 border-accent/20 bg-accent/5 p-4">
      <p className="mb-3 text-[10px] font-black uppercase tracking-[0.16em] text-accent">
        Try this before rating yourself
      </p>
      {question.kind === "rhythm-grid" && (
        <RhythmCue advanced={question.id === "sixteenth-groove"} />
      )}
      {question.kind === "fretboard" && (
        <FretboardCue octave={question.id === "roots-octaves-intervals"} />
      )}
      {question.kind === "chord-diagram" && <ChordCue />}
      {question.kind === "practical" && (
        <PracticalCue questionId={question.id} />
      )}
      {question.kind === "multiple-choice" && (
        <TheoryCue questionId={question.id} />
      )}
      {question.kind === "listening" && listening && (
        <div>
          <p className="text-xs leading-5 text-muted">{listening.prompt}</p>
          <div className="mt-3 grid gap-2 sm:grid-cols-2">
            <Button
              type="button"
              variant="secondary"
              onClick={() => void guitarAudioEngine.play(listening.first)}
            >
              <Play className="h-4 w-4" />
              {listening.firstLabel}
            </Button>
            <Button
              type="button"
              variant="secondary"
              onClick={() => void guitarAudioEngine.play(listening.second)}
            >
              <Play className="h-4 w-4" />
              {listening.secondLabel}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
