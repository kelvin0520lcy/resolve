"use client";

import { useEffect, useMemo, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Check, Clock3, Plus, Sparkles, X } from "lucide-react";
import { CharacterCompanion } from "@/components/character/character-companion";
import { PageShell } from "@/components/layout/page-shell";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ProgressBar } from "@/components/ui/badge";
import {
  CategoryBadge,
  MetricCard,
  PageIntro,
  fieldClassName,
} from "@/components/ui/resolve";
import { offsetDate, useResolve } from "@/contexts/resolve-context";
import { resolveCharacterState } from "@/lib/character/dialogue";
import { formatDate } from "@/lib/utils";
import type { GoalCategory } from "@/types";

export default function TodayPage() {
  const { tasks, habits, habitLogs, addTask, toggleTask, toggleHabit } =
    useResolve();
  const today = offsetDate(0);
  const [showAdd, setShowAdd] = useState(false);
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState<GoalCategory>("academics");
  const [minutes, setMinutes] = useState("45");
  const router = useRouter();

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      setShowAdd(
        new URLSearchParams(window.location.search).get("add") === "true",
      );
    });
    return () => window.cancelAnimationFrame(frame);
  }, []);

  const todayTasks = useMemo(
    () => tasks.filter((task) => task.scheduledDate === today),
    [tasks, today],
  );
  const complete = todayTasks.filter(
    (task) => task.status === "completed",
  ).length;
  const totalMinutes = todayTasks.reduce(
    (sum, task) => sum + (task.estimatedMinutes ?? 0),
    0,
  );
  const habitCount = habits.filter((habit) =>
    habitLogs.some(
      (log) =>
        log.habitId === habit.id && log.date === today && log.completed,
    ),
  ).length;
  const state = resolveCharacterState({
    tasksCompletedToday: complete,
    tasksTotalToday: todayTasks.length,
    overdueTasks: 0,
    upcomingDeadlines: todayTasks.filter((task) => task.deadline === today)
      .length,
    habitStreak: 4,
    weeklyWorkloadHours: totalMinutes / 60,
    hourOfDay: new Date().getHours(),
  });

  function submit(event: FormEvent) {
    event.preventDefault();
    if (!title.trim()) return;
    addTask({
      title: title.trim(),
      category,
      priority: "medium",
      scheduledDate: today,
      estimatedMinutes: Number(minutes) || 0,
    });
    setTitle("");
    setShowAdd(false);
    router.replace("/today", { scroll: false });
  }

  function toggleAddForm() {
    if (showAdd) {
      setShowAdd(false);
      router.replace("/today", { scroll: false });
      return;
    }
    setShowAdd(true);
  }

  return (
    <PageShell title="Today">
      <div className="mx-auto max-w-6xl space-y-6">
        <PageIntro
          eyebrow={formatDate(`${today}T12:00:00`)}
          title="Today’s setlist"
          description="A focused daily view for the work that can actually move today."
          action={
            <Button onClick={toggleAddForm}>
              {showAdd ? <X className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
              {showAdd ? "Close" : "Add task"}
            </Button>
          }
        />

        {showAdd && (
          <Card className="border-accent/30">
            <CardHeader>
              <CardTitle>Add one focused action</CardTitle>
              <CardDescription>
                Small enough to complete, specific enough to start.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form
                onSubmit={submit}
                className="grid gap-3 md:grid-cols-[1fr_180px_120px_auto]"
              >
                <input
                  className={fieldClassName}
                  value={title}
                  onChange={(event) => setTitle(event.target.value)}
                  placeholder="e.g. Draft the project introduction"
                  aria-label="Task title"
                  autoFocus
                  required
                />
                <select
                  className={fieldClassName}
                  value={category}
                  onChange={(event) =>
                    setCategory(event.target.value as GoalCategory)
                  }
                  aria-label="Category"
                >
                  <option value="academics">Academics</option>
                  <option value="career">Career</option>
                  <option value="guitar">Guitar</option>
                  <option value="health">Health</option>
                  <option value="personal">Personal</option>
                </select>
                <input
                  className={fieldClassName}
                  value={minutes}
                  onChange={(event) => setMinutes(event.target.value)}
                  type="number"
                  min="5"
                  max="720"
                  step="5"
                  aria-label="Estimated minutes"
                  required
                />
                <Button type="submit">Add to today</Button>
              </form>
            </CardContent>
          </Card>
        )}

        <div className="grid gap-4 sm:grid-cols-3">
          <MetricCard
            label="Completed"
            value={`${complete}/${todayTasks.length}`}
            detail="daily tasks"
            icon={<Check className="h-5 w-5" />}
          />
          <MetricCard
            label="Planned time"
            value={`${Math.floor(totalMinutes / 60)}h ${totalMinutes % 60}m`}
            detail={
              totalMinutes > 480 ? "This may be overloaded" : "Workload looks realistic"
            }
            icon={<Clock3 className="h-5 w-5" />}
          />
          <MetricCard
            label="Habits"
            value={`${habitCount}/${habits.length}`}
            detail="checked in today"
            icon={<Sparkles className="h-5 w-5" />}
          />
        </div>

        <div className="grid gap-6 lg:grid-cols-[1.35fr_0.65fr]">
          <Card>
            <CardHeader>
              <CardTitle>Focus queue</CardTitle>
              <CardDescription>
                {complete === todayTasks.length && todayTasks.length
                  ? "Encore! Everything planned for today is complete."
                  : `${todayTasks.length - complete} action${todayTasks.length - complete === 1 ? "" : "s"} remaining.`}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <ProgressBar
                className="mb-5"
                value={
                  todayTasks.length ? (complete / todayTasks.length) * 100 : 0
                }
                color="var(--success)"
              />
              {todayTasks.map((task, index) => {
                const done = task.status === "completed";
                return (
                  <div
                    key={task.id}
                    className="flex items-center gap-4 rounded-2xl border border-border bg-surface p-4"
                  >
                    <button
                      type="button"
                      onClick={() => toggleTask(task.id)}
                      className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-xl border-2 ${
                        done
                          ? "border-success bg-success text-white"
                          : "border-border text-muted hover:border-accent"
                      }`}
                      aria-label={`Toggle ${task.title}`}
                    >
                      {done ? <Check className="h-4 w-4" /> : index + 1}
                    </button>
                    <div className="min-w-0 flex-1">
                      <p
                        className={`font-bold ${done ? "text-muted line-through" : ""}`}
                      >
                        {task.title}
                      </p>
                      <p className="mt-1 text-xs text-muted">
                        {task.estimatedMinutes ?? 0} minutes · difficulty{" "}
                        {task.difficulty ?? 2}/5
                      </p>
                    </div>
                    <CategoryBadge category={task.category} />
                  </div>
                );
              })}
            </CardContent>
          </Card>

          <div className="space-y-6">
            <CharacterCompanion compact state={state} />
            <Card>
              <CardHeader>
                <CardTitle>Daily habits</CardTitle>
                <CardDescription>
                  Missing one is data, not a verdict.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                {habits.map((habit) => {
                  const checked = habitLogs.some(
                    (log) =>
                      log.habitId === habit.id &&
                      log.date === today &&
                      log.completed,
                  );
                  return (
                    <button
                      type="button"
                      key={habit.id}
                      onClick={() => toggleHabit(habit.id, today)}
                      className="flex w-full items-center gap-3 rounded-xl p-2 text-left hover:bg-surface-muted"
                    >
                      <span
                        className={`flex h-5 w-5 items-center justify-center rounded-md border ${
                          checked
                            ? "border-success bg-success text-white"
                            : "border-border"
                        }`}
                      >
                        {checked && <Check className="h-3 w-3" />}
                      </span>
                      <span className="flex-1 text-sm font-medium">
                        {habit.title}
                      </span>
                      <CategoryBadge category={habit.category} />
                    </button>
                  );
                })}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </PageShell>
  );
}
