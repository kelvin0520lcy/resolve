"use client";

import dynamic from "next/dynamic";
import { useEffect, useState, type FormEvent } from "react";
import {
  BookOpen,
  Check,
  Clock3,
  Compass,
  Gauge,
  Guitar,
  MapPinned,
  Music2,
  Pencil,
  Plus,
  Sparkles,
  X,
} from "lucide-react";
import { PageShell } from "@/components/layout/page-shell";
import { Badge, ProgressBar } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ConfirmDeleteButton } from "@/components/ui/confirm-delete-button";
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
import {
  GuitarStudioNav,
  type GuitarStudioMode,
} from "@/features/guitar-learning/components/studio-nav";
import type { GuitarToolId } from "@/features/guitar-learning/types";

function StudioPanelLoading({ label }: { label: string }) {
  return (
    <div
      role="status"
      className="flex min-h-96 items-center justify-center rounded-[22px] border-2 border-dashed border-border bg-surface/70"
    >
      <div className="text-center">
        <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-accent/25 border-t-accent" />
        <p className="mt-3 text-xs font-black uppercase tracking-wide text-muted">
          {label}
        </p>
      </div>
    </div>
  );
}

const GuitarLearnMode = dynamic(
  () =>
    import(
      "@/features/guitar-learning/components/learn-mode"
    ).then((module) => module.GuitarLearnMode),
  {
    loading: () => <StudioPanelLoading label="Preparing guided lessons" />,
  },
);

const GuitarLearningMap = dynamic(
  () =>
    import(
      "@/features/guitar-learning/components/learning-map"
    ).then((module) => module.GuitarLearningMap),
  {
    loading: () => <StudioPanelLoading label="Drawing the learning map" />,
  },
);

const GuitarExploreMode = dynamic(
  () =>
    import(
      "@/features/guitar-learning/components/explore-mode"
    ).then((module) => module.GuitarExploreMode),
  {
    loading: () => (
      <StudioPanelLoading label="Opening the interactive studio" />
    ),
  },
);

const GuitarPracticeMode = dynamic(
  () =>
    import(
      "@/features/guitar-learning/components/practice-mode"
    ).then((module) => module.GuitarPracticeMode),
  {
    loading: () => <StudioPanelLoading label="Building today’s practice" />,
  },
);

const MODE_INTROS: Record<
  GuitarStudioMode,
  { eyebrow: string; title: string; description: string }
> = {
  learn: {
    eyebrow: "Guided learning",
    title: "Understand it, hear it, use it",
    description:
      "Follow a prerequisite-aware lesson, compare the sound, try it on the guitar, and confirm understanding through musical evidence.",
  },
  practise: {
    eyebrow: "Practice room",
    title: "Know exactly what to do next",
    description:
      "Choose a short routine, tune up, train clean chord changes, or diagnose the exact problem you can hear and feel.",
  },
  tools: {
    eyebrow: "Interactive tools",
    title: "Start guided, then explore freely",
    description:
      "Use a lesson preset with only the controls you need, or switch to Sandbox when you are ready to experiment.",
  },
  progress: {
    eyebrow: "Your evidence",
    title: "See what is becoming reliable",
    description:
      "Review course mastery, practice history, clean tempos, weak areas, and the next prerequisite that will unlock progress.",
  },
};

