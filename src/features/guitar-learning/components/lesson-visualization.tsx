import {
  ArrowDown,
  ArrowRight,
  ArrowUp,
  Ear,
  Guitar,
  Music2,
} from "lucide-react";
import {
  generateFretboard,
  STANDARD_TUNING,
} from "@/features/guitar-learning/lib/music-theory";
import { GuitarChordDiagram } from "@/features/guitar-learning/components/chord-diagram";
import type { VisualSection } from "@/features/guitar-learning/types";
import type { ExplicitLessonVisual } from "@/features/guitar-learning/types";

function DiagramShell({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div
      role="img"
      aria-label={label}
      className="overflow-hidden rounded-2xl border-2 border-foreground/15 bg-surface-muted/45 p-3 sm:p-4"
    >
      {children}
    </div>
  );
}

function RhythmDiagram({ title }: { title: string }) {
  const isSixteenth = /sixteenth|syncopat|muted|accent/i.test(title);
  const counts = isSixteenth
    ? ["1", "e", "&", "a", "2", "e", "&", "a"]
    : ["1", "&", "2", "&", "3", "&", "4", "&"];
  const active = /rest|miss/i.test(title)
    ? [0, 2, 4, 7]
    : [0, 2, 3, 5, 6, 7];
  const muted = /mut|palm/i.test(title) ? [2, 6] : [];
  const accents = /accent|intensity|dynamic/i.test(title) ? [0, 4] : [2];

  return (
    <DiagramShell label={`Count, hand direction, and sounding-stroke grid for ${title}`}>
      <div className="grid grid-cols-[2.9rem_repeat(8,minmax(1.4rem,1fr))] gap-0.5 text-center text-xs sm:grid-cols-[3.7rem_repeat(8,minmax(2rem,1fr))] sm:gap-1">
        <span className="flex items-center justify-start font-black text-muted">
          COUNT
        </span>
        {counts.map((count, index) => (
          <span
            key={`${count}-${index}`}
            className={`rounded-lg py-2 font-black ${
              index % 4 === 0
                ? "bg-warning text-[#18121f]"
                : "bg-surface text-muted"
            }`}
          >
            {count}
          </span>
        ))}
        <span className="flex items-center justify-start font-black text-muted">
          HAND
        </span>
        {counts.map((_count, index) => (
          <span
            key={`hand-${index}`}
            className="flex min-h-9 items-center justify-center rounded-lg border border-border bg-surface"
          >
            {index % 2 === 0 ? (
              <ArrowDown className="h-4 w-4 text-accent" aria-hidden="true" />
            ) : (
              <ArrowUp className="h-4 w-4 text-cyan" aria-hidden="true" />
            )}
          </span>
        ))}
        <span className="flex items-center justify-start font-black text-muted">
          SOUND
        </span>
        {counts.map((_count, index) => {
          const isActive = active.includes(index);
          const isMuted = muted.includes(index);
          const isAccent = accents.includes(index);
          return (
            <span
              key={`sound-${index}`}
              className={`flex min-h-10 items-center justify-center rounded-lg border-2 font-black ${
                isMuted
                  ? "border-cyan bg-cyan/15 text-cyan"
                  : isActive
                    ? "border-accent bg-accent/15 text-accent"
                    : "border-dashed border-border bg-transparent text-muted"
              }`}
            >
              {isMuted ? "X" : isActive ? (isAccent ? ">" : "●") : "—"}
            </span>
          );
        })}
      </div>
      <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs font-bold text-muted">
        <span>● sounds</span>
        <span>&gt; accent</span>
        <span>X muted</span>
        <span>— silent hand pass</span>
      </div>
    </DiagramShell>
  );
}

