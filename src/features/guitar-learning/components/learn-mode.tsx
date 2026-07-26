"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import {
  BookOpen,
  Bookmark,
  CheckCircle2,
  ChevronRight,
  EyeOff,
  LockKeyhole,
  Map,
  Play,
  Search,
  Sparkles,
} from "lucide-react";
import { Badge, ProgressBar } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { fieldClassName } from "@/components/ui/resolve";
import { LessonRenderer } from "@/features/guitar-learning/components/lesson-renderer";
import { PlacementAssessment } from "@/features/guitar-learning/components/placement-assessment";
import {
  GUITAR_LESSON_BY_ID,
  GUITAR_LESSONS,
  GUITAR_PATHS,
} from "@/features/guitar-learning/data/curriculum";
import {
  applyPlacementResult,
  getEffectiveLessonStatus,
  getLessonProgress,
  hideLessonRecommendation,
  markLessonAlreadyKnown,
  openGuitarLesson,
  setSelectedGuitarPaths,
} from "@/features/guitar-learning/lib/learning-state";
import { getLessonRecommendations } from "@/features/guitar-learning/lib/recommendations";
import type {
  Goal,
  GuitarPracticeSession,
} from "@/types";
import type {
  GuitarLearningState,
  GuitarMasteryStatus,
  GuitarPathId,
  GuitarToolId,
  PlacementResult,
} from "@/features/guitar-learning/types";

const COACH_ASSETS = {
  bocchi: "/illustrations/cut-in-bocchi-v2.webp",
  nijika: "/illustrations/cut-in-nijika-v2.webp",
  ryo: "/illustrations/cut-in-ryo-v2.webp",
  kita: "/illustrations/cut-in-kita-v2.webp",
} as const;

const STATUS_LABELS: Record<GuitarMasteryStatus, string> = {
  not_assessed: "Not assessed",
  locked: "Prerequisite needed",
  ready: "Ready",
  learning: "Learning",
  understood: "Understood",
  needs_review: "Review",
  already_known: "Already known",
};

type UpdateLearningState = (
  updater: (current: GuitarLearningState) => GuitarLearningState,
) => void;

