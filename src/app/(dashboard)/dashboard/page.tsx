"use client";

import Link from "next/link";
import {
  ArrowRight,
  CalendarClock,
  Check,
  Flame,
  Plus,
  Target,
  Zap,
} from "lucide-react";
import { PageShell } from "@/components/layout/page-shell";
import { CharacterCompanion } from "@/components/character/character-companion";
import { MainResolutionPanel } from "@/components/resolution/main-resolution-panel";
import { ProgressBar } from "@/components/ui/badge";
import { ConfirmDeleteButton } from "@/components/ui/confirm-delete-button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  CategoryBadge,
  EmptyState,
  MetricCard,
} from "@/components/ui/resolve";
import { resolveCharacterState } from "@/lib/character/dialogue";
import { getDailyMotivation } from "@/lib/daily-motivation";
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
    milestones,
    habits,
    habitLogs,
    weeklyPriorities,
    toggleTask,
    removeTask,
    updateSemester,
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
  let habitStreak = 0;
  for (let day = 0; day < 365; day += 1) {
    const date = offsetDate(-day);
    if (habitLogs.some((log) => log.date === date && log.completed)) {
      habitStreak += 1;
    } else {
      break;
    }
  }
  const semesterStats = getSemesterWeek(
    semester.startDate,
    semester.endDate,
  );
  const characterState = resolveCharacterState({
    tasksCompletedToday: completedToday,
    tasksTotalToday: todayTasks.length,
    overdueTasks: overdue,
    upcomingDeadlines: deadlines.length,
    habitStreak,
    weeklyWorkloadHours: Math.round(weekMinutes / 60),
    hourOfDay: new Date().getHours(),
  });
  const topGoal = goals
    .filter((goal) => goal.status !== "completed")
    .sort((a, b) =>
      a.priority === "high" ? -1 : b.priority === "high" ? 1 : 0,
    )[0];
  const topGoalMilestones = topGoal
    ? milestones.filter((milestone) => milestone.goalId === topGoal.id)
    : [];
  const completedTopGoalMilestones = topGoalMilestones.filter(
    (milestone) => milestone.completed,
  ).length;
  const topGoalProgress = topGoalMilestones.length
    ? (completedTopGoalMilestones / topGoalMilestones.length) * 100
    : 0;
  const nextProof =
    topGoal?.title ??
    todayTasks.find((task) => task.status !== "completed")?.title ??
    weeklyPriorities.find(Boolean);
  const dailyQuote = getDailyMotivation(today, semester.userId);

  return (
    <PageShell title="Dashboard">
      <div className="mx-auto max-w-7xl space-y-6">
        <section className="grid gap-5 lg:grid-cols-[1.35fr_0.65fr]">
          <MainResolutionPanel
            resolution={semester.mainResolution}
            theme={semester.theme}
            semesterName={semester.name}
            weekNumber={semesterStats.weekNumber}
            percentComplete={semesterStats.percentComplete}
            daysRemaining={semesterStats.daysRemaining}
            focus={nextProof}
            quote={dailyQuote}
            onSave={(mainResolution) =>
              updateSemester({ ...semester, mainResolution })
            }
          />
          <CharacterCompanion state={characterState} className="h-full" />
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
                      className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border-2 transition ${
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
                    <div className="flex shrink-0 items-center gap-2">
                      <CategoryBadge category={task.category} />
                      <ConfirmDeleteButton
                        itemLabel={`task ${task.title}`}
                        onConfirm={() => removeTask(task.id)}
                      />
                    </div>
                  </div>
                );
              })}
              {!todayTasks.length && (
                <EmptyState
                  title="Nothing planned for today"
                  description="Start with one task that is specific enough to complete."
                  action={
                    <Link
                      href="/today?add=true"
                      className="inline-flex h-9 items-center rounded-xl bg-accent px-4 text-xs font-bold text-white"
                    >
                      Add a task
                    </Link>
                  }
                />
              )}
            </CardContent>
          </Card>

          <div className="space-y-6">
            <Card className="overflow-hidden">
              <CardHeader>
                <CardTitle>Weekly top three</CardTitle>
                <CardDescription>The plot points that matter most.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {weeklyPriorities.filter(Boolean).map((priority, index) => (
                  <div key={`${index}-${priority}`} className="flex gap-3 rounded-xl border border-border bg-surface p-3">
                    <span className="sticker flex h-6 w-6 shrink-0 -rotate-3 items-center justify-center rounded-md bg-warning text-xs font-black text-[#18121f]">
                      {index + 1}
                    </span>
                    <p className="text-sm font-medium leading-6">{priority}</p>
                  </div>
                ))}
                {!weeklyPriorities.some(Boolean) && (
                  <p className="rounded-xl border border-dashed border-border p-4 text-sm leading-6 text-muted">
                    Choose three outcomes on Weekly Plan so the week has a
                    clear finish line.
                  </p>
                )}
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
                    value={topGoalProgress}
                    label={`${topGoal.title} breakdown progress`}
                  />
                  <p className="mt-2 text-xs text-muted">
                    {topGoalMilestones.length
                      ? `${completedTopGoalMilestones} of ${topGoalMilestones.length} breakdown steps complete`
                      : "No breakdown steps yet"}
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
              {!deadlines.length && (
                <div className="sm:col-span-3">
                  <EmptyState
                    title="No upcoming deadlines"
                    description="Add deadlines to tasks and they will appear here automatically."
                  />
                </div>
              )}
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
