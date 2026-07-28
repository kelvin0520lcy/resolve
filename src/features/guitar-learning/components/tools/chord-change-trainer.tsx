"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Check, RotateCcw, Timer } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { GuitarLearningState } from "@/features/guitar-learning/types";
import { recordChordChangeBest } from "@/features/guitar-learning/lib/learning-state";

const CHORDS = {
  G: ["3", "2", "0", "0", "0", "3"],
  C: ["X", "3", "2", "0", "1", "0"],
  Am: ["X", "0", "2", "2", "1", "0"],
  E: ["0", "2", "2", "1", "0", "0"],
  D: ["X", "X", "0", "2", "3", "2"],
  Fmaj7: ["X", "X", "3", "2", "1", "0"],
} as const;

type ChordName = keyof typeof CHORDS;

function MiniChord({ name }: { name: ChordName }) {
  return (
    <div className="rounded-2xl border-2 border-border bg-surface p-3 text-center">
      <p className="font-display text-2xl">{name}</p>
      <div className="mx-auto mt-3 grid max-w-48 grid-cols-6 gap-1">
        {CHORDS[name].map((fret, index) => (
          <div key={`${name}-${index}`} className="text-center">
            <span className="text-[10px] font-black">{fret}</span>
            <div className="mt-1 flex h-24 items-center justify-center rounded-md border border-foreground/20 bg-[repeating-linear-gradient(to_bottom,transparent_0,transparent_23%,color-mix(in_srgb,var(--foreground)_20%,transparent)_24%)]">
              {!["0", "X"].includes(fret) && (
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-accent text-xs font-black text-white">
                  {fret}
                </span>
              )}
            </div>
            <span className="mt-1 block text-[9px] text-muted">
              string {6 - index}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

export function ChordChangeTrainer({
  state,
  updateState,
}: {
  state: GuitarLearningState;
  updateState: (
    updater: (current: GuitarLearningState) => GuitarLearningState,
  ) => void;
}) {
  const [first, setFirst] = useState<ChordName>("G");
  const [second, setSecond] = useState<ChordName>("C");
  const [duration, setDuration] = useState(30);
  const [secondsLeft, setSecondsLeft] = useState(30);
  const [running, setRunning] = useState(false);
  const [changes, setChanges] = useState(0);
  const recordedRef = useRef(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | undefined>(
    undefined,
  );
  const pairKey = useMemo(() => `${first}-${second}`.toUpperCase(), [first, second]);
  const best = state.profile.chordChangeBests?.[pairKey] ?? 0;

  useEffect(() => {
    if (!running) return;
    timerRef.current = setInterval(() => {
      setSecondsLeft((current) => {
        if (current > 1) return current - 1;
        setRunning(false);
        return 0;
      });
    }, 1000);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [running]);

  useEffect(() => {
    if (secondsLeft === 0 && !recordedRef.current) {
      recordedRef.current = true;
      updateState((current) =>
        recordChordChangeBest(current, pairKey, changes),
      );
    }
  }, [changes, pairKey, secondsLeft, state, updateState]);

  function reset(nextDuration = duration) {
    if (timerRef.current) clearInterval(timerRef.current);
    setRunning(false);
    setChanges(0);
    setSecondsLeft(nextDuration);
    recordedRef.current = false;
  }

  return (
    <section aria-labelledby="chord-change-title" className="space-y-4">
      <div className="rounded-2xl border-2 border-accent/25 bg-accent/5 p-4">
        <Badge variant="accent">Chord-change trainer</Badge>
        <h2 id="chord-change-title" className="font-display mt-2 text-2xl">
          Count clean changes, not rushed ones
        </h2>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-muted">
          Fret the first chord, strum once, move to the second chord, then
          strum once. Tap “Clean change” only when every intended string rings.
          One direction counts as one change.
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <label className="text-xs font-black">
          First chord
          <select
            className="mt-2 w-full rounded-xl border-2 border-border bg-surface px-3 py-2"
            value={first}
            disabled={running}
            onChange={(event) => {
              setFirst(event.target.value as ChordName);
              reset();
            }}
          >
            {Object.keys(CHORDS).map((name) => <option key={name}>{name}</option>)}
          </select>
        </label>
        <label className="text-xs font-black">
          Second chord
          <select
            className="mt-2 w-full rounded-xl border-2 border-border bg-surface px-3 py-2"
            value={second}
            disabled={running}
            onChange={(event) => {
              setSecond(event.target.value as ChordName);
              reset();
            }}
          >
            {Object.keys(CHORDS).map((name) => <option key={name}>{name}</option>)}
          </select>
        </label>
        <label className="text-xs font-black">
          Timer
          <select
            className="mt-2 w-full rounded-xl border-2 border-border bg-surface px-3 py-2"
            value={duration}
            disabled={running}
            onChange={(event) => {
              const value = Number(event.target.value);
              setDuration(value);
              reset(value);
            }}
          >
            <option value={30}>30 seconds</option>
            <option value={60}>60 seconds</option>
          </select>
        </label>
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        <MiniChord name={first} />
        <MiniChord name={second} />
      </div>

      <div className="rounded-2xl border-2 border-border bg-surface-elevated p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="flex items-center gap-2 text-xs font-black uppercase text-muted">
              <Timer className="h-4 w-4" /> {secondsLeft} seconds
            </p>
            <p className="font-display mt-1 text-4xl">{changes} clean</p>
            <p className="text-xs text-muted">Best for {pairKey}: {best}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button type="button" variant="secondary" onClick={() => reset()}>
              <RotateCcw className="h-4 w-4" /> Reset
            </Button>
            {!running && secondsLeft > 0 ? (
              <Button type="button" onClick={() => setRunning(true)}>
                Start timer
              </Button>
            ) : (
              <Button
                type="button"
                disabled={!running}
                onClick={() => setChanges((current) => current + 1)}
              >
                <Check className="h-4 w-4" /> Clean change
              </Button>
            )}
          </div>
        </div>
        <p className="mt-3 text-xs leading-5 text-muted">
          Diagnostic: if one finger always arrives late, move that finger
          first for five slow changes. If several fingers move separately,
          rehearse the shape in the air and land them together.
        </p>
      </div>
    </section>
  );
}
