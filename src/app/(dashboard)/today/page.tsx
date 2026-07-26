"use client";

import { useEffect, useMemo, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import {
  Ban,
  CalendarDays,
  Check,
  Clock3,
  Pause,
  Pencil,
  Play,
  Plus,
  Sparkles,
  X,
} from "lucide-react";
import { CharacterCompanion } from "@/components/character/character-companion";
import { PageShell } from "@/components/layout/page-shell";
import { Button } from "@/components/ui/button";
import { ConfirmDeleteButton } from "@/components/ui/confirm-delete-button";
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
  EmptyState,
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
import { resolveCharacterState } from "@/lib/character/dialogue";
import { getCharacterTask } from "@/lib/character-tasks";
import {
  getHabitCompletionCount,
  getHabitScheduleLabel,
  getHabitTargetCount,
  getScheduledHabits,
} from "@/features/workspace/lib/habits";
import { expandEvents } from "@/features/workspace/lib/events";
import {
  formatDeadline,
  getTaskDeadline,
  getTaskEstimatedMinutes,
  getTaskScheduleDate,
  getDeadlineDateKey,
  getDeadlineLocalTime,
  zonedLocalDateTimeToIso,
} from "@/features/workspace/lib/deadlines";
import { formatDate } from "@/lib/utils";
import type { GoalCategory, Task } from "@/types";

export default function TodayPage() {
  const {
    tasks,
    habits,
    habitLogs,
    addTask,
    updateTask,
    toggleTask,
    removeTask,
    toggleHabit,
    updateTaskActualMinutes,
    moveTask,
    goals,
    milestones,
    preferences,
    events,
    setTaskDailyPriority,
  } = useResolve();
  const today = offsetDate(0);
  const [showAdd, setShowAdd] = useState(false);
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState<GoalCategory>("academics");
  const [priority, setPriority] = useState<Task["priority"]>("medium");
  const [minutes, setMinutes] = useState("45");
  const [deadline, setDeadline] = useState("");
  const [deadlineTime, setDeadlineTime] = useState("");
  const [startTime, setStartTime] = useState("");
  const [goalId, setGoalId] = useState("");
  const [milestoneId, setMilestoneId] = useState("");
  const [requiredForMilestone, setRequiredForMilestone] = useState(false);
  const [focusedTaskId, setFocusedTaskId] = useState<string | null>(null);
  const [focusRunning, setFocusRunning] = useState(false);
  const [focusSeconds, setFocusSeconds] = useState(0);
  const [focusNote, setFocusNote] = useState("");
  const router = useRouter();
  const weekDates = getWeekDateKeys();
  const planningPreferences = preferences ?? {
    timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC",
    dailyCapacityMinutes: 480,
    nextActionEnabled: true,
    showDeadlineWarnings: true,
  };

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      const search = new URLSearchParams(window.location.search);
      setShowAdd(search.get("add") === "true");
      const requestedGoalId = search.get("goal");
      if (requestedGoalId) setGoalId(requestedGoalId);
      const requestedTaskId = search.get("task");
      if (requestedTaskId) {
        setFocusedTaskId(requestedTaskId);
        setFocusRunning(true);
      }
    });
    return () => window.cancelAnimationFrame(frame);
  }, []);

  useEffect(() => {
    if (!focusedTaskId || !focusRunning) return;
    const timer = window.setInterval(
      () => setFocusSeconds((seconds) => seconds + 1),
      1_000,
    );
    return () => window.clearInterval(timer);
  }, [focusRunning, focusedTaskId]);

  const todayTasks = useMemo(
    () => tasks.filter((task) => getTaskScheduleDate(task) === today),
    [tasks, today],
  );
  const todayHabits = useMemo(
    () => getScheduledHabits(habits, today),
    [habits, today],
  );
  const todayEvents = useMemo(
    () => expandEvents(events ?? [], today, today),
    [events, today],
  );
  const dailyPriorities = [1, 2, 3].map((rank) =>
    todayTasks.find((task) => task.dailyPriorityRank === rank),
  );
  const timedItems = [
    ...todayEvents.map((event) => ({
      id: `event:${event.id}`,
      time: event.startTime,
      title: event.title,
      detail: `${event.durationMinutes ?? 0} fixed minutes`,
      category: event.category,
      kind: "Fixed commitment",
    })),
    ...todayTasks
      .filter((task) => task.schedule?.startTime)
      .map((task) => ({
        id: `task:${task.id}`,
        time: task.schedule?.startTime,
        title: task.title,
        detail: `${getTaskEstimatedMinutes(task) ?? 0} planned minutes`,
        category: task.category,
        kind: "Task block",
      })),
  ].sort((a, b) => (a.time ?? "23:59").localeCompare(b.time ?? "23:59"));
  const carryOverTasks = tasks.filter(
    (task) =>
      getTaskScheduleDate(task) &&
      getTaskScheduleDate(task)! < today &&
      !["completed", "cancelled", "skipped"].includes(task.status),
  );
  const backlogTasks = tasks.filter(
    (task) =>
      !getTaskScheduleDate(task) &&
      !["completed", "cancelled", "skipped"].includes(task.status),
  );
  const complete = todayTasks.filter(
    (task) => task.status === "completed",
  ).length;
  const totalMinutes = todayTasks.reduce(
    (sum, task) => sum + (getTaskEstimatedMinutes(task) ?? 0),
    0,
  );
  const habitCount = todayHabits.filter((habit) =>
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
  const state = {
    ...resolveCharacterState({
    tasksCompletedToday: complete,
    tasksTotalToday: todayTasks.length,
    overdueTasks: 0,
    upcomingDeadlines: todayTasks.filter((task) => task.deadline === today)
      .length,
    habitStreak,
    weeklyWorkloadHours: totalMinutes / 60,
    hourOfDay: new Date().getHours(),
    }),
    dialogue: getCharacterTask("nijika", todayTasks).dialogue,
  };

  function submit(event: FormEvent) {
    event.preventDefault();
    if (!title.trim()) return;
    const changes = {
      title: title.trim(),
      category,
      priority,
      scheduledDate: today,
      schedule: {
        date: today,
        startTime: startTime || undefined,
        estimatedMinutes: Number(minutes) || undefined,
        timeZone: planningPreferences.timeZone,
      },
      deadline: deadline || undefined,
      deadlineInfo: deadline
        ? deadlineTime
          ? {
              kind: "dateTime" as const,
              at: zonedLocalDateTimeToIso(
                deadline,
                deadlineTime,
                planningPreferences.timeZone,
              ),
              timeZone: planningPreferences.timeZone,
            }
          : { kind: "date" as const, date: deadline }
        : undefined,
      estimatedMinutes: Number(minutes) || undefined,
      goalId: goalId || undefined,
      milestoneId: milestoneId || undefined,
      requiredForMilestone,
    } as const;
    if (editingTaskId) {
      updateTask(editingTaskId, changes);
    } else {
      addTask(changes);
    }
    resetTaskForm();
    router.replace("/today", { scroll: false });
  }

  function resetTaskForm() {
    setTitle("");
    setCategory("academics");
    setPriority("medium");
    setMinutes("45");
    setDeadline("");
    setDeadlineTime("");
    setStartTime("");
    setGoalId("");
    setMilestoneId("");
    setRequiredForMilestone(false);
    setEditingTaskId(null);
    setShowAdd(false);
  }

  function startEditingTask(task: Task) {
    setEditingTaskId(task.id);
    setTitle(task.title);
    setCategory(task.category as GoalCategory);
    setPriority(task.priority);
    setMinutes(String(getTaskEstimatedMinutes(task) ?? 30));
    const taskDeadline = getTaskDeadline(task);
    setDeadline(taskDeadline ? getDeadlineDateKey(taskDeadline) : "");
    setDeadlineTime(
      taskDeadline ? getDeadlineLocalTime(taskDeadline) : "",
    );
    setStartTime(task.schedule?.startTime ?? "");
    setGoalId(task.goalId ?? "");
    setMilestoneId(task.milestoneId ?? "");
    setRequiredForMilestone(task.requiredForMilestone === true);
    setShowAdd(true);
    window.requestAnimationFrame(() => {
      document
        .getElementById("today-task-editor")
        ?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  }

  function toggleAddForm() {
    if (showAdd) {
      resetTaskForm();
      router.replace("/today", { scroll: false });
      return;
    }
    resetTaskForm();
    setShowAdd(true);
  }

  function startFocus(task: Task) {
    if (task.status !== "in_progress") {
      updateTask(task.id, { ...task, status: "in_progress" });
    }
    setFocusedTaskId(task.id);
    setFocusSeconds(0);
    setFocusNote("");
    setFocusRunning(true);
  }

  function closeFocus() {
    setFocusedTaskId(null);
    setFocusRunning(false);
    setFocusSeconds(0);
    setFocusNote("");
  }

  const focusedTask = tasks.find((task) => task.id === focusedTaskId);
  const focusClock = `${String(Math.floor(focusSeconds / 60)).padStart(2, "0")}:${String(
    focusSeconds % 60,
  ).padStart(2, "0")}`;

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
          <Card id="today-task-editor" className="border-accent/30">
            <CardHeader>
              <CardTitle>
                {editingTaskId
                  ? "Edit this focused action"
                  : "Add one focused action"}
              </CardTitle>
              <CardDescription>
                Small enough to complete, specific enough to start.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form
                onSubmit={submit}
                className="grid gap-3 md:grid-cols-2 xl:grid-cols-3"
              >
                <label className={alignedFieldLabelClassName}>
                  <span className="flex items-end">Task</span>
                  <input
                    className={fieldClassName}
                    value={title}
                    onChange={(event) => setTitle(event.target.value)}
                    autoFocus
                    required
                  />
                </label>
                <label className={alignedFieldLabelClassName}>
                  <span className="flex items-end">Category</span>
                  <select
                    className={fieldClassName}
                    value={category}
                    onChange={(event) =>
                      setCategory(event.target.value as GoalCategory)
                    }
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
                  <span className="flex items-end">Priority</span>
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
                  <span className="flex items-end">
                    Planned time{" "}
                    <span className="ml-1 font-medium text-muted">
                      (minutes)
                    </span>
                  </span>
                  <input
                    className={fieldClassName}
                    value={minutes}
                    onChange={(event) => setMinutes(event.target.value)}
                    type="number"
                    min="5"
                    max="720"
                    step="5"
                    required
                  />
                </label>
                <label className={alignedFieldLabelClassName}>
                  <span className="flex items-end">
                    Deadline{" "}
                    <span className="ml-1 font-medium text-muted">
                      (optional)
                    </span>
                  </span>
                  <input
                    className={fieldClassName}
                    value={deadline}
                    onChange={(event) => setDeadline(event.target.value)}
                    type="date"
                    min={today}
                  />
                </label>
                <label className={alignedFieldLabelClassName}>
                  <span className="flex items-end">
                    Deadline time{" "}
                    <span className="ml-1 font-medium text-muted">(optional)</span>
                  </span>
                  <input
                    className={fieldClassName}
                    value={deadlineTime}
                    onChange={(event) => setDeadlineTime(event.target.value)}
                    type="time"
                    disabled={!deadline}
                  />
                </label>
                <label className={alignedFieldLabelClassName}>
                  <span className="flex items-end">
                    Start time{" "}
                    <span className="ml-1 font-medium text-muted">(optional)</span>
                  </span>
                  <input
                    className={fieldClassName}
                    type="time"
                    value={startTime}
                    onChange={(event) => setStartTime(event.target.value)}
                  />
                </label>
                <label className={alignedFieldLabelClassName}>
                  <span className="flex items-end">Goal</span>
                  <select
                    className={fieldClassName}
                    value={goalId}
                    onChange={(event) => {
                      setGoalId(event.target.value);
                      setMilestoneId("");
                    }}
                  >
                    <option value="">No linked goal</option>
                    {goals.map((goal) => (
                      <option key={goal.id} value={goal.id}>
                        {goal.title}
                      </option>
                    ))}
                  </select>
                </label>
                <label className={alignedFieldLabelClassName}>
                  <span className="flex items-end">Goal breakdown</span>
                  <select
                    className={fieldClassName}
                    value={milestoneId}
                    disabled={!goalId}
                    onChange={(event) => setMilestoneId(event.target.value)}
                  >
                    <option value="">No breakdown link</option>
                    {milestones
                      .filter((milestone) => milestone.goalId === goalId)
                      .map((milestone) => (
                        <option key={milestone.id} value={milestone.id}>
                          {milestone.title}
                        </option>
                      ))}
                  </select>
                </label>
                {milestoneId && (
                  <label className="flex min-h-11 items-center gap-2 self-end rounded-xl border border-border px-3 text-xs font-bold">
                    <input
                      type="checkbox"
                      checked={requiredForMilestone}
                      onChange={(event) =>
                        setRequiredForMilestone(event.target.checked)
                      }
                    />
                    Required for automatic completion
                  </label>
                )}
                <Button type="submit" className="self-end">
                  {editingTaskId ? "Save task changes" : "Add to today"}
                </Button>
              </form>
            </CardContent>
          </Card>
        )}

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
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
              totalMinutes > planningPreferences.dailyCapacityMinutes
                ? `Over your ${planningPreferences.dailyCapacityMinutes}-minute capacity`
                : "Workload looks realistic"
            }
            icon={<Clock3 className="h-5 w-5" />}
          />
          <MetricCard
            label="Habits"
            value={`${habitCount}/${todayHabits.length}`}
            detail="checked in today"
            icon={<Sparkles className="h-5 w-5" />}
          />
          <MetricCard
            label="Fixed commitments"
            value={todayEvents.length}
            detail={`${todayEvents.reduce((sum, event) => sum + (event.durationMinutes ?? 0), 0)} minutes reserved`}
            icon={<CalendarDays className="h-5 w-5" />}
          />
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <Card className="border-accent/30">
            <CardHeader>
              <CardTitle>Today&apos;s top three</CardTitle>
              <CardDescription>
                Choose up to three outcomes. Everything else stays available
                without competing for equal attention.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-3 sm:grid-cols-3">
              {dailyPriorities.map((selected, index) => {
                const rank = (index + 1) as 1 | 2 | 3;
                return (
                  <label
                    key={rank}
                    className="rounded-2xl border border-border bg-surface p-3 text-xs font-black"
                  >
                    <span className="mb-2 flex items-center gap-2 text-accent">
                      <span className="flex h-7 w-7 items-center justify-center rounded-xl bg-accent/10">
                        {rank}
                      </span>
                      Priority {rank}
                    </span>
                    <select
                      className={fieldClassName}
                      aria-label={`Daily priority ${rank}`}
                      value={selected?.id ?? ""}
                      onChange={(event) => {
                        if (selected && !event.target.value) {
                          setTaskDailyPriority(selected.id, undefined);
                        } else if (event.target.value) {
                          setTaskDailyPriority(event.target.value, rank);
                        }
                      }}
                    >
                      <option value="">Leave open</option>
                      {todayTasks
                        .filter((task) => task.status !== "cancelled")
                        .map((task) => (
                          <option key={task.id} value={task.id}>
                            {task.title}
                          </option>
                        ))}
                    </select>
                  </label>
                );
              })}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Fixed commitments and timed blocks</CardTitle>
              <CardDescription>
                Exact-time work shares one timeline; flexible tasks stay in the
                focus queue below.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              {timedItems.map((item) => (
                <div
                  key={item.id}
                  className="grid grid-cols-[3.5rem_minmax(0,1fr)_auto] items-center gap-3 rounded-xl border border-border bg-surface p-3"
                >
                  <span className="text-sm font-black text-accent">
                    {item.time ?? "Any"}
                  </span>
                  <div className="min-w-0">
                    <p className="break-words text-sm font-bold">
                      {item.title}
                    </p>
                    <p className="text-[10px] text-muted">
                      {item.kind} · {item.detail}
                    </p>
                  </div>
                  <CategoryBadge category={item.category} />
                </div>
              ))}
              {!timedItems.length && (
                <p className="rounded-xl border border-dashed border-border p-4 text-sm text-muted">
                  No exact-time blocks today. Flexible tasks can be started
                  whenever your available time opens.
                </p>
              )}
            </CardContent>
          </Card>
        </div>

        {(carryOverTasks.length > 0 || backlogTasks.length > 0) && (
          <Card className="border-warning/30">
            <CardHeader>
              <CardTitle>Decide what enters today</CardTitle>
              <CardDescription>
                Carry-over and backlog work stay visible without silently
                crowding the focus queue.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4 lg:grid-cols-2">
              {[
                {
                  title: "Needs a carry-over decision",
                  tasks: carryOverTasks,
                  empty: "Nothing has been left behind.",
                },
                {
                  title: "Backlog",
                  tasks: backlogTasks,
                  empty: "No unscheduled work.",
                },
              ].map((group) => (
                <section
                  key={group.title}
                  className="rounded-2xl border border-border bg-surface p-3"
                >
                  <p className="text-xs font-black uppercase tracking-wider text-warning">
                    {group.title}
                  </p>
                  <div className="mt-3 space-y-2">
                    {group.tasks.slice(0, 6).map((task) => (
                      <div
                        key={task.id}
                        className="rounded-xl border border-border bg-surface-muted/40 p-3"
                      >
                        <p className="break-words text-sm font-bold leading-5">
                          {task.title}
                        </p>
                        <p className="mt-1 text-[11px] text-muted">
                          {task.origin?.kind === "assessment-preparation"
                            ? "Assessment preparation"
                            : getTaskScheduleDate(task)
                              ? `Previously planned ${formatDate(`${getTaskScheduleDate(task)}T12:00:00`)}`
                              : "Not placed on a day yet"}
                        </p>
                        <div className="mt-2 flex flex-wrap gap-2">
                          <Button
                            size="sm"
                            onClick={() => moveTask(task.id, today)}
                          >
                            Plan today
                          </Button>
                          <Button
                            size="sm"
                            variant="secondary"
                            onClick={() => moveTask(task.id, offsetDate(1))}
                          >
                            Plan tomorrow
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => startEditingTask(task)}
                          >
                            Edit
                          </Button>
                        </div>
                      </div>
                    ))}
                    {!group.tasks.length && (
                      <p className="py-3 text-xs text-muted">{group.empty}</p>
                    )}
                  </div>
                </section>
              ))}
            </CardContent>
          </Card>
        )}

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
                    className="rounded-2xl border border-border bg-surface p-4"
                  >
                    <div className="grid grid-cols-[2rem_minmax(0,1fr)] items-start gap-x-3 gap-y-2 sm:grid-cols-[2rem_minmax(0,1fr)_auto] sm:items-center">
                      <button
                        type="button"
                        onClick={() => toggleTask(task.id)}
                        className={`flex h-8 w-8 items-center justify-center rounded-xl border-2 ${
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
                          className={`break-words font-bold leading-6 [overflow-wrap:anywhere] ${done ? "text-muted line-through" : ""}`}
                        >
                          {task.title}
                        </p>
                        <p className="mt-1 break-words text-xs leading-5 text-muted">
                          {task.schedule?.startTime
                            ? `${task.schedule.startTime} · `
                            : ""}
                          {getTaskEstimatedMinutes(task) !== undefined
                            ? `${getTaskEstimatedMinutes(task)} planned minutes`
                            : "No duration estimate"}
                          {getTaskDeadline(task)
                            ? ` · due ${formatDeadline(getTaskDeadline(task)!)}`
                            : ""}
                        </p>
                      </div>
                      <div className="col-start-2 row-start-2 flex min-w-0 flex-wrap items-center gap-2 sm:col-start-3 sm:row-start-1 sm:justify-end">
                        <CategoryBadge category={task.category} />
                        {!done && (
                          <Button
                            type="button"
                            size="sm"
                            variant="secondary"
                            onClick={() => startFocus(task)}
                          >
                            <Play className="h-3.5 w-3.5" />
                            Focus
                          </Button>
                        )}
                        <Button
                          type="button"
                          size="sm"
                          variant="ghost"
                          onClick={() => startEditingTask(task)}
                          aria-label={`Edit task ${task.title}`}
                        >
                          <Pencil className="h-3.5 w-3.5" />
                          Edit
                        </Button>
                        <ConfirmDeleteButton
                          itemLabel={`task ${task.title}`}
                          onConfirm={() => removeTask(task.id)}
                        />
                      </div>
                    </div>
                    {done && (
                      <label className="mt-3 flex items-center justify-between gap-3 border-t border-border pt-3 text-xs font-bold text-muted sm:ml-12 sm:justify-start">
                        Time actually spent
                        <input
                          key={`${task.id}-${task.actualMinutes ?? "new"}`}
                          className="h-8 w-24 rounded-lg border border-border bg-surface-muted px-2 text-foreground outline-none focus:border-accent"
                          type="number"
                          min="0"
                          max="720"
                          step="5"
                          defaultValue={
                            task.actualMinutes ??
                            getTaskEstimatedMinutes(task) ??
                            0
                          }
                          onBlur={(event) =>
                            updateTaskActualMinutes(
                              task.id,
                              Number(event.target.value),
                            )
                          }
                          aria-label={`Actual minutes for ${task.title}`}
                        />
                        <span>min</span>
                      </label>
                    )}
                  </div>
                );
              })}
              {!todayTasks.length && (
                <EmptyState
                  title="Today’s setlist is clear"
                  description="Add one focused action instead of filling the day with an unrealistic queue."
                  action={<Button onClick={() => setShowAdd(true)}>Add today’s first task</Button>}
                />
              )}
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
                {todayHabits.map((habit) => {
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
                      className="flex min-h-11 w-full items-center gap-3 rounded-xl p-2 text-left hover:bg-surface-muted"
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
                        <span className="block">{habit.title}</span>
                        <span className="mt-0.5 block text-[10px] font-semibold text-muted">
                          {getHabitScheduleLabel(habit)}
                          {habit.scheduleType === "times_per_week"
                            ? ` · ${getHabitCompletionCount(
                                habit,
                                habitLogs,
                                weekDates,
                              )}/${getHabitTargetCount(habit, weekDates)} this week`
                            : ""}
                        </span>
                      </span>
                      <CategoryBadge category={habit.category} />
                    </button>
                  );
                })}
                {!todayHabits.length && (
                  <EmptyState
                    title="No habits scheduled today"
                    description="Create or review your schedule on Nijika’s Habits page."
                  />
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
      {focusedTask && (
        <div
          className="fixed inset-0 z-[85] flex items-center justify-center bg-black/75 p-4 backdrop-blur-md"
          role="dialog"
          aria-modal="true"
          aria-labelledby="focus-task-title"
        >
          <div className="manga-panel w-full max-w-xl rounded-[30px] p-6 sm:p-8">
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-accent">
                  Focus mode
                </p>
                <h2
                  id="focus-task-title"
                  className="mt-2 break-words font-display text-3xl"
                >
                  {focusedTask.title}
                </h2>
                <p className="mt-2 text-sm text-muted">
                  {getTaskEstimatedMinutes(focusedTask)
                    ? `${getTaskEstimatedMinutes(focusedTask)} minutes planned`
                    : "No estimate set"}
                  {focusedTask.origin?.kind === "assessment-preparation"
                    ? " · assessment preparation"
                    : focusedTask.goalId
                      ? " · linked to a goal"
                      : ""}
                </p>
              </div>
              <Button
                size="icon"
                variant="ghost"
                className="text-[color:var(--ink)] hover:bg-black/5"
                onClick={closeFocus}
                aria-label="Exit focus mode"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
            <p
              className="my-8 text-center font-display text-6xl tracking-widest text-accent"
              aria-label={`${Math.floor(focusSeconds / 60)} minutes and ${focusSeconds % 60} seconds elapsed`}
            >
              {focusClock}
            </p>
            <label className="block text-xs font-black uppercase tracking-wider text-muted">
              Quick note (optional)
              <input
                className={`${fieldClassName} mt-2`}
                value={focusNote}
                onChange={(event) => setFocusNote(event.target.value)}
              />
            </label>
            <div className="mt-5 flex flex-wrap gap-2">
              <Button
                variant="secondary"
                onClick={() => setFocusRunning((running) => !running)}
              >
                {focusRunning ? (
                  <Pause className="h-4 w-4" />
                ) : (
                  <Play className="h-4 w-4" />
                )}
                {focusRunning ? "Pause" : "Resume"}
              </Button>
              <Button
                onClick={() => {
                  updateTask(focusedTask.id, {
                    ...focusedTask,
                    description: focusNote.trim()
                      ? [focusedTask.description, focusNote.trim()]
                          .filter(Boolean)
                          .join("\n")
                      : focusedTask.description,
                  });
                  if (focusedTask.status !== "completed") {
                    toggleTask(focusedTask.id);
                  }
                  closeFocus();
                }}
              >
                <Check className="h-4 w-4" />
                Complete
              </Button>
              <Button
                variant="secondary"
                onClick={() => {
                  updateTask(focusedTask.id, {
                    ...focusedTask,
                    scheduledDate: undefined,
                    schedule: undefined,
                    status: "planned",
                  });
                  closeFocus();
                }}
              >
                Return to backlog
              </Button>
              <Button
                variant="destructive"
                onClick={() => {
                  updateTask(focusedTask.id, {
                    ...focusedTask,
                    status: "cancelled",
                  });
                  closeFocus();
                }}
              >
                <Ban className="h-4 w-4" />
                Cancel task
              </Button>
            </div>
          </div>
        </div>
      )}
    </PageShell>
  );
}