function PickingDiagram({ title }: { title: string }) {
  const crossesStrings = /cross|string|skip|double|octave/i.test(title);
  const strings = crossesStrings
    ? ["B", "G", "G", "D", "G", "B", "B", "G"]
    : ["G", "G", "G", "G", "G", "G", "G", "G"];

  return (
    <DiagramShell label={`Pick direction and string path for ${title}`}>
      <div className="relative grid grid-cols-8 gap-1">
        {strings.map((string, index) => (
          <div key={`${string}-${index}`} className="min-w-0 text-center">
            <span className="text-[11px] font-black text-muted">
              {index + 1}
            </span>
            <div
              className={`mt-1 flex min-h-14 flex-col items-center justify-center rounded-xl border-2 ${
                index % 2 === 0
                  ? "border-accent/45 bg-accent/10"
                  : "border-cyan/45 bg-cyan/10"
              }`}
            >
              {index % 2 === 0 ? (
                <ArrowDown className="h-5 w-5 text-accent" aria-hidden="true" />
              ) : (
                <ArrowUp className="h-5 w-5 text-cyan" aria-hidden="true" />
              )}
              <span className="mt-1 text-xs font-black">{string}</span>
            </div>
          </div>
        ))}
      </div>
      <div className="mt-4 space-y-2">
        {["B string", "G string", "D string"].map((string) => (
          <div key={string} className="flex items-center gap-2">
            <span className="w-14 text-[11px] font-black text-muted">{string}</span>
            <span className="h-px flex-1 bg-foreground/25" />
          </div>
        ))}
      </div>
      <p className="mt-3 text-xs leading-5 text-muted">
        Read left to right. The arrow controls pick direction; the letter
        controls string choice. Keep those decisions separate.
      </p>
    </DiagramShell>
  );
}

function FretboardDiagram({ title }: { title: string }) {
  const board = generateFretboard(STANDARD_TUNING, 7, "A");
  const usefulIntervals = /minor|pentatonic/i.test(title)
    ? [0, 3, 5, 7, 10]
    : /triad|chord/i.test(title)
      ? [0, 4, 7]
      : [0, 2, 4, 5, 7];
  const intervalNames: Record<number, string> = {
    0: "R",
    2: "2",
    3: "♭3",
    4: "3",
    5: "4",
    7: "5",
    10: "♭7",
  };

  return (
    <DiagramShell label={`Seven-fret interval map in A for ${title}`}>
      <div className="mb-2 grid grid-cols-[1.7rem_repeat(8,minmax(1.35rem,1fr))] gap-0.5 text-center text-[11px] font-black text-muted sm:grid-cols-[2rem_repeat(8,minmax(1.8rem,1fr))] sm:gap-1">
        <span>STR</span>
        {Array.from({ length: 8 }, (_unused, fret) => (
          <span key={fret}>{fret}</span>
        ))}
      </div>
      <div className="space-y-1">
        {STANDARD_TUNING.toReversed().map((openString, displayIndex) => {
          const stringIndex = STANDARD_TUNING.length - 1 - displayIndex;
          return (
            <div
              key={`${openString}-${stringIndex}`}
              className="grid grid-cols-[1.7rem_repeat(8,minmax(1.35rem,1fr))] gap-0.5 sm:grid-cols-[2rem_repeat(8,minmax(1.8rem,1fr))] sm:gap-1"
            >
              <span className="flex items-center justify-center text-[11px] font-black text-muted">
                {openString.replace(/\d/g, "")}
              </span>
              {board
                .filter((note) => note.stringIndex === stringIndex)
                .map((note) => {
                  const highlighted = usefulIntervals.includes(note.interval);
                  return (
                    <span
                      key={`${stringIndex}-${note.fret}`}
                      className={`flex min-h-7 items-center justify-center rounded-md border text-[11px] font-black ${
                        note.interval === 0
                          ? "border-warning bg-warning text-[#18121f]"
                          : highlighted
                            ? "border-accent/45 bg-accent/12 text-accent"
                            : "border-border bg-surface text-transparent"
                      }`}
                      title={`${note.note}, ${intervalNames[note.interval] ?? note.interval}`}
                    >
                      {highlighted
                        ? intervalNames[note.interval] ?? note.note
                        : "·"}
                    </span>
                  );
                })}
            </div>
          );
        })}
      </div>
      <p className="mt-3 text-xs leading-5 text-muted">
        Yellow R notes are the A anchors. Read every other dot as a distance
        from a root, then find the same distance from the next yellow anchor.
      </p>
    </DiagramShell>
  );
}

