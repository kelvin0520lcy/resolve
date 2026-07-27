import type { ResolveData } from "@/features/workspace/types";
import { isDateKey, isValidTimeZone } from "@/lib/date";

export const CURRENT_WORKSPACE_SCHEMA_VERSION = 6;

export type WorkspaceMigrationResult = {
  data: unknown;
  fromVersion: number;
  toVersion: number;
  migrated: boolean;
};

type JsonObject = Record<string, unknown>;

function clone<T>(value: T): T {
  if (value === undefined) return value;
  return JSON.parse(JSON.stringify(value)) as T;
}

function object(value: unknown): JsonObject | undefined {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as JsonObject)
    : undefined;
}

function list(value: unknown) {
  return Array.isArray(value) ? value : [];
}

const passThroughMigration = (value: unknown) => clone(value);

function migrateV3ToV4(value: unknown, timeZone: string) {
  const root = object(clone(value)) ?? {};
  const tasks = list(root.tasks).map((candidate) => {
    const task = object(candidate);
    if (!task) return candidate;
    const scheduledDate =
      typeof task.scheduledDate === "string" ? task.scheduledDate : undefined;
    const deadline =
      typeof task.deadline === "string" ? task.deadline : undefined;
    return {
      ...task,
      schedule:
        object(task.schedule) ??
        (scheduledDate
          ? {
              date: scheduledDate,
              estimatedMinutes:
                typeof task.estimatedMinutes === "number"
                  ? task.estimatedMinutes
                  : undefined,
              timeZone,
            }
          : undefined),
      deadlineInfo:
        object(task.deadlineInfo) ??
        (deadline ? { kind: "date", date: deadline } : undefined),
      prerequisiteTaskIds: Array.isArray(task.prerequisiteTaskIds)
        ? task.prerequisiteTaskIds
        : [],
      requiredForMilestone: task.requiredForMilestone === true,
      deferral: object(task.deferral) ?? { deferCount: 0 },
    };
  });
  const withDateDeadline = (candidate: unknown) => {
    const record = object(candidate);
    if (!record) return candidate;
    return {
      ...record,
      deadlineInfo:
        object(record.deadlineInfo) ??
        (typeof record.deadline === "string"
          ? { kind: "date", date: record.deadline }
          : undefined),
    };
  };
  const modules = list(root.modules).map((candidate) => {
    const moduleRecord = object(candidate);
    if (!moduleRecord) return candidate;
    return {
      ...moduleRecord,
      assessments: list(moduleRecord.assessments).map((assessment) => {
        const record = withDateDeadline(assessment);
        const assessmentRecord = object(record);
        return assessmentRecord
          ? {
              ...assessmentRecord,
              preparation:
                object(assessmentRecord.preparation) ?? {
                  generatedTaskIds: [],
                },
            }
          : record;
      }),
    };
  });

  return {
    ...root,
    tasks,
    goals: list(root.goals).map(withDateDeadline),
    milestones: list(root.milestones).map((candidate) => {
      const milestone = object(withDateDeadline(candidate));
      return milestone
        ? {
            ...milestone,
            completionMode:
              milestone.completionMode === "required_tasks"
                ? "required_tasks"
                : "manual",
          }
        : candidate;
    }),
    modules,
    applications: list(root.applications).map((candidate) => {
      const application = object(candidate);
      if (!application) return candidate;
      return {
        ...application,
        nextActionDeadline:
          object(application.nextActionDeadline) ??
          (typeof application.nextActionDate === "string"
            ? { kind: "date", date: application.nextActionDate }
            : undefined),
      };
    }),
    events: list(root.events),
    preferences: {
      timeZone,
      dailyCapacityMinutes: 480,
      autoNextAction: true,
      ...(object(root.preferences) ?? {}),
    },
    archiveSummaries: list(root.archiveSummaries),
  };
}

