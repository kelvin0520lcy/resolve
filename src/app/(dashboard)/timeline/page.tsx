"use client";

import { CalendarRange, Flag, Sparkles } from "lucide-react";
import { PageShell } from "@/components/layout/page-shell";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  CategoryBadge,
  MetricCard,
  PageIntro,
} from "@/components/ui/resolve";
import { offsetDate, useResolve } from "@/contexts/resolve-context";
import { formatDate, getSemesterWeek } from "@/lib/utils";
import type { SemesterEvent } from "@/types";
import {
  getDeadlineDateKey,
  getDerivedDeadlines,
} from "@/features/workspace/lib/deadlines";

export default function TimelinePage() {
  const workspace = useResolve();
  const { semester } = workspace;
  const stats = getSemesterWeek(semester.startDate, semester.endDate);
  const events: SemesterEvent[] = [
    {
      id: "semester-start",
      title: "Semester begins",
      date: semester.startDate,
      category: "academics",
      type: "semester" as const,
    },
    ...(semester.recessWeekStart
      ? [
          {
            id: "recess",
            title: "Recess week",
            date: semester.recessWeekStart,
            category: "health",
            type: "break" as const,
          },
        ]
      : []),
    ...(semester.readingWeekStart
      ? [
          {
            id: "reading",
            title: "Reading week",
            date: semester.readingWeekStart,
            category: "academics",
            type: "break" as const,
          },
        ]
      : []),
    ...(semester.examPeriodStart
      ? [
          {
            id: "exams",
            title: "Examination period",
            date: semester.examPeriodStart,
            category: "academics",
            type: "exam" as const,
          },
        ]
      : []),
    ...getDerivedDeadlines(workspace).map((deadline) => ({
      id: deadline.id,
      title: deadline.title,
      date: getDeadlineDateKey(deadline.deadline),
      category: deadline.sourceType,
      type:
        deadline.sourceType === "milestone"
          ? ("milestone" as const)
          : ("deadline" as const),
    })),
    {
      id: "semester-end",
      title: "Semester finale",
      date: semester.endDate,
      category: "personal",
      type: "semester" as const,
    },
  ].sort((a, b) => a.date.localeCompare(b.date));
  const upcoming = events.filter((event) => event.date >= offsetDate(0));

  return (
    <PageShell title="Timeline">
      <div className="mx-auto max-w-6xl space-y-6">
        <PageIntro
          eyebrow="Semester episode guide"
          title="See the whole season at once"
          description="Task deadlines, breaks, exams, and semester dates share one chronological story."
        />

        <div className="grid gap-4 sm:grid-cols-3">
          <MetricCard
            label="Current episode"
            value={`Week ${stats.weekNumber}`}
            detail={`of ${stats.totalWeeks} semester weeks`}
            icon={<Sparkles className="h-5 w-5" />}
          />
          <MetricCard
            label="Upcoming events"
            value={upcoming.length}
            detail="deadlines and semester dates ahead"
            icon={<Flag className="h-5 w-5" />}
          />
          <MetricCard
            label="Semester finale"
            value={`${stats.daysRemaining} days`}
            detail={formatDate(`${semester.endDate}T12:00:00`)}
            icon={<CalendarRange className="h-5 w-5" />}
          />
        </div>

        <Card>
          <CardHeader>
            <CardTitle>{semester.name}</CardTitle>
            <CardDescription>{semester.theme}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="relative space-y-0 before:absolute before:bottom-4 before:left-[19px] before:top-4 before:w-px before:bg-border">
              {events.map((event) => {
                const isPast = event.date < offsetDate(0);
                const isSoon =
                  event.date >= offsetDate(0) && event.date <= offsetDate(7);
                const week =
                  Math.max(
                    0,
                    new Date(`${event.date}T12:00:00`).getTime() -
                      new Date(`${semester.startDate}T12:00:00`).getTime(),
                  ) /
                  (7 * 24 * 60 * 60 * 1000);
                return (
                  <div
                    key={event.id}
                    className={`relative flex gap-4 pb-7 ${
                      isPast ? "opacity-55" : ""
                    }`}
                  >
                    <div
                      className={`relative z-10 mt-1 h-10 w-10 shrink-0 rounded-2xl border-4 border-surface-elevated ${
                        isSoon
                          ? "bg-accent shadow-lg shadow-accent/25"
                          : isPast
                            ? "bg-success"
                            : "bg-surface-muted"
                      }`}
                    />
                    <div
                      className={`flex-1 rounded-2xl border p-4 ${
                        isSoon
                          ? "border-accent/40 bg-accent/5"
                          : "border-border bg-surface"
                      }`}
                    >
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div>
                          <div className="flex flex-wrap items-center gap-2">
                            <CategoryBadge category={event.category} />
                            <Badge className="capitalize">{event.type}</Badge>
                          </div>
                          <p className="mt-3 font-black">{event.title}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-bold">
                            {formatDate(`${event.date}T12:00:00`)}
                          </p>
                          <p className="mt-1 text-xs text-muted">
                            Episode {Math.floor(week) + 1}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </PageShell>
  );
}