function chordFormula(title: string) {
  if (/power/i.test(title)) return ["R", "5", "R"];
  if (/minor/i.test(title)) return ["R", "♭3", "5"];
  if (/sus2/i.test(title)) return ["R", "2", "5"];
  if (/sus|sus4/i.test(title)) return ["R", "4", "5"];
  if (/add9/i.test(title)) return ["R", "3", "5", "9"];
  if (/seventh|7/i.test(title)) return ["R", "3", "5", "♭7"];
  return ["R", "3", "5"];
}

function ChordDiagram({ title }: { title: string }) {
  const formula = chordFormula(title);
  const intervalMarkers = [
    {
      string: 5 as const,
      fret: 3,
      marker: formula[0],
      markerDescription: `${formula[0]} interval`,
      root: true,
    },
    {
      string: 4 as const,
      fret: 2,
      marker: formula[1] ?? "5",
      markerDescription: `${formula[1] ?? "5"} interval`,
    },
    {
      string: 3 as const,
      fret: "open" as const,
    },
    {
      string: 2 as const,
      fret: 1,
      marker: formula[2] ?? "5",
      markerDescription: `${formula[2] ?? "5"} interval`,
    },
    {
      string: 1 as const,
      fret: "open" as const,
    },
    {
      string: 6 as const,
      fret: "muted" as const,
    },
  ];

  return (
    <DiagramShell label={`Chord formula and interval voicing for ${title}`}>
      <div className="grid gap-4 sm:grid-cols-[minmax(0,1fr)_12rem] sm:items-center">
        <div>
          <p className="text-xs font-black uppercase tracking-wide text-muted">
            Interval recipe
          </p>
          <div className="mt-2 flex items-center gap-2">
            {formula.map((interval, index) => (
              <div key={`${interval}-${index}`} className="contents">
                <span
                  className={`flex h-10 min-w-10 items-center justify-center rounded-xl border-2 px-2 font-black ${
                    index === 0
                      ? "border-warning bg-warning text-[#18121f]"
                      : "border-accent/45 bg-accent/10 text-accent"
                  }`}
                >
                  {interval}
                </span>
                {index < formula.length - 1 && (
                  <ArrowRight className="h-4 w-4 text-muted" aria-hidden="true" />
                )}
              </div>
            ))}
          </div>
          <p className="mt-3 text-xs leading-5 text-muted">
            The third—or its suspended replacement—controls most of the
            colour. The root names the chord; the fifth stabilises it.
          </p>
        </div>
        <GuitarChordDiagram
          chordName={`${title} interval shape`}
          strings={intervalMarkers}
        />
      </div>
    </DiagramShell>
  );
}

function ScaleComparison({ title }: { title: string }) {
  const isHarmony = /chord|roman|function|major|minor/i.test(title);
  const labels = isHarmony
    ? ["Hear: stable or tense?", "Name: function / interval", "Play: verify on guitar"]
    : ["Hear: direction / distance", "Name: relationship", "Play: match the sound"];

  return (
    <DiagramShell label={`Sound, theory, and guitar relationship for ${title}`}>
      <div className="grid gap-2 sm:grid-cols-[1fr_auto_1fr_auto_1fr] sm:items-center">
        {labels.map((label, index) => {
          const Icon = index === 0 ? Ear : index === 1 ? Music2 : Guitar;
          return (
            <div key={label} className="contents">
              <div
                className={`rounded-2xl border-2 p-4 text-center ${
                  index === 1
                    ? "border-warning/60 bg-warning/12"
                    : "border-accent/35 bg-accent/8"
                }`}
              >
                <Icon className="mx-auto h-5 w-5 text-accent" aria-hidden="true" />
                <p className="mt-2 text-xs font-black leading-5">{label}</p>
              </div>
              {index < labels.length - 1 && (
                <ArrowRight
                  className="mx-auto h-5 w-5 rotate-90 text-muted sm:rotate-0"
                  aria-hidden="true"
                />
              )}
            </div>
          );
        })}
      </div>
      <div className="mt-3 grid grid-cols-7 gap-1 text-center text-[11px] font-black">
        {["R", "2", "♭3 / 3", "4", "5", "♭6 / 6", "♭7 / 7"].map(
          (degree, index) => (
            <span
              key={degree}
              className={`rounded-lg border p-2 ${
                index === 0 || index === 4
                  ? "border-warning bg-warning/15"
                  : "border-border bg-surface"
              }`}
            >
              {degree}
            </span>
          ),
        )}
      </div>
    </DiagramShell>
  );
}

