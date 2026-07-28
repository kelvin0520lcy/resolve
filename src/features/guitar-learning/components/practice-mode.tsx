"use client";

import { useMemo, useState } from "react";
import { BookOpen, CheckCircle2, Clock3, Wrench } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  GUITAR_LESSONS,
  GUITAR_PATHS,
} from "@/features/guitar-learning/data/curriculum";
import { getEffectiveLessonStatus } from "@/features/guitar-learning/lib/learning-state";
import { GuitarTuner } from "@/features/guitar-learning/components/tools/tuner";
import { ChordChangeTrainer } from "@/features/guitar-learning/components/tools/chord-change-trainer";
import { PracticeTroubleshooter } from "@/features/guitar-learning/components/practice-troubleshooter";
import type { GuitarLearningState, GuitarToolId } from "@/features/guitar-learning/types";

type PracticeTab = "routine" | "tuner" | "chords" | "help";

export function GuitarPracticeMode({
  state,
  updateState,
  onOpenLesson,
  onOpenTool,
}: {
  state: GuitarLearningState;
  updateState: (
    updater: (current: GuitarLearningState) => GuitarLearningState,
  ) => void;
  onOpenLesson: (lessonId: string) => void;
  onOpenTool: (toolId: GuitarToolId, presetId?: string) => void;
}) {
  const [tab, setTab] = useState<PracticeTab>("routine");
  const [minutes, setMinutes] = useState<15 | 30 | 45>(15);
  const completed = useMemo(
    () =>
      new Set(
        state.progress
          .filter((entry) => ["understood", "already_known"].includes(entry.status))
          .map((entry) => entry.lessonId),
      ),
    [state.progress],
  );
  const routine = useMemo(() => {
    const actionable = GUITAR_LESSONS.filter(
      (lesson) =>
        !completed.has(lesson.id) &&
        getEffectiveLessonStatus(lesson, state) !== "locked",
    );
    const firstFromEachCourse = GUITAR_PATHS.map((path) =>
      actionable.find((lesson) => lesson.pathId === path.id),
    ).filter((lesson): lesson is (typeof actionable)[number] => Boolean(lesson));
    const featuredIds = new Set(firstFromEachCourse.map((lesson) => lesson.id));
    const candidates = [
      ...firstFromEachCourse,
      ...actionable.filter((lesson) => !featuredIds.has(lesson.id)),
    ];
    const targetCount = minutes === 15 ? 2 : minutes === 30 ? 3 : 4;
    return candidates.slice(0, targetCount);
  }, [completed, minutes, state]);

  const tabs: Array<{ id: PracticeTab; label: string; icon: typeof Clock3 }> = [
    { id: "routine", label: "Today’s routine", icon: Clock3 },
    { id: "tuner", label: "Tuner", icon: CheckCircle2 },
    { id: "chords", label: "Chord changes", icon: BookOpen },
    { id: "help", label: "Fix a problem", icon: Wrench },
  ];

  return (
    <div className="space-y-5">
      <div role="tablist" aria-label="Practice options" className="grid gap-2 sm:grid-cols-4">
        {tabs.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              type="button"
              role="tab"
              aria-selected={tab === item.id}
              onClick={() => setTab(item.id)}
              className={`flex min-h-12 items-center justify-center gap-2 rounded-xl border-2 px-3 text-xs font-black ${
                tab === item.id ? "border-accent bg-accent/15 text-accent" : "border-border bg-surface"
              }`}
            >
              <Icon className="h-4 w-4" /> {item.label}
            </button>
          );
        })}
      </div>

      {tab === "routine" && (
        <section aria-labelledby="routine-title">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <Badge variant="accent">Clear next actions</Badge>
              <h2 id="routine-title" className="font-display mt-2 text-2xl">A practice session you can finish</h2>
              <p className="mt-1 text-sm text-muted">Tune first, learn one thing, then use it. Completed lessons are skipped.</p>
            </div>
            <div className="flex gap-2" aria-label="Routine duration">
              {([15, 30, 45] as const).map((value) => (
                <Button key={value} type="button" size="sm" variant={minutes === value ? "default" : "outline"} onClick={() => setMinutes(value)}>
                  {value} min
                </Button>
              ))}
            </div>
          </div>
          <div className="mt-4 grid gap-3">
            <Card>
              <CardContent className="flex flex-wrap items-center justify-between gap-3 pt-5">
                <div>
                  <p className="text-xs font-black uppercase text-accent">1 · Prepare · 3 minutes</p>
                  <p className="mt-1 font-black">Tune every open string</p>
                  <p className="text-xs text-muted">E A D G B E, low to high.</p>
                </div>
                <Button type="button" onClick={() => setTab("tuner")}>Open tuner</Button>
              </CardContent>
            </Card>
            {routine.map((lesson, index) => (
              <Card key={lesson.id}>
                <CardContent className="flex flex-wrap items-center justify-between gap-3 pt-5">
                  <div className="min-w-0">
                    <p className="text-xs font-black uppercase text-accent">
                      {index + 2} · {lesson.skillType?.replace("-", " ")} · about {Math.min(lesson.estimatedMinutes, Math.max(6, Math.floor((minutes - 3) / routine.length)))} minutes
                    </p>
                    <p className="mt-1 font-black">{lesson.title}</p>
                    <p className="mt-1 max-w-2xl text-xs leading-5 text-muted">{lesson.learnerProblem}</p>
                  </div>
                  <Button type="button" onClick={() => onOpenLesson(lesson.id)}>Open lesson</Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      )}
      {tab === "tuner" && <Card><CardContent className="pt-5"><GuitarTuner /></CardContent></Card>}
      {tab === "chords" && <Card><CardContent className="pt-5"><ChordChangeTrainer state={state} updateState={updateState} /></CardContent></Card>}
      {tab === "help" && <PracticeTroubleshooter onOpenLesson={onOpenLesson} onOpenTool={onOpenTool} />}
    </div>
  );
}
