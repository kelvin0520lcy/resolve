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
import type { VisualSection } from "@/features/guitar-learning/types";

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
      <div className="grid grid-cols-[2.9rem_repeat(8,minmax(1.4rem,1fr))] gap-0.5 text-center text-[9px] sm:grid-cols-[3.7rem_repeat(8,minmax(2rem,1fr))] sm:gap-1 sm:text-xs">
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
      <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-[10px] font-bold text-muted">
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
            <span className="text-[9px] font-black text-muted">
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
              <span className="mt-1 text-[10px] font-black">{string}</span>
            </div>
          </div>
        ))}
      </div>
      <div className="mt-4 space-y-2">
        {["B string", "G string", "D string"].map((string) => (
          <div key={string} className="flex items-center gap-2">
            <span className="w-14 text-[9px] font-black text-muted">{string}</span>
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
      <div className="mb-2 grid grid-cols-[1.7rem_repeat(8,minmax(1.35rem,1fr))] gap-0.5 text-center text-[8px] font-black text-muted sm:grid-cols-[2rem_repeat(8,minmax(1.8rem,1fr))] sm:gap-1 sm:text-[9px]">
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
              <span className="flex items-center justify-center text-[9px] font-black text-muted">
                {openString.replace(/\d/g, "")}
              </span>
              {board
                .filter((note) => note.stringIndex === stringIndex)
                .map((note) => {
                  const highlighted = usefulIntervals.includes(note.interval);
                  return (
                    <span
                      key={`${stringIndex}-${note.fret}`}
                      className={`flex min-h-7 items-center justify-center rounded-md border text-[9px] font-black ${
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
  const dotPositions = [
    [5, 1],
    [4, 3],
    [3, 3],
    [2, 2],
  ];

  return (
    <DiagramShell label={`Chord formula and interval voicing for ${title}`}>
      <div className="grid gap-4 sm:grid-cols-[minmax(0,1fr)_12rem] sm:items-center">
        <div>
          <p className="text-[10px] font-black uppercase tracking-wide text-muted">
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
        <div className="grid grid-cols-6 gap-1 rounded-xl border border-border bg-surface p-2">
          {Array.from({ length: 30 }, (_unused, index) => {
            const string = index % 6;
            const fret = Math.floor(index / 6);
            const dotIndex = dotPositions.findIndex(
              ([dotString, dotFret]) =>
                dotString === string && dotFret === fret,
            );
            return (
              <span
                key={index}
                className={`flex aspect-square items-center justify-center border-b border-r border-foreground/20 text-[8px] font-black ${
                  dotIndex >= 0
                    ? "rounded-full bg-accent text-white"
                    : "text-transparent"
                }`}
              >
                {dotIndex >= 0
                  ? formula[dotIndex % formula.length]
                  : "·"}
              </span>
            );
          })}
          {["E", "A", "D", "G", "B", "e"].map((string) => (
            <span
              key={string}
              className="text-center text-[8px] font-black text-muted"
            >
              {string}
            </span>
          ))}
        </div>
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
      <div className="mt-3 grid grid-cols-7 gap-1 text-center text-[9px] font-black">
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
            <span className="text-[9px] font-black text-muted">
              {index + 1}
            </span>
            <p className="mt-1 text-[10px] font-black sm:text-xs">{section}</p>
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
            <p className="text-[9px] font-black text-accent">{label}</p>
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
              <p className="text-[9px] font-black text-warning">{label}</p>
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
