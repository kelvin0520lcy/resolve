"use client";

import Link from "next/link";
import { useState } from "react";
import { BarChart3, Lightbulb, Target, Timer } from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { PageShell } from "@/components/layout/page-shell";
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
} from "@/components/ui/resolve";
import { GOAL_CATEGORIES } from "@/lib/constants/categories";
import {
  getWeekDateKeys,
  offsetDate,
  useResolve,
} from "@/contexts/resolve-context";
import {
  getTasksInRange,
  getActualMinutesByCategory,
  getAverageGoalProgress,
  getPlannedMinutesByCategory,
  type DateRange,
} from "@/features/workspace/lib/analytics";
import { parseLocalDate, toDateKey } from "@/lib/date";
import {
  getHabitAchievedCount,
  getHabitTargetCount,
} from "@/features/workspace/lib/habits";
import {
  getTaskEstimatedMinutes,
  getTaskScheduleDate,
} from "@/features/workspace/lib/deadlines";

export default function AnalyticsPage() {
  const {
    tasks,
    goals,
    milestones,
    habits,
    habitLogs,
    guitarSessions,
    semester,
  } = useResolve();
  const [windowId, setWindowId] = useState<
    "this_week" | "previous_week" | "four_weeks" | "semester"
  >("this_week");
  const currentWeek = getWeekDateKeys();
  const previousWeek = getWeekDateKeys(parseLocalDate(offsetDate(-7)));
  const ranges: Record<typeof windowId, DateRange> = {
    this_week: { startDate: currentWeek[0], endDate: currentWeek[6] },
    previous_week: { startDate: previousWeek[0], endDate: previousWeek[6] },
    four_weeks: { startDate: offsetDate(-27), endDate: offsetDate(0) },
    semester: {
      startDate: semester.startDate,
      endDate: semester.endDate,
    },
  };
  const range = ranges[windowId];
  const rangeDates: string[] = [];
  for (
    let cursor = parseLocalDate(range.startDate);
    toDateKey(cursor) <= range.endDate;
    cursor = new Date(
      cursor.getFullYear(),
      cursor.getMonth(),
      cursor.getDate() + 1,
      12,
    )
  ) {
    rangeDates.push(toDateKey(cursor));
  }
  const periodTasks = getTasksInRange(tasks, range);
  const periodGuitarSessions = guitarSessions.filter(
    (session) =>
      session.date >= range.startDate && session.date <= range.endDate,
  );
  const lastSevenDates = [-6, -5, -4, -3, -2, -1, 0].map((day) =>
    offsetDate(day),
  );
  const lastSeven = lastSevenDates.map((date) => {
    const dayTasks = tasks.filter(
      (task) => getTaskScheduleDate(task) === date,
    );
    const complete = dayTasks.filter(
      (task) => task.status === "completed",
    ).length;
    return {
      day: new Date(`${date}T12:00:00`).toLocaleDateString("en-SG", {
        weekday: "short",
      }),
      completion: dayTasks.length
        ? Math.round((complete / dayTasks.length) * 100)
        : 0,
    };
  });
  const plannedByCategory = getPlannedMinutesByCategory(tasks, range);
  const actualByCategory = getActualMinutesByCategory(
    tasks,
    guitarSessions,
    range,
  );
  const categoryTime = GOAL_CATEGORIES.map((category) => ({
    name: category.label,
    planned: plannedByCategory[category.id] ?? 0,
    actual: actualByCategory[category.id] ?? 0,
    color: category.color,
  })).filter((item) => item.planned > 0 || item.actual > 0);
  const plannedMinutes = periodTasks.reduce(
    (sum, task) => sum + (getTaskEstimatedMinutes(task) ?? 0),
    0,
  );
  const completedTasks = periodTasks.filter(
    (task) => task.status === "completed",
  );
  const actualMinutes = completedTasks.reduce(
    (sum, task) => sum + (task.actualMinutes ?? 0),
    0,
  );
  const goalProgress = getAverageGoalProgress(goals, milestones);
  const habitTarget = habits.reduce(
    (sum, habit) => sum + getHabitTargetCount(habit, rangeDates),
    0,
  );
  const habitCompleted = habits.reduce(
    (sum, habit) =>
      sum + getHabitAchievedCount(habit, habitLogs, rangeDates),
    0,
  );
  const habitRate = Math.round(
    (habitCompleted / Math.max(habitTarget, 1)) * 100,
  );
  const guitarTechniqueMinutes = periodGuitarSessions
    .filter((session) => session.category !== "Repertoire")
    .reduce((sum, session) => sum + session.durationMinutes, 0);
  const guitarTotal = periodGuitarSessions.reduce(
    (sum, session) => sum + session.durationMinutes,
    0,
  );
  const hasActivity =
    periodTasks.length > 0 ||
    goals.length > 0 ||
    habits.length > 0 ||
    periodGuitarSessions.length > 0;
  const frequentlyDeferred = periodTasks.filter(
    (task) =>
      (task.deferral?.deferCount ?? 0) >= 2 &&
      !["completed", "cancelled", "skipped"].includes(task.status),
  );
  const activeGoalIdsWithTasks = new Set(
    periodTasks
      .filter(
        (task) =>
          task.goalId &&
          !["completed", "cancelled", "skipped"].includes(task.status),
      )
      .map((task) => task.goalId),
  );
  const goalWithoutAction = goals.find(
    (goal) =>
      !["completed", "paused"].includes(goal.status) &&
      !activeGoalIdsWithTasks.has(goal.id),
  );
  const insights = hasActivity
    ? [
        {
          text:
            completedTasks.length >= 3 &&
            plannedMinutes > 0 &&
            actualMinutes < plannedMinutes * 0.75
              ? `Actual logged time is ${Math.round((actualMinutes / Math.max(plannedMinutes, 1)) * 100)}% of planned time. Reduce tomorrow’s load or correct the estimates.`
              : completedTasks.length >= 3 && plannedMinutes > 0
                ? "Planned and actual time are tracking within a realistic range."
                : "Complete and time at least three tasks in this period before judging estimate accuracy.",
          href: "/today",
          action: "Adjust tomorrow",
        },
        frequentlyDeferred.length
          ? {
              text: `${frequentlyDeferred[0].title} has been deferred ${frequentlyDeferred[0].deferral?.deferCount ?? 0} times. Break it down or give it a smaller time block.`,
              href: `/today?task=${encodeURIComponent(frequentlyDeferred[0].id)}`,
              action: "Review task",
            }
          : {
              text: "No active task has crossed the repeated-deferral warning threshold.",
              href: "/weekly",
              action: "Review the week",
            },
        goalWithoutAction
          ? {
              text: `${goalWithoutAction.title} has no active next action. Add one task before the goal disappears behind other work.`,
              href: `/goals?goal=${encodeURIComponent(goalWithoutAction.id)}`,
              action: "Add goal action",
            }
          : {
              text: goals.length
                ? "Every active goal currently has a visible next action."
                : "Create a measurable goal to unlock goal-balance analysis.",
              href: "/goals",
              action: goals.length ? "Review goals" : "Create a goal",
            },
        {
          text:
            guitarTotal === 0
              ? "No guitar activity has been recorded in this period."
              : guitarTechniqueMinutes / guitarTotal < 0.4
              ? "Repertoire dominates guitar practice. Protect one technique-only session next week."
              : "Guitar practice includes a healthy amount of technique work.",
          href: "/guitar",
          action: "Open Guitar Studio",
        },
      ]
    : [
        {
          text: "Add your first task, goal, habit, or practice session. Analytics will explain patterns only after real activity exists.",
          href: "/today?add=true",
          action: "Add first task",
        },
      ];

  return (
    <PageShell title="Analytics">
      <div className="mx-auto max-w-7xl space-y-6">
        <PageIntro
          eyebrow="Control room"
          title="Use patterns to make better plans"
          description="The charts explain what is happening; the rules below suggest one useful adjustment."
        />

        <div className="flex flex-wrap items-end justify-between gap-3 rounded-2xl border border-border bg-surface p-4">
          <div>
            <p className="text-xs font-black uppercase tracking-wider text-accent">
              Analysis period
            </p>
            <p className="mt-1 text-sm text-muted">
              {range.startDate} to {range.endDate}
            </p>
          </div>
          <label className="text-xs font-bold">
            Time window
            <select
              className="mt-1 block min-h-10 rounded-xl border-2 border-border bg-surface-elevated px-3 text-sm"
              value={windowId}
              onChange={(event) =>
                setWindowId(event.target.value as typeof windowId)
              }
            >
              <option value="this_week">This week</option>
              <option value="previous_week">Previous week</option>
              <option value="four_weeks">Last four weeks</option>
              <option value="semester">Semester</option>
            </select>
          </label>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <MetricCard
            label="Goal progress"
            value={goalProgress === undefined ? "N/A" : `${goalProgress}%`}
            detail="average across active semester goals"
            icon={<Target className="h-5 w-5" />}
          />
          <MetricCard
            label="Habit consistency"
            value={habitTarget ? `${habitRate}%` : "N/A"}
            detail={
              habitTarget
                ? `${habitCompleted} of ${habitTarget} planned in this period`
                : "No habit targets fall in this period"
            }
            icon={<BarChart3 className="h-5 w-5" />}
          />
          <MetricCard
            label="Planned vs logged"
            value={`${Math.round(actualMinutes / 60)}h / ${Math.round(plannedMinutes / 60)}h`}
            detail="completed actual and scheduled planned time in this period"
            icon={<Timer className="h-5 w-5" />}
          />
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Recent seven-day completion rate</CardTitle>
              <CardDescription>
                Zero can mean a rest day, not a failed day.
              </CardDescription>
            </CardHeader>
            <CardContent className="h-72">
              <table className="sr-only">
                <caption>Recent daily task completion percentages</caption>
                <thead>
                  <tr>
                    <th>Day</th>
                    <th>Completion</th>
                  </tr>
                </thead>
                <tbody>
                  {lastSeven.map((item) => (
                    <tr key={item.day}>
                      <td>{item.day}</td>
                      <td>{item.completion}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={lastSeven}>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={false}
                    stroke="var(--border)"
                  />
                  <XAxis dataKey="day" tickLine={false} axisLine={false} />
                  <YAxis
                    domain={[0, 100]}
                    tickLine={false}
                    axisLine={false}
                    unit="%"
                  />
                  <Tooltip
                    cursor={{ fill: "var(--surface-muted)" }}
                    contentStyle={{
                      borderRadius: 12,
                      borderColor: "var(--border)",
                      background: "var(--surface-elevated)",
                    }}
                  />
                  <Bar
                    dataKey="completion"
                    fill="var(--accent)"
                    radius={[8, 8, 2, 2]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Time by category</CardTitle>
              <CardDescription>
                Planned estimates and actual logged time stay separate.
              </CardDescription>
            </CardHeader>
            <CardContent className="h-72">
              <table className="sr-only">
                <caption>Tracked minutes by category</caption>
                <thead>
                  <tr>
                    <th>Category</th>
                    <th>Planned minutes</th>
                    <th>Actual minutes</th>
                  </tr>
                </thead>
                <tbody>
                  {categoryTime.map((item) => (
                    <tr key={item.name}>
                      <td>{item.name}</td>
                      <td>{item.planned}</td>
                      <td>{item.actual}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {categoryTime.length ? <ResponsiveContainer width="100%" height="100%">
                <BarChart data={categoryTime}>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={false}
                    stroke="var(--border)"
                  />
                  <XAxis dataKey="name" tickLine={false} axisLine={false} />
                  <YAxis tickLine={false} axisLine={false} unit="m" />
                  <Tooltip
                    formatter={(value) => [`${value} min`]}
                    contentStyle={{
                      borderRadius: 12,
                      borderColor: "var(--border)",
                      background: "var(--surface-elevated)",
                    }}
                  />
                  <Bar
                    dataKey="planned"
                    name="Planned"
                    fill="var(--accent)"
                    radius={[6, 6, 0, 0]}
                  />
                  <Bar
                    dataKey="actual"
                    name="Actual"
                    fill="var(--success)"
                    radius={[6, 6, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer> : (
                <div className="flex h-full items-center">
                  <EmptyState
                    title="No time distribution yet"
                    description="Add estimated time to tasks or log practice to reveal where the week is going."
                  />
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <Card className="border-accent/25">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-accent/10 text-accent">
                <Lightbulb className="h-5 w-5" />
              </div>
              <div>
                <CardTitle>Rule-based insights</CardTitle>
                <CardDescription>
                  Deterministic suggestions from your current data.
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
            {insights.map((insight, index) => (
              <div
                key={insight.text}
                className="flex flex-col rounded-2xl border border-border bg-surface p-4"
              >
                <span className="text-xs font-black uppercase tracking-wider text-accent">
                  Signal {index + 1}
                </span>
                <p className="mt-2 flex-1 text-sm leading-6">{insight.text}</p>
                <Link
                  href={insight.href}
                  className="mt-4 inline-flex text-xs font-black text-accent underline underline-offset-4"
                >
                  {insight.action}
                </Link>
              </div>
            ))}
          </CardContent>
        </Card>
        {periodTasks.length > 0 && periodTasks.length < 5 && (
          <p className="rounded-2xl border border-border bg-surface p-4 text-xs leading-5 text-muted">
            Early signal: complete at least five tasks before treating these
            patterns as reliable trends.
          </p>
        )}
      </div>
    </PageShell>
  );
}
