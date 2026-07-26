import type { GuitarLearningState } from "@/features/guitar-learning/types";
import type { ResolveData } from "@/features/workspace/types";

export type WorkspaceEntityType =
  | "workspace"
  | "semester"
  | "resolution"
  | "task"
  | "goal"
  | "milestone"
  | "habit"
  | "habitLog"
  | "module"
  | "assessment"
  | "event"
  | "reflection"
  | "guitarSession"
  | "guitarLearning"
  | "algorithmLog"
  | "application";

export type WorkspacePatch = {
  id: string;
  entityType: WorkspaceEntityType;
  entityId: string;
  operation: "create" | "update" | "delete";
  changedFields?: Record<string, unknown>;
  baseValues?: Record<string, unknown>;
  createdAt: string;
  clientId: string;
};

export type WorkspaceConflict = {
  id: string;
  patchId: string;
  entityType: WorkspaceEntityType;
  entityId: string;
  field: string;
  baseValue: unknown;
  localValue: unknown;
  remoteValue: unknown;
};

type EntityRecord = Record<string, unknown> & { id: string };

function clone<T>(value: T): T {
  if (value === undefined) return value;
  return JSON.parse(JSON.stringify(value)) as T;
}

function equal(a: unknown, b: unknown) {
  return JSON.stringify(a) === JSON.stringify(b);
}

function record(value: unknown): EntityRecord | undefined {
  return value &&
    typeof value === "object" &&
    !Array.isArray(value) &&
    typeof (value as { id?: unknown }).id === "string"
    ? (value as EntityRecord)
    : undefined;
}

export function getWorkspaceEntities(
  data: ResolveData,
): Map<string, { entityType: WorkspaceEntityType; entity: EntityRecord }> {
  const entities = new Map<
    string,
    { entityType: WorkspaceEntityType; entity: EntityRecord }
  >();
  const add = (entityType: WorkspaceEntityType, candidate: unknown) => {
    const entity = record(candidate);
    if (entity) entities.set(`${entityType}:${entity.id}`, { entityType, entity });
  };

  add("workspace", {
    id: "workspace",
    weeklyPriorities: data.weeklyPriorities,
    preferences: data.preferences,
    archiveSummaries: data.archiveSummaries,
  });
  const { resolutions = [], ...semester } = data.semester;
  add("semester", semester);
  resolutions.forEach((item) => add("resolution", item));
  data.tasks.forEach((item) => add("task", item));
  data.goals.forEach((item) => add("goal", item));
  data.milestones.forEach((item) => add("milestone", item));
  data.habits.forEach((item) => add("habit", item));
  data.habitLogs.forEach((item) => add("habitLog", item));
  data.modules.forEach((item) => {
    const { assessments, ...module } = item;
    add("module", module);
    assessments.forEach((assessment) => add("assessment", assessment));
  });
  data.events.forEach((item) => add("event", item));
  data.reflections.forEach((item) => add("reflection", item));
  data.guitarSessions.forEach((item) => add("guitarSession", item));
  add("guitarLearning", {
    id: "guitar-learning",
    value: data.guitarLearning,
  });
  data.algorithmLogs.forEach((item) => add("algorithmLog", item));
  data.applications.forEach((item) => add("application", item));
  return entities;
}

export function buildWorkspacePatches(
  base: ResolveData,
  next: ResolveData,
  clientId: string,
  createdAt = new Date().toISOString(),
): WorkspacePatch[] {
  const baseEntities = getWorkspaceEntities(base);
  const nextEntities = getWorkspaceEntities(next);
  const keys = new Set([...baseEntities.keys(), ...nextEntities.keys()]);
  const patches: WorkspacePatch[] = [];

  for (const key of keys) {
    const before = baseEntities.get(key);
    const after = nextEntities.get(key);
    const entityType = (after ?? before)!.entityType;
    const entityId = (after ?? before)!.entity.id;
    const id = `${key}:${createdAt}:${clientId}`;
    if (!before && after) {
      patches.push({
        id,
        entityType,
        entityId,
        operation: "create",
        changedFields: clone(after.entity),
        createdAt,
        clientId,
      });
      continue;
    }
    if (before && !after) {
      patches.push({
        id,
        entityType,
        entityId,
        operation: "delete",
        baseValues: clone(before.entity),
        createdAt,
        clientId,
      });
      continue;
    }
    if (!before || !after || equal(before.entity, after.entity)) continue;

    const fields = new Set([
      ...Object.keys(before.entity),
      ...Object.keys(after.entity),
    ]);
    const changedFields: Record<string, unknown> = {};
    const baseValues: Record<string, unknown> = {};
    for (const field of fields) {
      if (field === "id") continue;
      if (!equal(before.entity[field], after.entity[field])) {
        changedFields[field] = clone(after.entity[field]);
        baseValues[field] = clone(before.entity[field]);
      }
    }
    patches.push({
      id,
      entityType,
      entityId,
      operation: "update",
      changedFields,
      baseValues,
      createdAt,
      clientId,
    });
  }
  return patches;
}