export function GuitarLearnMode({
  state,
  updateState,
  goals,
  sessions,
  lessonTaskIds = [],
  onCreateLessonTask,
  onOpenTool,
  initialLessonId,
  initialLessonStage,
  onActiveLessonChange,
  onLessonStageChange,
}: {
  state: GuitarLearningState;
  updateState: UpdateLearningState;
  goals: Goal[];
  sessions: GuitarPracticeSession[];
  lessonTaskIds?: string[];
  onCreateLessonTask?: (lessonId: string, lessonTitle: string) => void;
  onOpenTool: (toolId: GuitarToolId) => void;
  initialLessonId?: string;
  initialLessonStage?: number;
  onActiveLessonChange?: (lessonId?: string) => void;
  onLessonStageChange?: (lessonId: string, stage: number) => void;
}) {
  const [activeLessonId, setActiveLessonId] = useState<string | null>(
    initialLessonId && GUITAR_LESSON_BY_ID.has(initialLessonId)
      ? initialLessonId
      : null,
  );
  const [search, setSearch] = useState("");
  const [pathFilter, setPathFilter] = useState<GuitarPathId | "all">(
    "all",
  );
  const [showCurriculum, setShowCurriculum] = useState(false);
  const activeLesson = activeLessonId
    ? GUITAR_LESSON_BY_ID.get(activeLessonId)
    : undefined;
  const recommendations = useMemo(
    () =>
      getLessonRecommendations({
        state,
        goals,
        sessions,
        limit: 5,
      }),
    [goals, sessions, state],
  );
  const primaryRecommendation = recommendations[0];
  const recommendedLesson = primaryRecommendation
    ? GUITAR_LESSON_BY_ID.get(primaryRecommendation.lessonId)
    : undefined;
  const filteredLessons = useMemo(() => {
    const query = search.trim().toLowerCase();
    return GUITAR_LESSONS.filter(
      (lesson) =>
        (pathFilter === "all" || lesson.pathId === pathFilter) &&
        (!query ||
          `${lesson.title} ${lesson.summary} ${lesson.category}`
            .toLowerCase()
            .includes(query)),
    );
  }, [pathFilter, search]);

  function openLesson(lessonId: string) {
    const lesson = GUITAR_LESSON_BY_ID.get(lessonId);
    if (!lesson || getEffectiveLessonStatus(lesson, state) === "locked") {
      return;
    }
    updateState((current) => openGuitarLesson(current, lessonId));
    setActiveLessonId(lessonId);
    onActiveLessonChange?.(lessonId);
    window.requestAnimationFrame(() =>
      window.scrollTo({ top: 0, behavior: "smooth" }),
    );
  }

  function completePlacement(result: PlacementResult) {
    updateState((current) =>
      openGuitarLesson(
        applyPlacementResult(current, result),
        result.recommendedLessonId,
      ),
    );
    setActiveLessonId(result.recommendedLessonId);
    onActiveLessonChange?.(result.recommendedLessonId);
  }

  if (!state.profile.placementCompleted) {
    return <PlacementAssessment onComplete={completePlacement} />;
  }

  if (activeLesson) {
    return (
      <LessonRenderer
        key={activeLesson.id}
        lesson={activeLesson}
        state={state}
        updateState={updateState}
        onOpenTool={onOpenTool}
        onOpenLesson={openLesson}
        initialStage={initialLessonStage}
        onStageChange={(stage) =>
          onLessonStageChange?.(activeLesson.id, stage)
        }
        onExit={() => {
          setActiveLessonId(null);
          onActiveLessonChange?.(undefined);
        }}
      />
    );
  }

  const understoodCount = state.progress.filter((entry) =>
    ["understood", "already_known"].includes(entry.status),
  ).length;

  return (
    <div className="space-y-6">
      <section className="manga-panel speed-lines overflow-hidden rounded-[26px]">
        <div className="grid min-h-[17rem] lg:grid-cols-[1fr_20rem]">
          <div className="relative z-10 p-5 sm:p-7">
            <Badge variant="accent">
              <Sparkles className="mr-1 h-3 w-3" />
              Deterministic next step
            </Badge>
            {recommendedLesson && primaryRecommendation ? (
              <>
                <p className="mt-4 text-[10px] font-black uppercase tracking-[0.2em] text-[#7b5470]">
                  {recommendedLesson.coach} recommends
                </p>
                <h2 className="font-display mt-1 text-3xl leading-none tracking-wide text-[#18121f]">
                  {recommendedLesson.title}
                </h2>
                <p className="mt-3 max-w-2xl text-sm font-semibold leading-6 text-[#5d5267]">
                  {primaryRecommendation.reasons[0]}
                </p>
                {primaryRecommendation.missingPrerequisiteIds.length > 0 ? (
                  <div className="mt-4 rounded-2xl border-2 border-[#18121f]/20 bg-white/35 p-4 text-sm text-[#18121f]">
                    <strong>Start with the prerequisite:</strong>{" "}
                    {primaryRecommendation.missingPrerequisiteIds
                      .map(
                        (id) =>
                          GUITAR_LESSON_BY_ID.get(id)?.title ??
                          "Earlier lesson",
                      )
                      .join(", ")}
                  </div>
                ) : (
                  <div className="mt-5 flex flex-wrap gap-3">
                    <Button
                      type="button"
                      onClick={() => openLesson(recommendedLesson.id)}
                    >
                      <Play className="h-4 w-4" />
                      Start lesson
                    </Button>
                    {onCreateLessonTask && (
                      <Button
                        type="button"
                        variant="secondary"
                        disabled={lessonTaskIds.includes(recommendedLesson.id)}
                        onClick={() =>
                          onCreateLessonTask(
                            recommendedLesson.id,
                            recommendedLesson.title,
                          )
                        }
                      >
                        {lessonTaskIds.includes(recommendedLesson.id)
                          ? "Practice task added"
                          : "Add practice task"}
                      </Button>
                    )}
                    <Button
                      type="button"
                      variant="secondary"
                      onClick={() =>
                        updateState((current) =>
                          markLessonAlreadyKnown(
                            current,
                            recommendedLesson.id,
                          ),
                        )
                      }
                    >
                      <CheckCircle2 className="h-4 w-4" />
                      I already know this
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      onClick={() =>
                        updateState((current) =>
                          hideLessonRecommendation(
                            current,
                            recommendedLesson.id,
                          ),
                        )
                      }
                    >
                      <EyeOff className="h-4 w-4" />
                      Hide for now
                    </Button>
                  </div>
                )}
              </>
            ) : (
              <>
                <h2 className="font-display mt-4 text-3xl text-[#18121f]">
                  Curriculum complete
                </h2>
                <p className="mt-3 text-sm text-[#5d5267]">
                  Every available concept is understood, already known, or
                  hidden. Reopen the curriculum whenever you want a review.
                </p>
              </>
            )}
          </div>
          <div className="relative hidden overflow-hidden bg-[linear-gradient(145deg,var(--theme-glow),transparent)] lg:block">
            {recommendedLesson && (
              <Image
                src={COACH_ASSETS[recommendedLesson.coach]}
                alt={`${recommendedLesson.coach} coaching illustration`}
                fill
                sizes="320px"
                className="object-contain object-bottom"
              />
            )}
          </div>
        </div>
      </section>

      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardContent className="pt-5">
            <p className="text-[10px] font-black uppercase tracking-wide text-muted">
              Confirmed concepts
            </p>
            <p className="font-display mt-1 text-3xl">{understoodCount}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-5">
            <p className="text-[10px] font-black uppercase tracking-wide text-muted">
              Current paths
            </p>
            <p className="font-display mt-1 text-3xl">
              {state.profile.selectedPathIds.length}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-5">
            <p className="text-[10px] font-black uppercase tracking-wide text-muted">
              Bookmarked
            </p>
            <p className="font-display mt-1 text-3xl">
              {state.profile.bookmarkedLessonIds.length}
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Choose your current paths</CardTitle>
          <CardDescription>
            This changes recommendation priority, not access. Select the areas
            that match what you want from the guitar right now.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {GUITAR_PATHS.map((path) => {
            const selected = state.profile.selectedPathIds.includes(path.id);
            const completed = path.lessonIds.filter((lessonId) => {
              const status = getLessonProgress(state, lessonId)?.status;
              return status === "understood" || status === "already_known";
            }).length;
            return (
              <button
                key={path.id}
                type="button"
                aria-pressed={selected}
                onClick={() => {
                  const next = selected
                    ? state.profile.selectedPathIds.filter(
                        (id) => id !== path.id,
                      )
                    : [...state.profile.selectedPathIds, path.id];
                  updateState((current) =>
                    setSelectedGuitarPaths(current, next),
                  );
                }}
                className={`rounded-2xl border-2 p-4 text-left transition ${
                  selected
                    ? "border-accent bg-accent/10"
                    : "border-border bg-surface hover:border-accent/50"
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <span className="font-black">{path.title}</span>
                  <Badge variant={selected ? "accent" : "default"}>
                    {path.coach}
                  </Badge>
                </div>
                <p className="mt-2 text-xs leading-5 text-muted">
                  {path.description}
                </p>
                <ProgressBar
                  className="mt-3"
                  value={(completed / path.lessonIds.length) * 100}
                  label={`${path.title}: ${completed} of ${path.lessonIds.length} concepts confirmed`}
                />
                <p className="mt-2 text-[11px] font-bold text-muted">
                  {completed}/{path.lessonIds.length} confirmed
                </p>
              </button>
            );
          })}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <CardTitle>Lesson library</CardTitle>
              <CardDescription>
                Search the full studio, inspect prerequisites, or override the
                assessment by marking a familiar concept already known.
              </CardDescription>
            </div>
            <Button
              type="button"
              variant="secondary"
              onClick={() => setShowCurriculum((current) => !current)}
            >
              <BookOpen className="h-4 w-4" />
              {showCurriculum ? "Hide library" : "Browse all lessons"}
            </Button>
          </div>
        </CardHeader>
        {showCurriculum && (
          <CardContent>
            <div className="grid gap-3 md:grid-cols-[1fr_15rem]">
              <label className="relative">
                <span className="sr-only">Search lessons</span>
                <Search className="pointer-events-none absolute left-3 top-3.5 h-4 w-4 text-muted" />
                <input
                  className={`${fieldClassName} pl-10`}
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Search by concept or skill"
                />
              </label>
              <label>
                <span className="sr-only">Filter by learning path</span>
                <select
                  className={fieldClassName}
                  value={pathFilter}
                  onChange={(event) =>
                    setPathFilter(
                      event.target.value as GuitarPathId | "all",
                    )
                  }
                >
                  <option value="all">All learning paths</option>
                  {GUITAR_PATHS.map((path) => (
                    <option key={path.id} value={path.id}>
                      {path.title}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            <div className="mt-5 grid gap-3 md:grid-cols-2">
              {filteredLessons.map((lesson) => {
                const status = getEffectiveLessonStatus(lesson, state);
                const locked = status === "locked";
                return (
                  <article
                    key={lesson.id}
                    className="rounded-2xl border border-border bg-surface p-4"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="font-black leading-6">{lesson.title}</p>
                        <p className="mt-1 text-xs text-muted">
                          {lesson.estimatedMinutes} min · difficulty{" "}
                          {lesson.difficulty}/5
                        </p>
                      </div>
                      <Badge
                        variant={
                          status === "understood" ||
                          status === "already_known"
                            ? "success"
                            : status === "needs_review"
                              ? "warning"
                              : status === "ready"
                                ? "accent"
                                : "default"
                        }
                      >
                        {locked && (
                          <LockKeyhole className="mr-1 h-3 w-3" />
                        )}
                        {STATUS_LABELS[status]}
                      </Badge>
                    </div>
                    <p className="mt-3 line-clamp-3 text-xs leading-5 text-muted">
                      {lesson.summary}
                    </p>
                    {locked && (
                      <p className="mt-3 rounded-xl bg-surface-muted p-3 text-xs leading-5">
                        <strong>Needs:</strong>{" "}
                        {lesson.prerequisiteIds
                          .map(
                            (id) =>
                              GUITAR_LESSON_BY_ID.get(id)?.title ??
                              "Earlier lesson",
                          )
                          .join(", ")}
                      </p>
                    )}
                    <div className="mt-4 flex flex-wrap gap-2">
                      <Button
                        type="button"
                        size="sm"
                        disabled={locked}
                        onClick={() => openLesson(lesson.id)}
                      >
                        {status === "learning" ? "Resume" : "Open lesson"}
                        <ChevronRight className="h-3.5 w-3.5" />
                      </Button>
                      {!["understood", "already_known"].includes(status) && (
                        <Button
                          type="button"
                          size="sm"
                          variant="ghost"
                          onClick={() =>
                            updateState((current) =>
                              markLessonAlreadyKnown(current, lesson.id),
                            )
                          }
                        >
                          I know this
                        </Button>
                      )}
                    </div>
                  </article>
                );
              })}
            </div>
            {filteredLessons.length === 0 && (
              <div className="mt-5 rounded-2xl border-2 border-dashed border-border p-8 text-center">
                <Map className="mx-auto h-6 w-6 text-muted" />
                <p className="mt-2 font-black">No matching lesson</p>
                <p className="mt-1 text-xs text-muted">
                  Try a shorter concept name or select all paths.
                </p>
              </div>
            )}
          </CardContent>
        )}
      </Card>

      {recommendations.length > 1 && (
        <Card>
          <CardHeader>
            <CardTitle>Why these come next</CardTitle>
            <CardDescription>
              The queue is scored from your goals, practice focus, assessment,
              path, prerequisites, checkpoints, and review age—never shuffled.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {recommendations.slice(1).map((recommendation) => {
              const lesson = GUITAR_LESSON_BY_ID.get(
                recommendation.lessonId,
              )!;
              return (
                <div
                  key={recommendation.lessonId}
                  className="flex flex-col gap-3 rounded-2xl border border-border bg-surface p-4 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-black">{lesson.title}</p>
                      <Badge>{recommendation.source.replace("_", " ")}</Badge>
                    </div>
                    <p className="mt-1 text-xs leading-5 text-muted">
                      {recommendation.reasons[0]}
                    </p>
                  </div>
                  <Button
                    type="button"
                    size="sm"
                    variant="secondary"
                    disabled={
                      recommendation.missingPrerequisiteIds.length > 0
                    }
                    onClick={() => openLesson(lesson.id)}
                  >
                    Open
                  </Button>
                </div>
              );
            })}
          </CardContent>
        </Card>
      )}

      <div className="rounded-2xl border border-border bg-surface/80 p-4 text-xs leading-5 text-muted">
        <Bookmark className="mr-2 inline h-4 w-4 text-accent" />
        Placement results, mastery, bookmarks, path choices, and resume position
        sync with your account. Tool experiments and metronome ticks stay local.
      </div>
    </div>
  );
}