export default function GuitarPage() {
  const {
    guitarLearning,
    updateGuitarLearning,
    goals,
    guitarSessions,
    tasks = [],
    addTask,
  } = useResolve();
  const [mode, setMode] = useState<GuitarStudioMode>("learn");
  const [selectedToolId, setSelectedToolId] =
    useState<GuitarToolId>("fretboard");
  const [selectedPresetId, setSelectedPresetId] = useState<string>();
  const [lessonToOpen, setLessonToOpen] = useState<string>();
  const [sessionToOpen, setSessionToOpen] = useState<string>();
  const [lessonStageById, setLessonStageById] = useState<
    Record<string, number>
  >({});

  useEffect(() => {
    function openDeepLink(href = window.location.href) {
      const url = new URL(href, window.location.origin);
      const requestedMode = url.searchParams.get("mode");
      const requestedLesson = url.searchParams.get("lesson");
      const requestedSession = url.searchParams.get("session");
      const normalizedMode: Record<string, GuitarStudioMode> = {
        overview: "progress",
        learn: "learn",
        explore: "tools",
        "learning-map": "progress",
        practise: "practise",
        tools: "tools",
        progress: "progress",
      };
      if (requestedMode && normalizedMode[requestedMode]) {
        setMode(normalizedMode[requestedMode]);
      }
      if (requestedLesson) {
        setLessonToOpen(requestedLesson);
        setMode("learn");
      }
      if (requestedSession) {
        setSessionToOpen(requestedSession);
        setMode("progress");
      }
    }
    const handleRecord = (event: Event) => {
      const href = (event as CustomEvent<{ href?: string }>).detail?.href;
      if (href?.startsWith("/guitar")) openDeepLink(href);
    };
    openDeepLink();
    window.addEventListener("resolve:open-record", handleRecord);
    return () => window.removeEventListener("resolve:open-record", handleRecord);
  }, []);

  function updateLessonDeepLink(lessonId?: string) {
    setLessonToOpen(lessonId);
    const url = new URL(window.location.href);
    if (lessonId) {
      url.searchParams.set("mode", "learn");
      url.searchParams.set("lesson", lessonId);
    } else {
      url.searchParams.delete("lesson");
    }
    window.history.replaceState(
      window.history.state,
      "",
      `${url.pathname}${url.search}${url.hash}`,
    );
  }

  function openTool(toolId: GuitarToolId, presetId?: string) {
    setSelectedToolId(toolId);
    setSelectedPresetId(presetId);
    setMode("tools");
  }

  function createLessonTask(lessonId: string, lessonTitle: string) {
    if (typeof addTask !== "function") return;
    if (
      tasks.some(
        (task) =>
          task.origin?.kind === "guitar-lesson" &&
          task.origin.lessonId === lessonId &&
          !["completed", "cancelled", "skipped"].includes(task.status),
      )
    ) {
      return;
    }
    addTask({
      title: `Practise: ${lessonTitle}`,
      category: "guitar",
      priority: "medium",
      estimatedMinutes: 30,
      origin: { kind: "guitar-lesson", lessonId },
    });
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
                    onClick={() => setMode("progress")}
                  >
                    <MapPinned className="h-4 w-4" />
                    View course map
                  </Button>
                ) : mode === "tools" ? (
                  <Badge variant="accent">
                    <Compass className="mr-1 h-3.5 w-3.5" />
                    17 working tools
                  </Badge>
                ) : mode === "progress" ? (
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={() => setMode("learn")}
                  >
                    <BookOpen className="h-4 w-4" />
                    Return to Learn
                  </Button>
                ) : undefined
              }
            />
            <div className="mt-6">
                {mode === "learn" && (
                  <GuitarLearnMode
                    key={lessonToOpen ?? "guitar-learn"}
                    state={guitarLearning}
                    updateState={updateGuitarLearning}
                    goals={goals}
                    sessions={guitarSessions}
                    lessonTaskIds={tasks
                      .filter(
                        (task) =>
                          task.origin?.kind === "guitar-lesson" &&
                          !["completed", "cancelled", "skipped"].includes(
                            task.status,
                          ),
                      )
                      .map((task) =>
                        task.origin?.kind === "guitar-lesson"
                          ? task.origin.lessonId
                          : "",
                      )}
                    onCreateLessonTask={createLessonTask}
                    onOpenTool={openTool}
                    initialLessonId={lessonToOpen}
                    initialLessonStage={
                      lessonToOpen
                        ? lessonStageById[lessonToOpen]
                        : undefined
                    }
                    onActiveLessonChange={updateLessonDeepLink}
                    onLessonStageChange={(lessonId, stage) =>
                      setLessonStageById((current) => ({
                        ...current,
                        [lessonId]: stage,
                      }))
                    }
                  />
                )}
                {mode === "practise" && (
                  <GuitarPracticeMode
                    state={guitarLearning}
                    updateState={updateGuitarLearning}
                    onOpenTool={openTool}
                    onOpenLesson={(lessonId) => {
                      updateLessonDeepLink(lessonId);
                      setMode("learn");
                    }}
                  />
                )}
                {mode === "tools" && (
                  <GuitarExploreMode
                    selectedToolId={selectedToolId}
                    selectedPresetId={selectedPresetId}
                    onSelectTool={setSelectedToolId}
                    onSelectPreset={setSelectedPresetId}
                    state={guitarLearning}
                    updateState={updateGuitarLearning}
                    onOpenLesson={(lessonId) => {
                      updateLessonDeepLink(lessonId);
                      setMode("learn");
                    }}
                  />
                )}
                {mode === "progress" && (
                  <div className="space-y-6">
                    <GuitarLearningMap
                      state={guitarLearning}
                      updateState={updateGuitarLearning}
                      onOpenLesson={(lessonId) => {
                        updateLessonDeepLink(lessonId);
                        setMode("learn");
                      }}
                    />
                    <GuitarOverview deepLinkedSessionId={sessionToOpen} />
                  </div>
                )}
            </div>
          </>
        </div>
      </div>
    </PageShell>
  );
}

