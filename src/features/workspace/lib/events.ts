import type { WorkspaceEvent } from "@/types";

export type EventOccurrence = {
  id: string;
  eventId: string;
  sourceDate: string;
  title: string;
  category: string;
  date: string;
  startTime?: string;
  durationMinutes?: number;
  timeZone: string;
  continuesFromPreviousDay?: boolean;
  continuesIntoNextDay?: boolean;
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
      Math.floor(elapsed / 7) >= 0 &&
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
  for (
    let sourceDate = addDays(from, -1);
    sourceDate <= to;
    sourceDate = addDays(sourceDate, 1)
  ) {
    for (const event of events) {
      if (!eventOccursOn(event, sourceDate)) continue;
      const startMinutes = event.startTime
        ? Number(event.startTime.slice(0, 2)) * 60 +
          Number(event.startTime.slice(3, 5))
        : undefined;
      const duration = event.durationMinutes;
      const firstDuration =
        startMinutes !== undefined && duration !== undefined
          ? Math.min(duration, 1440 - startMinutes)
          : duration;
      if (sourceDate >= from && sourceDate <= to) {
        occurrences.push({
          id: `${event.id}:${sourceDate}:0`,
          eventId: event.id,
          sourceDate,
          title: event.title,
          category: event.category,
          date: sourceDate,
          startTime: event.startTime,
          durationMinutes: firstDuration,
          timeZone: event.timeZone,
          continuesIntoNextDay:
            duration !== undefined &&
            firstDuration !== undefined &&
            duration > firstDuration,
        });
      }
      const overflowMinutes =
        duration !== undefined && firstDuration !== undefined
          ? duration - firstDuration
          : 0;
      const overflowDate = addDays(sourceDate, 1);
      if (
        overflowMinutes > 0 &&
        overflowDate >= from &&
        overflowDate <= to
      ) {
        occurrences.push({
          id: `${event.id}:${sourceDate}:1`,
          eventId: event.id,
          sourceDate,
          title: event.title,
          category: event.category,
          date: overflowDate,
          startTime: "00:00",
          durationMinutes: overflowMinutes,
          timeZone: event.timeZone,
          continuesFromPreviousDay: true,
        });
      }
    }
  }
  return occurrences.sort((a, b) => {
    const dateOrder = a.date.localeCompare(b.date);
    if (dateOrder) return dateOrder;
    return (a.startTime ?? "23:59").localeCompare(b.startTime ?? "23:59");
  });
}
