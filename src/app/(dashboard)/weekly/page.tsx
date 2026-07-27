"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type FormEvent,
} from "react";
import {
  AlertTriangle,
  CalendarDays,
  Check,
  ChevronLeft,
  ChevronRight,
  ListTodo,
  Save,
  X,
} from "lucide-react";
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
  MetricCard,
  PageIntro,
  alignedFieldLabelClassName,
  fieldClassName,
} from "@/components/ui/resolve";
import {
  getWeekDateKeys,
  offsetDate,
  useResolve,
} from "@/contexts/resolve-context";
import { formatDate } from "@/lib/utils";
import type { Task } from "@/types";
import { WeeklyEventEditor } from "@/components/weekly/weekly-event-editor";
import { WeeklyScheduleBoard } from "@/components/weekly/weekly-schedule-board";
import { expandEvents } from "@/features/workspace/lib/events";
import { getDailyCapacitySummary } from "@/features/workspace/lib/analytics";
import { getScheduleConflicts } from "@/features/workspace/lib/scheduling";
import { isDateKey, parseLocalDate } from "@/lib/date";
import {
  getTaskEstimatedMinutes,
  getTaskDeadline,
  getDeadlineDateKey,
  getDeadlineLocalTime,
  getTaskScheduleDate,
  zonedLocalDateTimeToIso,
} from "@/features/workspace/lib/deadlines";

