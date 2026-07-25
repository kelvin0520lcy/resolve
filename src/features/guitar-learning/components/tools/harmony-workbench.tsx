"use client";

import { useState } from "react";
import {
  ArrowRight,
  Ear,
  Layers3,
  Music2,
  Sparkles,
  Volume2,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { fieldClassName } from "@/components/ui/resolve";
import { guitarAudioEngine } from "@/features/guitar-learning/lib/audio-engine";
import {
  buildEmotionalGuitarRecipe,
  chromaticDistanceLabel,
  getChordToneRoles,
  harmonizeMajorScale,
  intervalFormula,
  scaleStepFormula,
} from "@/features/guitar-learning/lib/harmony";
import {
  buildChord,
  buildScale,
  CHORD_INTERVALS,
  CHROMATIC_NOTES,
  compareScales,
  convertRomanProgression,
  getIntervalName,
  getNoteIndex,
  getTriadInversions,
  SCALE_INTERVALS,
  STANDARD_TUNING,
  generateFretboard,
  type ChordQuality,
  type ScaleType,
} from "@/features/guitar-learning/lib/music-theory";
import type { GuitarToolId } from "@/features/guitar-learning/types";

const SCALE_OPTIONS: Array<{ value: ScaleType; label: string }> = [
  { value: "major", label: "Major" },
  { value: "natural-minor", label: "Natural minor" },
  { value: "minor-pentatonic", label: "Minor pentatonic" },
  { value: "major-pentatonic", label: "Major pentatonic" },
  { value: "blues", label: "Blues" },
  { value: "harmonic-minor", label: "Harmonic minor" },
  { value: "dorian", label: "Dorian" },
  { value: "mixolydian", label: "Mixolydian" },
];

const CHORD_OPTIONS: Array<{ value: ChordQuality; label: string }> = [
  { value: "major", label: "Major" },
  { value: "minor", label: "Minor" },
  { value: "power", label: "Power chord" },
  { value: "sus2", label: "Suspended 2" },
  { value: "sus4", label: "Suspended 4" },
  { value: "add9", label: "Add9" },
  { value: "dominant7", label: "Dominant 7" },
  { value: "major7", label: "Major 7" },
  { value: "minor7", label: "Minor 7" },
  { value: "diminished", label: "Diminished" },
  { value: "augmented", label: "Augmented" },
];

const PROGRESSIONS = [
  {
    label: "Anthemic lift · I–V–vi–IV",
    numerals: ["I", "V", "vi", "IV"],
  },
  {
    label: "Minor momentum · vi–IV–I–V",
    numerals: ["vi", "IV", "I", "V"],
  },
  {
    label: "Forward pull · I–IV–V–V",
    numerals: ["I", "IV", "V", "V"],
  },
  {
    label: "Circular pop-rock · I–vi–IV–V",
    numerals: ["I", "vi", "IV", "V"],
  },
];

function notesToMidi(notes: string[], octave = 4) {
  return notes.map((note) => {
    const index = getNoteIndex(note);
    return (octave + 1) * 12 + index;
  });
}

function NoteStrip({
  root,
  notes,
  roleLabels,
}: {
  root: string;
  notes: string[];
  roleLabels?: string[];
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {notes.map((note, index) => (
        <button
          key={`${note}-${index}`}
          type="button"
          className={`min-w-14 rounded-2xl border-2 px-3 py-3 text-center transition hover:-translate-y-0.5 ${
            note === root
              ? "border-accent bg-accent text-white"
              : "border-border bg-surface-muted"
          }`}
          aria-label={`Play ${note}, ${roleLabels?.[index] ?? getIntervalName(root, note)}`}
          onClick={() =>
            void guitarAudioEngine.play({
              kind: "notes",
              midiNotes: notesToMidi([note]),
            })
          }
        >
          <span className="block font-display text-lg">{note}</span>
          <span className="mt-1 block text-[9px] font-black uppercase tracking-wide opacity-75">
            {roleLabels?.[index] ?? getIntervalName(root, note)}
          </span>
        </button>
      ))}
    </div>
  );
}

function MiniFretboardMap({
  root,
  notes,
}: {
  root: string;
  notes: string[];
}) {
  const positions = generateFretboard(STANDARD_TUNING, 12, root);
  const noteSet = new Set(notes);
  return (
    <div className="overflow-x-auto rounded-2xl border border-border bg-[#110e16] p-3">
      <div
        className="grid min-w-[620px] gap-px"
        style={{ gridTemplateColumns: "3rem repeat(13, 1fr)" }}
        aria-label="Twelve-fret note relationship map"
      >
        <div />
        {Array.from({ length: 13 }, (_value, fret) => (
          <div
            key={fret}
            className="text-center text-[9px] font-bold text-muted"
          >
            {fret}
          </div>
        ))}
        {[5, 4, 3, 2, 1, 0].map((stringIndex) => (
          <div key={stringIndex} className="contents">
            <div className="flex items-center justify-center text-[9px] font-black text-muted">
              {6 - stringIndex}
            </div>
            {positions
              .filter((position) => position.stringIndex === stringIndex)
              .map((position) => (
                <div
                  key={`${stringIndex}-${position.fret}`}
                  className="flex h-8 items-center justify-center border-b border-[#e5cfaa]/30 bg-[#533a29]"
                >
                  {noteSet.has(position.note) && (
                    <span
                      className={`flex h-6 w-6 items-center justify-center rounded-full text-[9px] font-black ${
                        position.note === root
                          ? "bg-accent text-white"
                          : "bg-warning text-[#18121f]"
                      }`}
                    >
                      {position.note}
                    </span>
                  )}
                </div>
              ))}
          </div>
        ))}
      </div>
    </div>
  );
}

function ScalePanel({
  root,
  scale,
}: {
  root: string;
  scale: ScaleType;
}) {
  const [secondScale, setSecondScale] =
    useState<ScaleType>("natural-minor");
  const notes = buildScale(root, scale);
  const comparison = compareScales(root, scale, secondScale);
  const intervals = intervalFormula(SCALE_INTERVALS[scale]);
  return (
    <div className="space-y-5">
      <div className="rounded-2xl border border-border bg-surface p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="font-black">
              {root} {scale.replace("-", " ")}
            </p>
            <p className="mt-1 text-xs text-muted">
              Steps: {scaleStepFormula(root, scale).join(" · ")}
            </p>
          </div>
          <Button
            type="button"
            onClick={() =>
              void guitarAudioEngine.play({
                kind: "notes",
                midiNotes: [...notesToMidi(notes), notesToMidi([root], 5)[0]],
                beatSeconds: 0.34,
              })
            }
          >
            <Volume2 className="h-4 w-4" />
            Hear scale
          </Button>
        </div>
        <div className="mt-4">
          <NoteStrip root={root} notes={notes} roleLabels={intervals} />
        </div>
      </div>
      <MiniFretboardMap root={root} notes={notes} />
      <div className="rounded-2xl border border-border bg-surface p-4">
        <label className="text-xs font-black">
          Compare with
          <select
            className={`${fieldClassName} mt-2 max-w-sm`}
            value={secondScale}
            onChange={(event) =>
              setSecondScale(event.target.value as ScaleType)
            }
          >
            {SCALE_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          {[
            ["Shared", comparison.shared, "text-success"],
            ["Only first", comparison.onlyFirst, "text-accent"],
            ["Only comparison", comparison.onlySecond, "text-warning"],
          ].map(([label, values, color]) => (
            <div
              key={String(label)}
              className="rounded-xl bg-surface-muted p-3 text-sm"
            >
              <p className={`font-black ${color}`}>{label as string}</p>
              <p className="mt-1 text-muted">
                {(values as string[]).join(", ") || "None"}
              </p>
            </div>
          ))}
        </div>
        <p className="mt-4 text-xs leading-5 text-muted">
          The changed notes are the colour controls. Keep the shared tones
          fixed, swap one changed tone, and listen for the emotional shift.
        </p>
      </div>
    </div>
  );
}

function ChordPanel({
  root,
  chord,
}: {
  root: string;
  chord: ChordQuality;
}) {
  const [secondRoot, setSecondRoot] = useState("F");
  const [simplified, setSimplified] = useState(false);
  const notes = buildChord(root, chord);
  const roles = getChordToneRoles(chord);
  const displayedNotes = simplified
    ? notes.filter((_note, index) => index === 0 || index === notes.length - 1)
    : notes;
  const second = buildChord(secondRoot, chord);
  const shared = notes.filter((note) => second.includes(note));
  return (
    <div className="space-y-5">
      <div className="grid gap-4 lg:grid-cols-[1fr_18rem]">
        <div className="rounded-2xl border border-border bg-surface p-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="font-black">
                {root} {chord.replace("7", " 7")}
              </p>
              <p className="mt-1 text-xs text-muted">
                Formula: {intervalFormula(CHORD_INTERVALS[chord]).join(" · ")}
              </p>
            </div>
            <Button
              type="button"
              onClick={() =>
                void guitarAudioEngine.play({
                  kind: "chord",
                  midiNotes: notesToMidi(displayedNotes, 3),
                })
              }
            >
              <Volume2 className="h-4 w-4" />
              Hear chord
            </Button>
          </div>
          <div className="mt-4">
            <NoteStrip
              root={root}
              notes={displayedNotes}
              roleLabels={roles
                .filter((_role, index) =>
                  simplified
                    ? index === 0 || index === roles.length - 1
                    : true,
                )
                .map((role) => role.role)}
            />
          </div>
          <Button
            type="button"
            size="sm"
            variant="secondary"
            className="mt-4"
            onClick={() => setSimplified((current) => !current)}
          >
            {simplified ? "Restore complete chord" : "Simplify this chord"}
          </Button>
        </div>
        <div className="rounded-2xl border border-warning/30 bg-warning/10 p-4">
          <p className="font-black">Construction</p>
          <div className="mt-3 space-y-2">
            {roles.map((tone, index) => (
              <div
                key={tone.role}
                className="flex items-center justify-between gap-3 text-sm"
              >
                <span>{tone.role}</span>
                <Badge variant={index === 0 ? "accent" : "default"}>
                  {notes[index]}
                </Badge>
              </div>
            ))}
          </div>
          <p className="mt-4 text-xs leading-5 text-muted">
            Suspended chords replace the third; add9 keeps the third and adds
            a ninth. That difference is why their colour and harmonic clarity
            are not interchangeable.
          </p>
        </div>
      </div>
      <MiniFretboardMap root={root} notes={displayedNotes} />
      <div className="rounded-2xl border border-border bg-surface p-4">
        <p className="font-black">Connect two chords</p>
        <div className="mt-3 flex flex-wrap items-end gap-3">
          <label className="text-xs font-black">
            Second root
            <select
              className={`${fieldClassName} mt-2 min-w-36`}
              value={secondRoot}
              onChange={(event) => setSecondRoot(event.target.value)}
            >
              {CHROMATIC_NOTES.map((note) => (
                <option key={note}>{note}</option>
              ))}
            </select>
          </label>
          <div className="pb-3 text-sm font-black">
            {root} {chord} <ArrowRight className="mx-2 inline h-4 w-4" />
            {secondRoot} {chord}
          </div>
        </div>
        <p className="mt-3 text-sm leading-6 text-muted">
          Shared tones: {shared.join(", ") || "none"}. Keep shared voices in
          place and move the remaining notes by the smallest available distance
          to hear smoother voice leading.
        </p>
      </div>
    </div>
  );
}

function TriadPanel({
  root,
  quality,
}: {
  root: string;
  quality: "major" | "minor";
}) {
  const inversions = getTriadInversions(root, quality);
  return (
    <div className="grid gap-4 md:grid-cols-3">
      {inversions.map((inversion, index) => (
        <div
          key={inversion.name}
          className="rounded-2xl border-2 border-border bg-surface p-4"
        >
          <Badge variant={index === 0 ? "accent" : "default"}>
            Bass note · {inversion.notes[0]}
          </Badge>
          <p className="mt-3 font-black">{inversion.name}</p>
          <p className="mt-1 text-xs leading-5 text-muted">
            {inversion.intervals.join(" · ")}
          </p>
          <div className="mt-4">
            <NoteStrip
              root={root}
              notes={inversion.notes}
              roleLabels={inversion.intervals}
            />
          </div>
          <Button
            type="button"
            size="sm"
            className="mt-4"
            onClick={() =>
              void guitarAudioEngine.play({
                kind: "chord",
                midiNotes: notesToMidi(inversion.notes),
              })
            }
          >
            Hear voicing
          </Button>
        </div>
      ))}
    </div>
  );
}

function ArpeggioPanel({
  root,
  chord,
  scale,
}: {
  root: string;
  chord: ChordQuality;
  scale: ScaleType;
}) {
  const chordNotes = buildChord(root, chord);
  const scaleNotes = buildScale(root, scale);
  const pattern = [
    ...chordNotes,
    ...[...chordNotes].reverse().slice(1),
  ];
  return (
    <div className="space-y-5">
      <div className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-2xl border border-accent/30 bg-accent/5 p-4">
          <p className="font-black">Arpeggio · chord tones in sequence</p>
          <div className="mt-4">
            <NoteStrip root={root} notes={pattern} />
          </div>
          <Button
            type="button"
            className="mt-4"
            onClick={() =>
              void guitarAudioEngine.play({
                kind: "notes",
                midiNotes: notesToMidi(pattern),
                beatSeconds: 0.32,
              })
            }
          >
            Hear arpeggio
          </Button>
        </div>
        <div className="rounded-2xl border border-warning/30 bg-warning/5 p-4">
          <p className="font-black">Scale · chord and passing tones</p>
          <div className="mt-4">
            <NoteStrip root={root} notes={scaleNotes} />
          </div>
          <Button
            type="button"
            className="mt-4"
            variant="secondary"
            onClick={() =>
              void guitarAudioEngine.play({
                kind: "notes",
                midiNotes: notesToMidi(scaleNotes),
                beatSeconds: 0.32,
              })
            }
          >
            Hear scale
          </Button>
        </div>
      </div>
      <p className="rounded-2xl border border-border bg-surface p-4 text-sm leading-6 text-muted">
        An arpeggio outlines the harmony because every note belongs to the
        selected chord. A scale adds non-chord tones that create motion and
        tension. Use chord tones on arrivals and passing tones between them.
      </p>
    </div>
  );
}

function ProgressionPanel({ root }: { root: string }) {
  const [progressionIndex, setProgressionIndex] = useState(0);
  const selected = PROGRESSIONS[progressionIndex];
  const progression = convertRomanProgression(
    root,
    "major",
    selected.numerals,
  );
  return (
    <div className="space-y-5">
      <label className="block text-xs font-black">
        Progression shape
        <select
          className={`${fieldClassName} mt-2 max-w-md`}
          value={progressionIndex}
          onChange={(event) =>
            setProgressionIndex(Number(event.target.value))
          }
        >
          {PROGRESSIONS.map((progression, index) => (
            <option key={progression.label} value={index}>
              {progression.label}
            </option>
          ))}
        </select>
      </label>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {progression.map((chord, index) => (
          <button
            key={`${chord.roman}-${index}`}
            type="button"
            className="rounded-2xl border-2 border-border bg-surface p-4 text-left hover:border-accent"
            onClick={() =>
              void guitarAudioEngine.play({
                kind: "chord",
                midiNotes: notesToMidi(chord.notes, 3),
              })
            }
          >
            <span className="text-[10px] font-black uppercase tracking-wide text-accent">
              {chord.roman} · {chord.function}
            </span>
            <span className="font-display mt-2 block text-2xl">
              {chord.root} {chord.quality}
            </span>
            <span className="mt-2 block text-xs text-muted">
              {chord.notes.join(" · ")}
            </span>
          </button>
        ))}
      </div>
      <Button
        type="button"
        onClick={() =>
          void guitarAudioEngine.play({
            kind: "notes",
            midiNotes: progression.flatMap((chord) =>
              notesToMidi(chord.notes, 3),
            ),
            beatSeconds: 0.2,
          })
        }
      >
        <Music2 className="h-4 w-4" />
        Hear progression
      </Button>
      <div className="grid gap-3 md:grid-cols-3">
        {[
          [
            "Tonic",
            "Feels settled or like home. I, iii, and vi often share this family role.",
          ],
          [
            "Predominant",
            "Moves away from home and prepares stronger forward motion. ii and IV commonly do this.",
          ],
          [
            "Dominant",
            "Creates a strong pull back toward tonic. V and vii° carry the clearest directional tension.",
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

function EmotionalPanel() {
  const [controls, setControls] = useState({
    brightness: 45,
    tension: 48,
    movement: 62,
    intensity: 58,
  });
  const recipe = buildEmotionalGuitarRecipe(controls);
  return (
    <div className="space-y-5">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {(Object.keys(controls) as Array<keyof typeof controls>).map(
          (control) => (
            <label
              key={control}
              className="rounded-2xl border border-border bg-surface p-4 text-xs font-black capitalize"
            >
              <span className="flex justify-between">
                {control}
                <strong className="text-accent">{controls[control]}%</strong>
              </span>
              <input
                className="mt-4 w-full accent-[var(--accent)]"
                type="range"
                min="0"
                max="100"
                value={controls[control]}
                onChange={(event) =>
                  setControls((current) => ({
                    ...current,
                    [control]: Number(event.target.value),
                  }))
                }
              />
            </label>
          ),
        )}
      </div>
      <div className="manga-panel rounded-[22px] p-5 sm:p-6">
        <Badge variant="accent">Generated musical recipe</Badge>
        <h3 className="font-display mt-3 text-3xl text-[#18121f]">
          {recipe.root} {recipe.scale.replace("-", " ")}
        </h3>
        <p className="mt-3 max-w-3xl text-sm font-semibold leading-6 text-[#5d5267]">
          Pair {recipe.root} {recipe.chordQuality} colour with{" "}
          {recipe.subdivision}th-note motion, {recipe.articulation}, and a{" "}
          {recipe.contour}.
        </p>
        <div className="mt-4">
          <NoteStrip root={recipe.root} notes={recipe.notes} />
        </div>
        <Button
          type="button"
          className="mt-5"
          onClick={() =>
            void guitarAudioEngine.play({
              kind: "notes",
              midiNotes: notesToMidi([
                ...recipe.chordNotes,
                ...recipe.notes.slice(0, 4),
              ]),
              beatSeconds: 0.35,
            })
          }
        >
          <Sparkles className="h-4 w-4" />
          Hear the colour sketch
        </Button>
      </div>
      <p className="text-xs leading-5 text-muted">
        These controls generate a deterministic practice constraint, not a
        claim that one scale has one fixed emotion. Register, rhythm,
        articulation, harmony, and context all contribute to the result.
      </p>
    </div>
  );
}

function TheoryPanel({
  root,
  scale,
  chord,
}: {
  root: string;
  scale: ScaleType;
  chord: ChordQuality;
}) {
  const [target, setTarget] = useState("E");
  const distance = chromaticDistanceLabel(root, target);
  const harmonized = harmonizeMajorScale(root);
  return (
    <div className="space-y-5">
      <div className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-2xl border border-border bg-surface p-4">
          <p className="font-black">Interval visualiser</p>
          <div className="mt-3 flex items-end gap-3">
            <Badge variant="accent">{root}</Badge>
            <ArrowRight className="mb-1 h-4 w-4" />
            <label className="text-xs font-black">
              Target
              <select
                className={`${fieldClassName} mt-2 min-w-28`}
                value={target}
                onChange={(event) => setTarget(event.target.value)}
              >
                {CHROMATIC_NOTES.map((note) => (
                  <option key={note}>{note}</option>
                ))}
              </select>
            </label>
          </div>
          <p className="mt-4 text-sm leading-6">
            {getIntervalName(root, target)} · {distance.semitones} semitones{" "}
            {distance.direction}
          </p>
          <p className="mt-2 text-xs text-muted">
            Chromatic path: {distance.chromaticPath.join(" → ")}
          </p>
        </div>
        <div className="rounded-2xl border border-border bg-surface p-4">
          <p className="font-black">Construction formulas</p>
          <p className="mt-3 text-sm">
            {root} {scale}:{" "}
            <strong>{scaleStepFormula(root, scale).join(" · ")}</strong>
          </p>
          <p className="mt-3 text-sm">
            {root} {chord}:{" "}
            <strong>
              {intervalFormula(CHORD_INTERVALS[chord]).join(" · ")}
            </strong>
          </p>
          <p className="mt-3 text-xs leading-5 text-muted">
            Change the root above: the formulas stay fixed while every note
            moves, which is transposition in practice.
          </p>
        </div>
      </div>
      <div>
        <p className="mb-3 font-black">
          Harmonised {root} major scale
        </p>
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7">
          {harmonized.map((degree) => (
            <button
              key={degree.roman}
              type="button"
              className="rounded-2xl border border-border bg-surface p-3 text-left hover:border-accent"
              onClick={() =>
                void guitarAudioEngine.play({
                  kind: "chord",
                  midiNotes: notesToMidi(degree.notes),
                })
              }
            >
              <span className="text-xs font-black text-accent">
                {degree.roman}
              </span>
              <span className="font-display mt-1 block text-lg">
                {degree.root}
              </span>
              <span className="block text-[10px] text-muted">
                {degree.quality} · {degree.function}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

export function HarmonyWorkbench({
  mode,
}: {
  mode:
    | "scales"
    | "chords"
    | "triads"
    | "arpeggios"
    | "progressions"
    | "emotional"
    | "theory";
}) {
  const [root, setRoot] = useState("A");
  const [scale, setScale] =
    useState<ScaleType>("minor-pentatonic");
  const [chord, setChord] = useState<ChordQuality>("minor");
  const relevantControls = mode !== "emotional";

  return (
    <div className="space-y-5">
      {relevantControls && (
        <div className="grid gap-3 md:grid-cols-3">
          <label className="text-xs font-black">
            Root note
            <select
              className={`${fieldClassName} mt-2`}
              value={root}
              onChange={(event) => setRoot(event.target.value)}
            >
              {CHROMATIC_NOTES.map((note) => (
                <option key={note}>{note}</option>
              ))}
            </select>
          </label>
          <label className="text-xs font-black">
            Scale colour
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
            Chord quality
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
      )}

      {mode === "scales" && <ScalePanel root={root} scale={scale} />}
      {mode === "chords" && <ChordPanel root={root} chord={chord} />}
      {mode === "triads" && (
        <TriadPanel
          root={root}
          quality={chord === "minor" ? "minor" : "major"}
        />
      )}
      {mode === "arpeggios" && (
        <ArpeggioPanel root={root} chord={chord} scale={scale} />
      )}
      {mode === "progressions" && <ProgressionPanel root={root} />}
      {mode === "emotional" && <EmotionalPanel />}
      {mode === "theory" && (
        <TheoryPanel root={root} scale={scale} chord={chord} />
      )}

      <div className="flex items-start gap-3 rounded-2xl border border-border bg-surface/75 p-4 text-xs leading-5 text-muted">
        <Layers3 className="mt-0.5 h-4 w-4 shrink-0 text-accent" />
        <p>
          Every note, interval, chord, scale, inversion, and progression here
          is calculated from the same tested theory engine used by the lesson
          checkpoints and fretboard. Tap a note or card to hear generated Web
          Audio—no copyrighted recording or tab is bundled.
        </p>
        <Ear className="mt-0.5 h-4 w-4 shrink-0 text-warning" />
      </div>
    </div>
  );
}

export const HARMONY_TOOL_IDS: GuitarToolId[] = [
  "scales",
  "chords",
  "triads",
  "arpeggios",
  "progressions",
  "emotional",
  "theory",
];
