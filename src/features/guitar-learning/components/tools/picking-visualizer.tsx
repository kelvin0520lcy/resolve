"use client";

import { useEffect, useRef, useState } from "react";
import {
  AlertTriangle,
  Hand,
  Pause,
  Play,
  RotateCcw,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { fieldClassName } from "@/components/ui/resolve";
import { guitarAudioEngine } from "@/features/guitar-learning/lib/audio-engine";
import {
  describeStringCrossing,
  type PickingStep,
} from "@/features/guitar-learning/lib/rhythm";

type PickingExercise = {
  id: string;
  label: string;
  description: string;
  steps: Array<PickingStep & { technique?: "pick" | "hammer" | "pull" | "slide" }>;
};

const EXERCISES: PickingExercise[] = [
  {
    id: "one-string",
    label: "One-string alternate picking",
    description:
      "Match four equal subdivisions with D U D U before adding a string change.",
    steps: [
      { string: 2, fret: 5, direction: "D" },
      { string: 2, fret: 7, direction: "U" },
      { string: 2, fret: 8, direction: "D" },
      { string: 2, fret: 7, direction: "U" },
    ],
  },
  {
    id: "two-string",
    label: "Inside and outside crossings",
    description:
      "Notice whether the pick starts between the strings or outside their pair.",
    steps: [
      { string: 2, fret: 5, direction: "D" },
      { string: 3, fret: 5, direction: "U" },
      { string: 3, fret: 7, direction: "D" },
      { string: 2, fret: 7, direction: "U" },
    ],
  },
  {
    id: "string-skip",
    label: "String skipping",
    description:
      "Clear one unused string with a small, prepared escape rather than a large hop.",
    steps: [
      { string: 1, fret: 5, direction: "D" },
      { string: 3, fret: 5, direction: "U" },
      { string: 1, fret: 7, direction: "D" },
      { string: 3, fret: 7, direction: "U" },
    ],
  },
  {
    id: "legato",
    label: "Picked and legato mix",
    description:
      "The hand continues tracking time while hammer-ons and pull-offs replace selected attacks.",
    steps: [
      { string: 2, fret: 5, direction: "D", technique: "pick" },
      { string: 2, fret: 7, direction: "U", technique: "hammer" },
      { string: 2, fret: 8, direction: "D", technique: "slide" },
      { string: 2, fret: 7, direction: "U", technique: "pull" },
    ],
  },
];

export function PickingVisualizer() {
  const [exerciseId, setExerciseId] = useState(EXERCISES[0].id);
  const [activeIndex, setActiveIndex] = useState(0);
  const [speed, setSpeed] = useState(0.75);
  const [exaggerated, setExaggerated] = useState(false);
  const timer = useRef<number | null>(null);
  const exercise =
    EXERCISES.find((candidate) => candidate.id === exerciseId) ??
    EXERCISES[0];

  function stop() {
    guitarAudioEngine.stop();
    if (timer.current !== null) {
      window.clearInterval(timer.current);
      timer.current = null;
    }
  }

  useEffect(
    () => () => {
      guitarAudioEngine.stop();
      if (timer.current !== null) window.clearInterval(timer.current);
    },
    [],
  );

  function play() {
    stop();
    setActiveIndex(0);
    const milliseconds = 520 / speed;
    void guitarAudioEngine.play({
      kind: "notes",
      midiNotes: exercise.steps.map(
        (step) => 45 + step.string * 5 + step.fret,
      ),
      beatSeconds: milliseconds / 1000,
    });
    let index = 0;
    timer.current = window.setInterval(() => {
      index += 1;
      if (index >= exercise.steps.length) {
        stop();
        setActiveIndex(exercise.steps.length - 1);
        return;
      }
      setActiveIndex(index);
    }, milliseconds);
  }

  const active = exercise.steps[activeIndex];
  const previous = exercise.steps[Math.max(0, activeIndex - 1)];
  const crossing =
    activeIndex > 0
      ? describeStringCrossing(previous, active)
      : "same string";

  return (
    <div className="space-y-5">
      <div className="grid gap-3 md:grid-cols-3">
        <label className="text-xs font-black md:col-span-2">
          Technique sequence
          <select
            className={`${fieldClassName} mt-2`}
            value={exerciseId}
            onChange={(event) => {
              stop();
              setExerciseId(event.target.value);
              setActiveIndex(0);
            }}
          >
            {EXERCISES.map((candidate) => (
              <option key={candidate.id} value={candidate.id}>
                {candidate.label}
              </option>
            ))}
          </select>
        </label>
        <label className="text-xs font-black">
          Animation speed · {speed.toFixed(2)}×
          <input
            className="mt-3 w-full accent-[var(--accent)]"
            type="range"
            min="0.5"
            max="1.5"
            step="0.25"
            value={speed}
            onChange={(event) => {
              stop();
              setSpeed(Number(event.target.value));
            }}
          />
        </label>
      </div>

      <p className="rounded-2xl border border-border bg-surface p-4 text-sm leading-6 text-muted">
        {exercise.description}
      </p>

      <div className="relative overflow-hidden rounded-[22px] border-2 border-border bg-[#0d1117] p-4">
        <div className="absolute right-4 top-4 flex gap-2">
          <Badge variant="accent">
            Pick {active.direction}
          </Badge>
          {activeIndex > 0 && <Badge>{crossing} crossing</Badge>}
        </div>
        <div className="mt-12 space-y-4" aria-label="Animated picking strings">
          {[5, 4, 3, 2, 1, 0].map((string) => (
            <div key={string} className="relative h-5">
              <span className="absolute left-0 top-0 text-[9px] font-black text-muted">
                {6 - string}
              </span>
              <span className="absolute left-7 right-0 top-2 h-px bg-[#e4cfaa]/70" />
              {active.string === string && (
                <span
                  className={`absolute top-[-0.35rem] flex h-7 w-7 items-center justify-center rounded-full border-2 border-white bg-accent text-[10px] font-black text-white transition-all duration-300 ${
                    exaggerated ? "left-[82%]" : "left-[48%]"
                  }`}
                >
                  {active.fret}
                </span>
              )}
            </div>
          ))}
        </div>
        <div className="mt-6 flex items-center justify-center">
          <div
            className={`flex items-center gap-2 rounded-2xl border-2 px-4 py-3 transition ${
              exaggerated
                ? "translate-y-3 rotate-12 border-danger bg-danger/10"
                : "border-accent bg-accent/10"
            }`}
          >
            <Hand className="h-5 w-5" />
            <span className="font-black">
              {active.technique && active.technique !== "pick"
                ? active.technique
                : active.direction === "D"
                  ? "Downstroke ↓"
                  : "Upstroke ↑"}
            </span>
          </div>
        </div>
      </div>

      <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
        {exercise.steps.map((step, index) => {
          const next = exercise.steps[index + 1];
          return (
            <button
              key={`${step.string}-${step.fret}-${index}`}
              type="button"
              onClick={() => {
                stop();
                setActiveIndex(index);
              }}
              className={`rounded-2xl border-2 p-3 text-left ${
                activeIndex === index
                  ? "border-accent bg-accent/10"
                  : "border-border bg-surface"
              }`}
            >
              <span className="text-[10px] font-black uppercase tracking-wide text-muted">
                Step {index + 1}
              </span>
              <span className="mt-1 block font-black">
                String {6 - step.string} · fret {step.fret}
              </span>
              <span className="mt-1 block text-xs text-muted">
                {step.technique && step.technique !== "pick"
                  ? step.technique
                  : step.direction}
                {next
                  ? ` · next ${describeStringCrossing(step, next)}`
                  : " · phrase end"}
              </span>
            </button>
          );
        })}
      </div>

      <div className="flex flex-wrap gap-2">
        <Button type="button" onClick={play}>
          <Play className="h-4 w-4" />
          Animate sequence
        </Button>
        <Button type="button" variant="ghost" onClick={stop}>
          <Pause className="h-4 w-4" />
          Stop
        </Button>
        <Button
          type="button"
          variant={exaggerated ? "destructive" : "secondary"}
          onClick={() => setExaggerated((current) => !current)}
        >
          <AlertTriangle className="h-4 w-4" />
          {exaggerated ? "Show efficient motion" : "Show excessive motion"}
        </Button>
        <Button
          type="button"
          variant="secondary"
          onClick={() => {
            stop();
            setActiveIndex(0);
          }}
        >
          <RotateCcw className="h-4 w-4" />
          First step
        </Button>
      </div>

      <div
        role="status"
        className={`rounded-2xl p-4 text-sm leading-6 ${
          exaggerated
            ? "border border-danger/35 bg-danger/10"
            : "border border-success/30 bg-success/10"
        }`}
      >
        {exaggerated ? (
          <>
            <strong>Why this fails:</strong> deep pick contact and a large
            string-to-string hop increase resistance, timing variation, and
            unwanted string contact.
          </>
        ) : (
          <>
            <strong>Efficient motion:</strong> expose a small pick tip, keep the
            wrist loose, and clear only the distance needed for the next
            string. Down and up attacks should sound equally weighted.
          </>
        )}
      </div>
    </div>
  );
}
