"use client";

import { useState, type FormEvent } from "react";
import { CalendarPlus, Pencil, X } from "lucide-react";
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
  alignedFieldLabelClassName,
  fieldClassName,
} from "@/components/ui/resolve";
import { useResolve } from "@/contexts/resolve-context";
import { formatDate } from "@/lib/utils";
import type { EventRecurrence, WorkspaceEvent } from "@/types";
import { expandEvents } from "@/features/workspace/lib/events";

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export function WeeklyEventEditor({ weekStart }: { weekStart: string }) {
  const { events, preferences, addEvent, updateEvent, removeEvent } = useResolve();
  const workspaceEvents = events ?? [];
  const timeZone =
    preferences?.timeZone ??
    Intl.DateTimeFormat().resolvedOptions().timeZone ??
    "UTC";
  const weekEnd = (() => {
    const value = new Date(`${weekStart}T12:00:00Z`);
    value.setUTCDate(value.getUTCDate() + 6);
    return value.toISOString().slice(0, 10);
  })();
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("academics");
  const [date, setDate] = useState(weekStart);
  const [startTime, setStartTime] = useState("");
  const [duration, setDuration] = useState("60");
  const [repeat, setRepeat] = useState<EventRecurrence["kind"]>("none");
  const [weekdays, setWeekdays] = useState<number[]>([]);
  const [endsOn, setEndsOn] = useState("");

  function reset() {
    setOpen(false);
    setEditingId(null);
    setTitle("");
    setCategory("academics");
    setDate(weekStart);
    setStartTime("");
    setDuration("60");
    setRepeat("none");
    setWeekdays([]);
    setEndsOn("");
  }

  function edit(event: WorkspaceEvent) {
    setEditingId(event.id);
    setTitle(event.title);
    setCategory(event.category);
    setDate(event.date);
    setStartTime(event.startTime ?? "");
    setDuration(String(event.durationMinutes ?? 60));
    setRepeat(event.recurrence.kind);
    setWeekdays(
      event.recurrence.kind === "none" ? [] : event.recurrence.weekdays,
    );
    setEndsOn(
      event.recurrence.kind === "none" ? "" : event.recurrence.endsOn ?? "",
    );
    setOpen(true);
  }

  function submit(event: FormEvent) {
    event.preventDefault();
    if (!title.trim()) return;
    const selectedWeekdays =
      weekdays.length > 0
        ? weekdays
        : [new Date(`${date}T12:00:00Z`).getUTCDay()];
    const recurrence: EventRecurrence =
      repeat === "none"
        ? { kind: "none" }
        : {
            kind: repeat,
            weekdays: selectedWeekdays,
            startsOn: date,
            endsOn: endsOn || undefined,
            excludedDates: [],
          };
    const input = {
      title,
      category,
      date,
      startTime: startTime || undefined,
      durationMinutes: Number(duration) || undefined,
      timeZone,
      recurrence,
    };
    if (editingId) updateEvent?.(editingId, input);
    else addEvent?.(input);
    reset();
  }

  return (
    <Card>
      <CardHeader className="flex flex-col items-start justify-between gap-4 sm:flex-row">
        <div className="min-w-0">
          <CardTitle>Fixed commitments</CardTitle>
          <CardDescription>
            Classes, shifts, appointments, and recurring commitments reduce
            the time available for focused tasks.
          </CardDescription>
        </div>
        <Button
          size="sm"
          variant={open ? "ghost" : "secondary"}
          onClick={() => (open ? reset() : setOpen(true))}
        >
          {open ? <X className="h-4 w-4" /> : <CalendarPlus className="h-4 w-4" />}
          {open ? "Close" : "Add event"}
        </Button>
      </CardHeader>
      <CardContent className="space-y-4">
        {open && (
          <form
            onSubmit={submit}
            className="grid gap-3 rounded-2xl border border-accent/25 bg-accent/5 p-4 md:grid-cols-2 xl:grid-cols-3"
          >
            <label className={alignedFieldLabelClassName}>
              <span>Event</span>
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
                <option value="health">Health</option>
                <option value="personal">Personal</option>
                <option value="social">Social</option>
              </select>
            </label>
            <label className={alignedFieldLabelClassName}>
              <span>First date</span>
              <input
                className={fieldClassName}
                type="date"
                value={date}
                onChange={(event) => setDate(event.target.value)}
                required
              />
            </label>
            <label className={alignedFieldLabelClassName}>
              <span>Start time (optional)</span>
              <input
                className={fieldClassName}
                type="time"
                value={startTime}
                onChange={(event) => setStartTime(event.target.value)}
              />
            </label>
            <label className={alignedFieldLabelClassName}>
              <span>Duration (minutes)</span>
              <input
                className={fieldClassName}
                type="number"
                min="5"
                max="1440"
                step="5"
                value={duration}
                onChange={(event) => setDuration(event.target.value)}
              />
            </label>
            <label className={alignedFieldLabelClassName}>
              <span>Repeat</span>
              <select
                className={fieldClassName}
                value={repeat}
                onChange={(event) =>
                  setRepeat(event.target.value as EventRecurrence["kind"])
                }
              >
                <option value="none">One-off</option>
                <option value="weekly">Weekly</option>
                <option value="fortnightly">Fortnightly</option>
                <option value="selected_weekdays">Selected weekdays</option>
              </select>
            </label>
            {repeat !== "none" && (
              <>
                <fieldset className="md:col-span-2">
                  <legend className="text-xs font-black uppercase tracking-wider text-muted">
                    Occurs on
                  </legend>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {DAYS.map((day, index) => (
                      <label
                        key={day}
                        className={`rounded-xl border px-3 py-2 text-xs font-bold ${
                          weekdays.includes(index)
                            ? "border-accent bg-accent text-white"
                            : "border-border bg-surface"
                        }`}
                      >
                        <input
                          className="sr-only"
                          type="checkbox"
                          checked={weekdays.includes(index)}
                          onChange={() =>
                            setWeekdays((current) =>
                              current.includes(index)
                                ? current.filter((item) => item !== index)
                                : [...current, index].sort(),
                            )
                          }
                        />
                        {day}
                      </label>
                    ))}
                  </div>
                </fieldset>
                <label className={alignedFieldLabelClassName}>
                  <span>Repeat until (optional)</span>
                  <input
                    className={fieldClassName}
                    type="date"
                    min={date}
                    value={endsOn}
                    onChange={(event) => setEndsOn(event.target.value)}
                  />
                </label>
              </>
            )}
            <Button type="submit" className="self-end">
              {editingId ? "Save event" : "Add fixed event"}
            </Button>
          </form>
        )}

        {workspaceEvents.length > 0 && (
          <div className="grid gap-2 sm:grid-cols-2">
            {workspaceEvents.map((event) => {
              const recurrenceWithoutExceptions =
                event.recurrence.kind === "none"
                  ? event.recurrence
                  : { ...event.recurrence, excludedDates: [] };
              const occurrences = expandEvents(
                [{ ...event, recurrence: recurrenceWithoutExceptions }],
                weekStart,
                weekEnd,
              );
              const occurrenceDates = [
                ...new Set(occurrences.map((occurrence) => occurrence.sourceDate)),
              ];
              const excludedDates =
                event.recurrence.kind === "none"
                  ? []
                  : event.recurrence.excludedDates ?? [];
              const allOccurrencesAreSkipped =
                occurrenceDates.length > 0 &&
                event.recurrence.kind !== "none" &&
                occurrenceDates.every((occurrenceDate) =>
                  excludedDates.includes(occurrenceDate),
                );
              return (
                <div
                  key={event.id}
                  className="min-w-0 rounded-xl border border-border bg-surface p-3"
                >
                <div className="min-w-0 flex-1">
                  <p className="break-words text-sm font-bold">{event.title}</p>
                  <p className="mt-1 break-words text-[11px] capitalize text-muted">
                    {formatDate(`${event.date}T12:00:00`)} ·{" "}
                    {event.startTime ? `${event.startTime} · ` : ""}
                    {event.durationMinutes
                      ? `${event.durationMinutes} min · `
                      : ""}
                    {event.recurrence.kind.replace("_", " ")}
                  </p>
                </div>
                <div className="mt-3 flex min-w-0 flex-wrap items-center justify-end gap-1">
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => edit(event)}
                    aria-label={`Edit event ${event.title}`}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  {occurrenceDates.length > 0 &&
                    event.recurrence.kind !== "none" && (
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => {
                        const recurring = event.recurrence;
                        if (recurring.kind === "none") return;
                        const excluded = new Set(
                          recurring.excludedDates ?? [],
                        );
                        if (allOccurrencesAreSkipped) {
                          occurrenceDates.forEach((occurrenceDate) =>
                            excluded.delete(occurrenceDate),
                          );
                        } else {
                          occurrenceDates.forEach((occurrenceDate) =>
                            excluded.add(occurrenceDate),
                          );
                        }
                        updateEvent?.(event.id, {
                          ...event,
                          recurrence: {
                            ...recurring,
                            excludedDates: [...excluded].sort(),
                          },
                        });
                      }}
                      aria-label={`${allOccurrencesAreSkipped ? "Restore" : "Skip"} ${event.title} during this week`}
                    >
                      {allOccurrencesAreSkipped
                        ? "Restore this week"
                        : "Skip this week"}
                    </Button>
                  )}
                  <ConfirmDeleteButton
                    itemLabel={`event ${event.title}`}
                    onConfirm={() => removeEvent?.(event.id)}
                    className="flex-wrap justify-end"
                  />
                </div>
              </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