export default function WeeklyPage() {
  const {
    tasks,
    weeklyPriorities,
    weeklyPrioritiesByWeek,
    updatePriorities,
    updateTask,
    moveTask,
    removeTask,
    events,
    preferences,
    modules,
  } = useResolve();
  const router = useRouter();
  const currentWeekStart = getWeekDateKeys()[0];
  const [weekStart, setWeekStart] = useState(currentWeekStart);
  const selectedWeekPriorities = useMemo(
    () =>
      (weeklyPrioritiesByWeek ?? {})[weekStart] ??
      (weekStart === currentWeekStart
        ? weeklyPriorities
        : ["", "", ""]),
    [
      currentWeekStart,
      weekStart,
      weeklyPriorities,
      weeklyPrioritiesByWeek,
    ],
  );
  const dates = useMemo(
    () => getWeekDateKeys(parseLocalDate(weekStart)),
    [weekStart],
  );
  const [priorities, setPriorities] = useState(selectedWeekPriorities);
  const prioritiesDirtyRef = useRef(false);
  const prioritiesWeekRef = useRef(weekStart);
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("academics");
  const [priority, setPriority] = useState<Task["priority"]>("medium");
  const [minutes, setMinutes] = useState("30");
  const [scheduledDate, setScheduledDate] = useState(dates[0]);
  const [deadline, setDeadline] = useState("");
  const [deadlineTime, setDeadlineTime] = useState("");
  const planningPreferences = preferences ?? {
    timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC",
    dailyCapacityMinutes: 480,
    nextActionEnabled: true,
    showDeadlineWarnings: true,
  };
  const dailyCapacityMinutes = planningPreferences.dailyCapacityMinutes;
  const workspaceEvents = useMemo(() => events ?? [], [events]);

  useEffect(() => {
    const setFromUrl = () => {
      const requested = new URLSearchParams(window.location.search).get("week");
      if (isDateKey(requested)) {
        setWeekStart(getWeekDateKeys(parseLocalDate(requested))[0]);
      } else {
        setWeekStart(getWeekDateKeys()[0]);
      }
    };
    setFromUrl();
    window.addEventListener("popstate", setFromUrl);
    const timer = window.setInterval(() => {
      if (!new URLSearchParams(window.location.search).has("week")) {
        setWeekStart(getWeekDateKeys()[0]);
      }
    }, 60_000);
    return () => {
      window.removeEventListener("popstate", setFromUrl);
      window.clearInterval(timer);
    };
  }, []);

  function showWeek(date: string, preserveInUrl = true) {
    const normalized = getWeekDateKeys(parseLocalDate(date))[0];
    setWeekStart(normalized);
    router.replace(
      preserveInUrl ? `/weekly?week=${normalized}` : "/weekly",
      { scroll: false },
    );
  }

  function moveWeek(weeks: number) {
    const date = parseLocalDate(weekStart);
    date.setDate(date.getDate() + weeks * 7);
    showWeek(getWeekDateKeys(date)[0]);
  }

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      const weekChanged = prioritiesWeekRef.current !== weekStart;
      if (weekChanged) {
        prioritiesWeekRef.current = weekStart;
        prioritiesDirtyRef.current = false;
      }
      if (weekChanged || !prioritiesDirtyRef.current) {
        setPriorities(selectedWeekPriorities);
      }
    });
    return () => window.cancelAnimationFrame(frame);
  }, [selectedWeekPriorities, weekStart]);

  useEffect(() => {
    let frame = 0;
    const openLinkedEvent = (href = window.location.href) => {
      const eventId = new URL(href, window.location.origin).searchParams.get(
        "event",
      );
      if (!eventId) return;
      frame = window.requestAnimationFrame(() => {
        const target = Array.from(
          document.querySelectorAll<HTMLElement>("[data-workspace-event]"),
        ).find((element) => element.dataset.workspaceEvent === eventId);
        target?.scrollIntoView({ behavior: "smooth", block: "center" });
      });
    };
    const handleRecord = (event: Event) => {
      const href = (event as CustomEvent<{ href?: string }>).detail?.href;
      if (href?.startsWith("/weekly")) openLinkedEvent(href);
    };
    openLinkedEvent();
    window.addEventListener("resolve:open-record", handleRecord);
    return () => {
      window.cancelAnimationFrame(frame);
      window.removeEventListener("resolve:open-record", handleRecord);
    };
  }, [workspaceEvents.length]);
  const {
    totalMinutes,
    fixedMinutes,
    highPriority,
    unscheduledTasks,
    assessmentWarnings,
    overloadedDays,
    tasksByDate,
    eventsByDate,
    scheduleConflicts,
  } = useMemo(() => {
    const tasksThisWeek = tasks.filter((task) => {
      const date = getTaskScheduleDate(task);
      return date !== undefined && date >= dates[0] && date <= dates[6];
    });
    const occurrences = expandEvents(workspaceEvents, dates[0], dates[6]);
    const taskIndex = new Map<string, Task[]>();
    const eventIndex = new Map<string, (typeof occurrences)[number][]>();
    for (const task of tasksThisWeek) {
      const date = getTaskScheduleDate(task);
      if (!date) continue;
      taskIndex.set(date, [...(taskIndex.get(date) ?? []), task]);
    }
    for (const event of occurrences) {
      eventIndex.set(event.date, [
        ...(eventIndex.get(event.date) ?? []),
        event,
      ]);
    }
    const activePreparationAssessmentIds = new Set(
      tasks.flatMap((task) =>
        task.origin?.kind === "assessment-preparation" &&
        !["cancelled", "skipped"].includes(task.status)
          ? [task.origin.assessmentId]
          : [],
      ),
    );
    const backlog = tasks
      .filter(
        (task) =>
          !getTaskScheduleDate(task) &&
          !["completed", "cancelled", "skipped"].includes(task.status),
      )
      .sort((a, b) => {
        const aDeadline = getTaskDeadline(a);
        const bDeadline = getTaskDeadline(b);
        return (
          (b.deferral?.deferCount ?? 0) - (a.deferral?.deferCount ?? 0) ||
          (a.priority === "high" ? -1 : b.priority === "high" ? 1 : 0) ||
          (aDeadline
            ? getDeadlineDateKey(aDeadline)
            : "9999-12-31"
          ).localeCompare(
            bDeadline ? getDeadlineDateKey(bDeadline) : "9999-12-31",
          )
        );
      });
    const warnings = modules
      .flatMap((moduleRecord) =>
        moduleRecord.assessments.map((assessment) => ({
          assessment,
          moduleRecord,
        })),
      )
      .filter(
        ({ assessment }) =>
          assessment.deadline >= dates[0] &&
          assessment.deadline <= dates[6] &&
          !["submitted", "graded"].includes(assessment.status) &&
          !activePreparationAssessmentIds.has(assessment.id),
      );

    const capacityByDate = new Map(
      dates.map((date) => [
        date,
        getDailyCapacitySummary({
          date,
          capacityMinutes: dailyCapacityMinutes,
          tasks,
          events: workspaceEvents,
        }),
      ]),
    );
    return {
      weekTasks: tasksThisWeek,
      eventOccurrences: occurrences,
      totalMinutes: dates.reduce(
        (sum, date) =>
          sum + (capacityByDate.get(date)?.scheduledTaskMinutes ?? 0),
        0,
      ),
      fixedMinutes: occurrences.reduce(
        (sum, event) => sum + (event.durationMinutes ?? 0),
        0,
      ),
      highPriority: tasksThisWeek.filter((task) => task.priority === "high")
        .length,
      unscheduledTasks: backlog,
      assessmentWarnings: warnings,
      overloadedDays: dates.filter(
        (date) => capacityByDate.get(date)?.isOverloaded,
      ),
      tasksByDate: taskIndex,
      eventsByDate: eventIndex,
      scheduleConflicts: getScheduleConflicts(tasksThisWeek, occurrences),
    };
  }, [
    dates,
    modules,
    dailyCapacityMinutes,
    tasks,
    workspaceEvents,
  ]);

  function resetTaskEditor() {
    setEditingTaskId(null);
    setTitle("");
    setCategory("academics");
    setPriority("medium");
    setMinutes("30");
    setScheduledDate(dates[0]);
    setDeadline("");
    setDeadlineTime("");
  }

  function startEditingTask(task: Task) {
    setEditingTaskId(task.id);
    setTitle(task.title);
    setCategory(task.category);
    setPriority(task.priority);
    setMinutes(String(getTaskEstimatedMinutes(task) ?? 30));
    setScheduledDate(getTaskScheduleDate(task) ?? dates[0]);
    const taskDeadline = getTaskDeadline(task);
    setDeadline(taskDeadline ? getDeadlineDateKey(taskDeadline) : "");
    setDeadlineTime(taskDeadline ? getDeadlineLocalTime(taskDeadline) : "");
    window.requestAnimationFrame(() => {
      document
        .getElementById("weekly-task-editor")
        ?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  }

  function submitTaskChanges(event: FormEvent) {
    event.preventDefault();
    if (!editingTaskId || !title.trim()) return;
    updateTask(editingTaskId, {
      title: title.trim(),
      category,
      priority,
      estimatedMinutes: Number(minutes) || 0,
      scheduledDate,
      schedule: {
        date: scheduledDate,
        estimatedMinutes: Number(minutes) || undefined,
        timeZone: planningPreferences.timeZone,
      },
      deadline: deadline || undefined,
      deadlineInfo: deadline
        ? deadlineTime
          ? {
              kind: "dateTime",
              at: zonedLocalDateTimeToIso(
                deadline,
                deadlineTime,
                planningPreferences.timeZone,
              ),
              timeZone: planningPreferences.timeZone,
            }
          : { kind: "date", date: deadline }
        : undefined,
    });
    resetTaskEditor();
  }

  return (
    <PageShell title="Weekly Plan">
      <div className="mx-auto max-w-7xl space-y-6">
        <PageIntro
          eyebrow={`${formatDate(`${dates[0]}T12:00:00`)} – ${formatDate(`${dates[6]}T12:00:00`)}`}
          title="Backstage planning board"
          description="Connect the semester plot to seven realistic days. Move any card with its day selector."
          action={
            <div className="flex max-w-full flex-wrap items-center gap-2">
              <Button
                type="button"
                size="sm"
                variant="secondary"
                onClick={() => moveWeek(-1)}
                aria-label="Previous week"
              >
                <ChevronLeft className="h-4 w-4" />
                Previous
              </Button>
              <Button
                type="button"
                size="sm"
                variant={weekStart === currentWeekStart ? "default" : "ghost"}
                onClick={() => showWeek(currentWeekStart, false)}
              >
                Current week
              </Button>
              <Button
                type="button"
                size="sm"
                variant="secondary"
                onClick={() => moveWeek(1)}
                aria-label="Next week"
              >
                Next
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          }
        />

        <div className="grid gap-4 sm:grid-cols-3">
          <MetricCard
            label="Planned workload"
            value={`${Math.round(((totalMinutes + fixedMinutes) / 60) * 10) / 10}h`}
            detail={`${Math.round(totalMinutes / 60)}h tasks · ${Math.round(fixedMinutes / 60)}h fixed`}
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
                : `no day exceeds ${Math.round(planningPreferences.dailyCapacityMinutes / 60)} hours`
            }
            icon={<Check className="h-5 w-5" />}
          />
        </div>

        {scheduleConflicts.length > 0 && (
          <Card className="border-warning/40">
            <CardHeader>
              <CardTitle>Schedule conflicts</CardTitle>
              <CardDescription>
                Resolve found exact-time overlaps or deadline problems. You can
                keep them, but review them before relying on this plan.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-2 md:grid-cols-2">
              {scheduleConflicts.map((conflict) => (
                <div
                  key={conflict.id}
                  className="rounded-xl border border-warning/30 bg-warning/5 p-3"
                >
                  <p className="text-[10px] font-black uppercase tracking-wider text-warning">
                    {conflict.kind.replaceAll("_", " ")} · {conflict.date}
                  </p>
                  <p className="mt-1 text-sm font-semibold">
                    {conflict.message}
                  </p>
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
            <div>
              <CardTitle>Top three priorities</CardTitle>
              <CardDescription>
                If these move, the week counts as progress.
              </CardDescription>
            </div>
            <Button
              size="sm"
              onClick={() => {
                updatePriorities(priorities, weekStart);
                prioritiesDirtyRef.current = false;
              }}
              disabled={!priorities.some((priority) => priority.trim())}
            >
              <Save className="h-4 w-4" />
              Save
            </Button>
          </CardHeader>
          <CardContent className="grid gap-3 md:grid-cols-3">
            {priorities.map((priority, index) => (
              <label key={index} className="block text-sm font-bold">
                <span className="mb-2 flex items-center gap-2">
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-xl bg-accent/10 text-xs font-black text-accent">
                    {index + 1}
                  </span>
                  Priority {index + 1}
                </span>
                <input
                  className={fieldClassName}
                  value={priority}
                  onChange={(event) => {
                    prioritiesDirtyRef.current = true;
                    setPriorities((current) =>
                      current.map((item, itemIndex) =>
                        itemIndex === index ? event.target.value : item,
                      ),
                    );
                  }}
                  aria-label={`Priority ${index + 1}`}
                />
              </label>
            ))}
          </CardContent>
        </Card>

        <WeeklyEventEditor weekStart={dates[0]} />

        {(unscheduledTasks.length > 0 || assessmentWarnings.length > 0) && (
          <div className="grid gap-4 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <ListTodo className="h-5 w-5 text-accent" />
                  <CardTitle>Unscheduled work</CardTitle>
                </div>
                <CardDescription>
                  Important backlog work stays here until you deliberately
                  assign it to a day.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                {unscheduledTasks.slice(0, 8).map((task) => (
                  <div
                    key={task.id}
                    className="flex flex-col gap-3 rounded-xl border border-border bg-surface p-3 sm:flex-row sm:items-center"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="break-words text-sm font-bold">
                        {task.title}
                      </p>
                      <p className="mt-1 text-[11px] text-muted">
                        {task.priority} priority
                        {getTaskEstimatedMinutes(task)
                          ? ` · ${getTaskEstimatedMinutes(task)} min`
                          : " · estimate recommended"}
                        {(task.deferral?.deferCount ?? 0) > 0
                          ? ` · deferred ${task.deferral!.deferCount}×`
                          : ""}
                      </p>
                    </div>
                    <label className="shrink-0 text-[10px] font-black uppercase tracking-wider text-muted">
                      Plan on
                      <select
                        className="mt-1 block h-9 rounded-lg border border-border bg-surface-muted px-2 text-xs font-medium normal-case tracking-normal text-foreground"
                        defaultValue=""
                        onChange={(event) => {
                          if (event.target.value) {
                            moveTask(task.id, event.target.value);
                          }
                        }}
                      >
                        <option value="" disabled>
                          Choose day
                        </option>
                        {dates.map((date) => (
                          <option key={date} value={date}>
                            {new Date(`${date}T12:00:00`).toLocaleDateString(
                              "en-SG",
                              { weekday: "short" },
                            )}
                          </option>
                        ))}
                      </select>
                    </label>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card className="border-warning/30">
              <CardHeader>
                <CardTitle>Preparation checks</CardTitle>
                <CardDescription>
                  Assessments due this week that have no active preparation
                  task.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                {assessmentWarnings.map(({ assessment, moduleRecord }) => (
                  <div
                    key={assessment.id}
                    className="rounded-xl border border-warning/30 bg-warning/5 p-3"
                  >
                    <p className="text-sm font-bold">
                      {moduleRecord.code} · {assessment.title}
                    </p>
                    <p className="mt-1 text-xs text-muted">
                      Due{" "}
                      {formatDate(`${assessment.deadline}T12:00:00`)} ·{" "}
                      {assessment.weight}% of module
                    </p>
                    <Link
                      href={`/academics?assessment=${encodeURIComponent(assessment.id)}`}
                      className="mt-2 inline-flex text-xs font-black text-warning underline underline-offset-4"
                    >
                      Preview preparation tasks
                    </Link>
                  </div>
                ))}
                {!assessmentWarnings.length && (
                  <p className="py-4 text-sm text-muted">
                    Every assessment due this week already has preparation
                    work, or there is no assessment due.
                  </p>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {editingTaskId && (
          <Card id="weekly-task-editor" className="border-accent/30">
            <CardHeader className="flex flex-col items-start justify-between gap-4 sm:flex-row">
              <div>
                <CardTitle>Edit scheduled task</CardTitle>
                <CardDescription>
                  Update the action without moving it back to Today first.
                </CardDescription>
              </div>
              <Button
                type="button"
                size="sm"
                variant="ghost"
                onClick={resetTaskEditor}
              >
                <X className="h-4 w-4" />
                Close
              </Button>
            </CardHeader>
            <CardContent>
              <form
                onSubmit={submitTaskChanges}
                className="grid gap-3 md:grid-cols-2 xl:grid-cols-3"
              >
                <label className={alignedFieldLabelClassName}>
                  <span>Task</span>
                  <input
                    className={fieldClassName}
                    value={title}
                    onChange={(event) => setTitle(event.target.value)}
                    required
                  />
                </label>
                <label className={alignedFieldLabelClassName}>
                  <span>Category</span>
                  <select
                    className={fieldClassName}
                    value={category}
                    onChange={(event) => setCategory(event.target.value)}
                  >
                    <option value="academics">Academics</option>
                    <option value="career">Career</option>
                    <option value="technical">Technical skills</option>
                    <option value="guitar">Guitar</option>
                    <option value="health">Health</option>
                    <option value="personal">Personal</option>
                    <option value="finance">Finance</option>
                    <option value="social">Social</option>
                    <option value="custom">Other</option>
                  </select>
                </label>
                <label className={alignedFieldLabelClassName}>
                  <span>Priority</span>
                  <select
                    className={fieldClassName}
                    value={priority}
                    onChange={(event) =>
                      setPriority(event.target.value as Task["priority"])
                    }
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </label>
                <label className={alignedFieldLabelClassName}>
                  <span>
                    Planned time{" "}
                    <span className="font-medium text-muted">(minutes)</span>
                  </span>
                  <input
                    className={fieldClassName}
                    type="number"
                    min="5"
                    max="720"
                    step="5"
                    value={minutes}
                    onChange={(event) => setMinutes(event.target.value)}
                    required
                  />
                </label>
                <label className={alignedFieldLabelClassName}>
                  <span>Scheduled day</span>
                  <select
                    className={fieldClassName}
                    value={scheduledDate}
                    onChange={(event) => setScheduledDate(event.target.value)}
                  >
                    {dates.map((date) => (
                      <option key={date} value={date}>
                        {formatDate(`${date}T12:00:00`)}
                      </option>
                    ))}
                  </select>
                </label>
                <label className={alignedFieldLabelClassName}>
                  <span>
                    Deadline{" "}
                    <span className="font-medium text-muted">(optional)</span>
                  </span>
                  <input
                    className={fieldClassName}
                    type="date"
                    value={deadline}
                    onChange={(event) => setDeadline(event.target.value)}
                  />
                </label>
                <label className={alignedFieldLabelClassName}>
                  <span>
                    Deadline time{" "}
                    <span className="font-medium text-muted">(optional)</span>
                  </span>
                  <input
                    className={fieldClassName}
                    type="time"
                    value={deadlineTime}
                    disabled={!deadline}
                    onChange={(event) => setDeadlineTime(event.target.value)}
                  />
                </label>
                <div className="flex flex-wrap gap-2 md:col-span-2 xl:col-span-3">
                  <Button type="submit">
                    <Save className="h-4 w-4" />
                    Save task changes
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={resetTaskEditor}
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        <WeeklyScheduleBoard
          dates={dates}
          tasksByDate={tasksByDate}
          eventsByDate={eventsByDate}
          today={offsetDate(0)}
          onEditTask={startEditingTask}
          onMoveTask={moveTask}
          onRemoveTask={removeTask}
        />
      </div>
    </PageShell>
  );
}
