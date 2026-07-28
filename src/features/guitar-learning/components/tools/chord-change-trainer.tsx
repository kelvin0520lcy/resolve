"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Check, RotateCcw, Timer } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { GuitarLearningState } from "@/features/guitar-learning/types";
import type { GuitarToolPreset } from "@/features/guitar-learning/data/tool-presets";
import { recordChordChangeBest } from "@/features/guitar-learning/lib/learning-state";

const CHORDS = {
  G: {
    frets: ["3", "2", "0", "0", "0", "3"],
    fingers: [2, 1, 0, 0, 0, 3],
    rootStrings: [0, 5],
  },
  C: {
    frets: ["X", "3", "2", "0", "1", "0"],
    fingers: [0, 3, 2, 0, 1, 0],
    rootStrings: [1],
  },
  Am: {
    frets: ["X", "0", "2", "2", "1", "0"],
    fingers: [0, 0, 2, 3, 1, 0],
    rootStrings: [1],
  },
  E: {
    frets: ["0", "2", "2", "1", "0", "0"],
    fingers: [0, 2, 3, 1, 0, 0],
    rootStrings: [0, 5],
  },
  D: {
    frets: ["X", "X", "0", "2", "3", "2"],
    fingers: [0, 0, 0, 1, 3, 2],
    rootStrings: [2],
  },
  Fmaj7: {
    frets: ["X", "X", "3", "2", "1", "0"],
    fingers: [0, 0, 3, 2, 1, 0],
    rootStrings: [2],
  },
} as const;

type ChordName = keyof typeof CHORDS;

function MiniChord({
  name,
  sharedStrings,
}: {
  name: ChordName;
  sharedStrings: Set<number>;
}) {
  const chord = CHORDS[name];
  return (
    <div className="rounded-2xl border-2 border-border bg-surface p-3 text-center">
      <p className="font-display text-2xl">{name}</p>
      <div
        className="mx-auto mt-3 grid max-w-56 grid-cols-6"
        aria-label={`${name} chord diagram`}
      >
        {chord.frets.map((fret, index) => {
          const numericFret = Number(fret);
          const root = chord.rootStrings.includes(index as never);
          const shared = sharedStrings.has(index);
          return (
            <div key={`${name}-${index}`} className="text-center">
              <span className="text-xs font-black">
                {fret === "X" ? "×" : fret === "0" ? "○" : " "}
              </span>
              <div className="relative mt-1 h-32 border-y-2 border-foreground/35 bg-[repeating-linear-gradient(to_bottom,transparent_0,transparent_calc(25%-1px),color-mix(in_srgb,var(--foreground)_24%,transparent)_25%)]">
                <span className="absolute bottom-0 left-1/2 top-0 w-px bg-foreground/45" />
                {Number.isFinite(numericFret) && numericFret > 0 && (
                  <span
                    className={`absolute left-1/2 flex h-7 w-7 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border-2 text-xs font-black text-white ${
                      shared
                        ? "border-white bg-success ring-2 ring-success/30"
                        : root
                          ? "border-white bg-warning text-[#18121f]"
                          : "border-white bg-accent"
                    }`}
                    style={{ top: `${(numericFret - 0.5) * 25}%` }}
                    aria-label={`String ${6 - index}, fret ${numericFret}, finger ${chord.fingers[index]}${root ? ", root note" : ""}${shared ? ", shared position" : ""}`}
                  >
                    {chord.fingers[index]}
                  </span>
                )}
              </div>
              <span className="mt-1 block text-[9px] text-muted">
                {6 - index}
              </span>
            </div>
          );
        })}
      </div>
      <p className="mt-2 text-[10px] text-muted">
        ○ open · × mute · number inside dot = finger
      </p>
    </div>
  );
}

export function ChordChangeTrainer({
  state,
  updateState,
  presetSettings,
}: {
  state: GuitarLearningState;
  updateState: (
    updater: (current: GuitarLearningState) => GuitarLearningState,
  ) => void;
  presetSettings?: GuitarToolPreset["settings"];
}) {
  const initialFirst =
    typeof presetSettings?.chordA === "string" &&
    presetSettings.chordA in CHORDS
      ? (presetSettings.chordA as ChordName)
      : "G";
  const initialSecond =
    typeof presetSettings?.chordB === "string" &&
    presetSettings.chordB in CHORDS &&
    presetSettings.chordB !== initialFirst
      ? (presetSettings.chordB as ChordName)
      : (Object.keys(CHORDS).find(
          (name) => name !== initialFirst,
        ) as ChordName);
  const initialDuration =
    presetSettings?.seconds === 60 ? 60 : 30;
  const [first, setFirst] = useState<ChordName>(initialFirst);
  const [second, setSecond] = useState<ChordName>(initialSecond);
  const [duration, setDuration] = useState(initialDuration);
  const [secondsLeft, setSecondsLeft] = useState(initialDuration);
  const [running, setRunning] = useState(false);
  const [changes, setChanges] = useState(0);
  const recordedRef = useRef(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | undefined>(
    undefined,
  );
  const pairKey = useMemo(() => `${first}-${second}`.toUpperCase(), [first, second]);
  const best = state.profile.chordChangeBests?.[pairKey] ?? 0;
  const sharedStrings = useMemo(
    () =>
      new Set(
        CHORDS[first].frets.flatMap((fret, index) =>
          fret !== "X" &&
          fret !== "0" &&
          fret === CHORDS[second].frets[index] &&
          CHORDS[first].fingers[index] === CHORDS[second].fingers[index]
            ? [index]
            : [],
        ),
      ),
    [first, second],
  );
  const movementSummary = CHORDS[first].frets
    .map((fret, index) => {
      const next = CHORDS[second].frets[index];
      if (fret === next) return undefined;
      return `S${6 - index}: ${fret} → ${next}`;
    })
    .filter(Boolean)
    .join(" · ");

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
            {Object.keys(CHORDS)
              .filter((name) => name !== second)
              .map((name) => <option key={name}>{name}</option>)}
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
            {Object.keys(CHORDS)
              .filter((name) => name !== first)
              .map((name) => <option key={name}>{name}</option>)}
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
        <MiniChord name={first} sharedStrings={sharedStrings} />
        <MiniChord name={second} sharedStrings={sharedStrings} />
      </div>

      <div className="rounded-2xl border border-border bg-surface-muted/45 p-4 text-xs leading-5">
        <p>
          <strong className="text-success">Shared anchor:</strong>{" "}
          {sharedStrings.size > 0
            ? [...sharedStrings]
                .map((index) => `string ${6 - index}`)
                .join(", ")
            : "No finger stays in exactly the same position—prepare the destination shape in the air."}
        </p>
        <p className="mt-2">
          <strong>Movement map:</strong> {movementSummary}
        </p>
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
