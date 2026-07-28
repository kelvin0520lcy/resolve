"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  Pause,
  Play,
  RotateCcw,
  Sparkles,
  WandSparkles,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { fieldClassName } from "@/components/ui/resolve";
import { guitarAudioEngine } from "@/features/guitar-learning/lib/audio-engine";
import {
  createMultiBeatRhythmGrid,
  createRhythmGrid,
  cycleRhythmState,
  deconstructStrummingPattern,
  describeRhythmChange,
  rhythmCellToSymbol,
  rhythmCountCue,
  transformRhythm,
  type RhythmSubdivision,
  type RhythmTransformation,
} from "@/features/guitar-learning/lib/rhythm";
import type { RhythmCell } from "@/features/guitar-learning/types";
import type { GuitarToolPreset } from "@/features/guitar-learning/data/tool-presets";

const TRANSFORMATIONS: Array<{
  id: RhythmTransformation;
  label: string;
}> = [
  { id: "accent-backbeat", label: "Accent 2 & 4" },
  { id: "add-muted", label: "Add muted strokes" },
  { id: "palm-mute", label: "Palm-mute verse" },
  { id: "add-syncopation", label: "Add syncopation" },
  { id: "simplify", label: "Simplify groove" },
  { id: "open-chorus", label: "Open the chorus" },
];

function initialPattern(subdivision: RhythmSubdivision) {
  if (subdivision === 8) {
    return deconstructStrummingPattern("D D U U D U", 8);
  }
  return createRhythmGrid(subdivision).map((cell) => ({
    ...cell,
    state:
      cell.index % Math.max(1, subdivision / 4) === 0
        ? ("played" as const)
        : cell.state,
  }));
}

function rhythmPreset(
  settings?: GuitarToolPreset["settings"],
): {
  bpm: number;
  beats: number;
  slotsPerBeat: 1 | 2 | 3 | 4;
  subdivision: RhythmSubdivision;
  cells: RhythmCell[];
  chordChanges: string[];
  voiceCount: boolean;
} {
  const requestedSlotsPerBeat =
    typeof settings?.slotsPerBeat === "number"
      ? settings.slotsPerBeat
      : 2;
  const slotsPerBeat = ([1, 2, 3, 4].includes(requestedSlotsPerBeat)
    ? requestedSlotsPerBeat
    : 2) as 1 | 2 | 3 | 4;
  const beats =
    typeof settings?.beats === "number"
      ? Math.max(1, Math.min(16, Math.round(settings.beats)))
      : 4;
  const subdivision = ([4, 8, 12, 16].includes(slotsPerBeat * 4)
    ? slotsPerBeat * 4
    : 8) as RhythmSubdivision;
  const totalSteps = beats * slotsPerBeat;
  const configuredBeatChords = Array.isArray(settings?.beatChords)
    ? settings.beatChords.filter(
        (chord): chord is string => typeof chord === "string",
      )
    : undefined;
  const activeSteps = new Set(
    Array.isArray(settings?.pattern)
      ? settings.pattern.filter(
          (step): step is number =>
            typeof step === "number" && Number.isInteger(step),
        )
      : Array.from({ length: totalSteps }, (_value, index) => index),
  );
  const mutedSteps = new Set(
    Array.isArray(settings?.mutedSteps)
      ? settings.mutedSteps.filter(
          (step): step is number => typeof step === "number",
        )
      : [],
  );
  const accentedSteps = new Set(
    Array.isArray(settings?.accentedSteps)
      ? settings.accentedSteps.filter(
          (step): step is number => typeof step === "number",
        )
      : [0],
  );
  return {
    bpm:
      typeof settings?.bpm === "number"
        ? Math.max(30, Math.min(240, settings.bpm))
        : 84,
    beats,
    slotsPerBeat,
    subdivision,
    cells: createMultiBeatRhythmGrid(beats, slotsPerBeat).map((cell) => ({
      ...cell,
      state: mutedSteps.has(cell.index)
        ? "muted"
        : activeSteps.has(cell.index)
          ? "played"
          : "missed",
      accented: accentedSteps.has(cell.index),
    })),
    chordChanges:
      configuredBeatChords
        ? Array.from(
            { length: beats },
            (_value, index) => configuredBeatChords[index] ?? "",
          )
        : Array.from(
            { length: beats },
            (_value, index) => ["Am", "F", "C", "G"][index % 4],
          ),
    voiceCount: settings?.voiceCount === true,
  };
}

