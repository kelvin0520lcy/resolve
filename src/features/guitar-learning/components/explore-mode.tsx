"use client";

import dynamic from "next/dynamic";
import Image from "next/image";
import { useState } from "react";
import {
  AudioLines,
  BookOpen,
  BrainCircuit,
  ChevronRight,
  CircleHelp,
  Compass,
  Drum,
  Ear,
  Gauge,
  Grid3X3,
  Hand,
  Layers3,
  Map,
  MessageCircleReply,
  Music2,
  Search,
  Sparkles,
  Waves,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { fieldClassName } from "@/components/ui/resolve";
import {
  findGuitarGuideEntries,
  GUITAR_GUIDE_SUGGESTIONS,
} from "@/features/guitar-learning/data/guide";
import { GUITAR_LESSON_BY_ID } from "@/features/guitar-learning/data/curriculum";
import type {
  GuitarCoach,
  GuitarToolId,
} from "@/features/guitar-learning/types";

const ToolLoading = () => (
  <div
    role="status"
    className="flex min-h-72 items-center justify-center rounded-2xl border-2 border-dashed border-border bg-surface/60"
  >
    <div className="text-center">
      <div className="mx-auto h-9 w-9 animate-spin rounded-full border-4 border-accent/25 border-t-accent" />
      <p className="mt-3 text-xs font-black uppercase tracking-wide text-muted">
        Setting up the studio tool
      </p>
    </div>
  </div>
);

const FretboardExplorer = dynamic(
  () =>
    import(
      "@/features/guitar-learning/components/tools/fretboard-explorer"
    ).then((module) => module.FretboardExplorer),
  { loading: ToolLoading },
);
const RhythmLab = dynamic(
  () =>
    import(
      "@/features/guitar-learning/components/tools/rhythm-lab"
    ).then((module) => module.RhythmLab),
  { loading: ToolLoading },
);
const PickingVisualizer = dynamic(
  () =>
    import(
      "@/features/guitar-learning/components/tools/picking-visualizer"
    ).then((module) => module.PickingVisualizer),
  { loading: ToolLoading },
);
const HarmonyWorkbench = dynamic(
  () =>
    import(
      "@/features/guitar-learning/components/tools/harmony-workbench"
    ).then((module) => module.HarmonyWorkbench),
  { loading: ToolLoading },
);
const ImprovisationCoach = dynamic(
  () =>
    import(
      "@/features/guitar-learning/components/tools/improvisation-coach"
    ).then((module) => module.ImprovisationCoach),
  { loading: ToolLoading },
);
const EarTrainingLab = dynamic(
  () =>
    import(
      "@/features/guitar-learning/components/tools/ear-training-lab"
    ).then((module) => module.EarTrainingLab),
  { loading: ToolLoading },
);
const PracticeAudioTools = dynamic(
  () =>
    import(
      "@/features/guitar-learning/components/tools/practice-audio-tools"
    ).then((module) => module.PracticeAudioTools),
  { loading: ToolLoading },
);

export type GuitarToolDefinition = {
  id: GuitarToolId;
  title: string;
  shortTitle: string;
  description: string;
  group: "Fretboard" | "Rhythm" | "Harmony" | "Expression" | "Listening";
  coach: GuitarCoach;
  icon: typeof Map;
};

export const GUITAR_TOOLS: GuitarToolDefinition[] = [
  {
    id: "fretboard",
    title: "Interactive Fretboard Explorer",
    shortTitle: "Fretboard",
    description:
      "Map notes, intervals, roots, scale tones, chord tones, tunings, and adjacent relationships across 24 frets.",
    group: "Fretboard",
    coach: "ryo",
    icon: Map,
  },
  {
    id: "scales",
    title: "Scale Explorer",
    shortTitle: "Scales",
    description:
      "Construct, hear, compare, and locate scale formulas instead of memorising disconnected boxes.",
    group: "Fretboard",
    coach: "bocchi",
    icon: Grid3X3,
  },
  {
    id: "rhythm",
    title: "Rhythm & Strumming Laboratory",
    shortTitle: "Rhythm",
    description:
      "Build full subdivision grids, deconstruct D/U shorthand, transform grooves, and hear deliberate silence.",
    group: "Rhythm",
    coach: "nijika",
    icon: Drum,
  },
  {
    id: "picking",
    title: "Picking Visualiser",
    shortTitle: "Picking",
    description:
      "See pick direction, depth, inside/outside crossings, string skips, and legato coordination in motion.",
    group: "Rhythm",
    coach: "bocchi",
    icon: Hand,
  },
  {
    id: "chords",
    title: "Chord Explorer",
    shortTitle: "Chords",
    description:
      "Build chord qualities from interval roles, simplify voicings, and inspect shared-tone voice leading.",
    group: "Harmony",
    coach: "kita",
    icon: Music2,
  },
  {
    id: "triads",
    title: "Triad Explorer",
    shortTitle: "Triads",
    description:
      "Compare root position and both inversions by bass note, note order, sound, and movable relationship.",
    group: "Harmony",
    coach: "ryo",
    icon: Layers3,
  },
  {
    id: "arpeggios",
    title: "Arpeggio Explorer",
    shortTitle: "Arpeggios",
    description:
      "Contrast sequenced chord tones with scales and practise chord-tone arrivals through a phrase.",
    group: "Harmony",
    coach: "ryo",
    icon: Waves,
  },
  {
    id: "progressions",
    title: "Chord Progression Explorer",
    shortTitle: "Progressions",
    description:
      "Transpose Roman-numeral progressions and hear tonic, predominant, and dominant function.",
    group: "Harmony",
    coach: "nijika",
    icon: Compass,
  },
  {
    id: "theory",
    title: "Theory Visualisers",
    shortTitle: "Theory",
    description:
      "Construct intervals, scales, chords, harmonised keys, and transpositions as audible note relationships.",
    group: "Harmony",
    coach: "ryo",
    icon: BrainCircuit,
  },
  {
    id: "emotional",
    title: "Emotional Guitar Explorer",
    shortTitle: "Emotion",
    description:
      "Turn brightness, tension, motion, and intensity into a concrete scale, chord, rhythm, and articulation constraint.",
    group: "Expression",
    coach: "kita",
    icon: Sparkles,
  },
  {
    id: "improvisation",
    title: "Improvisation Coach",
    shortTitle: "Improvise",
    description:
      "Practise roots, chord tones, endings, rests, motifs, position links, and call-and-response under useful limits.",
    group: "Expression",
    coach: "bocchi",
    icon: MessageCircleReply,
  },
  {
    id: "phrase-builder",
    title: "Phrase Builder",
    shortTitle: "Phrases",
    description:
      "Edit pitch, duration, rest, accent, and articulation events, then compare and analyse the musical evidence.",
    group: "Expression",
    coach: "bocchi",
    icon: BookOpen,
  },
  {
    id: "ear-training",
    title: "Ear Training Laboratory",
    shortTitle: "Ear training",
    description:
      "Train pitch, intervals, chord quality, note matching, rhythm imitation, tension, and phrase endings without a microphone.",
    group: "Listening",
    coach: "nijika",
    icon: Ear,
  },
  {
    id: "metronome",
    title: "Web Audio Metronome",
    shortTitle: "Metronome",
    description:
      "Schedule quarter, eighth, or sixteenth muted-string ticks, choose the accent, see the pulse, and set tempo by tapping.",
    group: "Listening",
    coach: "nijika",
    icon: Gauge,
  },
  {
    id: "drone",
    title: "Tonal-Centre Drone",
    shortTitle: "Drone",
    description:
      "Sustain a root, power, major, or minor context for intonation, bending, scale colour, and phrase-ending practice.",
    group: "Listening",
    coach: "kita",
    icon: AudioLines,
  },
];

const COACH_ASSETS = {
  bocchi: "/illustrations/cut-in-bocchi-v2.webp",
  nijika: "/illustrations/cut-in-nijika-v2.webp",
  ryo: "/illustrations/cut-in-ryo-v2.webp",
  kita: "/illustrations/cut-in-kita-v2.webp",
} as const;

function ContextualGuide({
  onSelectTool,
}: {
  onSelectTool: (toolId: GuitarToolId) => void;
}) {
  const [query, setQuery] = useState("");
  const [submittedQuery, setSubmittedQuery] = useState("");
  const results = findGuitarGuideEntries(submittedQuery);

  return (
    <Card>
      <CardHeader>
        <Badge variant="accent" className="mb-2 w-fit">
          <CircleHelp className="mr-1 h-3 w-3" />
          Local concept guide
        </Badge>
        <CardTitle>Ask a guitar question</CardTitle>
        <CardDescription>
          Searches a curated concept index in this app. Answers do not leave
          the browser and are not generated by an external AI service.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <label className="text-xs font-black">
          What feels unclear?
          <div className="mt-2 flex gap-2">
            <span className="relative min-w-0 flex-1">
              <Search className="pointer-events-none absolute left-3 top-3.5 h-4 w-4 text-muted" />
              <input
                className={`${fieldClassName} pl-10`}
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter") setSubmittedQuery(query);
                }}
              />
            </span>
            <Button
              type="button"
              disabled={!query.trim()}
              onClick={() => setSubmittedQuery(query)}
            >
              Ask
            </Button>
          </div>
        </label>
        <div className="mt-3 flex flex-wrap gap-2">
          {GUITAR_GUIDE_SUGGESTIONS.map((suggestion) => (
            <button
              key={suggestion}
              type="button"
              className="rounded-xl border border-border bg-surface-muted px-2.5 py-2 text-left text-[11px] font-bold hover:border-accent"
              onClick={() => {
                setQuery(suggestion);
                setSubmittedQuery(suggestion);
              }}
            >
              {suggestion}
            </button>
          ))}
        </div>

        {submittedQuery && results.length === 0 && (
          <p className="mt-4 rounded-xl border border-warning/25 bg-warning/10 p-3 text-xs leading-5">
            I could not match that wording yet. Try a shorter concept such as
            “strumming”, “bends”, “picking”, “chord”, “scale”, or “phrase”.
          </p>
        )}
        <div className="mt-4 space-y-3">
          {results.map((result) => (
            <article
              key={result.id}
              className="rounded-2xl border border-border bg-surface p-4"
            >
              <div className="flex flex-wrap items-center gap-2">
                <Badge>{result.coach}</Badge>
                <p className="font-black">{result.title}</p>
              </div>
              <p className="mt-3 text-sm leading-6 text-muted">
                {result.answer}
              </p>
              <p className="mt-3 rounded-xl bg-accent/8 p-3 text-xs leading-5">
                <strong>Try next:</strong> {result.tryNext}
              </p>
              <div className="mt-3 flex flex-wrap items-center gap-2">
                <Button
                  type="button"
                  size="sm"
                  onClick={() => onSelectTool(result.toolId)}
                >
                  Open {result.toolId.replace("-", " ")}
                  <ChevronRight className="h-3.5 w-3.5" />
                </Button>
                {result.lessonIds.map((lessonId) => (
                  <Badge key={lessonId} variant="default">
                    {GUITAR_LESSON_BY_ID.get(lessonId)?.title ??
                      "Related lesson"}
                  </Badge>
                ))}
              </div>
            </article>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

export function GuitarExploreMode({
  selectedToolId,
  onSelectTool,
}: {
  selectedToolId: GuitarToolId;
  onSelectTool: (toolId: GuitarToolId) => void;
}) {
  const activeTool =
    GUITAR_TOOLS.find((tool) => tool.id === selectedToolId) ??
    GUITAR_TOOLS[0];
  const ActiveIcon = activeTool.icon;
  const groups = [...new Set(GUITAR_TOOLS.map((tool) => tool.group))];

  function renderTool() {
    if (selectedToolId === "fretboard") return <FretboardExplorer />;
    if (selectedToolId === "rhythm") return <RhythmLab />;
    if (selectedToolId === "picking") return <PickingVisualizer />;
    if (
      [
        "scales",
        "chords",
        "triads",
        "arpeggios",
        "progressions",
        "emotional",
        "theory",
      ].includes(selectedToolId)
    ) {
      return (
        <HarmonyWorkbench
          mode={
            selectedToolId as
              | "scales"
              | "chords"
              | "triads"
              | "arpeggios"
              | "progressions"
              | "emotional"
              | "theory"
          }
        />
      );
    }
    if (
      selectedToolId === "improvisation" ||
      selectedToolId === "phrase-builder"
    ) {
      return <ImprovisationCoach mode={selectedToolId} />;
    }
    if (selectedToolId === "ear-training") return <EarTrainingLab />;
    return (
      <PracticeAudioTools
        mode={selectedToolId as "metronome" | "drone"}
      />
    );
  }

  return (
    <div className="grid min-w-0 gap-5 xl:grid-cols-[15rem_minmax(0,1fr)]">
      <aside className="min-w-0">
        <div className="arc-strip flex gap-2 overflow-x-auto pb-2 xl:block xl:space-y-4 xl:overflow-visible">
          {groups.map((group) => (
            <div key={group} className="min-w-max xl:min-w-0">
              <p className="mb-2 hidden px-2 text-[9px] font-black uppercase tracking-[0.18em] text-muted xl:block">
                {group}
              </p>
              <div className="flex gap-2 xl:grid">
                {GUITAR_TOOLS.filter((tool) => tool.group === group).map(
                  (tool) => {
                    const Icon = tool.icon;
                    return (
                      <button
                        key={tool.id}
                        type="button"
                        aria-pressed={selectedToolId === tool.id}
                        onClick={() => onSelectTool(tool.id)}
                        className={`flex min-h-11 items-center gap-2 rounded-xl border-2 px-3 py-2 text-left text-xs font-black transition xl:w-full ${
                          selectedToolId === tool.id
                            ? "border-accent bg-accent/15 text-accent"
                            : "border-border bg-surface hover:border-accent/50"
                        }`}
                      >
                        <Icon className="h-4 w-4 shrink-0" />
                        {tool.shortTitle}
                      </button>
                    );
                  },
                )}
              </div>
            </div>
          ))}
        </div>
      </aside>

      <div className="min-w-0 space-y-5">
        <section className="relative overflow-hidden rounded-[24px] border-2 border-border bg-surface-elevated">
          <div className="relative z-10 max-w-3xl p-5 sm:p-6">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="accent">{activeTool.group}</Badge>
              <Badge>{activeTool.coach} station</Badge>
            </div>
            <div className="mt-3 flex items-center gap-3">
              <span className="sticker flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-warning text-[#18121f]">
                <ActiveIcon className="h-5 w-5" />
              </span>
              <h2 className="font-display text-2xl tracking-wide sm:text-3xl">
                {activeTool.title}
              </h2>
            </div>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-muted">
              {activeTool.description}
            </p>
          </div>
          <div className="pointer-events-none absolute inset-y-0 right-0 hidden w-64 opacity-20 sm:block">
            <Image
              src={COACH_ASSETS[activeTool.coach]}
              alt=""
              fill
              sizes="256px"
              className="object-contain object-bottom"
            />
          </div>
        </section>

        <Card className="min-w-0">
          <CardContent className="min-w-0 pt-5">
            {renderTool()}
          </CardContent>
        </Card>

        <ContextualGuide onSelectTool={onSelectTool} />
      </div>
    </div>
  );
}
