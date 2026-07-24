"use client";

import { useState, type FormEvent } from "react";
import { Check, Flame, Heart, Plus, TrendingUp, X } from "lucide-react";
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
  EmptyState,
  MetricCard,
  PageIntro,
  fieldClassName,
} from "@/components/ui/resolve";
import { offsetDate, useResolve } from "@/contexts/resolve-context";

const DAYS = [-6, -5, -4, -3, -2, -1, 0];

export default function HabitsPage() {
  const { habits, habitLogs, toggleHabit, addHabit } = useResolve();
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("health");
  const [schedule, setSchedule] = useState("daily");
  const dates = DAYS.map((day) => offsetDate(day));
  const isScheduled = (habitId: string, date: string) => {
    const habit = habits.find((item) => item.id === habitId);
    const day = new Date(`${date}T12:00:00`).getDay();
    return Boolean(habit?.targetDays.includes(day));
  };
  const totalTargets = habits.reduce(
    (total, habit) =>
      total +
      dates.filter((date) => isScheduled(habit.id, date)).length,
    0,
  );
  const completed = habitLogs.filter(
    (log) =>
      dates.includes(log.date) &&
      log.completed &&
      isScheduled(log.habitId, log.date),
  ).length;
  const weeklyRate = Math.round((completed / Math.max(totalTargets, 1)) * 100);
  const strongestHabit = [...habits].sort((a, b) => {
    const bCount = habitLogs.filter(
      (log) =>
        log.habitId === b.id &&
        dates.includes(log.date) &&
        log.completed &&
        isScheduled(b.id, log.date),
    ).length;
    const aCount = habitLogs.filter(
      (log) =>
        log.habitId === a.id &&
        dates.includes(log.date) &&
        log.completed &&
        isScheduled(a.id, log.date),
    ).length;
    return bCount - aCount;
  })[0];

  function submit(event: FormEvent) {
    event.preventDefault();
    if (!title.trim()) return;
    addHabit({
      title,
      category,
      measurementType: "boolean",
      targetDays:
        schedule === "weekdays" ? [1, 2, 3, 4, 5] : [0, 1, 2, 3, 4, 5, 6],
    });
    setTitle("");
    setShowForm(false);
  }

  return (
    <PageShell title="Habits">
      <div className="mx-auto max-w-6xl space-y-6">
        <PageIntro
          eyebrow="Consistency studio"
          title="Aim for rhythm, not perfection"
          description="Weekly consistency stays visible even when one missed day breaks a traditional streak."
          action={
            <Button onClick={() => setShowForm((value) => !value)}>
              {showForm ? <X className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
              {showForm ? "Close" : "Add habit"}
            </Button>
          }
        />

        {showForm && (
          <Card className="border-accent/30">
            <CardHeader>
              <CardTitle>Add a repeatable rhythm</CardTitle>
              <CardDescription>
                Choose something easy to recognise and quick to check in.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form
                onSubmit={submit}
                className="grid gap-3 sm:grid-cols-[1fr_160px_150px_auto]"
              >
                <input
                  className={fieldClassName}
                  value={title}
                  onChange={(event) => setTitle(event.target.value)}
                  aria-label="Habit title"
                  autoFocus
                  required
                />
                <select
                  className={fieldClassName}
                  value={category}
                  onChange={(event) => setCategory(event.target.value)}
                  aria-label="Habit category"
                >
                  <option value="health">Health</option>
                  <option value="personal">Personal</option>
                  <option value="academics">Academics</option>
                  <option value="guitar">Guitar</option>
                  <option value="career">Career</option>
                </select>
                <select
                  className={fieldClassName}
                  value={schedule}
                  onChange={(event) => setSchedule(event.target.value)}
                  aria-label="Habit schedule"
                >
                  <option value="daily">Every day</option>
                  <option value="weekdays">Weekdays</option>
                </select>
                <Button type="submit">Add</Button>
              </form>
            </CardContent>
          </Card>
        )}

        <div className="grid gap-4 sm:grid-cols-3">
          <MetricCard
            label="Weekly consistency"
            value={`${weeklyRate}%`}
            detail="across all active habits"
            icon={<TrendingUp className="h-5 w-5" />}
          />
          <MetricCard
            label="Check-ins"
            value={completed}
            detail={`of ${totalTargets} possible this week`}
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
            {habits.length ? <div className="min-w-[660px]">
              <div className="grid grid-cols-[220px_repeat(7,1fr)] gap-2 pb-3 text-center text-xs font-bold text-muted">
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
                    className="grid grid-cols-[220px_repeat(7,1fr)] items-center gap-2 rounded-2xl border border-border bg-surface p-3"
                  >
                    <div className="pr-3">
                      <p className="text-sm font-bold">{habit.title}</p>
                      <div className="mt-1">
                        <CategoryBadge category={habit.category} />
                      </div>
                    </div>
                    {dates.map((date) => {
                      const checked = habitLogs.some(
                        (log) =>
                          log.habitId === habit.id &&
                          log.date === date &&
                          log.completed,
                      );
                      const scheduled = isScheduled(habit.id, date);
                      return (
                        <button
                          key={date}
                          type="button"
                          onClick={() => toggleHabit(habit.id, date)}
                          aria-label={`${checked ? "Clear" : "Complete"} ${habit.title} on ${date}`}
                          className={`mx-auto flex h-9 w-9 items-center justify-center rounded-xl border transition ${
                            checked
                              ? "border-success bg-success text-white shadow-sm shadow-success/20"
                              : scheduled
                                ? "border-border bg-surface-elevated hover:border-accent"
                                : "border-transparent bg-surface-muted/50 opacity-45 hover:opacity-80"
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
                action={<Button onClick={() => setShowForm(true)}>Add habit</Button>}
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
