"use client";

import { BarChart3, Lightbulb, Target, Timer } from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
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
import { offsetDate, useResolve } from "@/contexts/resolve-context";

export default function AnalyticsPage() {
  const { tasks, goals, habits, habitLogs, guitarSessions } = useResolve();
  const lastSevenDates = [-6, -5, -4, -3, -2, -1, 0].map((day) =>
    offsetDate(day),
  );
  const lastSeven = lastSevenDates.map((date) => {
    const dayTasks = tasks.filter((task) => task.scheduledDate === date);
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
  const categoryTime = GOAL_CATEGORIES.map((category) => ({
    name: category.label,
    value: tasks
      .filter((task) => task.category === category.id)
      .reduce((sum, task) => sum + (task.actualMinutes ?? task.estimatedMinutes ?? 0), 0),
    color: category.color,
  })).filter((item) => item.value > 0);
  const plannedMinutes = tasks.reduce(
    (sum, task) => sum + (task.estimatedMinutes ?? 0),
    0,
  );
  const actualMinutes = tasks.reduce(
    (sum, task) => sum + (task.actualMinutes ?? 0),
    0,
  );
  const goalProgress = Math.round(
    goals.reduce(
      (sum, goal) =>
        sum +
        ((goal.currentValue ?? 0) / Math.max(goal.targetValue ?? 1, 1)) * 100,
      0,
    ) / Math.max(goals.length, 1),
  );
  const habitRate = Math.round(
    (habitLogs.filter((log) => {
      const habit = habits.find((item) => item.id === log.habitId);
      const day = new Date(`${log.date}T12:00:00`).getDay();
      return (
        lastSevenDates.includes(log.date) &&
        log.completed &&
        habit?.targetDays.includes(day)
      );
    }).length /
      Math.max(
        habits.reduce(
          (total, habit) =>
            total +
            lastSevenDates.filter((date) =>
              habit.targetDays.includes(
                new Date(`${date}T12:00:00`).getDay(),
              ),
            ).length,
          0,
        ),
        1,
      )) *
      100,
  );
  const guitarTechniqueMinutes = guitarSessions
    .filter((session) => session.category !== "Repertoire")
    .reduce((sum, session) => sum + session.durationMinutes, 0);
  const guitarTotal = guitarSessions.reduce(
    (sum, session) => sum + session.durationMinutes,
    0,
  );
  const hasActivity =
    tasks.length > 0 ||
    goals.length > 0 ||
    habits.length > 0 ||
    guitarSessions.length > 0;
  const insights = hasActivity ? [
    plannedMinutes > 0 && actualMinutes < plannedMinutes * 0.75
      ? `Actual logged time is ${Math.round((actualMinutes / Math.max(plannedMinutes, 1)) * 100)}% of planned time. Reduce estimates or log completed sessions more consistently.`
      : plannedMinutes > 0
        ? "Planned and actual time are tracking within a realistic range."
        : "Add estimated time to tasks to compare planning with reality.",
    guitarTotal && guitarTechniqueMinutes / guitarTotal < 0.4
      ? "Repertoire dominates guitar practice. Protect one technique-only session next week."
      : "Guitar practice includes a healthy amount of technique work.",
    goals.some((goal) => goal.status === "at_risk")
      ? "At least one goal is at risk. Give it a specific task on the weekly board."
      : goals.length
        ? "Every active goal currently has a healthy status."
        : "Create a measurable goal to unlock progress analysis.",
  ] : [
    "Add your first task, goal, habit, or practice session. Analytics will explain patterns only after real activity exists.",
  ];

  return (
    <PageShell title="Analytics">
      <div className="mx-auto max-w-7xl space-y-6">
        <PageIntro
          eyebrow="Control room"
          title="Use patterns to make better plans"
          description="The charts explain what is happening; the rules below suggest one useful adjustment."
        />

        <div className="grid gap-4 sm:grid-cols-3">
          <MetricCard
            label="Goal progress"
            value={`${goalProgress}%`}
            detail="average across semester goals"
            icon={<Target className="h-5 w-5" />}
          />
          <MetricCard
            label="Habit consistency"
            value={`${habitRate}%`}
            detail="seven-day completion signal"
            icon={<BarChart3 className="h-5 w-5" />}
          />
          <MetricCard
            label="Planned vs logged"
            value={`${Math.round(actualMinutes / 60)}h / ${Math.round(plannedMinutes / 60)}h`}
            detail="actual and estimated time"
            icon={<Timer className="h-5 w-5" />}
          />
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Daily completion rate</CardTitle>
              <CardDescription>
                Zero can mean a rest day, not a failed day.
              </CardDescription>
            </CardHeader>
            <CardContent className="h-72">
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
                Estimated time is used when actual time is missing.
              </CardDescription>
            </CardHeader>
            <CardContent className="h-72">
              {categoryTime.length ? <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryTime}
                    dataKey="value"
                    nameKey="name"
                    innerRadius={55}
                    outerRadius={90}
                    paddingAngle={3}
                  >
                    {categoryTime.map((entry) => (
                      <Cell key={entry.name} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value) => [`${value} min`, "Time"]}
                    contentStyle={{
                      borderRadius: 12,
                      borderColor: "var(--border)",
                      background: "var(--surface-elevated)",
                    }}
                  />
                </PieChart>
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
          <CardContent className="grid gap-3 md:grid-cols-3">
            {insights.map((insight, index) => (
              <div
                key={insight}
                className="rounded-2xl border border-border bg-surface p-4"
              >
                <span className="text-xs font-black uppercase tracking-wider text-accent">
                  Signal {index + 1}
                </span>
                <p className="mt-2 text-sm leading-6">{insight}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </PageShell>
  );
}
