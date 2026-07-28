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
  Mic,
  Music2,
  Repeat2,
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
  GuitarLearningState,
  GuitarToolId,
} from "@/features/guitar-learning/types";
import { GuitarTuner } from "@/features/guitar-learning/components/tools/tuner";
import { ChordChangeTrainer } from "@/features/guitar-learning/components/tools/chord-change-trainer";
import { GuidedGuitarTool } from "@/features/guitar-learning/components/tools/guided-tool";
import { GuitarGlossarySearch } from "@/features/guitar-learning/components/glossary";
import {
  AUTHORED_GUITAR_TOOL_PRESETS,
  getAuthoredGuitarToolPreset,
} from "@/features/guitar-learning/data/authored-tool-presets";

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
    id: "tuner",
    title: "Standard Guitar Tuner",
    shortTitle: "Tuner",
    description:
      "Tune E A D G B E with a live direction display or private reference tones.",
    group: "Listening",
    coach: "kita",
    icon: Mic,
  },
  {
    id: "chord-trainer",
    title: "Chord-Change Trainer",
    shortTitle: "Chord changes",
    description:
      "See both shapes, count only clean changes, and keep a best score for each chord pair.",
    group: "Harmony",
    coach: "nijika",
    icon: Repeat2,
  },
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

export const GUITAR_TOOL_QUICK_START: Record<
  GuitarToolId,
  { setup: string; action: string; success: string }
> = {
  tuner: {
    setup: "Mute five strings and play one open string near your device.",
    action: "Turn the matching tuning peg slowly in the direction shown.",
    success: "The indicator remains within ±5 cents and says In tune.",
  },
  "chord-trainer": {
    setup: "Choose two chords and a 30- or 60-second timer.",
    action: "Strum each shape once and count only changes where the intended strings ring.",
    success: "Your clean-change score improves without extra hand tension.",
  },
  fretboard: {
    setup: "Choose a root and one display layer: notes, intervals, scale, or chord.",
    action: "Find the highlighted root twice, then trace one interval from each root.",
    success: "You can predict the second location before revealing or playing it.",
  },
  scales: {
    setup: "Choose a root and scale, then read the interval formula before the note names.",
    action: "Play the scale, change one scale type, and identify the notes that changed.",
    success: "You can explain the new colour using the changed scale degrees.",
  },
  rhythm: {
    setup: "Choose the subdivision and start slowly enough to count every cell aloud.",
    action: "Toggle sound, mute, accent, and rest cells while the hand-direction row stays continuous.",
    success: "You can count and loop three identical bars without losing a silent hand pass.",
  },
  picking: {
    setup: "Choose a picking pattern and inspect its D/U arrows before pressing play.",
    action: "Follow one event at a time, saying the direction and destination string first.",
    success: "Your pick arrives on the correct side of the next string without resetting.",
  },
  chords: {
    setup: "Choose a root and chord quality, then read the interval recipe.",
    action: "Inspect each chord tone and compare a second voicing or nearby chord.",
    success: "You can name the colour tone and keep shared notes still during the change.",
  },
  triads: {
    setup: "Choose a major or minor triad and one three-string set.",
    action: "Cycle root position, first inversion, and second inversion while naming the bass note.",
    success: "You can predict the next note order and move to it with minimal motion.",
  },
  arpeggios: {
    setup: "Choose a chord quality and compare its chord tones with the full parent scale.",
    action: "Play the arpeggio, then make one phrase land on a chord tone.",
    success: "The landing note sounds connected to the harmony rather than merely inside the scale.",
  },
  progressions: {
    setup: "Choose a key and read the Roman numerals before the chord names.",
    action: "Play the progression, transpose the key, and track each chord’s function.",
    success: "You hear which chord feels stable, prepares motion, or demands resolution.",
  },
  theory: {
    setup: "Choose one theory visual and keep a single root fixed.",
    action: "Change one interval, scale, chord, or key parameter and play both versions.",
    success: "You can describe the audible change before reading its label.",
  },
  emotional: {
    setup: "Set brightness, tension, motion, and intensity to match one intended mood.",
    action: "Use the suggested scale, chord, rhythm, and articulation as a four-bar constraint.",
    success: "A listener can hear the intended contrast when you change only one mood control.",
  },
  improvisation: {
    setup: "Choose a tonal centre and one constraint such as roots, rests, motifs, or phrase endings.",
    action: "Play a short call, leave space, then answer while preserving one feature.",
    success: "Both phrases have audible beginnings and endings instead of sounding like scale runs.",
  },
  "phrase-builder": {
    setup: "Begin with the sample phrase and listen once before editing.",
    action: "Change only one pitch, duration, rest, accent, or articulation event.",
    success: "You can name the edit and accurately predict how it changes the phrase.",
  },
  "ear-training": {
    setup: "Choose one listening skill and listen before looking at the choices.",
    action: "Hum, clap, or predict the answer, then submit and replay the comparison.",
    success: "Your audible clue predicts the answer consistently across several questions.",
  },
  metronome: {
    setup: "Set a comfortable tempo, subdivision, and accent pattern.",
    action: "Count aloud, play one bar, then leave one bar silent while keeping the pulse.",
    success: "You re-enter on beat one without chasing or waiting for the click.",
  },
  drone: {
    setup: "Choose a root and tonal quality that matches the skill you are practising.",
    action: "Play a short phrase, hold its final note, and compare its stability against the drone.",
    success: "You can hear and deliberately choose a stable or tense phrase ending.",
  },
};

