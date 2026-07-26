import type { WorkspaceEvent } from "@/types";

export type EventOccurrence = {
  id: string;
  eventId: string;
  title: string;
  category: string;
  date: string;
  startTime?: string;
  durationMinutes?: number;
  timeZone: string;
};

function parseDateKey(date: string) {
  return new Date(`${date}T12:00:00Z`);
}

function addDays(date: string, days: number) {
  const value = parseDateKey(date);
  value.setUTCDate(value.getUTCDate() + days);
  return value.toISOString().slice(0, 10);
}

function daysBetween(start: string, end: string) {
  return Math.round(
    (parseDateKey(end).getTime() - parseDateKey(start).getTime()) / 86_400_000,
  );
}

function weekday(date: string) {
  return parseDateKey(date).getUTCDay();
}

export function eventOccursOn(event: WorkspaceEvent, date: string) {
  const recurrence = event.recurrence;
  if (recurrence.kind === "none") return event.date === date;
  if (date < recurrence.startsOn) return false;
  if (recurrence.endsOn && date > recurrence.endsOn) return false;
  if (recurrence.excludedDates?.includes(date)) return false;

  const elapsed = daysBetween(recurrence.startsOn, date);
  if (recurrence.kind === "weekly") {
    return (
      elapsed >= 0 &&
      elapsed % 7 === 0 &&
      recurrence.weekdays.includes(weekday(date))
    );
  }
  if (recurrence.kind === "fortnightly") {
    return (
      elapsed >= 0 &&
      Math.floor(elapsed / 7) % 2 === 0 &&
      recurrence.weekdays.includes(weekday(date))
    );
  }
  return recurrence.weekdays.includes(weekday(date));
}

export function expandEvents(
  events: WorkspaceEvent[],
  from: string,
  to: string,
): EventOccurrence[] {
  if (to < from) return [];
  const occurrences: EventOccurrence[] = [];
  for (let date = from; date <= to; date = addDays(date, 1)) {
    for (const event of events) {
      if (!eventOccursOn(event, date)) continue;
      occurrences.push({
        id: `${event.id}:${date}`,
        eventId: event.id,
        title: event.title,
        category: event.category,
        date,
        startTime: event.startTime,
        durationMinutes: event.durationMinutes,
        timeZone: event.timeZone,
      });
    }
  }
  return occurrences.sort((a, b) => {
    const dateOrder = a.date.localeCompare(b.date);
    if (dateOrder) return dateOrder;
    return (a.startTime ?? "23:59").localeCompare(b.startTime ?? "23:59");
  });
}
