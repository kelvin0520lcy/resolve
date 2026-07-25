"use client";

import dynamic from "next/dynamic";
import { useState, type FormEvent } from "react";
import {
  BookOpen,
  Check,
  Clock3,
  Compass,
  Gauge,
  Guitar,
  MapPinned,
  Music2,
  Plus,
  Sparkles,
  X,
} from "lucide-react";
import { PageShell } from "@/components/layout/page-shell";
import { Badge, ProgressBar } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  EmptyState,
  MetricCard,
  PageIntro,
  alignedFieldLabelClassName,
  fieldClassName,
  textAreaClassName,
} from "@/components/ui/resolve";
import { offsetDate, useResolve } from "@/contexts/resolve-context";
import {
  GUITAR_LEARNING_AREAS,
  getGuitarLearningStats,
  getSuggestedGuitarArea,
} from "@/lib/guitar-learning";
import { formatDate } from "@/lib/utils";
import { GuitarLearnMode } from "@/features/guitar-learning/components/learn-mode";
import { GuitarLearningMap } from "@/features/guitar-learning/components/learning-map";
import {
  GuitarStudioNav,
  type GuitarStudioMode,
} from "@/features/guitar-learning/components/studio-nav";
import type { GuitarToolId } from "@/features/guitar-learning/types";

const GuitarExploreMode = dynamic(
  () =>
    import(
      "@/features/guitar-learning/components/explore-mode"
    ).then((module) => module.GuitarExploreMode),
  {
    loading: () => (
      <div
        role="status"
        className="flex min-h-96 items-center justify-center rounded-[22px] border-2 border-dashed border-border bg-surface/70"
      >
        <div className="text-center">
          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-accent/25 border-t-accent" />
          <p className="mt-3 text-xs font-black uppercase tracking-wide text-muted">
            Opening the interactive studio
          </p>
        </div>
      </div>
    ),
  },
);

const MODE_INTROS: Record<
  Exclude<GuitarStudioMode, "overview">,
  { eyebrow: string; title: string; description: string }
> = {
  learn: {
    eyebrow: "Guided learning",
    title: "Understand it, hear it, use it",
    description:
      "Follow a prerequisite-aware lesson, compare the sound, try it on the guitar, and confirm understanding through musical evidence.",
  },
  explore: {
    eyebrow: "Interactive studio",
    title: "Touch the theory and hear it move",
    description:
      "Experiment with the fretboard, rhythm, picking, harmony, phrasing, ear training, metronome, and drones without polluting your practice history.",
  },
  "learning-map": {
    eyebrow: "Knowledge map",
    title: "See the route behind the next note",
    description:
      "Inspect seven complete learning paths, understand every locked prerequisite, and override concepts you already know.",
  },
};