export function RhythmLab({
  presetSettings,
  guided = false,
}: {
  presetSettings?: GuitarToolPreset["settings"];
  guided?: boolean;
}) {
  const preset = rhythmPreset(presetSettings);
  const [bpm, setBpm] = useState(preset.bpm);
  const [beats, setBeats] = useState(preset.beats);
  const [slotsPerBeat, setSlotsPerBeat] = useState(preset.slotsPerBeat);
  const [subdivision, setSubdivision] =
    useState<RhythmSubdivision>(preset.subdivision);
  const [cells, setCells] = useState<RhythmCell[]>(preset.cells);
  const [patternInput, setPatternInput] = useState("D D U U D U");
  const [patternError, setPatternError] = useState("");
  const [transformationNote, setTransformationNote] = useState("");
  const [activeStep, setActiveStep] = useState<number | null>(null);
  const [looping, setLooping] = useState(false);
  const [completedLoops, setCompletedLoops] = useState(0);
  const [chordChanges, setChordChanges] = useState(preset.chordChanges);
  const playbackTimer = useRef<number | null>(null);
  const playbackStep = useRef(0);
  const totalSteps = cells.length;
  const stepsPerBar = slotsPerBeat * 4;
  const bars = Array.from(
    { length: Math.ceil(totalSteps / stepsPerBar) },
    (_value, barIndex) => {
      const startStep = barIndex * stepsPerBar;
      const startBeat = barIndex * 4;
      const barChords = chordChanges
        .slice(startBeat, startBeat + 4)
        .filter((chord, index, all) => chord && all.indexOf(chord) === index);
      return {
        index: barIndex,
        startBeat,
        chords: barChords,
        cells: cells.slice(startStep, startStep + stepsPerBar),
      };
    },
  );

  const audioPattern = useMemo(
    () => ({
      kind: "rhythm" as const,
      subdivisions: subdivision,
      totalSteps,
      activeSteps: cells
        .filter((cell) => cell.state === "played" || cell.state === "muted")
        .map((cell) => cell.index),
      accentedSteps: cells
        .filter((cell) => cell.accented)
        .map((cell) => cell.index),
      mutedSteps: cells
        .filter((cell) => cell.state === "muted" || cell.palmMuted)
        .map((cell) => cell.index),
      bpm,
    }),
    [bpm, cells, subdivision, totalSteps],
  );

  function speakCount(step: number) {
    if (!preset.voiceCount || !("speechSynthesis" in window)) return;
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(
      new SpeechSynthesisUtterance(rhythmCountCue(step, slotsPerBeat)),
    );
  }

  function stopPlayback() {
    guitarAudioEngine.stop();
    if (playbackTimer.current !== null) {
      window.clearInterval(playbackTimer.current);
      playbackTimer.current = null;
    }
    playbackStep.current = 0;
    setActiveStep(null);
    setLooping(false);
  }

  useEffect(() => stopPlayback, []);

  function startPlayback(loop: boolean) {
    stopPlayback();
    setCompletedLoops(0);
    const stepMilliseconds = (60_000 / bpm) * (4 / subdivision);
    playbackStep.current = 0;
    setActiveStep(0);
    speakCount(0);
    void guitarAudioEngine.play(audioPattern);
    setLooping(loop);
    playbackTimer.current = window.setInterval(() => {
      playbackStep.current += 1;
      if (playbackStep.current >= totalSteps) {
        if (!loop) {
          setCompletedLoops(1);
          stopPlayback();
          return;
        }
        setCompletedLoops((current) => current + 1);
        playbackStep.current = 0;
        void guitarAudioEngine.play(audioPattern);
      }
      setActiveStep(playbackStep.current);
      speakCount(playbackStep.current);
    }, stepMilliseconds);
  }

  function changeSubdivision(next: RhythmSubdivision) {
    stopPlayback();
    setBeats(4);
    setSlotsPerBeat((next / 4) as 1 | 2 | 3 | 4);
    setSubdivision(next);
    setCells(initialPattern(next));
    setChordChanges(["Am", "F", "C", "G"]);
    setPatternError("");
    setTransformationNote("");
  }

  function deconstruct() {
    try {
      const next = deconstructStrummingPattern(
        patternInput,
        subdivision,
      );
      stopPlayback();
      setCells(next);
      setPatternError("");
      setTransformationNote(
        "The symbols now sit on a continuous down-up grid. Dashes are timed hand movements, not pauses.",
      );
    } catch (error) {
      setPatternError(
        error instanceof Error
          ? error.message
          : "That pattern does not fit this subdivision.",
      );
    }
  }

  function applyTransformation(transformation: RhythmTransformation) {
    stopPlayback();
    setCells((current) => transformRhythm(current, transformation));
    setTransformationNote(describeRhythmChange(transformation));
  }

  return (
    <div className="space-y-5">
      <div className="grid gap-3 md:grid-cols-[1fr_1fr_1.4fr]">
        <label className="text-xs font-black">
          Tempo · {bpm} BPM
          <input
            className="mt-3 w-full accent-[var(--accent)]"
            type="range"
            min="30"
            max="240"
            value={bpm}
            onChange={(event) => {
              stopPlayback();
              setBpm(Number(event.target.value));
            }}
          />
        </label>
        {guided ? (
          <div className="rounded-xl border border-border bg-surface p-3 text-xs">
            <p className="font-black">
              {slotsPerBeat} timing {slotsPerBeat === 1 ? "position" : "positions"} per beat
            </p>
            <p className="mt-1 text-muted">
              {beats} beats · {preset.voiceCount ? "spoken count cues on" : "visual count cues"}
            </p>
          </div>
        ) : (
          <label className="text-xs font-black">
            Subdivision
            <select
              className={`${fieldClassName} mt-2`}
              value={subdivision}
              onChange={(event) =>
                changeSubdivision(
                  Number(event.target.value) as RhythmSubdivision,
                )
              }
            >
              <option value="4">Quarter notes · 1 2 3 4</option>
              <option value="8">Eighth notes · 1 & 2 &</option>
              <option value="12">Triplets · 1-trip-let</option>
              <option value="16">Sixteenths · 1-e-&-a</option>
            </select>
          </label>
        )}
        <div className="flex flex-wrap items-end gap-2">
          <Button type="button" onClick={() => startPlayback(false)}>
            <Play className="h-4 w-4" />
            Play sequence
          </Button>
          <Button
            type="button"
            variant={looping ? "default" : "secondary"}
            onClick={() => (looping ? stopPlayback() : startPlayback(true))}
          >
            <RotateCcw className="h-4 w-4" />
            {looping ? "Looping" : "Loop sequence"}
          </Button>
          <Button type="button" variant="ghost" onClick={stopPlayback}>
            <Pause className="h-4 w-4" />
            Stop
          </Button>
        </div>
      </div>

      {guided && (
        <p role="status" className="text-xs font-black text-accent">
          Completed loops: {completedLoops}
        </p>
      )}

      <div
        className={`grid gap-3 ${
          bars.length > 1 ? "lg:grid-cols-2" : ""
        }`}
        aria-label={`${totalSteps}-step rhythm grid`}
      >
        {bars.map((bar) => (
          <section
            key={bar.index}
            className="min-w-0 rounded-[22px] border-2 border-border bg-[#100d15] p-3"
            aria-label={`Bar ${bar.index + 1}${
              bar.chords.length ? `, ${bar.chords.join(" to ")}` : ""
            }`}
          >
            <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
              <p className="text-xs font-black uppercase tracking-[0.14em] text-accent">
                Bar {bar.index + 1}
              </p>
              {bar.chords.length > 0 && (
                <Badge variant="warning">
                  Hold {bar.chords.join(" → ")}
                </Badge>
              )}
            </div>
            <div
              data-testid={`rhythm-bar-grid-${bar.index + 1}`}
              className="grid grid-cols-2 gap-2 sm:grid-cols-4"
            >
              {Array.from(
                { length: Math.ceil(bar.cells.length / slotsPerBeat) },
                (_unused, localBeatIndex) => {
                  const beatCells = bar.cells.slice(
                    localBeatIndex * slotsPerBeat,
                    (localBeatIndex + 1) * slotsPerBeat,
                  );
                  const chord =
                    chordChanges[bar.startBeat + localBeatIndex];
                  return (
                    <div
                      key={`beat-${bar.index}-${localBeatIndex}`}
                      data-testid={`rhythm-beat-group-${bar.index + 1}-${localBeatIndex + 1}`}
                      className="min-w-0 rounded-xl border border-border/80 bg-surface-muted/35 p-1.5"
                    >
                      <div className="mb-1 flex min-h-5 items-center justify-between gap-1 px-0.5">
                        <p className="text-[11px] font-black text-muted">
                          Beat {localBeatIndex + 1}
                        </p>
                        {bar.chords.length > 1 && chord && (
                          <span className="truncate text-xs font-black text-warning">
                            {chord}
                          </span>
                        )}
                      </div>
                      <div
                        className="grid gap-1"
                        style={{
                          gridTemplateColumns: `repeat(${slotsPerBeat}, minmax(0, 1fr))`,
                        }}
                      >
                        {beatCells.map((cell) => (
                          <div
                            key={cell.index}
                            className={`min-w-0 rounded-xl border-2 text-center transition ${
                              guided ? "p-1" : "p-1.5 sm:p-2"
                            } ${
                              activeStep === cell.index
                                ? "scale-105 border-warning bg-warning/15"
                                : cell.accented
                                  ? "border-accent bg-accent/10"
                                  : "border-border bg-surface"
                            }`}
                          >
                            <p className="text-xs font-black text-muted">
                              {cell.count}
                            </p>
                            <p className="mt-1 font-bold text-muted">
                              <span className="sr-only">
                                hand {cell.direction}
                              </span>
                              <span aria-hidden="true" className="text-sm">
                                {cell.direction === "D" ? "↓" : "↑"}
                              </span>
                            </p>
                            {guided ? (
                              <div
                                className="mt-2 flex h-10 items-center justify-center rounded-lg border border-border bg-surface-muted text-lg font-black"
                                aria-label={`Step ${cell.index + 1}, ${cell.count}, ${cell.direction}, ${cell.state}`}
                              >
                                {rhythmCellToSymbol(cell)}
                              </div>
                            ) : (
                              <>
                                <button
                                  type="button"
                                  className="mt-2 flex h-11 w-full items-center justify-center rounded-lg border border-border bg-surface-muted text-lg font-black hover:border-accent"
                                  aria-label={`Step ${cell.index + 1}, ${cell.count}, ${cell.direction}, ${cell.state}`}
                                  onClick={() => {
                                    stopPlayback();
                                    setCells((current) =>
                                      current.map((candidate) =>
                                        candidate.index === cell.index
                                          ? {
                                              ...candidate,
                                              state: cycleRhythmState(
                                                candidate.state,
                                              ),
                                            }
                                          : candidate,
                                      ),
                                    );
                                  }}
                                >
                                  {rhythmCellToSymbol(cell)}
                                </button>
                                <label className="mt-2 flex min-w-0 flex-col items-center justify-center gap-0.5 text-[11px] font-bold leading-3">
                                  <input
                                    type="checkbox"
                                    checked={cell.accented}
                                    onChange={(event) => {
                                      stopPlayback();
                                      setCells((current) =>
                                        current.map((candidate) =>
                                          candidate.index === cell.index
                                            ? {
                                                ...candidate,
                                                accented:
                                                  event.target.checked,
                                              }
                                            : candidate,
                                        ),
                                      );
                                    }}
                                  />
                                  Accent
                                </label>
                                <label className="mt-1 flex min-w-0 flex-col items-center justify-center gap-0.5 text-[11px] font-bold leading-3">
                                  <input
                                    type="checkbox"
                                    checked={cell.palmMuted}
                                    onChange={(event) => {
                                      stopPlayback();
                                      setCells((current) =>
                                        current.map((candidate) =>
                                          candidate.index === cell.index
                                            ? {
                                                ...candidate,
                                                palmMuted:
                                                  event.target.checked,
                                              }
                                            : candidate,
                                        ),
                                      );
                                    }}
                                  />
                                  Palm mute
                                </label>
                              </>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                },
              )}
            </div>
          </section>
        ))}
      </div>

      <p className="rounded-2xl border border-accent/25 bg-accent/5 p-4 text-xs leading-5 text-muted">
        <strong className="text-foreground">Four cell states:</strong> played
        stroke → missed hand pass → muted contact → full rest. The hand
        direction stays visible so silence never hides the underlying motion.
      </p>

      {!guided && <div className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-2xl border border-border bg-surface p-4">
          <p className="font-black">Pattern deconstructor</p>
          <p className="mt-1 text-xs leading-5 text-muted">
            Enter familiar D/U shorthand. The lab places each attack on the
            continuous motion that actually creates it.
          </p>
          <label className="mt-4 block text-xs font-black">
            Strumming symbols
            <input
              className={`${fieldClassName} mt-2 font-mono`}
              value={patternInput}
              onChange={(event) => setPatternInput(event.target.value)}
            />
          </label>
          <Button type="button" className="mt-3" onClick={deconstruct}>
            <Sparkles className="h-4 w-4" />
            Place on the grid
          </Button>
          {patternError && (
            <p role="alert" className="mt-3 text-xs leading-5 text-danger">
              {patternError}
            </p>
          )}
        </div>

        <div className="rounded-2xl border border-border bg-surface p-4">
          <p className="font-black">Groove transformation</p>
          <p className="mt-1 text-xs leading-5 text-muted">
            Change one musical variable and keep the original pulse visible.
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            {TRANSFORMATIONS.map((transformation) => (
              <Button
                key={transformation.id}
                type="button"
                size="sm"
                variant="secondary"
                onClick={() => applyTransformation(transformation.id)}
              >
                <WandSparkles className="h-3.5 w-3.5" />
                {transformation.label}
              </Button>
            ))}
          </div>
          {transformationNote && (
            <p role="status" className="mt-4 text-xs leading-5 text-muted">
              {transformationNote}
            </p>
          )}
        </div>
      </div>}

      {!guided && <div className="rounded-2xl border border-border bg-surface p-4">
        <p className="font-black">Chord changes on the groove</p>
        <p className="mt-1 text-xs leading-5 text-muted">
          Label one chord per beat to see where the fretting hand must prepare
          relative to the strumming subdivision.
        </p>
        <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
          {chordChanges.map((chord, index) => (
            <label key={index} className="text-xs font-black">
              Beat {index + 1} chord
              <input
                className={`${fieldClassName} mt-1`}
                value={chord}
                maxLength={8}
                onChange={(event) =>
                  setChordChanges((current) =>
                    current.map((item, itemIndex) =>
                      itemIndex === index ? event.target.value : item,
                    ),
                  )
                }
              />
            </label>
          ))}
        </div>
      </div>}

      <div className="flex flex-wrap gap-2 text-xs font-black uppercase tracking-wide text-muted">
        <Badge>D/U · sounding stroke</Badge>
        <Badge>– · missed pass</Badge>
        <Badge>X · muted stroke</Badge>
        <Badge>R · rest</Badge>
      </div>
    </div>
  );
}