function findEntity(
  data: ResolveData,
  entityType: WorkspaceEntityType,
  entityId: string,
) {
  return getWorkspaceEntities(data).get(`${entityType}:${entityId}`)?.entity;
}

function replaceInArray<T extends { id: string }>(
  items: T[],
  entity: EntityRecord,
) {
  const typed = entity as T;
  return items.some((item) => item.id === entity.id)
    ? items.map((item) => (item.id === entity.id ? typed : item))
    : [...items, typed];
}

function removeFromArray<T extends { id: string }>(items: T[], id: string) {
  return items.filter((item) => item.id !== id);
}

function putEntity(
  data: ResolveData,
  entityType: WorkspaceEntityType,
  entity: EntityRecord,
) {
  switch (entityType) {
    case "workspace":
      data.weeklyPriorities = clone(entity.weeklyPriorities) as string[];
      data.preferences = clone(entity.preferences) as ResolveData["preferences"];
      data.archiveSummaries = clone(
        entity.archiveSummaries,
      ) as ResolveData["archiveSummaries"];
      break;
    case "semester":
      data.semester = {
        ...(entity as unknown as ResolveData["semester"]),
        resolutions: data.semester.resolutions ?? [],
      };
      break;
    case "resolution":
      data.semester.resolutions = replaceInArray(
        data.semester.resolutions ?? [],
        entity,
      ) as ResolveData["semester"]["resolutions"];
      break;
    case "task":
      data.tasks = replaceInArray(data.tasks, entity);
      break;
    case "goal":
      data.goals = replaceInArray(data.goals, entity);
      break;
    case "milestone":
      data.milestones = replaceInArray(data.milestones, entity);
      break;
    case "habit":
      data.habits = replaceInArray(data.habits, entity);
      break;
    case "habitLog":
      data.habitLogs = replaceInArray(data.habitLogs, entity);
      break;
    case "module": {
      const existing = data.modules.find((item) => item.id === entity.id);
      const assessments = existing?.assessments ?? [];
      data.modules = replaceInArray(data.modules, {
        ...entity,
        assessments,
      });
      break;
    }
    case "assessment": {
      data.modules = data.modules.map((module) => ({
        ...module,
        assessments: module.assessments.filter((item) => item.id !== entity.id),
      }));
      const moduleId = entity.moduleId as string;
      data.modules = data.modules.map((module) =>
        module.id === moduleId
          ? {
              ...module,
              assessments: [...module.assessments, entity as never],
            }
          : module,
      );
      break;
    }
    case "event":
      data.events = replaceInArray(data.events, entity);
      break;
    case "reflection":
      data.reflections = replaceInArray(data.reflections, entity);
      break;
    case "guitarSession":
      data.guitarSessions = replaceInArray(data.guitarSessions, entity);
      break;
    case "guitarLearning":
      data.guitarLearning = clone(entity.value) as GuitarLearningState;
      break;
    case "algorithmLog":
      data.algorithmLogs = replaceInArray(data.algorithmLogs, entity);
      break;
    case "application":
      data.applications = replaceInArray(data.applications, entity);
      break;
  }
}

