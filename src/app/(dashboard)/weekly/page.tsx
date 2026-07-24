"use client";

import { useEffect, useMemo, useState } from "react";
import { AlertTriangle, CalendarDays, Check, Save } from "lucide-react";
import { PageShell } from "@/components/layout/page-shell";
import { Button } from "@/components/ui/button";
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
  fieldClassName,
} from "@/components/ui/resolve";
import {
  getWeekDateKeys,
  offsetDate,
  useResolve,
} from "@/contexts/resolve-context";
import { formatDate } from "@/lib/utils";

export default function WeeklyPage() {
  const { tasks, weeklyPriorities, updatePriorities, moveTask } = useResolve();
  const dates = useMemo(() => getWeekDateKeys(), []);
  const [priorities, setPriorities] = useState(weeklyPriorities);

  useEffect(() => {
    const frame = window.requestAnimationFrame(() =>
      setPriorities(weeklyPriorities),
    );
    return () => window.cancelAnimationFrame(frame);
  }, [weeklyPriorities]);
  const weekTasks = tasks.filter(
    (task) =>
      task.scheduledDate &&
      task.scheduledDate >= dates[0] &&
      task.scheduledDate <= dates[6],
  );
  const totalMinutes = weekTasks.reduce(
    (sum, task) => sum + (task.estimatedMinutes ?? 0),
    0,
  );
  const highPriority = weekTasks.filter(
    (task) => task.priority === "high",
  ).length;
  const overloadedDays = dates.filter(
    (date) =>
      weekTasks
        .filter((task) => task.scheduledDate === date)
        .reduce((sum, task) => sum + (task.estimatedMinutes ?? 0), 0) > 480,
  );

  return (
    <PageShell title="Weekly Plan">
      <div className="mx-auto max-w-7xl space-y-6">
        <PageIntro
          eyebrow={`Week of ${formatDate(`${dates[0]}T12:00:00`)}`}
          title="Backstage planning board"
          description="Connect the semester plot to seven realistic days. Move any card with its day selector."
        />

        <div className="grid gap-4 sm:grid-cols-3">
          <MetricCard
            label="Planned workload"
            value={`${Math.round((totalMinutes / 60) * 10) / 10}h`}
            detail="estimated focused time"
            icon={<CalendarDays className="h-5 w-5" />}
          />
          <MetricCard
            label="High priority"
            value={highPriority}
            detail="protect time for these first"
            icon={<AlertTriangle className="h-5 w-5" />}
          />
          <MetricCard
            label="Overloaded days"
            value={overloadedDays.length}
            detail={
              overloadedDays.length
                ? "redistribute before the week starts"
                : "no day exceeds eight hours"
            }
            icon={<Check className="h-5 w-5" />}
          />
        </div>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-4">
            <div>
              <CardTitle>Top three priorities</CardTitle>
              <CardDescription>
                If these move, the week counts as progress.
              </CardDescription>
            </div>
            <Button
              size="sm"
              onClick={() => updatePriorities(priorities)}
              disabled={priorities.some((priority) => !priority.trim())}
            >
              <Save className="h-4 w-4" />
              Save
            </Button>
          </CardHeader>
          <CardContent className="grid gap-3 md:grid-cols-3">
            {priorities.map((priority, index) => (
              <label key={index} className="flex items-center gap-3">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-accent/10 text-sm font-black text-accent">
                  {index + 1}
                </span>
                <input
                  className={fieldClassName}
                  value={priority}
                  onChange={(event) =>
                    setPriorities((current) =>
                      current.map((item, itemIndex) =>
                        itemIndex === index ? event.target.value : item,
                      ),
                    )
                  }
                  aria-label={`Priority ${index + 1}`}
                />
              </label>
            ))}
          </CardContent>
        </Card>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-7">
          {dates.map((date) => {
            const dayTasks = weekTasks.filter(
              (task) => task.scheduledDate === date,
            );
            const dayMinutes = dayTasks.reduce(
              (sum, task) => sum + (task.estimatedMinutes ?? 0),
              0,
            );
            const isToday = date === offsetDate(0);
            return (
              <Card
                key={date}
                className={
                  isToday
                    ? "border-accent shadow-md shadow-accent/10"
                    : undefined
                }
              >
                <CardHeader className="p-4 pb-0">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="text-xs font-black uppercase tracking-wider text-muted">
                        {new Date(`${date}T12:00:00`).toLocaleDateString(
                          "en-SG",
                          { weekday: "short" },
                        )}
                      </p>
                      <CardTitle className="text-xl">
                        {new Date(`${date}T12:00:00`).getDate()}
                      </CardTitle>
                    </div>
                    {isToday && (
                      <span className="h-2 w-2 rounded-full bg-accent" />
                    )}
                  </div>
                  <CardDescription>
                    {dayMinutes ? `${dayMinutes} min` : "Open"}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-2 p-3">
                  {dayTasks.map((task) => (
                    <div
                      key={task.id}
                      className="rounded-xl border border-border bg-surface p-3"
                    >
                      <CategoryBadge category={task.category} />
                      <p className="mt-2 text-xs font-bold leading-5">
                        {task.title}
                      </p>
                      <select
                        className="mt-2 w-full rounded-lg border border-border bg-surface-muted px-2 py-1 text-[11px] outline-none"
                        value={task.scheduledDate}
                        onChange={(event) =>
                          moveTask(task.id, event.target.value)
                        }
                        aria-label={`Move ${task.title}`}
                      >
                        {dates.map((optionDate) => (
                          <option key={optionDate} value={optionDate}>
                            {new Date(
                              `${optionDate}T12:00:00`,
                            ).toLocaleDateString("en-SG", {
                              weekday: "short",
                            })}
                          </option>
                        ))}
                      </select>
                    </div>
                  ))}
                  {!dayTasks.length && (
                    <p className="py-5 text-center text-xs text-muted">
                      Recovery space
                    </p>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </PageShell>
  );
}
