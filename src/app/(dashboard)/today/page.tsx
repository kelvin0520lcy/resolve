"use client";

import { useEffect, useMemo, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Check, Clock3, Pencil, Plus, Sparkles, X } from "lucide-react";
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
  } = useResolve();
  const today = offsetDate(0);
  const [showAdd, setShowAdd] = useState(false);
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState<GoalCategory>("academics");
  const [priority, setPriority] = useState<Task["priority"]>("medium");
  const [minutes, setMinutes] = useState("45");
  const [deadline, setDeadline] = useState("");
  const router = useRouter();
  const weekDates = getWeekDateKeys();

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      setShowAdd(
        new URLSearchParams(window.location.search).get("add") === "true",
      );
    });
    return () => window.cancelAnimationFrame(frame);
  }, []);

  const todayTasks = useMemo(
    () => tasks.filter((task) => task.scheduledDate === today),
    [tasks, today],
  );
  const todayHabits = useMemo(
    () => getScheduledHabits(habits, today),
    [habits, today],
  );
  const complete = todayTasks.filter(
    (task) => task.status === "completed",
  ).length;
  const totalMinutes = todayTasks.reduce(
    (sum, task) => sum + (task.estimatedMinutes ?? 0),
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
      deadline: deadline || undefined,
      estimatedMinutes: Number(minutes) || 0,
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
    setEditingTaskId(null);
    setShowAdd(false);
  }

  function startEditingTask(task: Task) {
    setEditingTaskId(task.id);
    setTitle(task.title);
    setCategory(task.category as GoalCategory);
    setPriority(task.priority);
    setMinutes(String(task.estimatedMinutes ?? 30));
    setDeadline(task.deadline ?? "");
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
                className="grid gap-3 md:grid-cols-2 xl:grid-cols-[minmax(220px,1fr)_150px_125px_150px_170px_auto]"
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
                <Button type="submit" className="self-end">
                  {editingTaskId ? "Save task changes" : "Add to today"}
                </Button>
              </form>
            </CardContent>
          </Card>
        )}

        <div className="grid gap-4 sm:grid-cols-3">
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
              totalMinutes > 480 ? "This may be overloaded" : "Workload looks realistic"
            }
            icon={<Clock3 className="h-5 w-5" />}
          />
          <MetricCard
            label="Habits"
            value={`${habitCount}/${todayHabits.length}`}
            detail="checked in today"
            icon={<Sparkles className="h-5 w-5" />}
          />
        </div>

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
                          {task.estimatedMinutes ?? 0} planned minutes
                          {task.deadline
                            ? ` · due ${formatDate(`${task.deadline}T12:00:00`)}`
                            : ""}
                        </p>
                      </div>
                      <div className="col-start-2 row-start-2 flex min-w-0 flex-wrap items-center gap-2 sm:col-start-3 sm:row-start-1 sm:justify-end">
                        <CategoryBadge category={task.category} />
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
                            task.actualMinutes ?? task.estimatedMinutes ?? 0
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
    </PageShell>
  );
}