function migrateV4ToV5(value: unknown) {
  const root = object(clone(value)) ?? {};
  const milestones = list(root.milestones);
  const milestoneIds = new Set(
    milestones
      .map((candidate) => object(candidate)?.id)
      .filter((id): id is string => typeof id === "string"),
  );
  return {
    ...root,
    tasks: list(root.tasks).map((candidate) => {
      const task = object(candidate);
      if (!task) return candidate;
      const milestoneId =
        typeof task.milestoneId === "string" &&
        milestoneIds.has(task.milestoneId)
          ? task.milestoneId
          : undefined;
      return {
        ...task,
        milestoneId,
        requiredForMilestone:
          Boolean(milestoneId) && task.requiredForMilestone === true,
      };
    }),
    modules: list(root.modules),
    moduleStudyLogs: list(root.moduleStudyLogs),
  };
}

function migrateV5ToV6(value: unknown) {
  const root = object(clone(value)) ?? {};
  return {
    ...root,
    weeklyPrioritiesByWeek:
      object(root.weeklyPrioritiesByWeek) ?? {},
  };
}

const MIGRATIONS: Record<
  number,
  (value: unknown, timeZone: string) => unknown
> = {
  0: passThroughMigration,
  1: passThroughMigration,
  2: passThroughMigration,
  3: migrateV3ToV4,
  4: migrateV4ToV5,
  5: migrateV5ToV6,
};

export function migrateWorkspaceData(
  value: unknown,
  fromVersion: number,
  timeZone = "Asia/Kuala_Lumpur",
): WorkspaceMigrationResult {
  if (fromVersion > CURRENT_WORKSPACE_SCHEMA_VERSION) {
    throw new Error("This workspace was created by a newer Resolve version.");
  }
  let data = clone(value);
  let version = Math.max(0, Math.floor(fromVersion));
  while (version < CURRENT_WORKSPACE_SCHEMA_VERSION) {
    const migration = MIGRATIONS[version];
    if (!migration) {
      throw new Error(`No migration is available for workspace schema ${version}.`);
    }
    data = migration(data, timeZone);
    version += 1;
  }
  return {
    data,
    fromVersion,
    toVersion: version,
    migrated: fromVersion !== version,
  };
}

