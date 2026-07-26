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
  CategoryBadge,
  EmptyState,
  MetricCard,
} from "@/components/ui/resolve";
import { resolveCharacterState } from "@/lib/character/dialogue";
import {
  getHabitCompletionCount,
  getHabitTargetCount,
  getScheduledHabits,
} from "@/features/workspace/lib/habits";
import { getDailyCapacitySummary } from "@/features/workspace/lib/analytics";
import {
  formatDeadline,
  getDeadlineDateKey,
  getDerivedDeadlines,
  getTaskEstimatedMinutes,
  getTaskScheduleDate,
  isDeadlineComplete,
} from "@/features/workspace/lib/deadlines";
import { rankNextActions } from "@/features/workspace/lib/recommendations";
import { getDailyMotivation } from "@/lib/daily-motivation";
import { getSemesterWeek } from "@/lib/utils";
import {
  getWeekDateKeys,
  offsetDate,
  useResolve,
} from "@/contexts/resolve-context";

export default function DashboardPage() {
  const workspace = useResolve();
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
    addSemesterResolution,
    updateSemesterResolution,
    toggleSemesterResolution,
    removeSemesterResolution,
    updateWorkspacePreferences,
    preferences,
  } = workspace;
  const today = offsetDate(0);
  const weekDates = getWeekDateKeys();
  const todayTasks = tasks.filter(
    (task) => getTaskScheduleDate(task) === today,
  );
  const todayHabits = getScheduledHabits(habits, today);
  const completedToday = todayTasks.filter(
    (task) => task.status === "completed",
  ).length;
  const deadlines = getDerivedDeadlines(workspace)
    .filter(
      (deadline) =>
        getDeadlineDateKey(deadline.deadline) >= today &&
        !isDeadlineComplete(deadline),
    )
    .slice(0, 3);
  const overdue = getDerivedDeadlines(workspace).filter(
    (deadline) =>
      getDeadlineDateKey(deadline.deadline) < today &&
      !isDeadlineComplete(deadline),
  ).length;
  const weekMinutes = tasks
    .filter(
      (task) =>
        getTaskScheduleDate(task) &&
        getTaskScheduleDate(task)! >= weekDates[0] &&
        getTaskScheduleDate(task)! <= weekDates[6],
    )
    .reduce((sum, task) => sum + (getTaskEstimatedMinutes(task) ?? 0), 0);
  const completedHabits = todayHabits.filter((habit) =>
    habitLogs.some(
      (log) =>
        log.habitId === habit.id && log.date === today && log.completed,
    ),
  ).length;
  const weeklyHabitTarget = habits.reduce(
    (sum, habit) => sum + getHabitTargetCount(habit, weekDates),
    0,
  );
  const weeklyHabitCompleted = habits.reduce(
    (sum, habit) =>
      sum + getHabitCompletionCount(habit, habitLogs, weekDates),
    0,
  );
  const semesterStats = getSemesterWeek(
    semester.startDate,
    semester.endDate,
  );
  const characterState = resolveCharacterState({
    tasksCompletedToday: completedToday,
    tasksTotalToday: todayTasks.length,
    overdueTasks: overdue,
    upcomingDeadlines: deadlines.length,
    habitStreak: weeklyHabitCompleted,
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
  const todayCapacity = getDailyCapacitySummary({
    date: today,
    capacityMinutes: preferences.dailyCapacityMinutes,
    tasks,
    events: workspace.events ?? [],
  });
  const recommendation = rankNextActions(
    workspace,
    today,
    todayCapacity.remainingTaskCapacityMinutes,
  )[0];
  const activeTaskGoalIds = new Set(
    tasks
      .filter(
        (task) =>
          task.goalId &&
          !["completed", "cancelled", "skipped"].includes(task.status),
      )
      .map((task) => task.goalId),
  );
  const goalsWithoutActions = goals.filter(
    (goal) =>
      !["completed", "paused"].includes(goal.status) &&
      !activeTaskGoalIds.has(goal.id),
  );
  const repeatedlyDeferred = tasks.filter(
    (task) =>
      (task.deferral?.deferCount ?? 0) >= 3 &&
      !["completed", "cancelled", "skipped"].includes(task.status),
  );
  const assessmentsNeedingPreparation = workspace.modules
    .flatMap((module) => module.assessments)
    .filter(
      (assessment) =>
        !["submitted", "graded"].includes(assessment.status) &&
        assessment.deadline >= today &&
        assessment.deadline <= offsetDate(7) &&
        !tasks.some(
          (task) =>
            task.origin?.kind === "assessment-preparation" &&
            task.origin.assessmentId === assessment.id &&
            !["completed", "cancelled", "skipped"].includes(task.status),
        ),
    );
  const attentionItems = [
    ...(overdue
      ? [
          {
            id: "overdue",
            title: `${overdue} overdue deadline${overdue === 1 ? "" : "s"}`,
            detail: "Choose whether to complete, defer, or cancel each item.",
            href: "/timeline",
            action: "Review deadlines",
          },
        ]
      : []),
    ...(todayCapacity.isOverloaded
      ? [
          {
            id: "capacity",
            title: "Today exceeds your planning capacity",
            detail: `${todayCapacity.scheduledTaskMinutes} task minutes and ${todayCapacity.fixedEventMinutes} fixed minutes against ${preferences.dailyCapacityMinutes} available.`,
            href: "/today",
            action: "Rebalance today",
          },
        ]
      : []),
    ...goalsWithoutActions.slice(0, 2).map((goal) => ({
      id: `goal:${goal.id}`,
      title: `${goal.title} has no next action`,
      detail: "Create one shared task so the goal can move this week.",
      href: `/goals?goal=${encodeURIComponent(goal.id)}`,
      action: "Open goal",
    })),
    ...assessmentsNeedingPreparation.slice(0, 2).map((assessment) => ({
      id: `assessment:${assessment.id}`,
      title: `${assessment.title} needs preparation`,
      detail: `Due ${formatDeadline({ kind: "date", date: assessment.deadline })}. No active preparation task exists.`,
      href: `/academics?assessment=${encodeURIComponent(assessment.id)}`,
      action: "Plan preparation",
    })),
    ...repeatedlyDeferred.slice(0, 2).map((task) => ({
      id: `deferred:${task.id}`,
      title: `${task.title} keeps being deferred`,
      detail: `Deferred ${task.deferral?.deferCount ?? 0} times. Reduce its scope or give it an exact block.`,
      href: `/today?task=${encodeURIComponent(task.id)}`,
      action: "Review task",
    })),
  ].slice(0, 5);

  return (
    <PageShell title="Dashboard">
      <div className="mx-auto max-w-7xl space-y-6">
        <section className="grid gap-5 lg:grid-cols-[1.35fr_0.65fr]">
          <MainResolutionPanel
            resolutions={semester.resolutions ?? []}
            theme={semester.theme}
            semesterName={semester.name}
            weekNumber={semesterStats.weekNumber}
            percentComplete={semesterStats.percentComplete}
            daysRemaining={semesterStats.daysRemaining}
            focus={nextProof}
            quote={dailyQuote}
            onAdd={addSemesterResolution}
            onUpdate={updateSemesterResolution}
            onToggle={toggleSemesterResolution}
            onRemove={removeSemesterResolution}
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
            label="Habits this week"
            value={`${weeklyHabitCompleted}/${weeklyHabitTarget}`}
            detail={`${completedHabits} of ${todayHabits.length} scheduled today`}
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

        <Card className="overflow-hidden border-warning/40 bg-[linear-gradient(120deg,rgba(255,199,72,0.14),rgba(255,79,154,0.07))]">
          <CardContent className="flex flex-col gap-4 pt-6 lg:flex-row lg:items-center lg:justify-between">
            {recommendation ? (
              <>
                <div className="min-w-0">
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-warning">
                    Recommended next action
                  </p>
                  <h2 className="mt-1 break-words font-display text-2xl">
                    {recommendation.task.title}
                  </h2>
                  <p className="mt-2 text-sm text-muted">
                    {recommendation.reasons.join(" · ") ||
                      "Available and ready to begin"}
                  </p>
                </div>
                <div className="flex max-w-full flex-wrap gap-2 lg:shrink-0">
                  <Link
                    href={`/today?task=${encodeURIComponent(recommendation.task.id)}&start=true`}
                    className="inline-flex min-h-10 max-w-full items-center rounded-xl bg-accent px-4 py-2 text-center text-sm font-black leading-tight text-white"
                  >
                    Start this
                  </Link>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() =>
                      updateWorkspacePreferences({
                        pinnedTaskId:
                          preferences.pinnedTaskId === recommendation.task.id
                            ? undefined
                            : recommendation.task.id,
                      })
                    }
                  >
                    {preferences.pinnedTaskId === recommendation.task.id
                      ? "Unpin"
                      : "Pin"}
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() =>
                      updateWorkspacePreferences({
                        hiddenRecommendationDate: today,
                      })
                    }
                  >
                    Hide today
                  </Button>
                </div>
              </>
            ) : (
              <div>
                <p className="font-display text-xl">
                  {preferences.autoNextAction
                    ? "No available task needs a recommendation."
                    : "Automatic recommendations are paused."}
                </p>
                <Link
                  href="/today"
                  className="mt-2 inline-flex text-sm font-bold text-accent"
                >
                  Choose a task manually
                </Link>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Needs attention</CardTitle>
            <CardDescription>
              Only exceptions that require a decision appear here.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {attentionItems.map((item) => (
              <div
                key={item.id}
                className="flex flex-col gap-3 rounded-2xl border border-warning/30 bg-warning/5 p-4 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="min-w-0">
                  <p className="break-words text-sm font-black">{item.title}</p>
                  <p className="mt-1 text-xs leading-5 text-muted">
                    {item.detail}
                  </p>
                </div>
                <Link
                  href={item.href}
                  className="inline-flex min-h-9 max-w-full items-center justify-center rounded-xl bg-warning px-3 py-2 text-center text-xs font-black leading-tight text-[#18121f] sm:shrink-0"
                >
                  {item.action}
                </Link>
              </div>
            ))}
            {!attentionItems.length && (
              <p className="rounded-2xl border border-success/25 bg-success/5 p-4 text-sm font-semibold text-success">
                No urgent exception needs a decision. Continue with the
                recommended next action.
              </p>
            )}
          </CardContent>
        </Card>

        <div className="grid gap-6 lg:grid-cols-[1.4fr_0.8fr]">
          <Card>
            <CardHeader className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
              <div>
                <CardTitle>Today&apos;s setlist</CardTitle>
                <CardDescription>
                  One clear action at a time. Tap the circle when it&apos;s done.
                </CardDescription>
              </div>
              <Link
                href="/today?add=true"
                className="inline-flex min-h-9 max-w-full items-center gap-2 rounded-xl bg-accent px-3 py-2 text-xs font-bold leading-tight text-white sm:shrink-0"
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
                    className="group grid grid-cols-[2.25rem_minmax(0,1fr)] items-start gap-x-3 gap-y-2 rounded-2xl border-2 border-border bg-surface p-3 transition hover:-translate-y-0.5 hover:border-accent/50 sm:grid-cols-[2.25rem_minmax(0,1fr)_auto] sm:items-center"
                  >
                    <button
                      type="button"
                      onClick={() => toggleTask(task.id)}
                      aria-label={
                        done
                          ? `Mark ${task.title} incomplete`
                          : `Complete ${task.title}`
                      }
                      className={`flex h-9 w-9 items-center justify-center rounded-xl border-2 transition ${
                        done
                          ? "border-success bg-success text-white"
                          : "border-border hover:border-accent"
                      }`}
                    >
                      {done && <Check className="h-3.5 w-3.5" />}
                    </button>
                    <div className="min-w-0 flex-1">
                      <p
                        className={`break-words font-semibold leading-6 [overflow-wrap:anywhere] ${
                          done ? "text-muted line-through" : ""
                        }`}
                      >
                        {task.title}
                      </p>
                      <p className="mt-0.5 break-words text-xs leading-5 text-muted">
                        {getTaskEstimatedMinutes(task) !== undefined
                          ? `${getTaskEstimatedMinutes(task)} min · `
                          : ""}
                        {task.priority} priority
                      </p>
                    </div>
                    <div className="col-start-2 row-start-2 flex min-w-0 flex-wrap items-center gap-2 sm:col-start-3 sm:row-start-1 sm:justify-end">
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
                      className="inline-flex min-h-9 max-w-full items-center rounded-xl bg-accent px-4 py-2 text-center text-xs font-bold leading-tight text-white"
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
                  <CategoryBadge category={deadline.sourceType} />
                  <p className="mt-3 text-sm font-bold">{deadline.title}</p>
                  <p className="mt-1 text-xs text-muted">
                    {formatDeadline(deadline.deadline)}
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
                className="inline-flex min-h-11 max-w-full items-center justify-center gap-2 rounded-xl bg-[#1e1b4b] px-4 py-2.5 text-center text-sm font-bold leading-tight text-white"
              >
                <Zap className="h-4 w-4 text-accent" />
                Log guitar practice
              </Link>
              <Link
                href="/reflections"
                className="inline-flex min-h-11 max-w-full items-center justify-center rounded-xl border border-border bg-surface px-4 py-2.5 text-center text-sm font-bold leading-tight"
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
