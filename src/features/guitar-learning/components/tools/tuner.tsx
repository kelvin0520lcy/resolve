"use client";

import { useEffect, useRef, useState } from "react";
import { Mic, MicOff, ShieldCheck, Volume2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { fieldClassName } from "@/components/ui/resolve";
import type { GuitarToolPreset } from "@/features/guitar-learning/data/tool-presets";
import { guitarAudioEngine } from "@/features/guitar-learning/lib/audio-engine";
import { midiToFrequency } from "@/features/guitar-learning/lib/music-theory";

const STRINGS = [
  { label: "6 · low E", note: "E2", midi: 40, frequency: 82.41 },
  { label: "5 · A", note: "A2", midi: 45, frequency: 110 },
  { label: "4 · D", note: "D3", midi: 50, frequency: 146.83 },
  { label: "3 · G", note: "G3", midi: 55, frequency: 196 },
  { label: "2 · B", note: "B3", midi: 59, frequency: 246.94 },
  { label: "1 · high E", note: "E4", midi: 64, frequency: 329.63 },
] as const;

type TunerMode =
  | "standard"
  | "chromatic"
  | "target"
  | "bend-target"
  | "alternate";

const NOTE_NAMES = [
  "C",
  "C♯",
  "D",
  "E♭",
  "E",
  "F",
  "F♯",
  "G",
  "A♭",
  "A",
  "B♭",
  "B",
] as const;

function noteName(midi: number) {
  return `${NOTE_NAMES[((midi % 12) + 12) % 12]}${Math.floor(midi / 12) - 1}`;
}

function targetFromMidi(midi: number, label = noteName(midi)) {
  return {
    label,
    note: noteName(midi),
    midi,
    frequency: midiToFrequency(midi),
  };
}

const ALTERNATE_TUNINGS = {
  "drop-d": [38, 45, 50, 55, 59, 64],
  "half-step-down": [39, 44, 49, 54, 58, 63],
  "open-g": [38, 43, 50, 55, 59, 62],
} as const;

function detectPitch(buffer: Float32Array, sampleRate: number) {
  let rms = 0;
  for (const value of buffer) rms += value * value;
  rms = Math.sqrt(rms / buffer.length);
  if (rms < 0.015) return undefined;

  let bestOffset = -1;
  let bestCorrelation = 0;
  const minimumOffset = Math.floor(sampleRate / 1_000);
  const maximumOffset = Math.min(
    Math.floor(sampleRate / 55),
    Math.floor(buffer.length / 2),
  );
  for (let offset = minimumOffset; offset <= maximumOffset; offset += 1) {
    let correlation = 0;
    for (let index = 0; index < buffer.length - offset; index += 1) {
      correlation +=
        1 - Math.abs(buffer[index] - buffer[index + offset]);
    }
    correlation /= buffer.length - offset;
    if (correlation > bestCorrelation) {
      bestCorrelation = correlation;
      bestOffset = offset;
    }
  }
  return bestOffset > 0 && bestCorrelation > 0.75
    ? sampleRate / bestOffset
    : undefined;
}

function nearestTarget(
  frequency: number,
  targets: ReadonlyArray<{
    label: string;
    note: string;
    midi: number;
    frequency: number;
  }>,
) {
  return targets.map((target) => {
    const cents = 1200 * Math.log2(frequency / target.frequency);
    return { ...target, cents };
  }).sort((left, right) => Math.abs(left.cents) - Math.abs(right.cents))[0];
}

export function GuitarTuner({
  presetSettings,
}: {
  presetSettings?: GuitarToolPreset["settings"];
}) {
  const initialMode =
    presetSettings?.mode === "bend-target"
      ? "bend-target"
      : ("standard" as TunerMode);
  const [mode, setMode] = useState<TunerMode>(initialMode);
  const [targetMidi, setTargetMidi] = useState(
    typeof presetSettings?.targetMidi === "number"
      ? presetSettings.targetMidi
      : 69,
  );
  const [sourceMidi, setSourceMidi] = useState(
    typeof presetSettings?.sourceMidi === "number"
      ? presetSettings.sourceMidi
      : 67,
  );
  const [alternateTuning, setAlternateTuning] =
    useState<keyof typeof ALTERNATE_TUNINGS>("drop-d");
  const [listening, setListening] = useState(false);
  const [error, setError] = useState("");
  const [frequency, setFrequency] = useState<number>();
  const [stableFrames, setStableFrames] = useState(0);
  const streamRef = useRef<MediaStream | undefined>(undefined);
  const contextRef = useRef<AudioContext | undefined>(undefined);
  const animationRef = useRef<number | undefined>(undefined);
  const targets =
    mode === "standard"
      ? [...STRINGS]
      : mode === "alternate"
        ? ALTERNATE_TUNINGS[alternateTuning].map((midi, index) =>
            targetFromMidi(midi, `${6 - index} · ${noteName(midi)}`),
          )
        : mode === "chromatic" && frequency
          ? [
              targetFromMidi(
                Math.round(69 + 12 * Math.log2(frequency / 440)),
              ),
            ]
          : [targetFromMidi(targetMidi)];
  const current = frequency ? nearestTarget(frequency, targets) : undefined;
  const centred = current ? Math.abs(current.cents) <= 5 : false;

  function stopListening() {
    if (animationRef.current) cancelAnimationFrame(animationRef.current);
    streamRef.current?.getTracks().forEach((track) => track.stop());
    void contextRef.current?.close();
    streamRef.current = undefined;
    contextRef.current = undefined;
    setListening(false);
    setFrequency(undefined);
    setStableFrames(0);
  }

  useEffect(() => stopListening, []);

  async function startListening() {
    if (!navigator.mediaDevices?.getUserMedia) {
      setError(
        "Microphone tuning is unavailable here. Use the reference-tone buttons below.",
      );
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: false,
          noiseSuppression: false,
          autoGainControl: false,
        },
      });
      const context = new AudioContext();
      const source = context.createMediaStreamSource(stream);
      const analyser = context.createAnalyser();
      analyser.fftSize = 4096;
      source.connect(analyser);
      const buffer = new Float32Array(analyser.fftSize);
      streamRef.current = stream;
      contextRef.current = context;
      setError("");
      setListening(true);
      const update = () => {
        analyser.getFloatTimeDomainData(buffer);
        const pitch = detectPitch(buffer, context.sampleRate);
        setFrequency(pitch);
        if (pitch) {
          const activeTargets =
            mode === "standard"
              ? [...STRINGS]
              : mode === "alternate"
                ? ALTERNATE_TUNINGS[alternateTuning].map((midi, index) =>
                    targetFromMidi(midi, `${6 - index} · ${noteName(midi)}`),
                  )
                : mode === "chromatic"
                  ? [
                      targetFromMidi(
                        Math.round(69 + 12 * Math.log2(pitch / 440)),
                      ),
                    ]
                  : [targetFromMidi(targetMidi)];
          const nearest = nearestTarget(pitch, activeTargets);
          setStableFrames((frames) =>
            Math.abs(nearest.cents) <= 5 ? Math.min(frames + 1, 60) : 0,
          );
        } else {
          setStableFrames(0);
        }
        animationRef.current = requestAnimationFrame(update);
      };
      update();
    } catch {
      stopListening();
      setError(
        "Microphone access was not available. No recording is stored or uploaded; you can still use reference tones.",
      );
    }
  }

  const title =
    mode === "standard"
      ? "Tune E A D G B E, one string at a time"
      : mode === "chromatic"
        ? "Identify and centre any guitar note"
        : mode === "bend-target"
          ? `Bend ${noteName(sourceMidi)} up to ${noteName(targetMidi)}`
          : mode === "alternate"
            ? "Tune every string to the selected alternate tuning"
            : `Match the selected target: ${noteName(targetMidi)}`;

  return (
    <section aria-labelledby="tuner-title" className="space-y-4">
      <div className="rounded-2xl border-2 border-accent/25 bg-accent/5 p-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <Badge variant="accent">Guided tuner</Badge>
            <h2 id="tuner-title" className="font-display mt-2 text-2xl">
              {title}
            </h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-muted">
              {mode === "bend-target"
                ? "Play the target reference first. Then fret the source note and bend slowly until the indicator reaches the centre."
                : "Play one note at a time. Adjust slowly until the indicator reaches the centre and holds there."}
            </p>
          </div>
          <Button
            type="button"
            variant={listening ? "destructive" : "default"}
            onClick={() =>
              listening ? stopListening() : void startListening()
            }
          >
            {listening ? (
              <MicOff className="h-4 w-4" />
            ) : (
              <Mic className="h-4 w-4" />
            )}
            {listening ? "Stop listening" : "Use microphone"}
          </Button>
        </div>
        <p className="mt-3 flex items-start gap-2 text-xs leading-5 text-muted">
          <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-success" />
          Audio is analysed live in this browser. Resolve does not upload or
          save microphone audio. Your browser will ask permission first.
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <label className="text-xs font-black">
          Tuner mode
          <select
            className={`${fieldClassName} mt-2`}
            value={mode}
            onChange={(event) => {
              stopListening();
              const nextMode = event.target.value as TunerMode;
              if (nextMode === "bend-target" && sourceMidi >= targetMidi) {
                setSourceMidi(Math.max(40, targetMidi - 2));
              }
              setMode(nextMode);
            }}
          >
            <option value="standard">Standard tuning</option>
            <option value="chromatic">Chromatic · any note</option>
            <option value="target">Selected target note</option>
            <option value="bend-target">Bend target</option>
            <option value="alternate">Alternate tuning</option>
          </select>
        </label>
        {(mode === "target" || mode === "bend-target") && (
          <label className="text-xs font-black">
            Target note
            <select
              className={`${fieldClassName} mt-2`}
              value={targetMidi}
              onChange={(event) => {
                stopListening();
                const nextTarget = Number(event.target.value);
                setTargetMidi(nextTarget);
                if (sourceMidi >= nextTarget) {
                  setSourceMidi(Math.max(40, nextTarget - 2));
                }
              }}
            >
              {Array.from({ length: 37 }, (_value, index) => 40 + index).map(
                (midi) => (
                  <option key={midi} value={midi}>
                    {noteName(midi)}
                  </option>
                ),
              )}
            </select>
          </label>
        )}
        {mode === "bend-target" && (
          <label className="text-xs font-black">
            Bend from
            <select
              className={`${fieldClassName} mt-2`}
              value={sourceMidi}
              onChange={(event) => {
                stopListening();
                setSourceMidi(Number(event.target.value));
              }}
            >
              {Array.from({ length: 36 }, (_value, index) => 40 + index)
                .filter((midi) => midi < targetMidi)
                .map((midi) => (
                  <option key={midi} value={midi}>
                    {noteName(midi)}
                  </option>
                ))}
            </select>
          </label>
        )}
        {mode === "alternate" && (
          <label className="text-xs font-black">
            Alternate tuning
            <select
              className={`${fieldClassName} mt-2`}
              value={alternateTuning}
              onChange={(event) => {
                stopListening();
                setAlternateTuning(
                  event.target.value as keyof typeof ALTERNATE_TUNINGS,
                );
              }}
            >
              <option value="drop-d">Drop D · D A D G B E</option>
              <option value="half-step-down">
                Half-step down · E♭ A♭ D♭ G♭ B♭ E♭
              </option>
              <option value="open-g">Open G · D G D G B D</option>
            </select>
          </label>
        )}
      </div>

      <div
        className="rounded-[24px] border-2 border-border bg-surface p-5 text-center"
        aria-live="polite"
      >
        <p className="text-[10px] font-black uppercase tracking-[0.18em] text-muted">
          {listening ? `Listening in ${mode.replace("-", " ")} mode` : "Microphone is off"}
        </p>
        <p className="font-display mt-2 text-5xl">
          {current?.note ?? "—"}
        </p>
        <p className="mt-2 text-sm font-black">
          {!current
            ? "Play one string and let it ring"
            : centred
              ? stableFrames >= 15
                ? "In tune · stable"
                : "Centred · hold it"
              : current.cents < 0
                ? "Too low · raise the pitch slowly"
                : "Too high · lower the pitch slowly"}
        </p>
        <div className="mx-auto mt-5 max-w-xl">
          <div className="relative h-4 rounded-full bg-surface-muted">
            <span className="absolute left-1/2 top-[-0.35rem] h-7 w-0.5 bg-success" />
            {current && (
              <span
                className={`absolute top-0 h-4 w-4 -translate-x-1/2 rounded-full ${
                  centred ? "bg-success" : "bg-warning"
                }`}
                style={{
                  left: `${Math.max(0, Math.min(100, 50 + current.cents))}%`,
                }}
              />
            )}
          </div>
          <div className="mt-2 flex justify-between text-[10px] font-bold text-muted">
            <span>Lower</span>
            <span>{current ? `${Math.round(current.cents)} cents` : "Centre"}</span>
            <span>Higher</span>
          </div>
        </div>
        {frequency && (
          <p className="mt-3 text-[10px] text-muted">
            {frequency.toFixed(1)} Hz · target {current?.label}
          </p>
        )}
      </div>

      {error && (
        <p role="status" className="rounded-xl border border-warning/30 bg-warning/10 p-3 text-xs leading-5">
          {error}
        </p>
      )}

      <div>
        <p className="text-xs font-black uppercase tracking-wide text-muted">
          Manual reference tones
        </p>
        <p className="mt-1 text-xs leading-5 text-muted">
          Lower your device volume first. Match one string at a time by ear
          when microphone access is unavailable.
        </p>
        <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-6">
          {targets.map((string) => (
            <Button
              key={string.note}
              type="button"
              variant="secondary"
              onClick={() =>
                void guitarAudioEngine.play({
                  kind: "notes",
                  midiNotes: [string.midi],
                  beatSeconds: 1.2,
                })
              }
            >
              <Volume2 className="h-3.5 w-3.5" />
              {string.label}
            </Button>
          ))}
        </div>
      </div>
    </section>
  );
}