export function validateWorkspaceData(data: ResolveData) {
  const errors: string[] = [];
  if (!data.semester?.id) errors.push("The active semester is missing.");
  if (
    !isDateKey(data.semester?.startDate) ||
    !isDateKey(data.semester?.endDate) ||
    data.semester.endDate <= data.semester.startDate
  ) {
    errors.push("The active semester date range is invalid.");
  }
  if (!Array.isArray(data.tasks)) errors.push("Tasks are malformed.");
  if (!Array.isArray(data.goals)) errors.push("Goals are malformed.");
  if (!Array.isArray(data.modules)) errors.push("Modules are malformed.");
  if (!Array.isArray(data.moduleStudyLogs)) {
    errors.push("Module study logs are malformed.");
  }
  if (!Array.isArray(data.events)) errors.push("Events are malformed.");
  if (!data.preferences?.timeZone) errors.push("Workspace timezone is missing.");
  for (const [weekStart, priorities] of Object.entries(
    data.weeklyPrioritiesByWeek,
  )) {
    if (
      !isDateKey(weekStart) ||
      !Array.isArray(priorities) ||
      priorities.length !== 3 ||
      priorities.some((priority) => typeof priority !== "string")
    ) {
      errors.push(`Weekly priorities for ${weekStart} are invalid.`);
    }
  }

  const checkIds = (label: string, records: { id: string }[]) => {
    const ids = new Set<string>();
    for (const record of records) {
      if (!record.id || ids.has(record.id)) {
        errors.push(`${label} contain a missing or duplicate identifier.`);
        return;
      }
      ids.add(record.id);
    }
  };
  checkIds("Tasks", data.tasks);
  checkIds("Goals", data.goals);
  checkIds("Milestones", data.milestones);
  checkIds("Habits", data.habits);
  checkIds("Habit logs", data.habitLogs);
  checkIds("Modules", data.modules);
  checkIds("Module study logs", data.moduleStudyLogs);
  checkIds("Events", data.events);
  checkIds("Reflections", data.reflections);
  checkIds("Guitar sessions", data.guitarSessions);
  checkIds("Algorithm logs", data.algorithmLogs);
  checkIds("Applications", data.applications);
  checkIds("Archive summaries", data.archiveSummaries);
  checkIds("Semester resolutions", data.semester.resolutions ?? []);

  const goalIds = new Set(data.goals.map((goal) => goal.id));
  const milestoneIds = new Set(data.milestones.map((milestone) => milestone.id));
  const taskIds = new Set(data.tasks.map((task) => task.id));
  const habitIds = new Set(data.habits.map((habit) => habit.id));
  const moduleIds = new Set(data.modules.map((module) => module.id));
  const milestonesById = new Map(
    data.milestones.map((milestone) => [milestone.id, milestone]),
  );
  const assessmentModuleById = new Map<string, string>();
  const seenHabitDates = new Set<string>();
  for (const milestone of data.milestones) {
    if (!goalIds.has(milestone.goalId)) {
      errors.push(`Milestone ${milestone.id} refers to a missing goal.`);
    }
  }
  for (const task of data.tasks) {
    if (!task.title.trim()) errors.push(`Task ${task.id} has no title.`);
    if (task.goalId && !goalIds.has(task.goalId)) {
      errors.push(`Task ${task.id} refers to a missing goal.`);
    }
    if (task.milestoneId && !milestoneIds.has(task.milestoneId)) {
      errors.push(`Task ${task.id} refers to a missing milestone.`);
    }
    if (
      task.milestoneId &&
      milestonesById.get(task.milestoneId)?.goalId !== task.goalId
    ) {
      errors.push(`Task ${task.id} links a milestone from another goal.`);
    }
    if (task.requiredForMilestone && !task.milestoneId) {
      errors.push(`Task ${task.id} is required but has no milestone.`);
    }
    if (
      task.schedule &&
      (!isDateKey(task.schedule.date) ||
        (task.schedule.estimatedMinutes !== undefined &&
          (!Number.isFinite(task.schedule.estimatedMinutes) ||
            task.schedule.estimatedMinutes < 5 ||
            task.schedule.estimatedMinutes > 720)))
    ) {
      errors.push(`Task ${task.id} has an invalid schedule.`);
    }
    if (
      (task.prerequisiteTaskIds ?? []).some(
        (id) => id === task.id || !taskIds.has(id),
      )
    ) {
      errors.push(`Task ${task.id} has an invalid prerequisite.`);
    }
  }
  for (const log of data.habitLogs) {
    if (!habitIds.has(log.habitId) || !isDateKey(log.date)) {
      errors.push(`Habit log ${log.id} is invalid.`);
    }
    const habitDate = `${log.habitId}:${log.date}`;
    if (seenHabitDates.has(habitDate)) {
      errors.push(`Habit ${log.habitId} has duplicate logs for ${log.date}.`);
    }
    seenHabitDates.add(habitDate);
  }
  for (const moduleRecord of data.modules) {
    for (const assessment of moduleRecord.assessments) {
      if (
        !assessment.id ||
        assessmentModuleById.has(assessment.id) ||
        assessment.moduleId !== moduleRecord.id ||
        !isDateKey(assessment.deadline) ||
        assessment.progress < 0 ||
        assessment.progress > 100
      ) {
        errors.push(`Module ${moduleRecord.id} has an invalid assessment.`);
      }
      assessmentModuleById.set(assessment.id, moduleRecord.id);
    }
  }
  for (const task of data.tasks) {
    if (task.origin?.kind !== "assessment-preparation") continue;
    if (
      assessmentModuleById.get(task.origin.assessmentId) !==
        task.origin.moduleId ||
      !moduleIds.has(task.origin.moduleId)
    ) {
      errors.push(`Task ${task.id} has a stale assessment relationship.`);
    }
  }
  for (const log of data.moduleStudyLogs) {
    if (
      !moduleIds.has(log.moduleId) ||
      !isDateKey(log.date) ||
      !Number.isFinite(log.minutes) ||
      log.minutes <= 0
    ) {
      errors.push(`Module study log ${log.id} is invalid.`);
    }
    if (log.sourceTaskId && !taskIds.has(log.sourceTaskId)) {
      errors.push(`Module study log ${log.id} refers to a missing task.`);
    }
  }
  for (const event of data.events) {
    if (!event.title.trim() || !isDateKey(event.date)) {
      errors.push(`Event ${event.id} is invalid.`);
    }
    if (
      event.recurrence.kind !== "none" &&
      (!isDateKey(event.recurrence.startsOn) ||
        event.recurrence.weekdays.length === 0 ||
        (event.recurrence.endsOn !== undefined &&
          (!isDateKey(event.recurrence.endsOn) ||
            event.recurrence.endsOn < event.recurrence.startsOn)) ||
        event.recurrence.weekdays.some(
          (day) => !Number.isInteger(day) || day < 0 || day > 6,
        ))
    ) {
      errors.push(`Event ${event.id} has an invalid recurrence.`);
    }
  }
  for (const reflection of data.reflections) {
    if (
      !isDateKey(reflection.periodStart) ||
      !isDateKey(reflection.periodEnd) ||
      reflection.periodEnd < reflection.periodStart
    ) {
      errors.push(`Reflection ${reflection.id} has an invalid period.`);
    }
  }
  return { valid: errors.length === 0, errors: [...new Set(errors)] };
}

