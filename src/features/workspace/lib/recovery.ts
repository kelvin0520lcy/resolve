import { CURRENT_WORKSPACE_SCHEMA_VERSION } from "@/features/workspace/lib/migrations";
import {
  getDerivedDeadlines,
  getTaskEstimatedMinutes,
  getTaskScheduleDate,
} from "@/features/workspace/lib/deadlines";
import type { ResolveData } from "@/features/workspace/types";

export type RecoverySnapshotReason = "migration" | "import" | "manual";

export type RecoverySnapshot = {
  id: string;
  ownerId?: string;
  schemaVersion: number;
  createdAt: string;
  reason: RecoverySnapshotReason;
  workspaceHash: string;
  payload: unknown;
};

const DB_NAME = "resolve-recovery";
const STORE_NAME = "snapshots";
const DB_VERSION = 1;
export const MAX_RECOVERY_SNAPSHOTS = 4;

export function hashWorkspace(value: unknown) {
  const input = JSON.stringify(value) ?? "null";
  let hash = 0x811c9dc5;
  for (let index = 0; index < input.length; index += 1) {
    hash ^= input.charCodeAt(index);
    hash = Math.imul(hash, 0x01000193);
  }
  return (hash >>> 0).toString(16).padStart(8, "0");
}

export function createRecoverySnapshot(
  payload: unknown,
  reason: RecoverySnapshotReason,
  schemaVersion = CURRENT_WORKSPACE_SCHEMA_VERSION,
  now = new Date().toISOString(),
  ownerId?: string,
): RecoverySnapshot {
  const workspaceHash = hashWorkspace(payload);
  return {
    id: `${reason}-${schemaVersion}-${now}-${workspaceHash}`,
    ownerId,
    schemaVersion,
    createdAt: now,
    reason,
    workspaceHash,
    payload:
      payload === undefined ? null : JSON.parse(JSON.stringify(payload)),
  };
}

