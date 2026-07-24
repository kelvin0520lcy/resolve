"use client";

import Link from "next/link";
import { Plus, Zap } from "lucide-react";
import { PageShell } from "@/components/layout/page-shell";
import { CharacterCompanion } from "@/components/character/character-companion";
import { Badge, ProgressBar } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  DEMO_CHARACTER_CONTEXT,
  resolveCharacterState,
} from "@/lib/character/dialogue";
import { getSemesterWeek } from "@/lib/utils";

const DEMO_SEMESTER = {
  name: "AY2026/2027 Semester 1",
  theme: "Building consistency",
  startDate: "2026-08-11",
  endDate: "2026-12-05",
};

const DEMO_TASKS = [
  { title: "Review CS2040 lecture notes", category: "academics", done: false },
  { title: "Solve 2 LeetCode medium problems", category: "career", done: true },
  { title: "Guitar: alternate picking at 100 BPM", category: "guitar", done: false },
];

const DEMO_DEADLINES = [
  { title: "CS2103T Assignment 2", date: "Mon, 28 Jul", urgent: true },
  { title: "Internship application — Google", date: "Fri, 1 Aug", urgent: false },
];

export default function DashboardPage() {
  const characterState = resolveCharacterState(DEMO_CHARACTER_CONTEXT);
  const semester = getSemesterWeek(
    DEMO_SEMESTER.startDate,
    DEMO_SEMESTER.endDate,
  );
  const completedToday = DEMO_TASKS.filter((t) => t.done).length;

  return (
    <PageShell title="Dashboard">
      <div className="mx-auto max-w-6xl space-y-6">
        <CharacterCompanion state={characterState} />

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader>
              <CardDescription>Current Episode</CardDescription>
              <CardTitle className="text-2xl">
                Week {semester.weekNumber}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted">{DEMO_SEMESTER.name}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardDescription>Semester Progress</CardDescription>
              <CardTitle className="text-2xl">
                {semester.percentComplete}%
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ProgressBar value={semester.percentComplete} />
              <p className="mt-2 text-xs text-muted">
                {semester.daysRemaining} days remaining
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardDescription>Today&apos;s Tasks</CardDescription>
              <CardTitle className="text-2xl">
                {completedToday}/{DEMO_TASKS.length}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ProgressBar
                value={(completedToday / DEMO_TASKS.length) * 100}
                color="var(--success)"
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardDescription>Semester Theme</CardDescription>
              <CardTitle className="text-lg">{DEMO_SEMESTER.theme}</CardTitle>
            </CardHeader>
            <CardContent>
              <Badge variant="accent">Episode {semester.weekNumber}</Badge>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          <Card className="lg:col-span-2">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Today&apos;s Setlist</CardTitle>
                <CardDescription>Focus tasks for today</CardDescription>
              </div>
              <Link
                href="/today"
                className="inline-flex h-8 items-center gap-2 rounded-lg bg-accent px-3 text-xs font-semibold text-white"
              >
                <Plus className="h-4 w-4" />
                View all
              </Link>
            </CardHeader>
            <CardContent className="space-y-3">
              {DEMO_TASKS.map((task) => (
                <div
                  key={task.title}
                  className="flex items-center justify-between rounded-xl border border-border bg-surface px-4 py-3"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`h-4 w-4 rounded-full border-2 ${
                        task.done
                          ? "border-success bg-success"
                          : "border-border"
                      }`}
                    />
                    <span
                      className={
                        task.done ? "text-muted line-through" : "font-medium"
                      }
                    >
                      {task.title}
                    </span>
                  </div>
                  <Badge>{task.category}</Badge>
                </div>
              ))}
            </CardContent>
          </Card>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Upcoming Deadlines</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {DEMO_DEADLINES.map((d) => (
                  <div
                    key={d.title}
                    className="flex items-start justify-between gap-2 text-sm"
                  >
                    <span className="font-medium">{d.title}</span>
                    <Badge variant={d.urgent ? "danger" : "default"}>
                      {d.date}
                    </Badge>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="grid gap-2">
                <Link
                  href="/today?add=true"
                  className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-border bg-surface-elevated px-4 text-sm font-semibold"
                >
                  <Plus className="h-4 w-4" />
                  Add task
                </Link>
                <Link
                  href="/guitar"
                  className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-border bg-surface-elevated px-4 text-sm font-semibold"
                >
                  <Zap className="h-4 w-4" />
                  Log practice
                </Link>
                <Link
                  href="/weekly"
                  className="inline-flex h-10 items-center justify-center rounded-xl border-2 border-accent px-4 text-sm font-semibold text-accent"
                >
                  Plan this week
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </PageShell>
  );
}
