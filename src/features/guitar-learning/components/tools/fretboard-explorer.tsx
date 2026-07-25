"use client";

import { useMemo, useState } from "react";
import { Ear, Eye, EyeOff, RotateCcw, Volume2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { fieldClassName } from "@/components/ui/resolve";
import { guitarAudioEngine } from "@/features/guitar-learning/lib/audio-engine";
import {
  buildChord,
  buildScale,
  CHROMATIC_NOTES,
  generateFretboard,
  getIntervalName,
  parsePitchedNote,
  STANDARD_TUNING,
  TUNINGS,
  type ChordQuality,
  type ScaleType,
} from "@/features/guitar-learning/lib/music-theory";

type FretboardDisplay =
  | "notes"
  | "intervals"
  | "scale"
  | "chord"
  | "arpeggio";

const INTERVAL_COLORS = [
  "#ff5f9e",
  "#ff8f70",
  "#ffc95c",
  "#dce861",
  "#72dea2",
  "#53d9d2",
  "#5db8ff",
  "#8b93ff",
  "#b982ff",
  "#e173ed",
  "#ff74c7",
  "#ff7692",
];

const SCALE_OPTIONS: Array<{ value: ScaleType; label: string }> = [
  { value: "major", label: "Major" },
  { value: "natural-minor", label: "Natural minor" },
  { value: "major-pentatonic", label: "Major pentatonic" },
  { value: "minor-pentatonic", label: "Minor pentatonic" },
  { value: "blues", label: "Blues" },
  { value: "harmonic-minor", label: "Harmonic minor" },
  { value: "dorian", label: "Dorian" },
  { value: "mixolydian", label: "Mixolydian" },
];

const CHORD_OPTIONS: Array<{ value: ChordQuality; label: string }> = [
  { value: "major", label: "Major" },
  { value: "minor", label: "Minor" },
  { value: "power", label: "Power chord" },
  { value: "sus2", label: "Sus2" },
  { value: "sus4", label: "Sus4" },
  { value: "add9", label: "Add9" },
  { value: "dominant7", label: "Dominant 7" },
  { value: "major7", label: "Major 7" },
  { value: "minor7", label: "Minor 7" },
  { value: "diminished", label: "Diminished" },
];

export function FretboardExplorer() {
  const [tuningKey, setTuningKey] =
    useState<keyof typeof TUNINGS | "custom">("standard");
  const [customTuning, setCustomTuning] = useState<string[]>([
    ...STANDARD_TUNING,
  ]);
  const [root, setRoot] = useState("A");
  const [display, setDisplay] = useState<FretboardDisplay>("scale");
  const [scale, setScale] = useState<ScaleType>("minor-pentatonic");
  const [chord, setChord] = useState<ChordQuality>("minor");
  const [fretCount, setFretCount] = useState(24);
  const [leftHanded, setLeftHanded] = useState(false);
  const [revealAll, setRevealAll] = useState(false);
  const [compare, setCompare] = useState(false);
  const [quizTarget, setQuizTarget] = useState("C");
  const [quizFeedback, setQuizFeedback] = useState("");
  const activeTuning = useMemo(() => {
    if (tuningKey !== "custom") return [...TUNINGS[tuningKey]];
    try {
      if (customTuning.length !== 6) return [...STANDARD_TUNING];
      customTuning.forEach(parsePitchedNote);
      return [...customTuning];
    } catch {
      return [...STANDARD_TUNING];
    }
  }, [customTuning, tuningKey]);
  const fretboard = useMemo(
    () => generateFretboard(activeTuning, fretCount, root),
    [activeTuning, fretCount, root],
  );
  const scaleNotes = useMemo(
    () => new Set(buildScale(root, scale)),
    [root, scale],
  );
  const chordNotes = useMemo(
    () => new Set(buildChord(root, chord)),
    [chord, root],
  );
  const frets = Array.from({ length: fretCount + 1 }, (_value, index) =>
    leftHanded ? fretCount - index : index,
  );
  const strings = [5, 4, 3, 2, 1, 0];

  function isVisible(note: string) {
    if (revealAll || display === "notes" || display === "intervals") {
      return true;
    }
    if (display === "scale") return scaleNotes.has(note as never);
    return chordNotes.has(note as never);
  }

  function labelFor(note: string, interval: number) {
    if (display === "intervals") {
      const compact = [
        "R",
        "♭2",
        "2",
        "♭3",
        "3",
        "4",
        "♭5",
        "5",
        "♭6",
        "6",
        "♭7",
        "7",
      ];
      return compact[interval];
    }
    return note;
  }

  return (
    <div className="space-y-5">
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-5">
        <label className="text-xs font-black">
          Root note
          <select
            className={`${fieldClassName} mt-2`}
            value={root}
            onChange={(event) => {
              setRoot(event.target.value);
              setQuizTarget(event.target.value);
            }}
          >
            {CHROMATIC_NOTES.map((note) => (
              <option key={note}>{note}</option>
            ))}
          </select>
        </label>
        <label className="text-xs font-black">
          Tuning
          <select
            className={`${fieldClassName} mt-2`}
            value={tuningKey}
            onChange={(event) =>
              setTuningKey(
                event.target.value as keyof typeof TUNINGS | "custom",
              )
            }
          >
            <option value="standard">Standard · E A D G B E</option>
            <option value="drop-d">Drop D · D A D G B E</option>
            <option value="open-g">Open G · D G D G B D</option>
            <option value="half-step-down">
              Half-step down · E♭ A♭ D♭ G♭ B♭ E♭
            </option>
            <option value="custom">Custom tuning</option>
          </select>
        </label>
        <label className="text-xs font-black">
          Display
          <select
            className={`${fieldClassName} mt-2`}
            value={display}
            onChange={(event) =>
              setDisplay(event.target.value as FretboardDisplay)
            }
          >
            <option value="notes">All notes</option>
            <option value="intervals">Intervals from root</option>
            <option value="scale">Scale tones</option>
            <option value="chord">Chord tones</option>
            <option value="arpeggio">Arpeggio tones</option>
          </select>
        </label>
        <label className="text-xs font-black">
          Scale
          <select
            className={`${fieldClassName} mt-2`}
            value={scale}
            onChange={(event) =>
              setScale(event.target.value as ScaleType)
            }
          >
            {SCALE_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
        <label className="text-xs font-black">
          Chord
          <select
            className={`${fieldClassName} mt-2`}
            value={chord}
            onChange={(event) =>
              setChord(event.target.value as ChordQuality)
            }
          >
            {CHORD_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="flex flex-wrap gap-2">
        <Button
          type="button"
          size="sm"
          variant="secondary"
          onClick={() => setRevealAll((current) => !current)}
        >
          {revealAll ? (
            <EyeOff className="h-3.5 w-3.5" />
          ) : (
            <Eye className="h-3.5 w-3.5" />
          )}
          {revealAll ? "Hide outside notes" : "Reveal every note"}
        </Button>
        <Button
          type="button"
          size="sm"
          variant={compare ? "default" : "secondary"}
          onClick={() => setCompare((current) => !current)}
        >
          Compare scale + chord
        </Button>
        <Button
          type="button"
          size="sm"
          variant="secondary"
          onClick={() => setLeftHanded((current) => !current)}
        >
          <RotateCcw className="h-3.5 w-3.5" />
          {leftHanded ? "Left-handed view" : "Right-handed view"}
        </Button>
        <Button
          type="button"
          size="sm"
          variant="secondary"
          onClick={() =>
            setFretCount((current) => (current === 24 ? 12 : 24))
          }
        >
          {fretCount === 24 ? "Compact to 12 frets" : "Show 24 frets"}
        </Button>
      </div>

      <div className="rounded-[22px] border-2 border-border bg-[#130f18] p-3">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap gap-2">
            <Badge variant="accent">
              Root · {root}
            </Badge>
            <Badge>
              {display === "scale"
                ? `${root} ${scale.replace("-", " ")}`
                : `${root} ${chord.replace("7", " 7")}`}
            </Badge>
          </div>
          <p className="text-[11px] font-bold text-muted">
            Scroll sideways on a phone · tap a note to hear it
          </p>
        </div>

        <div
          className="max-w-full overflow-x-auto pb-2"
          aria-label={`${fretCount}-fret interactive guitar fretboard`}
        >
          <div
            role="grid"
            className="grid min-w-[920px] gap-px rounded-xl bg-[#765d3f] p-1"
            style={{
              gridTemplateColumns: `3.5rem repeat(${fretCount + 1}, minmax(2.35rem, 1fr))`,
            }}
          >
            <div className="bg-[#201925] p-1 text-center text-[10px] text-muted">
              String
            </div>
            {frets.map((fret) => (
              <div
                key={`fret-label-${fret}`}
                role="columnheader"
                className="bg-[#201925] p-1 text-center text-[10px] font-bold text-muted"
              >
                {fret}
              </div>
            ))}
            {strings.map((stringIndex) => (
              <div key={`string-${stringIndex}`} className="contents">
                <div
                  role="rowheader"
                  className="flex items-center justify-center bg-[#201925] text-xs font-black"
                >
                  {activeTuning[stringIndex].replace(/[0-9-]/g, "")}
                </div>
                {frets.map((fret) => {
                  const position = fretboard.find(
                    (candidate) =>
                      candidate.stringIndex === stringIndex &&
                      candidate.fret === fret,
                  )!;
                  const visible = isVisible(position.note);
                  const inScale = scaleNotes.has(position.note as never);
                  const inChord = chordNotes.has(position.note as never);
                  const isRoot = position.interval === 0;
                  const color = INTERVAL_COLORS[position.interval];
                  return (
                    <button
                      key={`${stringIndex}-${fret}`}
                      type="button"
                      role="gridcell"
                      className="relative flex min-h-10 items-center justify-center overflow-hidden bg-[linear-gradient(180deg,#6c5037,#422f23)] px-0.5 text-[10px] font-black focus:z-10"
                      aria-label={`${position.note}${position.octave}, string ${6 - stringIndex}, fret ${fret}, ${getIntervalName(root, position.note)}`}
                      onClick={() => {
                        setQuizFeedback(
                          position.note === quizTarget
                            ? `Correct: ${position.note} at fret ${fret}.`
                            : `That is ${position.note}. Keep looking for ${quizTarget}.`,
                        );
                        void guitarAudioEngine.play({
                          kind: "notes",
                          midiNotes: [position.midi],
                          beatSeconds: 0.5,
                        });
                      }}
                    >
                      <span className="pointer-events-none absolute inset-x-0 top-1/2 h-px bg-[#e9d9bc]/70" />
                      {visible && (
                        <span
                          className={`relative flex h-7 min-w-7 items-center justify-center rounded-full border px-1 text-[#120e16] ${
                            isRoot ? "ring-2 ring-white ring-offset-1 ring-offset-black" : ""
                          }`}
                          style={{
                            backgroundColor:
                              compare && inScale && !inChord
                                ? "#64cdf4"
                                : compare && inChord && !inScale
                                  ? "#ffd35d"
                                  : compare && inScale && inChord
                                    ? "#72dea2"
                                    : color,
                            opacity:
                              display !== "notes" &&
                              display !== "intervals" &&
                              !inScale &&
                              !inChord
                                ? 0.38
                                : 1,
                          }}
                        >
                          {labelFor(position.note, position.interval)}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </div>

      {compare && (
        <div className="grid gap-3 sm:grid-cols-3">
          <div className="rounded-2xl bg-[#72dea2]/10 p-4 text-sm">
            <strong className="text-[#72dea2]">Shared tones</strong>
            <p className="mt-2 text-muted">
              {[...scaleNotes].filter((note) => chordNotes.has(note)).join(", ") ||
                "None"}
            </p>
          </div>
          <div className="rounded-2xl bg-[#64cdf4]/10 p-4 text-sm">
            <strong className="text-[#64cdf4]">Scale colour tones</strong>
            <p className="mt-2 text-muted">
              {[...scaleNotes].filter((note) => !chordNotes.has(note)).join(", ") ||
                "None"}
            </p>
          </div>
          <div className="rounded-2xl bg-[#ffd35d]/10 p-4 text-sm">
            <strong className="text-[#ffd35d]">Chord tones outside scale</strong>
            <p className="mt-2 text-muted">
              {[...chordNotes].filter((note) => !scaleNotes.has(note)).join(", ") ||
                "None"}
            </p>
          </div>
        </div>
      )}

      <div className="grid gap-4 lg:grid-cols-[1fr_auto] lg:items-end">
        <div className="rounded-2xl border border-border bg-surface p-4">
          <p className="flex items-center gap-2 text-sm font-black">
            <Ear className="h-4 w-4 text-accent" />
            Find-the-note trainer
          </p>
          <p className="mt-2 text-xs leading-5 text-muted">
            Find any {quizTarget} on the fretboard. The note stays hidden until
            you choose a position, so use octave shapes rather than scanning.
          </p>
          {quizFeedback && (
            <p role="status" className="mt-3 text-sm font-bold">
              {quizFeedback}
            </p>
          )}
        </div>
        <div className="flex flex-wrap gap-2">
          <label className="text-xs font-black">
            Target note
            <select
              className={`${fieldClassName} mt-2 min-w-32`}
              value={quizTarget}
              onChange={(event) => {
                setQuizTarget(event.target.value);
                setQuizFeedback("");
              }}
            >
              {CHROMATIC_NOTES.map((note) => (
                <option key={note}>{note}</option>
              ))}
            </select>
          </label>
          <Button
            type="button"
            variant="secondary"
            className="self-end"
            onClick={() => {
              setRevealAll(false);
              setDisplay("scale");
              setQuizFeedback("");
            }}
          >
            <Volume2 className="h-4 w-4" />
            Reset trainer
          </Button>
        </div>
      </div>

      <details className="rounded-2xl border border-border bg-surface p-4">
        <summary className="cursor-pointer text-sm font-black">
          Custom tuning editor
        </summary>
        <p className="mt-2 text-xs leading-5 text-muted">
          Enter six pitched notes from the lowest string to the highest, such
          as D2 A2 D3 G3 B3 E4.
        </p>
        <div className="mt-3 grid grid-cols-3 gap-2 sm:grid-cols-6">
          {customTuning.map((note, index) => (
            <label key={index} className="text-[10px] font-black">
              String {6 - index}
              <input
                className={`${fieldClassName} mt-1 px-2`}
                value={note}
                onChange={(event) =>
                  setCustomTuning((current) =>
                    current.map((item, itemIndex) =>
                      itemIndex === index ? event.target.value : item,
                    ),
                  )
                }
              />
            </label>
          ))}
        </div>
        <p className="mt-2 text-[11px] text-muted">
          Select “Custom tuning” above to apply these values. They remain
          local to this tool and are never written to practice history.
        </p>
      </details>
    </div>
  );
}
