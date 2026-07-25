"use client";

import {
  useEffect,
  useMemo,
  useState,
  type FormEvent,
} from "react";
import {
  AlertTriangle,
  CalendarDays,
  Check,
  Pencil,
  Save,
  X,
} from "lucide-react";
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
import {
  CategoryBadge,
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

export default function WeeklyPage() {
  const {
    tasks,
    weeklyPriorities,
    updatePriorities,
    updateTask,
    moveTask,
    removeTask,
  } = useResolve();
  const dates = useMemo(() => getWeekDateKeys(), []);
  const [priorities, setPriorities] = useState(weeklyPriorities);
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("academics");
  const [priority, setPriority] = useState<Task["priority"]>("medium");
  const [minutes, setMinutes] = useState("30");
  const [scheduledDate, setScheduledDate] = useState(dates[0]);
  const [deadline, setDeadline] = useState("");

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

  function resetTaskEditor() {
    setEditingTaskId(null);
    setTitle("");
    setCategory("academics");
    setPriority("medium");
    setMinutes("30");
    setScheduledDate(dates[0]);
    setDeadline("");
  }

  function startEditingTask(task: Task) {
    setEditingTaskId(task.id);
    setTitle(task.title);
    setCategory(task.category);
    setPriority(task.priority);
    setMinutes(String(task.estimatedMinutes ?? 30));
    setScheduledDate(task.scheduledDate ?? dates[0]);
    setDeadline(task.deadline ?? "");
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
      deadline: deadline || undefined,
    });
    resetTaskEditor();
  }

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

        {editingTaskId && (
          <Card id="weekly-task-editor" className="border-accent/30">
            <CardHeader className="flex flex-row items-start justify-between gap-4">
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
                      <div className="flex items-start justify-between gap-2">
                        <CategoryBadge category={task.category} />
                        <div className="flex flex-wrap justify-end gap-1">
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
                            className="flex-wrap justify-end"
                          />
                        </div>
                      </div>
                      <p className="mt-2 text-xs font-bold leading-5">
                        {task.title}
                      </p>
                      <label className="mt-2 block text-[10px] font-black uppercase tracking-wider text-muted">
                        Move to day
                        <select
                          className="mt-1 w-full rounded-lg border border-border bg-surface-muted px-2 py-1 text-[11px] font-medium normal-case tracking-normal text-foreground outline-none"
                          value={task.scheduledDate}
                          onChange={(event) =>
                            moveTask(task.id, event.target.value)
                          }
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
                      </label>
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
