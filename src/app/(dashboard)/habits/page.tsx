"use client";

import { useEffect, useState, type FormEvent } from "react";
import {
  Check,
  Flame,
  Heart,
  Pencil,
  Plus,
  TrendingUp,
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
import {
  getHabitCompletionCount,
  getHabitConsistency,
  getHabitScheduleLabel,
  getHabitTargetCount,
  isHabitScheduledOnDate,
} from "@/features/workspace/lib/habits";
import type { Habit } from "@/types";

const WEEKDAYS = [
  { value: 1, label: "Mon" },
  { value: 2, label: "Tue" },
  { value: 3, label: "Wed" },
  { value: 4, label: "Thu" },
  { value: 5, label: "Fri" },
  { value: 6, label: "Sat" },
  { value: 0, label: "Sun" },
] as const;
type ScheduleOption =
  | "daily"
  | "weekdays"
  | "weekends"
  | "specific"
  | "frequency";

export default function HabitsPage() {
  const {
    habits,
    habitLogs,
    toggleHabit,
    addHabit,
    updateHabit,
    removeHabit,
  } = useResolve();
  const [showForm, setShowForm] = useState(false);
  const [editingHabitId, setEditingHabitId] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("health");
  const [schedule, setSchedule] = useState<ScheduleOption>("daily");
  const [frequency, setFrequency] = useState("2");
  const [selectedDays, setSelectedDays] = useState<number[]>([1, 3, 5]);
  const today = offsetDate(0);
  const dates = getWeekDateKeys();
  const habitProgress = habits.map((habit) => ({
    habit,
    target: getHabitTargetCount(habit, dates),
    completed: getHabitCompletionCount(habit, habitLogs, dates),
    consistency: getHabitConsistency(habit, habitLogs, dates),
  }));
  const totalTargets = habitProgress.reduce(
    (total, item) => total + item.target,
    0,
  );
  const completed = habitProgress.reduce(
    (total, item) => total + Math.min(item.completed, item.target),
    0,
  );
  const weeklyRate = Math.round((completed / Math.max(totalTargets, 1)) * 100);
  const strongestHabit = [...habitProgress].sort(
    (a, b) =>
      b.consistency - a.consistency || b.completed - a.completed,
  )[0]?.habit;

  useEffect(() => {
    let frame = 0;
    function openDeepLink(href = window.location.href) {
      const url = new URL(href, window.location.origin);
      const habitId = url.searchParams.get("habit");
      if (!habitId) return;
      frame = window.requestAnimationFrame(() => {
        document
          .getElementById(`habit-${habitId}`)
          ?.scrollIntoView({ behavior: "smooth", block: "center" });
      });
    }
    const handleRecord = (event: Event) => {
      const href = (event as CustomEvent<{ href?: string }>).detail?.href;
      if (href?.startsWith("/habits")) openDeepLink(href);
    };
    openDeepLink();
    window.addEventListener("resolve:open-record", handleRecord);
    return () => {
      window.cancelAnimationFrame(frame);
      window.removeEventListener("resolve:open-record", handleRecord);
    };
  }, [habits.length]);

  function resetForm() {
    setTitle("");
    setCategory("health");
    setSchedule("daily");
    setFrequency("2");
    setSelectedDays([1, 3, 5]);
    setEditingHabitId(null);
    setShowForm(false);
  }

  function startNewHabit() {
    resetForm();
    setShowForm(true);
  }

  function startEditingHabit(habit: Habit) {
    setEditingHabitId(habit.id);
    setTitle(habit.title);
    setCategory(habit.category);
    setFrequency(String(habit.targetFrequency));
    setSelectedDays(habit.targetDays.length ? habit.targetDays : [1, 3, 5]);
    if (habit.scheduleType === "times_per_week") {
      setSchedule("frequency");
    } else if (habit.targetDays.length === 7) {
      setSchedule("daily");
    } else if (
      habit.targetDays.length === 5 &&
      habit.targetDays.every((day, index) => day === index + 1)
    ) {
      setSchedule("weekdays");
    } else if (
      habit.targetDays.length === 2 &&
      habit.targetDays.includes(0) &&
      habit.targetDays.includes(6)
    ) {
      setSchedule("weekends");
    } else {
      setSchedule("specific");
    }
    setShowForm(true);
    window.requestAnimationFrame(() => {
      document
        .getElementById("habit-editor")
        ?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  }

  function submit(event: FormEvent) {
    event.preventDefault();
    if (!title.trim()) return;
    const targetDays =
      schedule === "daily"
        ? [0, 1, 2, 3, 4, 5, 6]
        : schedule === "weekdays"
          ? [1, 2, 3, 4, 5]
          : schedule === "weekends"
            ? [0, 6]
            : schedule === "specific"
              ? selectedDays
              : [];
    if (schedule === "specific" && !targetDays.length) return;
    const changes = {
      title,
      category,
      measurementType: "boolean" as const,
      scheduleType:
        schedule === "frequency"
          ? ("times_per_week" as const)
          : ("days_of_week" as const),
      targetDays,
      targetFrequency:
        schedule === "frequency" ? Number(frequency) : targetDays.length,
    };
    if (editingHabitId) {
      updateHabit(editingHabitId, changes);
    } else {
      addHabit(changes);
    }
    resetForm();
  }

  return (
    <PageShell title="Habits">
      <div className="mx-auto max-w-6xl space-y-6">
        <PageIntro
          eyebrow="Consistency studio"
          title="Aim for rhythm, not perfection"
          description="Weekly consistency stays visible even when one missed day breaks a traditional streak."
          action={
            <Button
              onClick={() => {
                if (showForm) resetForm();
                else startNewHabit();
              }}
            >
              {showForm ? <X className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
              {showForm ? "Close" : "Add habit"}
            </Button>
          }
        />

        {showForm && (
          <Card id="habit-editor" className="border-accent/30">
            <CardHeader>
              <CardTitle>
                {editingHabitId
                  ? "Edit this rhythm"
                  : "Add a repeatable rhythm"}
              </CardTitle>
              <CardDescription>
                Pick fixed weekdays or a flexible number of check-ins per week.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form
                onSubmit={submit}
                className="grid gap-3 md:grid-cols-2 xl:grid-cols-4"
              >
                <label className={alignedFieldLabelClassName}>
                  <span className="flex items-end">Habit</span>
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
                    onChange={(event) => setCategory(event.target.value)}
                  >
                    <option value="health">Health</option>
                    <option value="personal">Personal</option>
                    <option value="academics">Academics</option>
                    <option value="technical">Technical skills</option>
                    <option value="guitar">Guitar</option>
                    <option value="career">Career</option>
                    <option value="finance">Finance</option>
                    <option value="social">Social</option>
                    <option value="custom">Other</option>
                  </select>
                </label>
                <label className={alignedFieldLabelClassName}>
                  <span className="flex items-end">Repeat</span>
                  <select
                    className={fieldClassName}
                    value={schedule}
                    onChange={(event) =>
                      setSchedule(event.target.value as ScheduleOption)
                    }
                  >
                    <option value="daily">Every day</option>
                    <option value="weekdays">Weekdays only</option>
                    <option value="weekends">Weekends only</option>
                    <option value="specific">Selected weekdays</option>
                    <option value="frequency">Flexible times per week</option>
                  </select>
                </label>
                {schedule === "frequency" && (
                  <label className={alignedFieldLabelClassName}>
                    <span className="flex items-end">Weekly target</span>
                    <select
                      className={fieldClassName}
                      value={frequency}
                      onChange={(event) => setFrequency(event.target.value)}
                    >
                      {Array.from({ length: 7 }, (_, index) => index + 1).map(
                        (count) => (
                          <option key={count} value={count}>
                            {count} {count === 1 ? "time" : "times"} per week
                          </option>
                        ),
                      )}
                    </select>
                  </label>
                )}
                {schedule === "specific" && (
                  <fieldset className="md:col-span-2 xl:col-span-4">
                    <legend className="text-sm font-bold">
                      Repeat on selected days
                    </legend>
                    <div className="mt-2 grid grid-cols-4 gap-2 sm:grid-cols-7">
                      {WEEKDAYS.map((day) => {
                        const selected = selectedDays.includes(day.value);
                        return (
                          <button
                            key={day.value}
                            type="button"
                            aria-pressed={selected}
                            onClick={() =>
                              setSelectedDays((current) =>
                                selected
                                  ? current.filter(
                                      (value) => value !== day.value,
                                    )
                                  : [...current, day.value].sort(
                                      (a, b) => a - b,
                                    ),
                              )
                            }
                            className={`min-h-10 rounded-xl border-2 px-2 text-xs font-black transition ${
                              selected
                                ? "border-accent bg-accent text-white"
                                : "border-border bg-surface hover:border-accent"
                            }`}
                          >
                            {day.label}
                          </button>
                        );
                      })}
                    </div>
                    {!selectedDays.length && (
                      <p className="mt-2 text-xs font-semibold text-danger">
                        Select at least one weekday.
                      </p>
                    )}
                  </fieldset>
                )}
                <Button
                  type="submit"
                  className={`self-end ${
                    schedule === "frequency"
                      ? ""
                      : "md:col-span-2 xl:col-span-1"
                  }`}
                  disabled={
                    schedule === "specific" && selectedDays.length === 0
                  }
                >
                  {editingHabitId ? "Save habit changes" : "Add habit"}
                </Button>
              </form>
            </CardContent>
          </Card>
        )}

        <div className="grid gap-4 sm:grid-cols-3">
          <MetricCard
            label="Weekly consistency"
            value={`${weeklyRate}%`}
            detail="100% once each weekly target is met"
            icon={<TrendingUp className="h-5 w-5" />}
          />
          <MetricCard
            label="Check-ins"
            value={completed}
            detail={`of ${totalTargets} targeted check-ins this week`}
            icon={<Check className="h-5 w-5" />}
          />
          <MetricCard
            label="Strongest rhythm"
            value={strongestHabit?.title ?? "Start today"}
            detail="keep the easiest win easy"
            icon={<Flame className="h-5 w-5" />}
          />
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Seven-day check-in</CardTitle>
            <CardDescription>
              Tap any square to record or correct a check-in.
            </CardDescription>
          </CardHeader>
          <CardContent className="overflow-x-auto">
            {habits.length ? <div className="min-w-[760px]">
              <div className="grid grid-cols-[300px_repeat(7,1fr)] gap-2 pb-3 text-center text-xs font-bold text-muted">
                <div />
                {dates.map((date) => (
                  <div key={date}>
                    <span className="block">
                      {new Date(`${date}T12:00:00`).toLocaleDateString(
                        "en-SG",
                        { weekday: "short" },
                      )}
                    </span>
                    <span className="font-normal">
                      {new Date(`${date}T12:00:00`).getDate()}
                    </span>
                  </div>
                ))}
              </div>
              <div className="space-y-2">
                {habits.map((habit) => (
                  <div
                    key={habit.id}
                    id={`habit-${habit.id}`}
                    className="scroll-mt-24 grid grid-cols-[300px_repeat(7,1fr)] items-center gap-2 rounded-2xl border border-border bg-surface p-3"
                  >
                    <div className="flex min-w-0 items-start justify-between gap-2 pr-3">
                      <div className="min-w-0">
                        <p className="break-words text-sm font-bold">
                          {habit.title}
                        </p>
                        <div className="mt-1">
                          <CategoryBadge category={habit.category} />
                        </div>
                        <p className="mt-1 text-[11px] font-semibold text-muted">
                          {getHabitScheduleLabel(habit)} ·{" "}
                          {getHabitConsistency(habit, habitLogs, dates)}%
                        </p>
                      </div>
                      <div className="flex shrink-0 items-center gap-1">
                        <button
                          type="button"
                          onClick={() => startEditingHabit(habit)}
                          aria-label={`Edit habit ${habit.title}`}
                          className="flex h-8 w-8 items-center justify-center rounded-lg text-muted transition hover:bg-accent/10 hover:text-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </button>
                        <ConfirmDeleteButton
                          itemLabel={`habit ${habit.title}`}
                          onConfirm={() => removeHabit(habit.id)}
                          className="flex-wrap justify-end"
                        />
                      </div>
                    </div>
                    {dates.map((date) => {
                      const checked = habitLogs.some(
                        (log) =>
                          log.habitId === habit.id &&
                          log.date === date &&
                          log.completed,
                      );
                      const scheduled = isHabitScheduledOnDate(habit, date);
                      const available = scheduled && date <= today;
                      return (
                        <button
                          key={date}
                          type="button"
                          onClick={() => toggleHabit(habit.id, date)}
                          disabled={!available}
                          aria-label={
                            !scheduled
                              ? `${habit.title} is not scheduled on ${date}`
                              : date > today
                                ? `${habit.title} check-in opens on ${date}`
                                : `${checked ? "Clear" : "Complete"} ${habit.title} on ${date}`
                          }
                          className={`mx-auto flex h-9 w-9 items-center justify-center rounded-xl border transition ${
                            checked
                              ? "border-success bg-success text-white shadow-sm shadow-success/20"
                              : available
                                ? "border-border bg-surface-elevated hover:border-accent"
                                : "cursor-not-allowed border-transparent bg-surface-muted/50 opacity-45"
                          }`}
                        >
                          {checked && <Check className="h-4 w-4" />}
                        </button>
                      );
                    })}
                  </div>
                ))}
              </div>
            </div> : (
              <EmptyState
                icon={<Heart className="h-6 w-6" />}
                title="No habits yet"
                description="Add one rhythm you want to repeat, then check it in from Today or this weekly grid."
                action={<Button onClick={startNewHabit}>Add habit</Button>}
              />
            )}
          </CardContent>
        </Card>

        <div className="rounded-3xl border border-accent/20 bg-accent/5 p-6">
          <div className="flex items-start gap-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-accent text-white">
              <Heart className="h-5 w-5" />
            </div>
            <div>
              <p className="font-black">Recovery is part of consistency.</p>
              <p className="mt-1 text-sm leading-6 text-muted">
                Resolve! keeps the weekly rate visible after a miss. The useful
                question is “what made showing up hard?”—not “how do I restart
                from zero?”
              </p>
            </div>
          </div>
        </div>
      </div>
    </PageShell>
  );
}
