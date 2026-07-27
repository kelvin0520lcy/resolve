import type { ResolveData } from "@/features/workspace/types";
import type { DeadlineValue, Task } from "@/types";

export type DerivedDeadlineSource =
  | "assessment"
  | "task"
  | "goal"
  | "milestone"
  | "application"
  | "event";

export type DerivedDeadline = {
  id: string;
  sourceType: DerivedDeadlineSource;
  sourceId: string;
  sourceHref: string;
  title: string;
  deadline: DeadlineValue;
  status: string;
  state: "active" | "done" | "dismissed";
  context?: string;
};

function deadlineState(status: string): DerivedDeadline["state"] {
  if (["completed", "submitted", "graded", "closed"].includes(status)) {
    return "done";
  }
  if (["cancelled", "skipped", "abandoned", "paused"].includes(status)) {
    return "dismissed";
  }
  return "active";
}

export function dateDeadline(date: string): DeadlineValue {
  return { kind: "date", date };
}

export function getTaskScheduleDate(task: Task) {
  return task.schedule?.date ?? task.scheduledDate;
}

export function getTaskEstimatedMinutes(task: Task) {
  return task.schedule?.estimatedMinutes ?? task.estimatedMinutes;
}

export function getTaskDeadline(task: Task): DeadlineValue | undefined {
  return task.deadlineInfo ?? (task.deadline ? dateDeadline(task.deadline) : undefined);
}

export function getDeadlineDateKey(deadline: DeadlineValue) {
  return deadline.kind === "date"
    ? deadline.date
    : new Intl.DateTimeFormat("en-CA", {
        timeZone: deadline.timeZone,
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
      }).format(new Date(deadline.at));
}

export function getDeadlineSortKey(
  deadline: DeadlineValue,
  dateOnlyTimeZone = "UTC",
) {
  if (deadline.kind === "dateTime") return Date.parse(deadline.at);
  try {
    return (
      Date.parse(
        zonedLocalDateTimeToIso(
          deadline.date,
          "23:59",
          dateOnlyTimeZone,
        ),
      ) + 59_999
    );
  } catch {
    // A historical timezone can skip a whole local date. Keep sorting stable
    // without changing the date-only value stored for display/editing.
    return Date.parse(`${deadline.date}T23:59:59.999Z`);
  }
}

export function formatDeadline(
  deadline: DeadlineValue,
  locale?: string,
) {
  if (deadline.kind === "date") {
    return new Intl.DateTimeFormat(locale, {
      year: "numeric",
      month: "short",
      day: "numeric",
      timeZone: "UTC",
    }).format(new Date(`${deadline.date}T12:00:00Z`));
  }
  return new Intl.DateTimeFormat(locale, {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    timeZone: deadline.timeZone,
  }).format(new Date(deadline.at));
}

export function zonedLocalDateTimeToIso(
  date: string,
  time: string,
  timeZone: string,
) {
  const [year, month, day] = date.split("-").map(Number);
  const [hour, minute] = time.split(":").map(Number);
  if (
    !year ||
    !month ||
    !day ||
    !Number.isFinite(hour) ||
    !Number.isFinite(minute)
  ) {
    throw new Error("A valid date and time are required.");
  }
  const target = Date.UTC(year, month - 1, day, hour, minute);
  const formatter = new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  });
  const offsetAt = (instant: number) => {
    const values = Object.fromEntries(
      formatter
        .formatToParts(new Date(instant))
        .filter((part) => part.type !== "literal")
        .map((part) => [part.type, Number(part.value)]),
    );
    return (
      Date.UTC(
        values.year,
        values.month - 1,
        values.day,
        values.hour,
        values.minute,
      ) - instant
    );
  };
  let instant = target - offsetAt(target);
  instant = target - offsetAt(instant);
  const result = new Date(instant);
  const parts = Object.fromEntries(
    formatter
      .formatToParts(result)
      .filter((part) => part.type !== "literal")
      .map((part) => [part.type, part.value]),
  );
  if (
    `${parts.year}-${parts.month}-${parts.day}` !== date ||
    `${parts.hour}:${parts.minute}` !== time
  ) {
    throw new Error(
      "That local time does not exist in the selected time zone because of a clock change.",
    );
  }
  const localSignature = `${date}T${time}`;
  const signatureAt = (candidate: number) => {
    const candidateParts = Object.fromEntries(
      formatter
        .formatToParts(new Date(candidate))
        .filter((part) => part.type !== "literal")
        .map((part) => [part.type, part.value]),
    );
    return `${candidateParts.year}-${candidateParts.month}-${candidateParts.day}T${candidateParts.hour}:${candidateParts.minute}`;
  };
  const isAmbiguous = [30, 60, 90, 120].some(
    (minutes) =>
      signatureAt(instant - minutes * 60_000) === localSignature ||
      signatureAt(instant + minutes * 60_000) === localSignature,
  );
  if (isAmbiguous) {
    throw new Error(
      "That local time occurs twice because of a clock change. Choose a time outside the repeated interval.",
    );
  }
  return result.toISOString();
}