export function validateWorkspacePayloadShape(
  value: unknown,
  options: { allowMissingLegacyFields?: boolean } = {},
) {
  const root = object(value);
  if (!root) {
    return { valid: false, errors: ["The workspace payload is not an object."] };
  }
  const errors: string[] = [];
  const allowMissingLegacyFields =
    options.allowMissingLegacyFields === true;
  const validTime = (candidate: unknown) =>
    typeof candidate === "string" &&
    /^([01]\d|2[0-3]):[0-5]\d$/.test(candidate);
  const validTimestamp = (candidate: unknown) =>
    typeof candidate === "string" &&
    candidate.trim().length > 0 &&
    !Number.isNaN(Date.parse(candidate));
  const validDeadline = (candidate: unknown) => {
    const deadline = object(candidate);
    if (!deadline) return false;
    return deadline.kind === "date"
      ? isDateKey(deadline.date)
      : deadline.kind === "dateTime" &&
          validTimestamp(deadline.at) &&
          isValidTimeZone(deadline.timeZone);
  };
  const hasText = (record: JsonObject, key: string) =>
    typeof record[key] === "string" &&
    Boolean((record[key] as string).trim());
  const validateRecords = (
    key: string,
    required: (record: JsonObject) => boolean,
  ) => {
    const candidates = root[key];
    if (!Array.isArray(candidates)) {
      if (!(allowMissingLegacyFields && candidates === undefined)) {
        errors.push(`${key} must be an array.`);
      }
      return [] as JsonObject[];
    }
    const records: JsonObject[] = [];
    const ids = new Set<string>();
    candidates.forEach((candidate, index) => {
      const record = object(candidate);
      if (!record) {
        errors.push(`${key}[${index}] must be an object.`);
        return;
      }
      if (!hasText(record, "id")) {
        errors.push(`${key}[${index}] is missing a valid identifier.`);
      } else if (ids.has(record.id as string)) {
        errors.push(`${key} contains duplicate identifier ${record.id}.`);
      } else {
        ids.add(record.id as string);
      }
      if (!required(record)) {
        errors.push(`${key}[${index}] is missing required data.`);
      }
      records.push(record);
    });
    return records;
  };

  const semester = object(root.semester);
  if (!semester) {
    if (!(allowMissingLegacyFields && root.semester === undefined)) {
      errors.push("The semester record is missing.");
    }
  } else {
    if (
      !hasText(semester, "id") ||
      !isDateKey(semester.startDate) ||
      !isDateKey(semester.endDate)
    ) {
      errors.push("The semester record is malformed.");
    }
    const resolutions = semester.resolutions;
    if (resolutions !== undefined) {
      if (!Array.isArray(resolutions)) {
        errors.push("Semester resolutions must be an array.");
      } else {
        const resolutionIds = new Set<string>();
        resolutions.forEach((candidate, index) => {
          const resolution = object(candidate);
          if (
            !resolution ||
            !hasText(resolution, "id") ||
            !hasText(resolution, "title")
          ) {
            errors.push(`Semester resolution ${index + 1} is malformed.`);
            return;
          }
          if (resolutionIds.has(resolution.id as string)) {
            errors.push(
              `Semester resolutions contain duplicate identifier ${resolution.id}.`,
            );
          }
          resolutionIds.add(resolution.id as string);
        });
      }
    }
  }
  if (
    !object(root.weeklyPrioritiesByWeek) &&
    !(allowMissingLegacyFields && root.weeklyPrioritiesByWeek === undefined)
  ) {
    errors.push("weeklyPrioritiesByWeek must be an object.");
  }
  const weeklyPriorities = root.weeklyPriorities;
  if (
    (!Array.isArray(weeklyPriorities) &&
      !(allowMissingLegacyFields && weeklyPriorities === undefined)) ||
    (Array.isArray(weeklyPriorities) &&
      (weeklyPriorities.length !== 3 ||
        weeklyPriorities.some((priority) => typeof priority !== "string")))
  ) {
    errors.push("weeklyPriorities must be an array.");
  }

  const tasks = validateRecords(
    "tasks",
    (record) => hasText(record, "title"),
  );
  const goals = validateRecords(
    "goals",
    (record) => hasText(record, "title"),
  );
  const milestones = validateRecords(
    "milestones",
    (record) => hasText(record, "goalId") && hasText(record, "title"),
  );
  const habits = validateRecords(
    "habits",
    (record) =>
      hasText(record, "title") &&
      (record.scheduleType === "times_per_week"
        ? typeof record.targetFrequency === "number" &&
          Number.isFinite(record.targetFrequency) &&
          record.targetFrequency >= 1 &&
          record.targetFrequency <= 7
        : record.scheduleType === "days_of_week" &&
          Array.isArray(record.targetDays) &&
          record.targetDays.length > 0 &&
          record.targetDays.every(
            (day) =>
              typeof day === "number" &&
              Number.isInteger(day) &&
              day >= 0 &&
              day <= 6,
          )),
  );
  const habitLogs = validateRecords(
    "habitLogs",
    (record) => hasText(record, "habitId") && isDateKey(record.date),
  );
  const modules = validateRecords(
    "modules",
    (record) => hasText(record, "code") && hasText(record, "name"),
  );
  const moduleStudyLogs = validateRecords(
    "moduleStudyLogs",
    (record) =>
      hasText(record, "moduleId") &&
      isDateKey(record.date) &&
      typeof record.minutes === "number" &&
      Number.isFinite(record.minutes),
  );
  const events = validateRecords(
    "events",
    (record) => hasText(record, "title") && isDateKey(record.date),
  );
  validateRecords(
    "reflections",
    (record) =>
      isDateKey(record.periodStart) && isDateKey(record.periodEnd),
  );
  validateRecords(
    "guitarSessions",
    (record) =>
      isDateKey(record.date) &&
      hasText(record, "category") &&
      typeof record.durationMinutes === "number" &&
      Number.isFinite(record.durationMinutes),
  );
  validateRecords(
    "algorithmLogs",
    (record) =>
      hasText(record, "problemName") &&
      isDateKey(record.completedDate) &&
      typeof record.minutes === "number" &&
      Number.isFinite(record.minutes),
  );
  validateRecords(
    "applications",
    (record) =>
      hasText(record, "company") &&
      hasText(record, "role") &&
      isDateKey(record.applicationDate),
  );
  validateRecords(
    "archiveSummaries",
    (record) =>
      hasText(record, "semesterId") &&
      hasText(record, "semesterName") &&
      validTimestamp(record.archivedAt) &&
      ["completedTasks", "completedGoals", "habitCompletions", "reflectionCount"]
        .every(
          (key) =>
            typeof record[key] === "number" &&
            Number.isFinite(record[key]),
        ),
  );

  const assessmentIds = new Set<string>();
  const assessmentModuleById = new Map<string, string>();
  modules.forEach((moduleRecord, moduleIndex) => {
    if (!Array.isArray(moduleRecord.assessments)) {
      errors.push(`modules[${moduleIndex}].assessments must be an array.`);
      return;
    }
    moduleRecord.assessments.forEach((candidate, assessmentIndex) => {
      const assessment = object(candidate);
      if (
        !assessment ||
        !hasText(assessment, "id") ||
        !hasText(assessment, "title") ||
        !isDateKey(assessment.deadline)
      ) {
        errors.push(
          `modules[${moduleIndex}].assessments[${assessmentIndex}] is malformed.`,
        );
        return;
      }
      if (assessmentIds.has(assessment.id as string)) {
        errors.push(
          `Assessments contain duplicate identifier ${assessment.id}.`,
        );
      }
      assessmentIds.add(assessment.id as string);
      assessmentModuleById.set(
        assessment.id as string,
        moduleRecord.id as string,
      );
      if (
        assessment.moduleId !== undefined &&
        assessment.moduleId !== moduleRecord.id
      ) {
        errors.push(
          `Assessment ${assessment.id} refers to the wrong module.`,
        );
      }
      if (
        assessment.deadlineInfo !== undefined &&
        !validDeadline(assessment.deadlineInfo)
      ) {
        errors.push(`Assessment ${assessment.id} has an invalid deadline.`);
      }
    });
  });

  const goalIds = new Set(goals.map((record) => record.id as string));
  const milestoneById = new Map(
    milestones.map((record) => [record.id as string, record]),
  );
  const taskIds = new Set(tasks.map((record) => record.id as string));
  const habitIds = new Set(habits.map((record) => record.id as string));
  const moduleIds = new Set(modules.map((record) => record.id as string));
  const habitDatePairs = new Set<string>();

  milestones.forEach((milestone) => {
    if (!goalIds.has(milestone.goalId as string)) {
      errors.push(`Milestone ${milestone.id} refers to a missing goal.`);
    }
  });
  habitLogs.forEach((log) => {
    if (!habitIds.has(log.habitId as string)) {
      errors.push(`Habit log ${log.id} refers to a missing habit.`);
    }
    const pair = `${log.habitId}:${log.date}`;
    if (habitDatePairs.has(pair)) {
      errors.push(`Habit ${log.habitId} has duplicate logs for ${log.date}.`);
    }
    habitDatePairs.add(pair);
  });
  moduleStudyLogs.forEach((log) => {
    if (!moduleIds.has(log.moduleId as string)) {
      errors.push(`Module study log ${log.id} refers to a missing module.`);
    }
    if (
      log.sourceTaskId !== undefined &&
      (typeof log.sourceTaskId !== "string" ||
        !taskIds.has(log.sourceTaskId))
    ) {
      errors.push(`Module study log ${log.id} refers to a missing task.`);
    }
  });

  tasks.forEach((task) => {
    if (task.deadlineInfo !== undefined && !validDeadline(task.deadlineInfo)) {
      errors.push(`Task ${task.id} has an invalid deadline.`);
    }
    const schedule = object(task.schedule);
    if (
      task.schedule !== undefined &&
      (!schedule ||
        !isDateKey(schedule.date) ||
        (schedule.startTime !== undefined && !validTime(schedule.startTime)) ||
        (schedule.estimatedMinutes !== undefined &&
          (typeof schedule.estimatedMinutes !== "number" ||
            !Number.isFinite(schedule.estimatedMinutes))) ||
        !isValidTimeZone(schedule.timeZone))
    ) {
      errors.push(`Task ${task.id} has an invalid schedule.`);
    }
    if (
      task.goalId !== undefined &&
      (typeof task.goalId !== "string" || !goalIds.has(task.goalId))
    ) {
      errors.push(`Task ${task.id} refers to a missing goal.`);
    }
    if (
      task.moduleId !== undefined &&
      (typeof task.moduleId !== "string" || !moduleIds.has(task.moduleId))
    ) {
      errors.push(`Task ${task.id} refers to a missing module.`);
    }
    if (
      task.assessmentId !== undefined &&
      (typeof task.assessmentId !== "string" ||
        !assessmentModuleById.has(task.assessmentId) ||
        assessmentModuleById.get(task.assessmentId) !== task.moduleId)
    ) {
      errors.push(`Task ${task.id} refers to a missing assessment.`);
    }
    const milestone =
      typeof task.milestoneId === "string"
        ? milestoneById.get(task.milestoneId)
        : undefined;
    if (task.milestoneId !== undefined && !milestone) {
      errors.push(`Task ${task.id} refers to a missing milestone.`);
    }
    if (
      milestone &&
      task.goalId !== undefined &&
      milestone.goalId !== task.goalId
    ) {
      errors.push(`Task ${task.id} links a milestone from another goal.`);
    }
    if (task.requiredForMilestone === true && !milestone) {
      errors.push(`Task ${task.id} is required but has no milestone.`);
    }
    const origin = object(task.origin);
    if (origin?.kind === "assessment-preparation") {
      if (
        typeof origin.assessmentId !== "string" ||
        typeof origin.moduleId !== "string" ||
        assessmentModuleById.get(origin.assessmentId) !== origin.moduleId
      ) {
        errors.push(`Task ${task.id} has a stale assessment relationship.`);
      }
    }
  });

  events.forEach((event) => {
    if (event.startTime !== undefined && !validTime(event.startTime)) {
      errors.push(`Event ${event.id} has an invalid start time.`);
    }
    if (
      event.durationMinutes !== undefined &&
      (typeof event.durationMinutes !== "number" ||
        !Number.isFinite(event.durationMinutes) ||
        event.durationMinutes <= 0)
    ) {
      errors.push(`Event ${event.id} has an invalid duration.`);
    }
    if (event.timeZone !== undefined && !isValidTimeZone(event.timeZone)) {
      errors.push(`Event ${event.id} has an invalid timezone.`);
    }
    const recurrence = object(event.recurrence);
    if (!recurrence || typeof recurrence.kind !== "string") {
      errors.push(`Event ${event.id} has an invalid recurrence.`);
      return;
    }
    if (
      recurrence.kind !== "none" &&
      (!["weekly", "fortnightly", "selected_weekdays"].includes(
        recurrence.kind,
      ) ||
        !isDateKey(recurrence.startsOn) ||
        !Array.isArray(recurrence.weekdays) ||
        recurrence.weekdays.length === 0 ||
        recurrence.weekdays.some(
          (day) =>
            typeof day !== "number" ||
            !Number.isInteger(day) ||
            day < 0 ||
            day > 6,
        ) ||
        (recurrence.endsOn !== undefined && !isDateKey(recurrence.endsOn)) ||
        (recurrence.excludedDates !== undefined &&
          (!Array.isArray(recurrence.excludedDates) ||
            recurrence.excludedDates.some((date) => !isDateKey(date)))))
    ) {
      errors.push(`Event ${event.id} has an invalid recurrence.`);
    }
  });

  const preferences = object(root.preferences);
  if (!preferences) {
    if (!(allowMissingLegacyFields && root.preferences === undefined)) {
      errors.push("preferences must be an object.");
    }
  } else if (!isValidTimeZone(preferences.timeZone)) {
    errors.push("preferences.timeZone must be a valid timezone.");
  } else if (
    preferences.pinnedTaskId !== undefined &&
    (typeof preferences.pinnedTaskId !== "string" ||
      !taskIds.has(preferences.pinnedTaskId))
  ) {
    errors.push("preferences.pinnedTaskId refers to a missing task.");
  }
  if (
    !object(root.guitarLearning) &&
    !(allowMissingLegacyFields && root.guitarLearning === undefined)
  ) {
    errors.push("guitarLearning must be an object.");
  }
  return { valid: errors.length === 0, errors: [...new Set(errors)] };
}