export default function GuitarPage() {
  const {
    guitarLearning,
    updateGuitarLearning,
    goals,
    guitarSessions,
  } = useResolve();
  const [mode, setMode] = useState<GuitarStudioMode>("overview");
  const [selectedToolId, setSelectedToolId] =
    useState<GuitarToolId>("fretboard");
  const [lessonToOpen, setLessonToOpen] = useState<string>();
  const [lessonStageById, setLessonStageById] = useState<
    Record<string, number>
  >({});

  function openTool(toolId: GuitarToolId) {
    setSelectedToolId(toolId);
    setMode("explore");
  }

  return (
    <PageShell title="Guitar Studio">
      <div className="mx-auto max-w-7xl space-y-6">
        <GuitarStudioNav
          mode={mode}
          onChange={setMode}
        />

        <div
          id={`guitar-${mode}-panel`}
          role="tabpanel"
          aria-label={`${mode.replace("-", " ")} guitar studio`}
          className="min-w-0"
        >
          {mode === "overview" ? (
            <GuitarOverview />
          ) : (
            <>
              <PageIntro
                eyebrow={MODE_INTROS[mode].eyebrow}
                title={MODE_INTROS[mode].title}
                description={MODE_INTROS[mode].description}
                action={
                  mode === "learn" ? (
                    <Button
                      type="button"
                      variant="secondary"
                      onClick={() => setMode("learning-map")}
                    >
                      <MapPinned className="h-4 w-4" />
                      View prerequisites
                    </Button>
                  ) : mode === "explore" ? (
                    <Badge variant="accent">
                      <Compass className="mr-1 h-3.5 w-3.5" />
                      15 working tools
                    </Badge>
                  ) : (
                    <Button
                      type="button"
                      variant="secondary"
                      onClick={() => setMode("learn")}
                    >
                      <BookOpen className="h-4 w-4" />
                      Return to Learn
                    </Button>
                  )
                }
              />
              <div className="mt-6">
                {mode === "learn" && (
                  <GuitarLearnMode
                    state={guitarLearning}
                    updateState={updateGuitarLearning}
                    goals={goals}
                    sessions={guitarSessions}
                    onOpenTool={openTool}
                    initialLessonId={lessonToOpen}
                    initialLessonStage={
                      lessonToOpen
                        ? lessonStageById[lessonToOpen]
                        : undefined
                    }
                    onActiveLessonChange={setLessonToOpen}
                    onLessonStageChange={(lessonId, stage) =>
                      setLessonStageById((current) => ({
                        ...current,
                        [lessonId]: stage,
                      }))
                    }
                  />
                )}
                {mode === "explore" && (
                  <GuitarExploreMode
                    selectedToolId={selectedToolId}
                    onSelectTool={setSelectedToolId}
                    onOpenLesson={(lessonId) => {
                      setLessonToOpen(lessonId);
                      setMode("learn");
                    }}
                  />
                )}
                {mode === "learning-map" && (
                  <GuitarLearningMap
                    state={guitarLearning}
                    updateState={updateGuitarLearning}
                    onOpenLesson={(lessonId) => {
                      setLessonToOpen(lessonId);
                      setMode("learn");
                    }}
                  />
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </PageShell>
  );
}

function GuitarOverview() {
  const { guitarSessions, addGuitarSession } = useResolve();
  const [showForm, setShowForm] = useState(false);
  const [practiceDate, setPracticeDate] = useState(offsetDate(0));
  const [duration, setDuration] = useState("30");
  const [category, setCategory] = useState(
    GUITAR_LEARNING_AREAS[0].name,
  );
  const [technique, setTechnique] = useState(
    GUITAR_LEARNING_AREAS[0].topics[0],
  );
  const [cleanBpm, setCleanBpm] = useState("");
  const [confidence, setConfidence] = useState("3");
  const [difficulty, setDifficulty] = useState("3");
  const [material, setMaterial] = useState("");
  const [notes, setNotes] = useState("");
  const [nextFocus, setNextFocus] = useState("");

  const totalMinutes = guitarSessions.reduce(
    (sum, session) => sum + session.durationMinutes,
    0,
  );
  const bestBpm = Math.max(
    ...guitarSessions.map((session) => session.cleanBpm ?? 0),
    0,
  );
  const learningStats = getGuitarLearningStats(guitarSessions);
  const suggestedArea = getSuggestedGuitarArea(guitarSessions);
  const areasStarted = learningStats.filter(
    (area) => area.sessionCount > 0,
  ).length;
  const selectedArea =
    GUITAR_LEARNING_AREAS.find((area) => area.name === category) ??
    GUITAR_LEARNING_AREAS[0];
  const skillMinutes = guitarSessions.reduce<Record<string, number>>(
    (totals, session) => {
      totals[session.category] =
        (totals[session.category] ?? 0) + session.durationMinutes;
      return totals;
    },
    {},
  );
  const dominantSkill = Object.entries(skillMinutes).sort(
    (a, b) => b[1] - a[1],
  )[0];

  function submit(event: FormEvent) {
    event.preventDefault();
    const durationMinutes = Number(duration);
    const bpm = cleanBpm.trim() ? Number(cleanBpm) : undefined;
    if (
      !Number.isFinite(durationMinutes) ||
      durationMinutes < 5 ||
      (bpm !== undefined && (!Number.isFinite(bpm) || bpm < 20)) ||
      !nextFocus.trim()
    ) {
      return;
    }
    addGuitarSession({
      date: practiceDate,
      durationMinutes,
      instrument: "Electric guitar",
      category,
      techniques: [technique],
      cleanBpm: bpm,
      confidence: Number(confidence),
      difficulty: Number(difficulty),
      song:
        category === "Repertoire" || category === "Performance"
          ? material.trim() || undefined
          : undefined,
      exercise:
        category !== "Repertoire" && category !== "Performance"
          ? material.trim() || undefined
          : undefined,
      notes: notes.trim(),
      nextFocus: nextFocus.trim(),
    });
    setMaterial("");
    setNotes("");
    setNextFocus("");
    setShowForm(false);
  }

  function chooseLearningFocus(areaName: string, topic: string) {
    setCategory(areaName);
    setTechnique(topic);
    setShowForm(true);
    window.requestAnimationFrame(() => {
      document
        .getElementById("guitar-practice-form")
        ?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  }

  return (
      <div className="space-y-6">
        <PageIntro
          eyebrow="Practice room"
          title="Make improvement audible"
          description="Choose what you are learning, record honest practice evidence, and always leave yourself a clear next note."
          action={
            <Button onClick={() => setShowForm((value) => !value)}>
              {showForm ? <X className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
              {showForm ? "Close" : "Log practice"}
            </Button>
          }
        />

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <MetricCard
            label="Total practice"
            value={`${Math.floor(totalMinutes / 60)}h ${totalMinutes % 60}m`}
            detail="time with the instrument"
            icon={<Clock3 className="h-5 w-5" />}
          />
          <MetricCard
            label="Practice entries"
            value={guitarSessions.length}
            detail="sessions with a next focus"
            icon={<Music2 className="h-5 w-5" />}
          />
          <MetricCard
            label="Clean tempo"
            value={bestBpm ? `${bestBpm} BPM` : "Not logged"}
            detail="best reliable benchmark"
            icon={<Gauge className="h-5 w-5" />}
          />
          <MetricCard
            label="Learning coverage"
            value={`${areasStarted}/${GUITAR_LEARNING_AREAS.length}`}
            detail="learning areas explored"
            icon={<BookOpen className="h-5 w-5" />}
          />
        </div>

        {showForm && (
          <Card id="guitar-practice-form" className="border-accent/30">
            <CardHeader>
              <CardTitle>Log this practice session</CardTitle>
              <CardDescription>
                Capture just enough detail to make the next session easier.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form
                onSubmit={submit}
                className="grid gap-4 md:grid-cols-2 xl:grid-cols-3"
              >
                <label className={alignedFieldLabelClassName}>
                  <span className="flex items-end">Practice date</span>
                  <input
                    className={fieldClassName}
                    type="date"
                    max={offsetDate(0)}
                    value={practiceDate}
                    onChange={(event) => setPracticeDate(event.target.value)}
                    required
                  />
                </label>
                <label className={alignedFieldLabelClassName}>
                  <span className="flex items-end">
                    Duration{" "}
                    <span className="ml-1 font-medium text-muted">
                      (minutes)
                    </span>
                  </span>
                  <input
                    className={fieldClassName}
                    type="number"
                    min="5"
                    max="720"
                    value={duration}
                    onChange={(event) => setDuration(event.target.value)}
                    required
                  />
                </label>
                <label className={alignedFieldLabelClassName}>
                  <span className="flex items-end">Learning area</span>
                  <select
                    className={fieldClassName}
                    value={category}
                    onChange={(event) => {
                      const nextArea =
                        GUITAR_LEARNING_AREAS.find(
                          (area) => area.name === event.target.value,
                        ) ?? GUITAR_LEARNING_AREAS[0];
                      setCategory(nextArea.name);
                      setTechnique(nextArea.topics[0]);
                    }}
                  >
                    {GUITAR_LEARNING_AREAS.map((area) => (
                      <option key={area.id} value={area.name}>
                        {area.name}
                      </option>
                    ))}
                  </select>
                </label>
                <label className={alignedFieldLabelClassName}>
                  <span className="flex items-end">Practice focus</span>
                  <select
                    className={fieldClassName}
                    value={technique}
                    onChange={(event) => setTechnique(event.target.value)}
                  >
                    {selectedArea.topics.map((topic) => (
                      <option key={topic}>{topic}</option>
                    ))}
                  </select>
                </label>
                <label className={alignedFieldLabelClassName}>
                  <span className="flex items-end">
                    Song or exercise{" "}
                    <span className="ml-1 font-medium text-muted">
                      (optional)
                    </span>
                  </span>
                  <input
                    className={fieldClassName}
                    value={material}
                    onChange={(event) => setMaterial(event.target.value)}
                  />
                </label>
                <label className={alignedFieldLabelClassName}>
                  <span className="flex items-end">
                    Clean tempo{" "}
                    <span className="ml-1 font-medium text-muted">
                      (BPM, optional)
                    </span>
                  </span>
                  <input
                    className={fieldClassName}
                    type="number"
                    min="20"
                    max="400"
                    value={cleanBpm}
                    onChange={(event) => setCleanBpm(event.target.value)}
                  />
                </label>
                <label className={alignedFieldLabelClassName}>
                  <span className="flex items-end">Challenge level</span>
                  <select
                    className={fieldClassName}
                    value={difficulty}
                    onChange={(event) => setDifficulty(event.target.value)}
                  >
                    <option value="1">1/5 · Comfortable</option>
                    <option value="2">2/5 · Manageable</option>
                    <option value="3">3/5 · Stretching</option>
                    <option value="4">4/5 · Difficult</option>
                    <option value="5">5/5 · At the limit</option>
                  </select>
                </label>
                <label className={alignedFieldLabelClassName}>
                  <span className="flex items-end">Confidence afterward</span>
                  <select
                    className={fieldClassName}
                    value={confidence}
                    onChange={(event) => setConfidence(event.target.value)}
                  >
                    <option value="1">1/5 · Lost</option>
                    <option value="2">2/5 · Unsteady</option>
                    <option value="3">3/5 · Developing</option>
                    <option value="4">4/5 · Reliable</option>
                    <option value="5">5/5 · Performance-ready</option>
                  </select>
                </label>
                <label
                  className={`${alignedFieldLabelClassName} md:col-span-2 xl:col-span-1`}
                >
                  <span className="flex items-end">
                    What changed during this session?
                  </span>
                  <textarea
                    className={textAreaClassName}
                    value={notes}
                    onChange={(event) => setNotes(event.target.value)}
                  />
                </label>
                <label
                  className={`${alignedFieldLabelClassName} md:col-span-2 xl:col-span-3`}
                >
                  <span className="flex items-end">
                    Exact starting point for next time
                  </span>
                  <textarea
                    className={textAreaClassName}
                    value={nextFocus}
                    onChange={(event) => setNextFocus(event.target.value)}
                    required
                  />
                </label>
                <Button
                  type="submit"
                  className="md:col-span-2 xl:col-span-3"
                >
                  Save practice session
                </Button>
              </form>
            </CardContent>
          </Card>
        )}

        <Card className="overflow-hidden">
          <div className="h-1.5 bg-gradient-to-r from-accent via-warning to-success" />
          <CardHeader>
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <CardTitle>Practice assessment</CardTitle>
                <CardDescription className="mt-1">
                  A useful snapshot of breadth, repetition, and the next gap.
                </CardDescription>
              </div>
              <Badge variant={guitarSessions.length ? "accent" : "warning"}>
                {guitarSessions.length ? "Evidence-based" : "Needs a baseline"}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="grid gap-3 md:grid-cols-3">
            <div className="rounded-2xl border border-border bg-surface p-4">
              <p className="text-xs font-black uppercase tracking-wider text-muted">
                Strongest evidence
              </p>
              <p className="mt-2 font-black">
                {dominantSkill?.[0] ?? "No area assessed yet"}
              </p>
              <p className="mt-1 text-xs leading-5 text-muted">
                {dominantSkill
                  ? `${dominantSkill[1]} minutes logged in this area.`
                  : "Log one honest session to establish your starting point."}
              </p>
            </div>
            <div className="rounded-2xl border border-border bg-surface p-4">
              <p className="text-xs font-black uppercase tracking-wider text-muted">
                Breadth
              </p>
              <p className="mt-2 font-black">
                {areasStarted} of {GUITAR_LEARNING_AREAS.length} areas
              </p>
              <p className="mt-1 text-xs leading-5 text-muted">
                Revisit skills deeply, but do not let one comfortable area hide
                every gap.
              </p>
            </div>
            <div className="rounded-2xl border border-accent/25 bg-accent/5 p-4">
              <p className="flex items-center gap-1.5 text-xs font-black uppercase tracking-wider text-accent">
                <Sparkles className="h-3.5 w-3.5" />
                Suggested next area
              </p>
              <p className="mt-2 font-black">{suggestedArea.name}</p>
              <p className="mt-1 text-xs leading-5 text-muted">
                {suggestedArea.description}
              </p>
              <Button
                type="button"
                size="sm"
                variant="secondary"
                className="mt-3"
                onClick={() =>
                  chooseLearningFocus(
                    suggestedArea.name,
                    suggestedArea.topics[0],
                  )
                }
              >
                Practise this next
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Practice-area coverage</CardTitle>
            <CardDescription>
              A broad curriculum from first clean notes to playing complete
              music with other people. Tap any topic to prepare a practice log.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {learningStats.map((area) => {
              const coverage =
                (area.practisedTopics.length / area.topics.length) * 100;
              return (
                <section
                  key={area.id}
                  className="rounded-2xl border border-border bg-surface p-4"
                  aria-labelledby={`guitar-area-${area.id}`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3
                        id={`guitar-area-${area.id}`}
                        className="font-black"
                      >
                        {area.name}
                      </h3>
                      <p className="mt-1 text-xs leading-5 text-muted">
                        {area.description}
                      </p>
                    </div>
                    <Badge variant={area.sessionCount ? "accent" : "default"}>
                      {area.minutes} min
                    </Badge>
                  </div>
                  <ProgressBar
                    className="mt-4"
                    value={coverage}
                    color={
                      coverage === 100 ? "var(--success)" : "var(--accent)"
                    }
                    label={`${area.name} topic coverage`}
                  />
                  <p className="mt-2 text-[11px] font-bold text-muted">
                    {area.practisedTopics.length}/{area.topics.length} topics
                    practised
                  </p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {area.topics.map((topic) => {
                      const practised = area.practisedTopics.includes(topic);
                      return (
                        <button
                          key={topic}
                          type="button"
                          onClick={() =>
                            chooseLearningFocus(area.name, topic)
                          }
                          className={`inline-flex min-h-9 items-center gap-1.5 rounded-xl border px-2.5 py-1.5 text-left text-xs font-bold transition ${
                            practised
                              ? "border-success/35 bg-success/10 text-success"
                              : "border-border bg-surface-muted text-muted hover:border-accent hover:text-accent"
                          }`}
                          aria-label={`Practise ${topic} in ${area.name}`}
                        >
                          {practised && <Check className="h-3 w-3" />}
                          {topic}
                        </button>
                      );
                    })}
                  </div>
                </section>
              );
            })}
          </CardContent>
        </Card>

        <div className="grid gap-6 lg:grid-cols-[0.7fr_1.3fr]">
          <Card>
            <CardHeader>
              <CardTitle>Practice mix</CardTitle>
              <CardDescription>
                Check whether one skill is crowding out the others.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              {Object.entries(skillMinutes)
                .sort((a, b) => b[1] - a[1])
                .map(([skill, minutes]) => (
                  <div key={skill}>
                    <div className="mb-2 flex justify-between text-sm">
                      <span className="font-bold">{skill}</span>
                      <span className="text-muted">{minutes} min</span>
                    </div>
                    <ProgressBar value={(minutes / totalMinutes) * 100} />
                  </div>
                ))}
              {dominantSkill ? (
                <div className="rounded-2xl bg-warning/10 p-4 text-sm leading-6">
                  <strong>Studio note:</strong> {dominantSkill[0]} currently
                  takes the largest share. Keep another skill in the next
                  session if you want a more balanced practice mix.
                </div>
              ) : (
                <EmptyState
                  icon={<Guitar className="h-6 w-6" />}
                  title="No practice mix yet"
                  description="Log a session and the balance between your practice categories will appear here."
                  action={
                    <Button onClick={() => setShowForm(true)}>
                      Log practice
                    </Button>
                  }
                />
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Recent sessions</CardTitle>
              <CardDescription>
                Your next focus is carried forward automatically.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {guitarSessions.map((session) => (
                <div
                  key={session.id}
                  className="rounded-2xl border border-border bg-surface p-4"
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="font-black">{session.category}</p>
                      <p className="mt-1 text-xs text-muted">
                        {formatDate(`${session.date}T12:00:00`)} ·{" "}
                        {session.durationMinutes} minutes
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {session.cleanBpm && (
                        <Badge variant="accent">
                          {session.cleanBpm} clean BPM
                        </Badge>
                      )}
                      {session.confidence && (
                        <Badge variant="success">
                          Confidence {session.confidence}/5
                        </Badge>
                      )}
                      {session.difficulty && (
                        <Badge>Challenge {session.difficulty}/5</Badge>
                      )}
                    </div>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {session.techniques.map((item) => (
                      <Badge key={item}>{item}</Badge>
                    ))}
                  </div>
                  {(session.song || session.exercise) && (
                    <p className="mt-3 flex items-center gap-2 text-sm font-semibold">
                      <Music2 className="h-4 w-4 text-accent" />
                      {session.song ?? session.exercise}
                    </p>
                  )}
                  {session.notes && (
                    <p className="mt-3 text-sm leading-6">{session.notes}</p>
                  )}
                  {session.nextFocus && (
                    <p className="mt-3 rounded-xl bg-surface-muted p-3 text-xs leading-5 text-muted">
                      <strong className="text-foreground">Next focus:</strong>{" "}
                      {session.nextFocus}
                    </p>
                  )}
                </div>
              ))}
              {!guitarSessions.length && (
                <EmptyState
                  title="No sessions logged"
                  description="Your real practice history and next-focus notes will appear here."
                />
              )}
            </CardContent>
          </Card>
        </div>
      </div>
  );
}