function openDatabase() {
  return new Promise<IDBDatabase>((resolve, reject) => {
    if (!globalThis.indexedDB) {
      reject(new Error("IndexedDB is unavailable."));
      return;
    }
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = () => {
      if (!request.result.objectStoreNames.contains(STORE_NAME)) {
        request.result.createObjectStore(STORE_NAME, { keyPath: "id" });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error ?? new Error("Recovery storage failed."));
  });
}

async function withStore<T>(
  mode: IDBTransactionMode,
  execute: (store: IDBObjectStore, resolve: (value: T) => void, reject: (error: unknown) => void) => void,
) {
  const database = await openDatabase();
  return new Promise<T>((resolve, reject) => {
    const transaction = database.transaction(STORE_NAME, mode);
    const store = transaction.objectStore(STORE_NAME);
    execute(store, resolve, reject);
    transaction.oncomplete = () => database.close();
    transaction.onerror = () => reject(transaction.error);
  });
}

export async function listRecoverySnapshots(): Promise<RecoverySnapshot[]> {
  return withStore<RecoverySnapshot[]>("readonly", (store, resolve, reject) => {
    const request = store.getAll();
    request.onsuccess = () =>
      resolve(
        (request.result as RecoverySnapshot[]).sort((a, b) =>
          b.createdAt.localeCompare(a.createdAt),
        ),
      );
    request.onerror = () => reject(request.error);
  });
}

export async function deleteRecoverySnapshot(id: string) {
  return withStore<void>("readwrite", (store, resolve, reject) => {
    const request = store.delete(id);
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

export async function saveRecoverySnapshot(snapshot: RecoverySnapshot) {
  await withStore<void>("readwrite", (store, resolve, reject) => {
    const request = store.put(snapshot);
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
  const snapshots = await listRecoverySnapshots();
  const sameOwner = snapshots.filter(
    (item) => item.ownerId === snapshot.ownerId,
  );
  const removable = sameOwner.slice(MAX_RECOVERY_SNAPSHOTS);
  await Promise.all(removable.map((item) => deleteRecoverySnapshot(item.id)));
}

export function snapshotBelongsToIdentity(
  snapshot: RecoverySnapshot,
  identity: string,
) {
  if (snapshot.ownerId) return snapshot.ownerId === identity;
  if (
    snapshot.payload &&
    typeof snapshot.payload === "object" &&
    !Array.isArray(snapshot.payload)
  ) {
    const payload = snapshot.payload as {
      semester?: { userId?: unknown };
      data?: { semester?: { userId?: unknown } };
    };
    return (
      payload.semester?.userId === identity ||
      payload.data?.semester?.userId === identity
    );
  }
  return false;
}

export async function listRecoverySnapshotsForIdentity(identity: string) {
  const snapshots = await listRecoverySnapshots();
  return snapshots.filter((snapshot) =>
    snapshotBelongsToIdentity(snapshot, identity),
  );
}

export async function deleteLocalAccountData(identity: string) {
  if (typeof window !== "undefined") {
    try {
      const exactKeys = [
        `resolve-data-v2:${identity}`,
        `resolve-sync-base-v1:${identity}`,
        `resolve-sync-v2:${identity}`,
        `resolve-sync-leader:${identity}`,
        "resolve-focus-session-v1",
      ];
      exactKeys.forEach((key) => window.localStorage.removeItem(key));
      for (
        let index = window.localStorage.length - 1;
        index >= 0;
        index -= 1
      ) {
        const key = window.localStorage.key(index);
        if (key?.startsWith("resolve-reflection-draft:")) {
          window.localStorage.removeItem(key);
        }
      }
    } catch {
      // Authentication deletion has already succeeded. Treat browser storage
      // cleanup as best effort when a browser blocks localStorage access.
    }
  }
  try {
    const snapshots = await listRecoverySnapshotsForIdentity(identity);
    await Promise.all(
      snapshots
        .map((snapshot) => deleteRecoverySnapshot(snapshot.id)),
    );
  } catch {
    // Account deletion must still complete when browser recovery storage is
    // unavailable. Browser storage can be cleared manually by the user.
  }
}

export function downloadWorkspaceJson(
  payload: unknown,
  filename = `resolve-workspace-${new Date().toISOString().slice(0, 10)}.json`,
) {
  const blob = new Blob([JSON.stringify(payload, null, 2)], {
    type: "application/json",
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

export function downloadWorkspaceText(payload: string, filename: string) {
  const blob = new Blob([payload], {
    type: "application/json;charset=utf-8",
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

function csvCell(value: unknown) {
  const text = value === undefined || value === null ? "" : String(value);
  return `"${text.replaceAll('"', '""')}"`;
}

export function downloadTasksCsv(data: ResolveData) {
  const header = [
    "id",
    "title",
    "category",
    "priority",
    "status",
    "scheduled_date",
    "start_time",
    "estimated_minutes",
    "actual_minutes",
    "deadline_kind",
    "deadline",
    "goal_id",
    "milestone_id",
    "origin",
  ];
  const rows = data.tasks.map((task) => {
    const deadline = task.deadlineInfo;
    return [
      task.id,
      task.title,
      task.category,
      task.priority,
      task.status,
      task.schedule?.date ?? task.scheduledDate,
      task.schedule?.startTime,
      task.schedule?.estimatedMinutes ?? task.estimatedMinutes,
      task.actualMinutes,
      deadline?.kind,
      deadline?.kind === "date" ? deadline.date : deadline?.at ?? task.deadline,
      task.goalId,
      task.milestoneId,
      task.origin?.kind,
    ];
  });
  const csv = [header, ...rows]
    .map((row) => row.map(csvCell).join(","))
    .join("\r\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `resolve-tasks-${new Date().toISOString().slice(0, 10)}.csv`;
  link.click();
  URL.revokeObjectURL(url);
}

function icsText(value: string) {
  return value
    .replaceAll("\\", "\\\\")
    .replaceAll("\n", "\\n")
    .replaceAll(",", "\\,")
    .replaceAll(";", "\\;");
}

function compactDate(date: string) {
  return date.replaceAll("-", "");
}

function nextDate(date: string) {
  const value = new Date(`${date}T12:00:00Z`);
  value.setUTCDate(value.getUTCDate() + 1);
  return value.toISOString().slice(0, 10);
}

function utcDateTime(at: string) {
  return new Date(at)
    .toISOString()
    .replaceAll("-", "")
    .replaceAll(":", "")
    .replace(".000", "");
}

const ICS_WEEKDAYS = ["SU", "MO", "TU", "WE", "TH", "FR", "SA"];

export function workspaceToIcs(data: ResolveData) {
  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Resolve!//Semester Workspace//EN",
    "CALSCALE:GREGORIAN",
  ];
  const addEvent = (eventLines: string[]) =>
    lines.push("BEGIN:VEVENT", ...eventLines, "END:VEVENT");

  for (const task of data.tasks) {
    const date = getTaskScheduleDate(task);
    if (!date || ["cancelled", "skipped"].includes(task.status)) continue;
    const startTime = task.schedule?.startTime;
    addEvent([
      `UID:task-schedule-${task.id}@resolve`,
      `SUMMARY:${icsText(task.title)}`,
      startTime
        ? `DTSTART;TZID=${icsText(task.schedule?.timeZone ?? data.preferences.timeZone)}:${compactDate(date)}T${startTime.replace(":", "")}00`
        : `DTSTART;VALUE=DATE:${compactDate(date)}`,
      startTime
        ? `DURATION:PT${getTaskEstimatedMinutes(task) ?? 30}M`
        : `DTEND;VALUE=DATE:${compactDate(nextDate(date))}`,
      `DESCRIPTION:${icsText(`${task.priority} priority Resolve task`)}`,
    ]);
  }

  for (const deadline of getDerivedDeadlines(data)) {
    addEvent([
      `UID:deadline-${deadline.id}@resolve`,
      `SUMMARY:${icsText(`Due: ${deadline.title}`)}`,
      deadline.deadline.kind === "date"
        ? `DTSTART;VALUE=DATE:${compactDate(deadline.deadline.date)}`
        : `DTSTART:${utcDateTime(deadline.deadline.at)}`,
      ...(deadline.deadline.kind === "date"
        ? [
            `DTEND;VALUE=DATE:${compactDate(
              nextDate(deadline.deadline.date),
            )}`,
          ]
        : []),
      `URL:${deadline.sourceHref}`,
    ]);
  }

  for (const event of data.events) {
    const startDate =
      event.recurrence.kind === "none"
        ? event.date
        : event.recurrence.startsOn;
    const datePrefix = event.startTime
      ? `DTSTART;TZID=${icsText(event.timeZone)}:${compactDate(startDate)}T${event.startTime.replace(":", "")}00`
      : `DTSTART;VALUE=DATE:${compactDate(startDate)}`;
    const recurrence =
      event.recurrence.kind === "none"
        ? []
        : [
            `RRULE:FREQ=WEEKLY${
              event.recurrence.kind === "fortnightly" ? ";INTERVAL=2" : ""
            };BYDAY=${event.recurrence.weekdays
              .map((day) => ICS_WEEKDAYS[day])
              .join(",")}${
              event.recurrence.endsOn
                ? `;UNTIL=${compactDate(event.recurrence.endsOn)}T235959Z`
                : ""
            }`,
            ...(event.recurrence.excludedDates?.length
              ? [
                  event.startTime
                    ? `EXDATE;TZID=${icsText(event.timeZone)}:${event.recurrence.excludedDates
                        .map(
                          (date) =>
                            `${compactDate(date)}T${event.startTime!.replace(":", "")}00`,
                        )
                        .join(",")}`
                    : `EXDATE;VALUE=DATE:${event.recurrence.excludedDates
                        .map(compactDate)
                        .join(",")}`,
                ]
              : []),
          ];
    addEvent([
      `UID:event-${event.id}@resolve`,
      `SUMMARY:${icsText(event.title)}`,
      datePrefix,
      ...(event.startTime
        ? [`DURATION:PT${event.durationMinutes ?? 30}M`]
        : [`DTEND;VALUE=DATE:${compactDate(nextDate(startDate))}`]),
      ...recurrence,
    ]);
  }

  lines.push("END:VCALENDAR");
  return `${lines.join("\r\n")}\r\n`;
}

export function downloadCalendarIcs(data: ResolveData) {
  const blob = new Blob([workspaceToIcs(data)], {
    type: "text/calendar;charset=utf-8",
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `resolve-calendar-${new Date().toISOString().slice(0, 10)}.ics`;
  link.click();
  URL.revokeObjectURL(url);
}