function GuitarOverview({
  deepLinkedSessionId,
}: {
  deepLinkedSessionId?: string;
}) {
  const {
    guitarSessions,
    addGuitarSession,
    updateGuitarSession,
    removeGuitarSession,
  } = useResolve();
  const [showForm, setShowForm] = useState(false);
  const [editingSessionId, setEditingSessionId] = useState<string | null>(
    null,
  );
  const [showAllSessions, setShowAllSessions] = useState(false);
  const [practiceDate, setPracticeDate] = useState(offsetDate(0));
  const [duration, setDuration] = useState("30");
  const [instrument, setInstrument] = useState("Electric guitar");
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
  const visibleSessions =
    showAllSessions ||
    Boolean(
      deepLinkedSessionId &&
        !guitarSessions.slice(0, 6).some(
          (session) => session.id === deepLinkedSessionId,
        ),
    )
    ? guitarSessions
    : guitarSessions.slice(0, 6);

  useEffect(() => {
    if (!deepLinkedSessionId) return;
    const frame = window.requestAnimationFrame(() => {
      document
        .getElementById(`guitar-session-${deepLinkedSessionId}`)
        ?.scrollIntoView({ behavior: "smooth", block: "center" });
    });
    return () => window.cancelAnimationFrame(frame);
  }, [deepLinkedSessionId, guitarSessions.length]);

  function resetForm() {
    setPracticeDate(offsetDate(0));
    setDuration("30");
    setInstrument("Electric guitar");
    setCategory(GUITAR_LEARNING_AREAS[0].name);
    setTechnique(GUITAR_LEARNING_AREAS[0].topics[0]);
    setCleanBpm("");
    setConfidence("3");
    setDifficulty("3");
    setMaterial("");
    setNotes("");
    setNextFocus("");
    setEditingSessionId(null);
    setShowForm(false);
  }

  function startNewSession() {
    resetForm();
    setShowForm(true);
  }

  function startEditingSession(
    session: (typeof guitarSessions)[number],
  ) {
    const area =
      GUITAR_LEARNING_AREAS.find(
        (item) => item.name === session.category,
      ) ?? GUITAR_LEARNING_AREAS[0];
    const focus = area.topics.includes(session.techniques[0])
      ? session.techniques[0]
      : area.topics[0];
    setEditingSessionId(session.id);
    setPracticeDate(session.date);
    setDuration(String(session.durationMinutes));
    setInstrument(session.instrument ?? "Electric guitar");
    setCategory(area.name);
    setTechnique(focus);
    setCleanBpm(session.cleanBpm ? String(session.cleanBpm) : "");
    setConfidence(String(session.confidence ?? 3));
    setDifficulty(String(session.difficulty ?? 3));
    setMaterial(session.song ?? session.exercise ?? "");
    setNotes(session.notes ?? "");
    setNextFocus(session.nextFocus ?? "");
    setShowForm(true);
    window.requestAnimationFrame(() => {
      document
        .getElementById("guitar-practice-form")
        ?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  }

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
    const changes = {
      date: practiceDate,
      durationMinutes,
      instrument: instrument.trim() || undefined,
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
    };
    if (editingSessionId) {
      updateGuitarSession(editingSessionId, changes);
    } else {
      addGuitarSession(changes);
    }
    resetForm();
  }

  function chooseLearningFocus(areaName: string, topic: string) {
    setEditingSessionId(null);
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
            <Button
              onClick={() => {
                if (showForm) resetForm();
                else startNewSession();
              }}
            >
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
              <CardTitle>
                {editingSessionId
                  ? "Edit this practice session"
                  : "Log this practice session"}
              </CardTitle>
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
                  <span className="flex items-end">Instrument</span>
                  <input
                    className={fieldClassName}
                    value={instrument}
                    onChange={(event) => setInstrument(event.target.value)}
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
                  {editingSessionId
                    ? "Save session changes"
                    : "Save practice session"}
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
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
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
                    <Button onClick={startNewSession}>
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
              {visibleSessions.map((session) => (
                <div
                  key={session.id}
                  id={`guitar-session-${session.id}`}
                  className="scroll-mt-24 rounded-2xl border border-border bg-surface p-4"
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
                      <Button
                        type="button"
                        size="sm"
                        variant="ghost"
                        onClick={() => startEditingSession(session)}
                        aria-label={`Edit practice session from ${session.date}`}
                      >
                        <Pencil className="h-3.5 w-3.5" />
                        Edit
                      </Button>
                      <ConfirmDeleteButton
                        itemLabel={`practice session from ${session.date}`}
                        onConfirm={() => removeGuitarSession(session.id)}
                        className="flex-wrap justify-end"
                      />
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
              {guitarSessions.length > 6 && (
                <Button
                  type="button"
                  variant="secondary"
                  className="w-full"
                  onClick={() => setShowAllSessions((current) => !current)}
                >
                  {showAllSessions
                    ? "Show six most recent"
                    : `Show all ${guitarSessions.length} sessions`}
                </Button>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
  );
}
