"use client";

import { useEffect, useRef, useState } from "react";
import {
  AudioLines,
  Gauge,
  Pause,
  Play,
  RotateCcw,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { fieldClassName } from "@/components/ui/resolve";
import { guitarAudioEngine } from "@/features/guitar-learning/lib/audio-engine";
import {
  buildChord,
  CHROMATIC_NOTES,
  getNoteIndex,
} from "@/features/guitar-learning/lib/music-theory";

function MetronomeTool() {
  const [bpm, setBpm] = useState(84);
  const [subdivision, setSubdivision] = useState<1 | 2 | 4>(1);
  const [accentBeat, setAccentBeat] = useState(1);
  const [playing, setPlaying] = useState(false);
  const [activeStep, setActiveStep] = useState(0);
  const [tapTimes, setTapTimes] = useState<number[]>([]);
  const timer = useRef<number | null>(null);

  function stop() {
    guitarAudioEngine.stop();
    if (timer.current !== null) {
      window.clearInterval(timer.current);
      timer.current = null;
    }
    setPlaying(false);
    setActiveStep(0);
  }

  useEffect(
    () => () => {
      guitarAudioEngine.stop();
      if (timer.current !== null) window.clearInterval(timer.current);
    },
    [],
  );

  function playBar() {
    const totalSteps = (subdivision * 4) as 4 | 8 | 16;
    void guitarAudioEngine.play({
      kind: "rhythm",
      subdivisions: totalSteps,
      activeSteps: Array.from({ length: totalSteps }, (_value, index) => index),
      accentedSteps: [(accentBeat - 1) * subdivision],
      bpm,
    });
  }

  function start() {
    stop();
    setPlaying(true);
    playBar();
    const stepMs = 60_000 / bpm / subdivision;
    let step = 0;
    timer.current = window.setInterval(() => {
      step = (step + 1) % (subdivision * 4);
      setActiveStep(step);
      if (step === 0) playBar();
    }, stepMs);
  }

  function tapTempo() {
    const now = performance.now();
    const recent = [...tapTimes.filter((time) => now - time < 3_000), now]
      .slice(-5);
    setTapTimes(recent);
    if (recent.length < 2) return;
    const intervals = recent
      .slice(1)
      .map((time, index) => time - recent[index]);
    const average =
      intervals.reduce((sum, interval) => sum + interval, 0) /
      intervals.length;
    setBpm(Math.max(30, Math.min(240, Math.round(60_000 / average))));
  }

  return (
    <div className="space-y-5">
      <div className="grid gap-4 md:grid-cols-3">
        <label className="text-xs font-black">
          Tempo · {bpm} BPM
          <input
            className="mt-4 w-full accent-[var(--accent)]"
            type="range"
            min="30"
            max="240"
            value={bpm}
            onChange={(event) => {
              setBpm(Number(event.target.value));
              if (playing) stop();
            }}
          />
        </label>
        <label className="text-xs font-black">
          Muted-string subdivision
          <select
            className={`${fieldClassName} mt-2`}
            value={subdivision}
            onChange={(event) => {
              setSubdivision(Number(event.target.value) as 1 | 2 | 4);
              if (playing) stop();
            }}
          >
            <option value="1">Quarter notes</option>
            <option value="2">Eighth notes</option>
            <option value="4">Sixteenth notes</option>
          </select>
        </label>
        <label className="text-xs font-black">
          Accented beat
          <select
            className={`${fieldClassName} mt-2`}
            value={accentBeat}
            onChange={(event) => {
              setAccentBeat(Number(event.target.value));
              if (playing) stop();
            }}
          >
            {[1, 2, 3, 4].map((beat) => (
              <option key={beat}>{beat}</option>
            ))}
          </select>
        </label>
      </div>

      <div className="rounded-[22px] border-2 border-border bg-[#100d15] p-5">
        <div
          className="grid gap-2"
          style={{
            gridTemplateColumns: `repeat(${subdivision * 4}, minmax(0, 1fr))`,
          }}
          aria-label="Metronome pulse display"
        >
          {Array.from(
            { length: subdivision * 4 },
            (_value, index) => (
              <div
                key={index}
                className={`aspect-square rounded-full border-2 transition ${
                  activeStep === index && playing
                    ? "scale-110 border-warning bg-warning shadow-[0_0_22px_var(--warning)]"
                    : index % subdivision === 0
                      ? "border-accent/60 bg-accent/20"
                      : "border-border bg-surface-muted"
                }`}
                aria-label={`Beat ${Math.floor(index / subdivision) + 1}${
                  index % subdivision
                    ? ` subdivision ${index % subdivision + 1}`
                    : ""
                }`}
              />
            ),
          )}
        </div>
        <div className="mt-5 flex flex-wrap gap-2">
          <Button type="button" onClick={playing ? stop : start}>
            {playing ? (
              <Pause className="h-4 w-4" />
            ) : (
              <Play className="h-4 w-4" />
            )}
            {playing ? "Stop metronome" : "Start metronome"}
          </Button>
          <Button type="button" variant="secondary" onClick={tapTempo}>
            <Gauge className="h-4 w-4" />
            Tap tempo
          </Button>
          <Button
            type="button"
            variant="ghost"
            onClick={() => {
              stop();
              setBpm(84);
              setTapTimes([]);
            }}
          >
            <RotateCcw className="h-4 w-4" />
            Reset 84 BPM
          </Button>
        </div>
      </div>

      <p className="rounded-2xl border border-border bg-surface p-4 text-xs leading-5 text-muted">
        The bar’s muted guitar-string ticks are scheduled against Web Audio
        time, while the circles provide a visual count. Restart after changing
        tempo so the displayed pulse and newly scheduled bar remain aligned.
      </p>
    </div>
  );
}

function DroneTool() {
  const [root, setRoot] = useState("A");
  const [quality, setQuality] =
    useState<"single" | "power" | "major" | "minor">("single");
  const [octave, setOctave] = useState(3);
  const [looping, setLooping] = useState(false);
  const timer = useRef<number | null>(null);

  function notes() {
    const names =
      quality === "single" ? [root] : buildChord(root, quality);
    return names.map(
      (note) => (octave + 1) * 12 + getNoteIndex(note),
    );
  }

  function playDrone() {
    void guitarAudioEngine.play({
      kind: "chord",
      midiNotes: notes(),
      durationSeconds: 3.8,
    });
  }

  function stop() {
    guitarAudioEngine.stop();
    if (timer.current !== null) {
      window.clearInterval(timer.current);
      timer.current = null;
    }
    setLooping(false);
  }

  useEffect(
    () => () => {
      guitarAudioEngine.stop();
      if (timer.current !== null) window.clearInterval(timer.current);
    },
    [],
  );

  function toggleLoop() {
    if (looping) {
      stop();
      return;
    }
    playDrone();
    setLooping(true);
    timer.current = window.setInterval(playDrone, 3_700);
  }

  return (
    <div className="space-y-5">
      <div className="grid gap-3 md:grid-cols-3">
        <label className="text-xs font-black">
          Drone root
          <select
            className={`${fieldClassName} mt-2`}
            value={root}
            onChange={(event) => {
              stop();
              setRoot(event.target.value);
            }}
          >
            {CHROMATIC_NOTES.map((note) => (
              <option key={note}>{note}</option>
            ))}
          </select>
        </label>
        <label className="text-xs font-black">
          Harmonic context
          <select
            className={`${fieldClassName} mt-2`}
            value={quality}
            onChange={(event) => {
              stop();
              setQuality(
                event.target.value as
                  | "single"
                  | "power"
                  | "major"
                  | "minor",
              );
            }}
          >
            <option value="single">Single root</option>
            <option value="power">Root + fifth</option>
            <option value="major">Major triad</option>
            <option value="minor">Minor triad</option>
          </select>
        </label>
        <label className="text-xs font-black">
          Register
          <select
            className={`${fieldClassName} mt-2`}
            value={octave}
            onChange={(event) => {
              stop();
              setOctave(Number(event.target.value));
            }}
          >
            <option value="2">Low · octave 2</option>
            <option value="3">Middle · octave 3</option>
            <option value="4">High · octave 4</option>
          </select>
        </label>
      </div>

      <div className="manga-panel rounded-[22px] p-5 sm:p-7">
        <Badge variant="accent">Tonal-centre station</Badge>
        <h3 className="font-display mt-3 text-5xl text-[#18121f]">
          {root}
        </h3>
        <p className="mt-2 text-sm font-semibold text-[#5d5267]">
          {quality === "single"
            ? "Pure root reference"
            : `${quality} harmonic context`}{" "}
          · octave {octave}
        </p>
        <div className="mt-5 flex flex-wrap gap-2">
          <Button type="button" onClick={playDrone}>
            <AudioLines className="h-4 w-4" />
            Sound 4-second drone
          </Button>
          <Button
            type="button"
            variant={looping ? "default" : "secondary"}
            onClick={toggleLoop}
          >
            <RotateCcw className="h-4 w-4" />
            {looping ? "Stop looping" : "Loop drone"}
          </Button>
          <Button type="button" variant="ghost" onClick={stop}>
            <Pause className="h-4 w-4" />
            Stop sound
          </Button>
        </div>
      </div>

      <div className="grid gap-3 md:grid-cols-3">
        {[
          [
            "Scale intonation",
            `Play each ${root} scale tone slowly and hear how stable or tense it feels against the drone.`,
          ],
          [
            "Bend targeting",
            `Play the target note first, bend from below, and stop only when the two pitches agree.`,
          ],
          [
            "Phrase endings",
            `End one phrase on ${root} and another away from it; compare closure without changing volume.`,
          ],
        ].map(([title, body]) => (
          <div
            key={title}
            className="rounded-2xl border border-border bg-surface p-4"
          >
            <p className="font-black">{title}</p>
            <p className="mt-2 text-xs leading-5 text-muted">{body}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export function PracticeAudioTools({
  mode,
}: {
  mode: "metronome" | "drone";
}) {
  return mode === "metronome" ? <MetronomeTool /> : <DroneTool />;
}
