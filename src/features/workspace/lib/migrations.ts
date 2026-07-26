import type { ResolveData } from "@/features/workspace/types";

export const CURRENT_WORKSPACE_SCHEMA_VERSION = 4;

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

const MIGRATIONS: Record<
  number,
  (value: unknown, timeZone: string) => unknown
> = {
  0: passThroughMigration,
  1: passThroughMigration,
  2: passThroughMigration,
  3: migrateV3ToV4,
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
  if (!Array.isArray(data.tasks)) errors.push("Tasks are malformed.");
  if (!Array.isArray(data.goals)) errors.push("Goals are malformed.");
  if (!Array.isArray(data.modules)) errors.push("Modules are malformed.");
  if (!Array.isArray(data.events)) errors.push("Events are malformed.");
  if (!data.preferences?.timeZone) errors.push("Workspace timezone is missing.");
  const ids = new Set<string>();
  for (const task of data.tasks) {
    if (!task.id || ids.has(`task:${task.id}`)) {
      errors.push("Tasks contain a missing or duplicate identifier.");
      break;
    }
    ids.add(`task:${task.id}`);
  }
  return { valid: errors.length === 0, errors };
}