export function getDeadlineLocalTime(deadline: DeadlineValue) {
  if (deadline.kind === "date") return "";
  return new Intl.DateTimeFormat("en-GB", {
    timeZone: deadline.timeZone,
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).format(new Date(deadline.at));
}

export function getDerivedDeadlines(data: ResolveData): DerivedDeadline[] {
  const records: DerivedDeadline[] = [];
  const add = (record: DerivedDeadline) => records.push(record);

  for (const task of data.tasks) {
    const deadline = getTaskDeadline(task);
    if (!deadline) continue;
    add({
      id: `task:${task.id}:deadline`,
      sourceType: "task",
      sourceId: task.id,
      sourceHref: `/today?task=${encodeURIComponent(task.id)}`,
      title: task.title,
      deadline,
      status: task.status,
      state: deadlineState(task.status),
      context: "Task",
    });
  }

  for (const goal of data.goals) {
    const deadline =
      goal.deadlineInfo ?? (goal.deadline ? dateDeadline(goal.deadline) : undefined);
    if (!deadline) continue;
    add({
      id: `goal:${goal.id}:deadline`,
      sourceType: "goal",
      sourceId: goal.id,
      sourceHref: `/goals?goal=${encodeURIComponent(goal.id)}`,
      title: goal.title,
      deadline,
      status: goal.status,
      state: deadlineState(goal.status),
      context: "Goal",
    });
  }

  for (const milestone of data.milestones) {
    const deadline =
      milestone.deadlineInfo ??
      (milestone.deadline ? dateDeadline(milestone.deadline) : undefined);
    if (!deadline) continue;
    add({
      id: `milestone:${milestone.id}:deadline`,
      sourceType: "milestone",
      sourceId: milestone.id,
      sourceHref: `/goals?milestone=${encodeURIComponent(milestone.id)}`,
      title: milestone.title,
      deadline,
      status: milestone.completed ? "completed" : "active",
      state: milestone.completed ? "done" : "active",
      context: "Goal breakdown",
    });
  }

  for (const moduleRecord of data.modules) {
    for (const assessment of moduleRecord.assessments) {
      const deadline =
        assessment.deadlineInfo ?? dateDeadline(assessment.deadline);
      add({
        id: `assessment:${assessment.id}:deadline`,
        sourceType: "assessment",
        sourceId: assessment.id,
        sourceHref: `/academics?assessment=${encodeURIComponent(assessment.id)}`,
        title: assessment.title,
        deadline,
        status: assessment.status,
        state: deadlineState(assessment.status),
        context: `${moduleRecord.code} assessment`,
      });
    }
  }

  for (const application of data.applications) {
    const deadline =
      application.nextActionDeadline ??
      (application.nextActionDate
        ? dateDeadline(application.nextActionDate)
        : undefined);
    if (!deadline || !application.nextAction) continue;
    add({
      id: `application:${application.id}:nextAction`,
      sourceType: "application",
      sourceId: application.id,
      sourceHref: `/career?application=${encodeURIComponent(application.id)}`,
      title: application.nextAction,
      deadline,
      status: application.stage,
      state: deadlineState(application.stage),
      context: `${application.company} · ${application.role}`,
    });
  }

  for (const event of data.events) {
    if (event.recurrence.kind !== "none") continue;
    add({
      id: `event:${event.id}:date`,
      sourceType: "event",
      sourceId: event.id,
      sourceHref: `/weekly?event=${encodeURIComponent(event.id)}`,
      title: event.title,
      deadline: dateDeadline(event.date),
      status: "scheduled",
      state: "active",
      context: "Fixed event",
    });
  }

  return records.sort((a, b) => {
    const due =
      getDeadlineSortKey(a.deadline, data.preferences.timeZone) -
      getDeadlineSortKey(b.deadline, data.preferences.timeZone);
    return due || a.id.localeCompare(b.id);
  });
}

export function isDeadlineComplete(deadline: DerivedDeadline) {
  return deadline.state === "done";
}

export function isDeadlineActive(deadline: DerivedDeadline) {
  return deadline.state === "active";
}