function deleteEntity(
  data: ResolveData,
  entityType: WorkspaceEntityType,
  entityId: string,
) {
  switch (entityType) {
    case "workspace":
    case "semester":
    case "guitarLearning":
      return;
    case "resolution":
      data.semester.resolutions = removeFromArray(
        data.semester.resolutions ?? [],
        entityId,
      );
      break;
    case "task":
      data.tasks = removeFromArray(data.tasks, entityId);
      break;
    case "goal":
      data.goals = removeFromArray(data.goals, entityId);
      break;
    case "milestone":
      data.milestones = removeFromArray(data.milestones, entityId);
      break;
    case "habit":
      data.habits = removeFromArray(data.habits, entityId);
      break;
    case "habitLog":
      data.habitLogs = removeFromArray(data.habitLogs, entityId);
      break;
    case "module":
      data.modules = removeFromArray(data.modules, entityId);
      break;
    case "assessment":
      data.modules = data.modules.map((module) => ({
        ...module,
        assessments: removeFromArray(module.assessments, entityId),
      }));
      break;
    case "event":
      data.events = removeFromArray(data.events, entityId);
      break;
    case "reflection":
      data.reflections = removeFromArray(data.reflections, entityId);
      break;
    case "guitarSession":
      data.guitarSessions = removeFromArray(data.guitarSessions, entityId);
      break;
    case "algorithmLog":
      data.algorithmLogs = removeFromArray(data.algorithmLogs, entityId);
      break;
    case "application":
      data.applications = removeFromArray(data.applications, entityId);
      break;
  }
}

export function mergeWorkspacePatches(
  remote: ResolveData,
  patches: WorkspacePatch[],
) {
  const data = clone(remote);
  const conflicts: WorkspaceConflict[] = [];

  for (const patch of patches) {
    const remoteEntity = findEntity(data, patch.entityType, patch.entityId);
    if (patch.operation === "create") {
      const localEntity = record(patch.changedFields);
      if (!localEntity) continue;
      if (remoteEntity && !equal(remoteEntity, localEntity)) {
        conflicts.push({
          id: `${patch.id}:$record`,
          patchId: patch.id,
          entityType: patch.entityType,
          entityId: patch.entityId,
          field: "$record",
          baseValue: undefined,
          localValue: localEntity,
          remoteValue: remoteEntity,
        });
      }
      putEntity(data, patch.entityType, localEntity);
      continue;
    }
    if (patch.operation === "delete") {
      if (!remoteEntity) continue;
      if (!equal(remoteEntity, patch.baseValues)) {
        conflicts.push({
          id: `${patch.id}:$delete`,
          patchId: patch.id,
          entityType: patch.entityType,
          entityId: patch.entityId,
          field: "$delete",
          baseValue: patch.baseValues,
          localValue: undefined,
          remoteValue: remoteEntity,
        });
      } else {
        deleteEntity(data, patch.entityType, patch.entityId);
      }
      continue;
    }

    if (!remoteEntity) {
      conflicts.push({
        id: `${patch.id}:$missing`,
        patchId: patch.id,
        entityType: patch.entityType,
        entityId: patch.entityId,
        field: "$missing",
        baseValue: patch.baseValues,
        localValue: patch.changedFields,
        remoteValue: undefined,
      });
      continue;
    }
    const merged = clone(remoteEntity);
    for (const [field, localValue] of Object.entries(
      patch.changedFields ?? {},
    )) {
      const baseValue = patch.baseValues?.[field];
      const remoteValue = remoteEntity[field];
      if (!equal(remoteValue, baseValue) && !equal(remoteValue, localValue)) {
        conflicts.push({
          id: `${patch.id}:${field}`,
          patchId: patch.id,
          entityType: patch.entityType,
          entityId: patch.entityId,
          field,
          baseValue,
          localValue,
          remoteValue,
        });
      }
      merged[field] = clone(localValue);
    }
    putEntity(data, patch.entityType, merged);
  }

  return { data, conflicts };
}

export function applyConflictChoice(
  data: ResolveData,
  conflict: WorkspaceConflict,
  choice: "local" | "remote",
) {
  const next = clone(data);
  if (conflict.field === "$delete") {
    if (choice === "local") {
      deleteEntity(next, conflict.entityType, conflict.entityId);
    }
    return next;
  }
  const current = findEntity(next, conflict.entityType, conflict.entityId);
  if (conflict.field === "$missing" || conflict.field === "$record") {
    const selected = choice === "local" ? conflict.localValue : conflict.remoteValue;
    const selectedRecord = record(selected);
    if (selectedRecord) putEntity(next, conflict.entityType, selectedRecord);
    else deleteEntity(next, conflict.entityType, conflict.entityId);
    return next;
  }
  if (!current) return next;
  putEntity(next, conflict.entityType, {
    ...current,
    [conflict.field]:
      choice === "local" ? conflict.localValue : conflict.remoteValue,
  });
  return next;
}
