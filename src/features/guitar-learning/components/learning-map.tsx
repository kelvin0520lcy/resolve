"use client";

import { useMemo, useState } from "react";
import {
  ArrowDown,
  CheckCircle2,
  Circle,
  CircleHelp,
  LockKeyhole,
  Map,
  Play,
  RotateCcw,
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
import {
  GUITAR_LESSON_BY_ID,
  GUITAR_PATHS,
} from "@/features/guitar-learning/data/curriculum";
import {
  getEffectiveLessonStatus,
  getLessonProgress,
  markLessonAlreadyKnown,
  openGuitarLesson,
} from "@/features/guitar-learning/lib/learning-state";
import type {
  GuitarLearningState,
  GuitarMasteryStatus,
  GuitarPathId,
} from "@/features/guitar-learning/types";

const STATUS_STYLES: Record<GuitarMasteryStatus, string> = {
  not_assessed: "border-border bg-surface text-muted",
  locked: "border-border bg-surface-muted/35 text-muted",
  ready: "border-accent bg-accent/10 text-foreground",
  learning: "border-warning bg-warning/10 text-foreground",
  understood: "border-success bg-success/10 text-success",
  needs_review: "border-warning bg-warning/10 text-warning",
  already_known: "border-success/60 bg-success/5 text-success",
};

const STATUS_LABELS: Record<GuitarMasteryStatus, string> = {
  not_assessed: "Not assessed",
  locked: "Locked",
  ready: "Ready",
  learning: "Learning",
  understood: "Understood",
  needs_review: "Needs review",
  already_known: "Already known",
};

type UpdateLearningState = (
  updater: (current: GuitarLearningState) => GuitarLearningState,
) => void;

export function GuitarLearningMap({
  state,
  updateState,
  onOpenLesson,
}: {
  state: GuitarLearningState;
  updateState: UpdateLearningState;
  onOpenLesson: (lessonId: string) => void;
}) {
  const firstSelectedPath =
    state.profile.selectedPathIds[0] ?? "rhythm";
  const [pathId, setPathId] =
    useState<GuitarPathId>(firstSelectedPath);
  const [selectedLessonId, setSelectedLessonId] = useState<string>();
  const path =
    GUITAR_PATHS.find((candidate) => candidate.id === pathId) ??
    GUITAR_PATHS[0];
  const selectedLesson = selectedLessonId
    ? GUITAR_LESSON_BY_ID.get(selectedLessonId)
    : undefined;

  const pathStats = useMemo(
    () =>
      GUITAR_PATHS.map((candidate) => {
        const confirmed = candidate.lessonIds.filter((lessonId) => {
          const status = getLessonProgress(state, lessonId)?.status;
          return status === "understood" || status === "already_known";
        }).length;
        const learning = candidate.lessonIds.filter(
          (lessonId) =>
            getLessonProgress(state, lessonId)?.status === "learning",
        ).length;
        return { path: candidate, confirmed, learning };
      }),
    [state],
  );

  function launchLesson(lessonId: string) {
    const lesson = GUITAR_LESSON_BY_ID.get(lessonId);
    if (!lesson || getEffectiveLessonStatus(lesson, state) === "locked") {
      return;
    }
    updateState((current) => openGuitarLesson(current, lessonId));
    onOpenLesson(lessonId);
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <Badge variant="accent" className="mb-2 w-fit">
            <Map className="mr-1 h-3 w-3" />
            Prerequisite map
          </Badge>
          <CardTitle>See why each concept comes next</CardTitle>
          <CardDescription>
            Choose one authored course to inspect its dependency chain,
            status, unlocks, and exact reason for being locked. Legacy progress
            is preserved without mixing unfinished lessons into these routes.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          {pathStats.map((item) => {
            const selected = item.path.id === path.id;
            return (
              <button
                key={item.path.id}
                type="button"
                aria-pressed={selected}
                onClick={() => {
                  setPathId(item.path.id);
                  setSelectedLessonId(undefined);
                }}
                className={`rounded-2xl border-2 p-4 text-left transition ${
                  selected
                    ? "border-accent bg-accent/10"
                    : "border-border bg-surface hover:border-accent/50"
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <span className="font-black">{item.path.title}</span>
                  <Badge variant={selected ? "accent" : "default"}>
                    {item.path.coach}
                  </Badge>
                </div>
                <p className="mt-2 line-clamp-2 text-xs leading-5 text-muted">
                  {item.path.description}
                </p>
                <ProgressBar
                  className="mt-3"
                  value={
                    (item.confirmed / item.path.lessonIds.length) * 100
                  }
                  label={`${item.path.title}: ${item.confirmed} confirmed of ${item.path.lessonIds.length}`}
                />
                <p className="mt-2 text-[10px] font-black uppercase tracking-wide text-muted">
                  {item.confirmed} confirmed · {item.learning} active ·{" "}
                  {item.path.lessonIds.length} total
                </p>
              </button>
            );
          })}
        </CardContent>
      </Card>

      <div className="grid min-w-0 gap-5 lg:grid-cols-[minmax(0,1fr)_20rem]">
        <Card className="min-w-0 overflow-hidden">
          <CardHeader>
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <CardTitle>{path.title}</CardTitle>
                <CardDescription>{path.description}</CardDescription>
              </div>
              <Badge variant="accent">{path.lessonIds.length} concepts</Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="relative mx-auto max-w-2xl">
              {path.lessonIds.map((lessonId, index) => {
                const lesson = GUITAR_LESSON_BY_ID.get(lessonId)!;
                const status = getEffectiveLessonStatus(lesson, state);
                const selected = selectedLessonId === lessonId;
                const progress = getLessonProgress(state, lessonId);
                return (
                  <div key={lessonId} className="relative">
                    {index > 0 && (
                      <div
                        className="mx-auto flex h-9 w-8 items-center justify-center border-x-2 border-dashed border-border text-muted"
                        aria-hidden="true"
                      >
                        <ArrowDown className="h-4 w-4" />
                      </div>
                    )}
                    <button
                      type="button"
                      onClick={() => setSelectedLessonId(lessonId)}
                      className={`relative w-full rounded-2xl border-2 p-4 text-left transition hover:-translate-y-0.5 ${STATUS_STYLES[status]} ${
                        selected ? "ring-2 ring-warning ring-offset-2 ring-offset-background" : ""
                      }`}
                      aria-label={`${lesson.title}, ${STATUS_LABELS[status]}`}
                    >
                      <span className="absolute -left-2 -top-2 flex h-7 min-w-7 items-center justify-center rounded-full border-2 border-[#18121f] bg-warning px-1 text-[10px] font-black text-[#18121f]">
                        {index + 1}
                      </span>
                      <span className="flex items-start justify-between gap-3">
                        <span>
                          <span className="block font-black leading-6">
                            {lesson.title}
                          </span>
                          <span className="mt-1 block text-xs opacity-75">
                            {lesson.estimatedMinutes} min · difficulty{" "}
                            {lesson.difficulty}/5
                          </span>
                        </span>
                        <span className="flex shrink-0 items-center gap-1 text-[10px] font-black uppercase tracking-wide">
                          {status === "locked" ? (
                            <LockKeyhole className="h-3.5 w-3.5" />
                          ) : status === "understood" ||
                            status === "already_known" ? (
                            <CheckCircle2 className="h-3.5 w-3.5" />
                          ) : status === "needs_review" ? (
                            <RotateCcw className="h-3.5 w-3.5" />
                          ) : status === "ready" ? (
                            <Sparkles className="h-3.5 w-3.5" />
                          ) : (
                            <Circle className="h-3.5 w-3.5" />
                          )}
                          {STATUS_LABELS[status]}
                        </span>
                      </span>
                      {progress?.checkpointScore !== undefined && (
                        <span className="mt-3 block text-[10px] font-bold">
                          Checkpoint {Math.round(progress.checkpointScore * 100)}%
                          · {progress.attempts} attempt
                          {progress.attempts === 1 ? "" : "s"}
                        </span>
                      )}
                    </button>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        <aside>
          <Card className="sticky top-20">
            <CardHeader>
              <CardTitle>
                {selectedLesson ? selectedLesson.title : "Select a concept"}
              </CardTitle>
              <CardDescription>
                {selectedLesson
                  ? selectedLesson.summary
                  : "Tap any node to inspect what it requires and what it unlocks."}
              </CardDescription>
            </CardHeader>
            {selectedLesson && (
              <CardContent className="space-y-4">
                {(() => {
                  const status = getEffectiveLessonStatus(
                    selectedLesson,
                    state,
                  );
                  return (
                    <>
                      <Badge
                        variant={
                          status === "ready"
                            ? "accent"
                            : status === "understood" ||
                                status === "already_known"
                              ? "success"
                              : status === "needs_review"
                                ? "warning"
                                : "default"
                        }
                      >
                        {STATUS_LABELS[status]}
                      </Badge>
                      <div>
                        <p className="text-[10px] font-black uppercase tracking-wide text-muted">
                          Learning objectives
                        </p>
                        <ul className="mt-2 space-y-2 text-xs leading-5">
                          {selectedLesson.learningObjectives.map(
                            (objective) => (
                              <li key={objective}>• {objective}</li>
                            ),
                          )}
                        </ul>
                      </div>
                      <div>
                        <p className="text-[10px] font-black uppercase tracking-wide text-muted">
                          Prerequisites
                        </p>
                        {selectedLesson.prerequisiteIds.length ? (
                          <div className="mt-2 flex flex-wrap gap-2">
                            {selectedLesson.prerequisiteIds.map((id) => {
                              const prerequisite =
                                GUITAR_LESSON_BY_ID.get(id);
                              const prerequisiteStatus = prerequisite
                                ? getEffectiveLessonStatus(
                                    prerequisite,
                                    state,
                                  )
                                : "locked";
                              return (
                                <button
                                  key={id}
                                  type="button"
                                  className="rounded-xl border border-border bg-surface-muted px-2.5 py-2 text-left text-[11px] font-bold"
                                  onClick={() => setSelectedLessonId(id)}
                                >
                                  {prerequisite?.title ?? id}
                                  <span className="block text-[9px] text-muted">
                                    {STATUS_LABELS[prerequisiteStatus]}
                                  </span>
                                </button>
                              );
                            })}
                          </div>
                        ) : (
                          <p className="mt-2 text-xs text-success">
                            No prerequisite. This path can begin here.
                          </p>
                        )}
                      </div>
                      <div>
                        <p className="text-[10px] font-black uppercase tracking-wide text-muted">
                          Unlocks
                        </p>
                        <p className="mt-2 text-xs leading-5">
                          {selectedLesson.unlocksConceptIds
                            .map(
                              (id) =>
                                GUITAR_LESSON_BY_ID.get(id)?.title ??
                                id,
                            )
                            .join(", ") || "Final concept in this path"}
                        </p>
                      </div>
                      {status === "locked" && (
                        <p className="rounded-xl border border-warning/25 bg-warning/10 p-3 text-xs leading-5">
                          <CircleHelp className="mr-1 inline h-3.5 w-3.5" />
                          This lesson stays locked until its prerequisite above
                          is understood or manually marked already known.
                        </p>
                      )}
                      <Button
                        type="button"
                        className="w-full"
                        disabled={status === "locked"}
                        onClick={() => launchLesson(selectedLesson.id)}
                      >
                        <Play className="h-4 w-4" />
                        {status === "learning"
                          ? "Resume lesson"
                          : "Open lesson"}
                      </Button>
                      {!["understood", "already_known"].includes(status) && (
                        <Button
                          type="button"
                          variant="ghost"
                          className="w-full"
                          onClick={() =>
                            updateState((current) =>
                              markLessonAlreadyKnown(
                                current,
                                selectedLesson.id,
                              ),
                            )
                          }
                        >
                          Override · I already know this
                        </Button>
                      )}
                    </>
                  );
                })()}
              </CardContent>
            )}
          </Card>
        </aside>
      </div>

      <div className="flex flex-wrap gap-2">
        {(Object.keys(STATUS_LABELS) as GuitarMasteryStatus[]).map(
          (status) => (
            <span
              key={status}
              className={`rounded-xl border-2 px-2.5 py-1.5 text-[10px] font-black uppercase tracking-wide ${STATUS_STYLES[status]}`}
            >
              {STATUS_LABELS[status]}
            </span>
          ),
        )}
      </div>
    </div>
  );
}