function SongStructure({ title }: { title: string }) {
  const sections = ["Intro", "Verse", "Chorus", "Bridge", "Outro"];
  return (
    <DiagramShell label={`Song-section timeline for ${title}`}>
      <div className="grid grid-cols-5 gap-1">
        {sections.map((section, index) => (
          <div
            key={section}
            className={`relative rounded-xl border-2 p-3 text-center ${
              index === 2
                ? "border-warning bg-warning/15"
                : "border-accent/30 bg-accent/8"
            }`}
          >
            <span className="text-[11px] font-black text-muted">
              {index + 1}
            </span>
            <p className="mt-1 text-[11px] font-black sm:text-xs">{section}</p>
          </div>
        ))}
      </div>
      <div className="mt-3 grid gap-2 sm:grid-cols-3">
        {[
          ["REPEAT", "What stays recognisable?"],
          ["CHANGE", "What creates contrast?"],
          ["CONNECT", "What happens across the boundary?"],
        ].map(([label, body]) => (
          <div key={label} className="rounded-xl border border-border bg-surface p-3">
            <p className="text-[11px] font-black text-accent">{label}</p>
            <p className="mt-1 text-xs leading-5">{body}</p>
          </div>
        ))}
      </div>
    </DiagramShell>
  );
}

function AlternativeDiagram({ title }: { title: string }) {
  return (
    <DiagramShell label={`Simplified control-and-result diagram for ${title}`}>
      <div className="grid gap-2 sm:grid-cols-[1fr_auto_1fr_auto_1fr] sm:items-center">
        {[
          ["KEEP STILL", "Pulse + musical context"],
          ["MOVE ONE CONTROL", title],
          ["COMPARE", "What changed in the sound?"],
        ].map(([label, body], index) => (
          <div key={label} className="contents">
            <div className="rounded-xl border-2 border-warning/45 bg-warning/10 p-3 text-center">
              <p className="text-[11px] font-black text-warning">{label}</p>
              <p className="mt-1 text-xs font-bold leading-5">{body}</p>
            </div>
            {index < 2 && (
              <ArrowRight
                className="mx-auto h-4 w-4 rotate-90 text-muted sm:rotate-0"
                aria-hidden="true"
              />
            )}
          </div>
        ))}
      </div>
    </DiagramShell>
  );
}

