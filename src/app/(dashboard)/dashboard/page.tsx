"use client";

import Link from "next/link";
import {
  ArrowRight,
  CalendarClock,
  Check,
  Flame,
  Plus,
  Sparkles,
  Target,
  Zap,
} from "lucide-react";
import { PageShell } from "@/components/layout/page-shell";
import { CharacterCompanion } from "@/components/character/character-companion";
import { ProgressBar } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { CategoryBadge, MetricCard } from "@/components/ui/resolve";
import { resolveCharacterState } from "@/lib/character/dialogue";
import { formatDate, getSemesterWeek } from "@/lib/utils";
import {
  getWeekDateKeys,
  offsetDate,
  useResolve,
} from "@/contexts/resolve-context";

export default function DashboardPage() {
  const {
    semester,
    tasks,
    goals,
    habits,
    habitLogs,
    weeklyPriorities,
    toggleTask,
  } = useResolve();
  const today = offsetDate(0);
  const weekDates = getWeekDateKeys();
  const todayTasks = tasks.filter((task) => task.scheduledDate === today);
  const completedToday = todayTasks.filter(
    (task) => task.status === "completed",
  ).length;
  const deadlines = tasks
    .filter(
      (task) =>
        task.deadline &&
        task.deadline >= today &&
        task.status !== "completed",
    )
    .sort((a, b) => (a.deadline ?? "").localeCompare(b.deadline ?? ""))
    .slice(0, 3);
  const overdue = tasks.filter(
    (task) =>
      task.deadline && task.deadline < today && task.status !== "completed",
  ).length;
  const weekMinutes = tasks
    .filter(
      (task) =>
        task.scheduledDate &&
        task.scheduledDate >= weekDates[0] &&
        task.scheduledDate <= weekDates[6],
    )
    .reduce((sum, task) => sum + (task.estimatedMinutes ?? 0), 0);
  const completedHabits = habits.filter((habit) =>
    habitLogs.some(
      (log) =>
        log.habitId === habit.id && log.date === today && log.completed,
    ),
  ).length;
  const semesterStats = getSemesterWeek(
    semester.startDate,
    semester.endDate,
  );
  const characterState = resolveCharacterState({
    tasksCompletedToday: completedToday,
    tasksTotalToday: todayTasks.length,
    overdueTasks: overdue,
    upcomingDeadlines: deadlines.length,
    habitStreak: 4,
    weeklyWorkloadHours: Math.round(weekMinutes / 60),
    hourOfDay: new Date().getHours(),
  });
  const topGoal = goals
    .filter((goal) => goal.status !== "completed")
    .sort((a, b) => (a.priority === "high" ? -1 : b.priority === "high" ? 1 : 0))[0];

  return (
    <PageShell title="Dashboard">
      <div className="mx-auto max-w-7xl space-y-6">
        <section className="grid gap-5 lg:grid-cols-[1.45fr_0.55fr]">
          <CharacterCompanion state={characterState} className="h-full" />
          <div className="manga-panel flex min-h-[340px] rotate-[0.5deg] flex-col justify-between rounded-[26px] p-6">
            <div>
              <div className="flex items-center gap-2 text-accent">
                <Sparkles className="h-4 w-4" />
                <span className="text-xs font-black uppercase tracking-[0.2em]">
                  Episode {String(semesterStats.weekNumber).padStart(2, "0")}
                </span>
              </div>
              <p className="mt-6 text-[9px] font-black uppercase tracking-[0.22em] text-[#756879]">
                This week&apos;s title
              </p>
              <h1 className="font-display mt-2 text-4xl leading-[0.95] tracking-wide">
                {semester.theme}
              </h1>
              <p className="mt-4 text-sm font-medium leading-6 text-[#64576c]">
                {semester.mainResolution}
              </p>
            </div>
            <div className="mt-6">
              <div className="mb-3 flex justify-between text-[10px] font-black uppercase tracking-wider">
                <span>{semesterStats.percentComplete}% complete</span>
                <span>{semesterStats.daysRemaining} days left</span>
              </div>
              <ProgressBar
                value={semesterStats.percentComplete}
                className="border-[#18121f]/10 bg-[#18121f]/10"
              />
              <p className="mt-4 border-t border-[#18121f]/15 pt-3 text-[9px] font-black uppercase tracking-[0.18em] text-[#7a6e80]">
                Season {semester.name}
              </p>
            </div>
          </div>
        </section>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <MetricCard
            label="Today"
            value={`${completedToday}/${todayTasks.length}`}
            detail="tasks completed"
            icon={<Check className="h-5 w-5" />}
          />
          <MetricCard
            label="Habit check-in"
            value={`${completedHabits}/${habits.length}`}
            detail="gentle consistency, not perfection"
            icon={<Flame className="h-5 w-5" />}
          />
          <MetricCard
            label="This week"
            value={`${Math.round((weekMinutes / 60) * 10) / 10}h`}
            detail="planned focused work"
            icon={<CalendarClock className="h-5 w-5" />}
          />
          <MetricCard
            label="Active goals"
            value={goals.filter((goal) => goal.status === "active").length}
            detail={`${goals.filter((goal) => goal.status === "at_risk").length} needs attention`}
            icon={<Target className="h-5 w-5" />}
          />
        </div>

        <div className="grid gap-6 lg:grid-cols-[1.4fr_0.8fr]">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between gap-4">
              <div>
                <CardTitle>Today&apos;s setlist</CardTitle>
                <CardDescription>
                  One clear action at a time. Tap the circle when it&apos;s done.
                </CardDescription>
              </div>
              <Link
                href="/today?add=true"
                className="inline-flex h-9 shrink-0 items-center gap-2 rounded-xl bg-accent px-3 text-xs font-bold text-white"
              >
                <Plus className="h-4 w-4" />
                Add task
              </Link>
            </CardHeader>
            <CardContent className="space-y-3">
              {todayTasks.map((task) => {
                const done = task.status === "completed";
                return (
                  <div
                    key={task.id}
                    className="group flex items-center gap-3 rounded-2xl border-2 border-border bg-surface p-3 transition hover:-translate-y-0.5 hover:border-accent/50"
                  >
                    <button
                      type="button"
                      onClick={() => toggleTask(task.id)}
                      aria-label={
                        done
                          ? `Mark ${task.title} incomplete`
                          : `Complete ${task.title}`
                      }
                      className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border-2 transition ${
                        done
                          ? "border-success bg-success text-white"
                          : "border-border hover:border-accent"
                      }`}
                    >
                      {done && <Check className="h-3.5 w-3.5" />}
                    </button>
                    <div className="min-w-0 flex-1">
                      <p
                        className={`font-semibold ${
                          done ? "text-muted line-through" : ""
                        }`}
                      >
                        {task.title}
                      </p>
                      <p className="mt-0.5 text-xs text-muted">
                        {task.estimatedMinutes ?? 0} min · {task.priority} priority
                      </p>
                    </div>
                    <CategoryBadge category={task.category} />
                  </div>
                );
              })}
            </CardContent>
          </Card>

          <div className="space-y-6">
            <Card className="overflow-hidden">
              <CardHeader>
                <CardTitle>Weekly top three</CardTitle>
                <CardDescription>The plot points that matter most.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {weeklyPriorities.map((priority, index) => (
                  <div key={priority} className="flex gap-3 rounded-xl border border-border bg-surface p-3">
                    <span className="sticker flex h-6 w-6 shrink-0 -rotate-3 items-center justify-center rounded-md bg-warning text-xs font-black text-[#18121f]">
                      {index + 1}
                    </span>
                    <p className="text-sm font-medium leading-6">{priority}</p>
                  </div>
                ))}
                <Link
                  href="/weekly"
                  className="mt-2 inline-flex items-center gap-1 text-sm font-bold text-accent"
                >
                  Adjust this week <ArrowRight className="h-4 w-4" />
                </Link>
              </CardContent>
            </Card>

            {topGoal && (
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between gap-3">
                    <CardDescription>Focus goal</CardDescription>
                    <CategoryBadge category={topGoal.category} />
                  </div>
                  <CardTitle className="text-base">{topGoal.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <ProgressBar
                    value={
                      ((topGoal.currentValue ?? 0) /
                        Math.max(topGoal.targetValue ?? 1, 1)) *
                      100
                    }
                  />
                  <p className="mt-2 text-xs text-muted">
                    {topGoal.currentValue ?? 0} of {topGoal.targetValue}{" "}
                    {topGoal.unit}
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1fr_0.55fr]">
          <Card>
            <CardHeader>
              <CardTitle>Upcoming deadlines</CardTitle>
              <CardDescription>
                The next beats in your semester timeline.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-3 sm:grid-cols-3">
              {deadlines.map((deadline) => (
                <div
                  key={deadline.id}
                  className="rounded-2xl border-2 border-border bg-surface p-4 transition hover:-translate-y-1 hover:border-accent/50"
                >
                  <CategoryBadge category={deadline.category} />
                  <p className="mt-3 text-sm font-bold">{deadline.title}</p>
                  <p className="mt-1 text-xs text-muted">
                    {deadline.deadline
                      ? formatDate(`${deadline.deadline}T12:00:00`)
                      : "No date"}
                  </p>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="overflow-hidden border-accent/40 bg-[linear-gradient(135deg,rgba(255,79,154,0.16),rgba(92,225,239,0.06))]">
            <CardHeader>
              <CardTitle>Quick start</CardTitle>
              <CardDescription>Less setup, more doing.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-2">
              <Link
                href="/guitar"
                className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-[#1e1b4b] px-4 text-sm font-bold text-white"
              >
                <Zap className="h-4 w-4 text-accent" />
                Log guitar practice
              </Link>
              <Link
                href="/reflections"
                className="inline-flex h-11 items-center justify-center rounded-xl border border-border bg-surface px-4 text-sm font-bold"
              >
                Reflect on today
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </PageShell>
  );
}
