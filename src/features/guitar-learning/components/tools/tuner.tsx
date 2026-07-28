"use client";

import { useEffect, useRef, useState } from "react";
import { Mic, MicOff, ShieldCheck, Volume2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { guitarAudioEngine } from "@/features/guitar-learning/lib/audio-engine";

const STRINGS = [
  { label: "6 · low E", note: "E2", midi: 40, frequency: 82.41 },
  { label: "5 · A", note: "A2", midi: 45, frequency: 110 },
  { label: "4 · D", note: "D3", midi: 50, frequency: 146.83 },
  { label: "3 · G", note: "G3", midi: 55, frequency: 196 },
  { label: "2 · B", note: "B3", midi: 59, frequency: 246.94 },
  { label: "1 · high E", note: "E4", midi: 64, frequency: 329.63 },
] as const;

function detectPitch(buffer: Float32Array, sampleRate: number) {
  let rms = 0;
  for (const value of buffer) rms += value * value;
  rms = Math.sqrt(rms / buffer.length);
  if (rms < 0.015) return undefined;

  let bestOffset = -1;
  let bestCorrelation = 0;
  const minimumOffset = Math.floor(sampleRate / 380);
  const maximumOffset = Math.min(
    Math.floor(sampleRate / 70),
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

function nearestString(frequency: number) {
  return STRINGS.map((string) => {
    const cents = 1200 * Math.log2(frequency / string.frequency);
    return { ...string, cents };
  }).sort((left, right) => Math.abs(left.cents) - Math.abs(right.cents))[0];
}

export function GuitarTuner() {
  const [listening, setListening] = useState(false);
  const [error, setError] = useState("");
  const [frequency, setFrequency] = useState<number>();
  const [stableFrames, setStableFrames] = useState(0);
  const streamRef = useRef<MediaStream | undefined>(undefined);
  const contextRef = useRef<AudioContext | undefined>(undefined);
  const animationRef = useRef<number | undefined>(undefined);
  const current = frequency ? nearestString(frequency) : undefined;
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
          const nearest = nearestString(pitch);
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

  return (
    <section aria-labelledby="tuner-title" className="space-y-4">
      <div className="rounded-2xl border-2 border-accent/25 bg-accent/5 p-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <Badge variant="accent">Guided tuner</Badge>
            <h2 id="tuner-title" className="font-display mt-2 text-2xl">
              Tune E A D G B E, one string at a time
            </h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-muted">
              Play one open string. Move the tuning peg slowly until the
              indicator reaches the centre. Mute the other five strings.
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

      <div
        className="rounded-[24px] border-2 border-border bg-surface p-5 text-center"
        aria-live="polite"
      >
        <p className="text-[10px] font-black uppercase tracking-[0.18em] text-muted">
          {listening ? "Listening for one open string" : "Microphone is off"}
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
            {frequency.toFixed(1)} Hz · closest string {current?.label}
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
          {STRINGS.map((string) => (
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