const COACH_ASSETS = {
  bocchi: "/illustrations/cut-in-bocchi-v2.webp",
  nijika: "/illustrations/cut-in-nijika-v2.webp",
  ryo: "/illustrations/cut-in-ryo-v2.webp",
  kita: "/illustrations/cut-in-kita-v2.webp",
} as const;

function ContextualGuide({
  onSelectTool,
  onOpenLesson,
}: {
  onSelectTool: (toolId: GuitarToolId) => void;
  onOpenLesson: (lessonId: string) => void;
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
                  <Button
                    key={lessonId}
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={() => onOpenLesson(lessonId)}
                  >
                    <BookOpen className="h-3.5 w-3.5" />
                    {GUITAR_LESSON_BY_ID.get(lessonId)?.title ??
                      "Related lesson"}
                  </Button>
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
  selectedPresetId,
  onSelectTool,
  onSelectPreset,
  onOpenLesson,
  state,
  updateState,
}: {
  selectedToolId: GuitarToolId;
  selectedPresetId?: string;
  onSelectTool: (toolId: GuitarToolId) => void;
  onSelectPreset: (presetId: string) => void;
  onOpenLesson: (lessonId: string) => void;
  state: GuitarLearningState;
  updateState: (
    updater: (current: GuitarLearningState) => GuitarLearningState,
  ) => void;
}) {
  const [toolMode, setToolMode] = useState<"guided" | "sandbox">("guided");
  const activeTool =
    GUITAR_TOOLS.find((tool) => tool.id === selectedToolId) ??
    GUITAR_TOOLS[0];
  const ActiveIcon = activeTool.icon;
  const quickStart = GUITAR_TOOL_QUICK_START[activeTool.id];
  const groups = [...new Set(GUITAR_TOOLS.map((tool) => tool.group))];

  function renderTool() {
    if (selectedToolId === "tuner") return <GuitarTuner />;
    if (selectedToolId === "chord-trainer") {
      return <ChordChangeTrainer state={state} updateState={updateState} />;
    }
    const hasGuidedPreset = AUTHORED_GUITAR_TOOL_PRESETS.some(
      (preset) => preset.toolId === selectedToolId,
    );
    if (toolMode === "guided" && hasGuidedPreset) {
      return (
        <GuidedGuitarTool
          toolId={selectedToolId}
          presetId={
            getAuthoredGuitarToolPreset(selectedPresetId)?.toolId === selectedToolId
              ? selectedPresetId
              : undefined
          }
          onSelectPreset={onSelectPreset}
          onOpenLesson={onOpenLesson}
        />
      );
    }
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
    if (selectedToolId === "ear-training") {
      return <EarTrainingLab onOpenLesson={onOpenLesson} />;
    }
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

        <section
          aria-labelledby="guitar-tool-quick-start"
          className="grid gap-2 rounded-2xl border-2 border-accent/20 bg-accent/5 p-4 sm:grid-cols-3"
        >
          <h3 id="guitar-tool-quick-start" className="sr-only">
            Quick start for {activeTool.title}
          </h3>
          {[
            ["1 · Set up", quickStart.setup],
            ["2 · Try it", quickStart.action],
            ["3 · You’ve got it when", quickStart.success],
          ].map(([label, instruction]) => (
            <div
              key={label}
              className="rounded-xl border border-border bg-surface p-3"
            >
              <p className="text-[9px] font-black uppercase tracking-[0.14em] text-accent">
                {label}
              </p>
              <p className="mt-2 text-xs leading-5">{instruction}</p>
            </div>
          ))}
        </section>

        {!["tuner", "chord-trainer"].includes(selectedToolId) && (
          <div
            className="flex w-fit rounded-xl border-2 border-border bg-surface p-1"
            role="group"
            aria-label="Tool mode"
          >
            {(["guided", "sandbox"] as const).map((item) => (
              <button
                key={item}
                type="button"
                aria-pressed={toolMode === item}
                onClick={() => setToolMode(item)}
                className={`rounded-lg px-4 py-2 text-xs font-black capitalize ${
                  toolMode === item
                    ? "bg-accent text-white"
                    : "text-muted hover:text-foreground"
                }`}
              >
                {item}
              </button>
            ))}
          </div>
        )}

        <Card className="min-w-0">
          <CardContent className="min-w-0 pt-5">
            {renderTool()}
          </CardContent>
        </Card>

        <ContextualGuide
          onSelectTool={onSelectTool}
          onOpenLesson={onOpenLesson}
        />
        <Card>
          <CardContent className="pt-5">
            <GuitarGlossarySearch />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