function ExplicitRhythmDiagram({
  visual,
}: {
  visual: Extract<ExplicitLessonVisual, { kind: "rhythm-grid" }>;
}) {
  const eventBySlot = new Map(
    visual.events.map((event) => [event.slot, event]),
  );
  const beatGroups = Array.from({ length: visual.beats }, (_unused, beat) =>
    Array.from(
      { length: visual.slotsPerBeat },
      (_empty, withinBeat) => beat * visual.slotsPerBeat + withinBeat,
    ),
  );

  return (
    <DiagramShell
      label={`Explicit ${visual.beats}-beat rhythm with ${visual.slotsPerBeat} timing position${visual.slotsPerBeat === 1 ? "" : "s"} per beat`}
    >
      {visual.pulseOnly && (
        <div className="mb-4 flex justify-center" aria-hidden="true">
          <span className="flex h-20 w-20 animate-pulse items-center justify-center rounded-full border-4 border-warning bg-warning/20 font-display text-2xl text-warning motion-reduce:animate-none">
            TAP
          </span>
        </div>
      )}
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        {beatGroups.map((slots, beatIndex) => (
          <div
            key={`beat-${beatIndex}`}
            className="rounded-xl border-2 border-foreground/20 bg-surface p-2"
          >
            <p className="mb-2 text-center text-xs font-black uppercase tracking-wide text-muted">
              Beat {beatIndex + 1}
            </p>
            <div
              className="grid gap-1"
              style={{
                gridTemplateColumns: `repeat(${visual.slotsPerBeat}, minmax(0, 1fr))`,
              }}
            >
              {slots.map((slot) => {
                const event = eventBySlot.get(slot);
                const direction = visual.handDirections[slot];
                const symbol =
                  event?.type === "muted"
                    ? "X"
                    : event?.type === "played"
                      ? event.accented
                        ? ">●"
                        : "●"
                      : event?.type === "rest"
                        ? "REST"
                        : "MISS";
                return (
                  <div key={slot} className="min-w-0 text-center">
                    <span className="block rounded-md bg-warning/15 px-1 py-1 text-xs font-black">
                      {visual.countLabels[slot]}
                    </span>
                    <span className="mt-1 block text-xs font-black text-muted">
                      {direction === "D" ? "Down ↓" : "Up ↑"}
                    </span>
                    <span
                      className={`mt-1 flex min-h-10 items-center justify-center rounded-md border-2 px-1 text-xs font-black ${
                        event?.type === "played"
                          ? "border-accent bg-accent/12 text-accent"
                          : event?.type === "muted"
                            ? "border-cyan bg-cyan/12 text-cyan"
                            : event?.type === "rest"
                              ? "border-dotted border-warning text-warning"
                              : "border-dashed border-border text-muted"
                      }`}
                    >
                      {symbol}
                    </span>
                    {event?.chord && (
                      <span className="mt-1 block truncate text-xs font-black">
                        {event.chord}
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
      <div className="mt-3 flex flex-wrap gap-x-3 gap-y-1 text-xs font-bold text-muted">
        <span>● played</span>
        <span>&gt;● accented</span>
        <span>X muted contact</span>
        <span>MISS hand moves, no contact</span>
        <span>REST measured silence</span>
      </div>
    </DiagramShell>
  );
}

function ExplicitFretboardDiagram({
  visual,
}: {
  visual: Extract<ExplicitLessonVisual, { kind: "fretboard" }>;
}) {
  const notes = new Map(
    visual.notes.map((note) => [`${note.string}:${note.fret}`, note]),
  );
  return (
    <DiagramShell
      label={`Explicit beginner fretboard from fret 0 to ${visual.fretCount}`}
    >
      <div
        className="grid gap-0.5 text-center text-[11px] sm:gap-1"
        style={{
          gridTemplateColumns: `2.8rem repeat(${visual.fretCount + 1}, minmax(0, 1fr))`,
        }}
      >
        <span className="font-black text-muted">STRING</span>
        {Array.from({ length: visual.fretCount + 1 }, (_unused, fret) => (
          <span
            key={fret}
            className={`font-black ${fret === 0 ? "text-warning" : "text-muted"}`}
          >
            {fret === 0 ? "0·NUT" : fret}
          </span>
        ))}
        {[1, 2, 3, 4, 5, 6].map((string) => (
          <div key={string} className="contents">
            <span className="flex items-center gap-1 font-black text-muted">
              <span>{string}</span>
              <span
                aria-hidden="true"
                className="block flex-1 rounded-full bg-current"
                style={{
                  height: visual.showStringThickness
                    ? `${0.5 + string * 0.28}px`
                    : "1px",
                }}
              />
            </span>
            {Array.from({ length: visual.fretCount + 1 }, (_unused, fret) => {
              const note = notes.get(`${string}:${fret}`);
              return (
                <span
                  key={`${string}:${fret}`}
                  className={`flex min-h-8 min-w-0 items-center justify-center rounded-md border px-0.5 font-black leading-3 ${
                    note?.role === "root"
                      ? "border-warning bg-warning text-[#18121f]"
                      : note
                        ? "border-accent/50 bg-accent/12 text-accent"
                        : fret === 0
                          ? "border-warning/30 bg-warning/5 text-muted"
                          : "border-border bg-surface text-transparent"
                  }`}
                  title={note?.label}
                >
                  {note
                    ? visual.showNoteNames === false
                      ? note.role === "root"
                        ? "HOME"
                        : "●"
                      : note.label
                    : "·"}
                </span>
              );
            })}
          </div>
        ))}
      </div>
      <p className="mt-3 text-xs font-bold leading-5 text-muted">
        String 1 is thin and high. String 6 is thick and low. Fret 0 means the
        open string at the nut.
      </p>
    </DiagramShell>
  );
}

function ExplicitChordDiagram({
  visual,
}: {
  visual: Extract<ExplicitLessonVisual, { kind: "chord-diagram" }>;
}) {
  return (
    <DiagramShell label={`Playable ${visual.chordName} chord diagram`}>
      <div className="mx-auto max-w-sm">
        <p className="text-center font-display text-xl">{visual.chordName}</p>
        <p className="mt-1 text-center text-xs font-bold text-muted">
          Starting fret {visual.startingFret}
        </p>
        <GuitarChordDiagram
          chordName={visual.chordName}
          startingFret={visual.startingFret}
          strings={visual.strings.map((instruction) => ({
            string: instruction.string,
            fret: instruction.fret,
            finger: instruction.finger,
            root: instruction.role === "root",
          }))}
          className="mt-2"
        />
      </div>
    </DiagramShell>
  );
}

function ExplicitOrientationDiagram({
  visual,
}: {
  visual: Extract<ExplicitLessonVisual, { kind: "guitar-orientation" }>;
}) {
  return (
    <DiagramShell label="Guitar orientation with physical landmarks">
      <div className="relative mx-auto flex min-h-36 max-w-3xl items-center">
        <div className="h-10 w-20 rounded-l-2xl border-4 border-warning/70 bg-warning/15" />
        <div className="relative h-5 flex-1 border-y-4 border-foreground/30 bg-surface">
          <span className="absolute inset-x-0 top-1/2 h-px bg-foreground/40" />
          <span className="absolute left-0 top-[-0.55rem] text-[11px] font-black text-warning">
            NUT
          </span>
        </div>
        <div className="h-32 w-36 rounded-[45%] border-4 border-accent/50 bg-accent/10">
          <span className="mx-auto mt-10 block h-12 w-12 rounded-full border-4 border-foreground/20" />
        </div>
      </div>
      <div className="mt-4 grid gap-2 sm:grid-cols-3">
        {visual.labels.map((label) => (
          <div
            key={label.name}
            className="rounded-xl border border-border bg-surface p-3"
          >
            <p className="text-xs font-black">{label.name}</p>
            <p className="mt-1 text-xs leading-5 text-muted">
              {label.plainEnglish}
            </p>
          </div>
        ))}
      </div>
    </DiagramShell>
  );
}

function ExplicitPickingDiagram({
  visual,
}: {
  visual: Extract<ExplicitLessonVisual, { kind: "picking" }>;
}) {
  return (
    <DiagramShell label="Explicit pick direction, movement, and string contact">
      <div className="grid gap-2 sm:grid-cols-4">
        {visual.steps.map((step, index) => (
          <div
            key={`${step.label}-${index}`}
            className="rounded-xl border-2 border-border bg-surface p-3 text-center"
          >
            <span
              aria-hidden="true"
              className="mx-auto block h-10 w-6 rotate-12 rounded-b-full rounded-t-md border-2 border-warning bg-warning/25"
            />
            <p className="mt-2 text-xs font-black">{step.label}</p>
            <p className="mt-1 text-xs font-bold text-muted">
              {step.direction === "D"
                ? "Toward floor ↓"
                : step.direction === "U"
                  ? "Toward ceiling ↑"
                  : "Relax between motions"}
            </p>
            <p className="mt-1 text-[11px] uppercase tracking-wide text-accent">
              {step.contact}
            </p>
          </div>
        ))}
      </div>
    </DiagramShell>
  );
}

function ExplicitTabDiagram({
  visual,
}: {
  visual: Extract<ExplicitLessonVisual, { kind: "tab" }>;
}) {
  return (
    <DiagramShell label="Six-line tablature with explicit string and fret events">
      <div className="space-y-2">
        {visual.strings.map((stringName, displayIndex) => {
          const string = displayIndex + 1;
          return (
            <div
              key={`${stringName}-${string}`}
              className="grid grid-cols-[1.5rem_repeat(4,minmax(0,1fr))] items-center gap-1"
            >
              <span className="text-xs font-black text-muted">
                {stringName}
              </span>
              {[1, 2, 3, 4].map((beat) => {
                const event = visual.events.find(
                  (candidate) =>
                    candidate.string === string &&
                    candidate.beat === beat,
                );
                return (
                  <span
                    key={beat}
                    className="flex min-h-8 items-center justify-center border-y border-foreground/25 text-xs font-black"
                  >
                    {event ? event.fret : "—"}
                  </span>
                );
              })}
            </div>
          );
        })}
      </div>
      <p className="mt-3 text-xs font-bold leading-5 text-muted">
        Top line = thin high E, string 1. Numbers are frets. Read left to right.
      </p>
    </DiagramShell>
  );
}

function ExplicitPhraseDiagram({
  visual,
}: {
  visual: Extract<ExplicitLessonVisual, { kind: "phrase-timeline" }>;
}) {
  return (
    <DiagramShell label={`Explicit ${visual.beats}-beat phrase timeline`}>
      <div
        className="grid gap-1"
        style={{
          gridTemplateColumns: `repeat(${visual.beats}, minmax(0, 1fr))`,
        }}
      >
        {Array.from({ length: visual.beats }, (_unused, index) => (
          <span
            key={index}
            className="rounded-md bg-warning/15 py-1 text-center text-xs font-black"
          >
            {index + 1}
          </span>
        ))}
      </div>
      <div className="relative mt-2 min-h-32 rounded-xl border-2 border-border bg-surface p-2">
        {visual.events.map((event, index) => (
          <div
            key={`${event.beat}-${event.label}-${index}`}
            className={`absolute top-3 flex min-h-20 items-center justify-center rounded-lg border-2 px-2 text-center text-[11px] font-black leading-4 ${
              event.role === "rest"
                ? "border-dashed border-warning bg-warning/8 text-warning"
                : event.role === "root"
                  ? "border-warning bg-warning text-[#18121f]"
                  : "border-accent/50 bg-accent/12 text-accent"
            }`}
            style={{
              left: `${((event.beat - 1) / visual.beats) * 100}%`,
              width: `${Math.max((event.duration / visual.beats) * 100, 8)}%`,
            }}
          >
            <span>
              {event.label}
              {event.string && event.fret !== undefined
                ? ` · S${event.string} F${event.fret}`
                : ""}
            </span>
          </div>
        ))}
      </div>
      <p className="mt-3 text-xs font-bold leading-5 text-muted">
        Block position shows when the note or rest begins; width shows how long
        it lasts.
      </p>
    </DiagramShell>
  );
}

function ExplicitDiagram({ visual }: { visual: ExplicitLessonVisual }) {
  if (visual.kind === "rhythm-grid") {
    return <ExplicitRhythmDiagram visual={visual} />;
  }
  if (visual.kind === "fretboard") {
    return <ExplicitFretboardDiagram visual={visual} />;
  }
  if (visual.kind === "chord-diagram") {
    return <ExplicitChordDiagram visual={visual} />;
  }
  if (visual.kind === "guitar-orientation") {
    return <ExplicitOrientationDiagram visual={visual} />;
  }
  if (visual.kind === "picking") {
    return <ExplicitPickingDiagram visual={visual} />;
  }
  if (visual.kind === "tab") {
    return <ExplicitTabDiagram visual={visual} />;
  }
  return <ExplicitPhraseDiagram visual={visual} />;
}

export function LessonVisualization({
  section,
  conceptTitle,
  alternative = false,
}: {
  section: VisualSection;
  conceptTitle: string;
  alternative?: boolean;
}) {
  if (alternative) return <AlternativeDiagram title={conceptTitle} />;
  if (section.visualData) {
    return <ExplicitDiagram visual={section.visualData} />;
  }
  if (section.type === "rhythm-grid") {
    return <RhythmDiagram title={conceptTitle} />;
  }
  if (section.type === "picking-animation") {
    return <PickingDiagram title={conceptTitle} />;
  }
  if (section.type === "chord-diagram") {
    return <ChordDiagram title={conceptTitle} />;
  }
  if (section.type === "scale-comparison") {
    return <ScaleComparison title={conceptTitle} />;
  }
  if (section.type === "song-structure") {
    return <SongStructure title={conceptTitle} />;
  }
  return <FretboardDiagram title={conceptTitle} />;
}
