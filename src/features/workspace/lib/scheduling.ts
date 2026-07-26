import {
  getDeadlineDateKey,
  getTaskDeadline,
  getTaskEstimatedMinutes,
  getTaskScheduleDate,
} from "@/features/workspace/lib/deadlines";
import type { EventOccurrence } from "@/features/workspace/lib/events";
import type { Task } from "@/types";

export type ScheduleConflict = {
  id: string;
  kind:
    | "event_event"
    | "task_event"
    | "task_task"
    | "after_deadline"
    | "cross_midnight";
  date: string;
  message: string;
  sourceIds: string[];
};

type TimeBlock = {
  id: string;
  kind: "task" | "event";
  title: string;
  date: string;
  start: number;
  end: number;
};

function timeMinutes(time: string) {
  return Number(time.slice(0, 2)) * 60 + Number(time.slice(3, 5));
}

function nextDate(date: string) {
  const value = new Date(`${date}T12:00:00Z`);
  value.setUTCDate(value.getUTCDate() + 1);
  return value.toISOString().slice(0, 10);
}

function taskBlocks(tasks: Task[]) {
  const blocks: TimeBlock[] = [];
  const conflicts: ScheduleConflict[] = [];
  for (const task of tasks) {
    const date = getTaskScheduleDate(task);
    const time = task.schedule?.startTime;
    const duration = getTaskEstimatedMinutes(task);
    if (!date || !time || !duration) continue;
    const start = timeMinutes(time);
    const firstEnd = Math.min(1440, start + duration);
    blocks.push({
      id: task.id,
      kind: "task",
      title: task.title,
      date,
      start,
      end: firstEnd,
    });
    if (start + duration > 1440) {
      const overflow = start + duration - 1440;
      blocks.push({
        id: task.id,
        kind: "task",
        title: task.title,
        date: nextDate(date),
        start: 0,
        end: overflow,
      });
      conflicts.push({
        id: `cross-midnight:task:${task.id}:${date}`,
        kind: "cross_midnight",
        date,
        message: `${task.title} continues into the next day.`,
        sourceIds: [task.id],
      });
    }
  }
  return { blocks, conflicts };
}

export function getScheduleConflicts(
  tasks: Task[],
  events: EventOccurrence[],
): ScheduleConflict[] {
  const activeTasks = tasks.filter(
    (task) => !["cancelled", "skipped"].includes(task.status),
  );
  const taskResult = taskBlocks(activeTasks);
  const blocks: TimeBlock[] = [
    ...taskResult.blocks,
    ...events.flatMap((event) =>
      event.startTime && event.durationMinutes
        ? [
            {
              id: event.eventId,
              kind: "event" as const,
              title: event.title,
              date: event.date,
              start: timeMinutes(event.startTime),
              end: timeMinutes(event.startTime) + event.durationMinutes,
            },
          ]
        : [],
    ),
  ];
  const conflicts = [...taskResult.conflicts];
  for (const task of activeTasks) {
    const scheduleDate = getTaskScheduleDate(task);
    const deadline = getTaskDeadline(task);
    if (
      scheduleDate &&
      deadline &&
      scheduleDate > getDeadlineDateKey(deadline)
    ) {
      conflicts.push({
        id: `after-deadline:${task.id}`,
        kind: "after_deadline",
        date: scheduleDate,
        message: `${task.title} is planned after its deadline.`,
        sourceIds: [task.id],
      });
    }
  }
  const byDate = new Map<string, TimeBlock[]>();
  for (const block of blocks) {
    byDate.set(block.date, [...(byDate.get(block.date) ?? []), block]);
  }
  for (const [date, dayBlocks] of byDate) {
    const sorted = [...dayBlocks].sort((a, b) => a.start - b.start);
    for (let left = 0; left < sorted.length; left += 1) {
      for (let right = left + 1; right < sorted.length; right += 1) {
        const first = sorted[left];
        const second = sorted[right];
        if (second.start >= first.end) break;
        if (first.id === second.id && first.kind === second.kind) continue;
        const kind =
          first.kind === "event" && second.kind === "event"
            ? "event_event"
            : first.kind === "task" && second.kind === "task"
              ? "task_task"
              : "task_event";
        conflicts.push({
          id: `${kind}:${date}:${first.kind}:${first.id}:${second.kind}:${second.id}`,
          kind,
          date,
          message: `${first.title} overlaps ${second.title}.`,
          sourceIds: [first.id, second.id],
        });
      }
    }
  }
  return conflicts;
}
