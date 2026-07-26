"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import type { ResolveData } from "@/features/workspace/types";
import {
  applyConflictChoice,
  buildWorkspacePatches,
  mergeWorkspacePatches,
  type WorkspaceConflict,
  type WorkspacePatch,
} from "@/features/workspace/lib/patches";
import {
  createRecoverySnapshot,
  deleteRecoverySnapshot,
  downloadCalendarIcs,
  downloadTasksCsv,
  downloadWorkspaceJson,
  listRecoverySnapshots,
  saveRecoverySnapshot,
} from "@/features/workspace/lib/recovery";
import {
  CURRENT_WORKSPACE_SCHEMA_VERSION,
  migrateWorkspaceData,
  validateWorkspaceData,
} from "@/features/workspace/lib/migrations";
import {
  estimateWorkspaceSize,
  WORKSPACE_SAFE_CEILING_BYTES,
  type WorkspaceSizeReport,
} from "@/features/workspace/lib/workspace-size";
import {
  loadWorkspace,
  saveCloudSemesterArchive,
  saveCloudRecoverySnapshot,
  syncWorkspaceTransaction,
  upgradeWorkspaceTransaction,
  WorkspaceConflictError,
} from "@/lib/firebase/workspace";
import {
  TabSyncCoordinator,
  type WorkspaceTabMessage,
} from "@/features/workspace/sync/tab-coordinator";

export const CLOUD_SAVE_DEBOUNCE_MS = 15_000;
export const CLOUD_REFRESH_INTERVAL_MS = 15 * 60_000;
const UNDO_WINDOW_MS = 8_000;

export type WorkspaceSyncStatus =
  | "demo"
  | "connecting"
  | "migrating"
  | "saving"
  | "synced"
  | "offline"
  | "conflict"
  | "error";

export type WorkspaceSyncMetrics = {
  reads: number;
  writes: number;
  conflictedFlushes: number;
  patchesFlushed: number;
  noOpFlushes: number;
};

type LocalSyncMetadata = {
  dirty: boolean;
  lastCheckedAt: number;
  baseRevision: number;
  schemaVersion: number;
  patches: WorkspacePatch[];
  metrics: WorkspaceSyncMetrics;
};

type TabPayload =
  | { patches: WorkspacePatch[] }
  | { data: ResolveData; revision: number };

const EMPTY_METRICS: WorkspaceSyncMetrics = {
  reads: 0,
  writes: 0,
  conflictedFlushes: 0,
  patchesFlushed: 0,
  noOpFlushes: 0,
};

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

function readJson<T>(key: string): T | undefined {
  try {
    const value = window.localStorage.getItem(key);
    return value ? (JSON.parse(value) as T) : undefined;
  } catch {
    return undefined;
  }
}

function writeJson(key: string, value: unknown) {
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // The in-memory workspace remains usable and the size warning explains why.
  }
}

function readMetadata(key: string): LocalSyncMetadata {
  const value = readJson<Partial<LocalSyncMetadata>>(key);
  return {
    dirty: value?.dirty === true,
    lastCheckedAt: Number.isFinite(value?.lastCheckedAt)
      ? Math.max(0, value!.lastCheckedAt!)
      : 0,
    baseRevision: Number.isFinite(value?.baseRevision)
      ? Math.max(0, value!.baseRevision!)
      : 0,
    schemaVersion: Number.isFinite(value?.schemaVersion)
      ? Math.max(0, value!.schemaVersion!)
      : 3,
    patches: Array.isArray(value?.patches) ? value!.patches! : [],
    metrics: {
      ...EMPTY_METRICS,
      ...(value?.metrics ?? {}),
    },
  };
}

export function useWorkspaceSync({
  identity,
  enabled,
  emptyData,
  normalize,
}: {
  identity: string;
  enabled: boolean;
  emptyData: ResolveData;
  normalize: (value: unknown, identity: string) => ResolveData;
}) {
  const storageKey = `resolve-data-v2:${identity}`;
  const baseKey = `resolve-sync-base-v1:${identity}`;
  const metadataKey = `resolve-sync-v2:${identity}`;
  const [data, setData] = useState(emptyData);
  const [hydrated, setHydrated] = useState(false);
  const [cloudReady, setCloudReady] = useState(false);
  const [status, setStatus] = useState<WorkspaceSyncStatus>(
    enabled ? "connecting" : "demo",
  );
  const [error, setError] = useState("");
  const [lastSyncedAt, setLastSyncedAt] = useState<string | null>(null);
  const [conflicts, setConflicts] = useState<WorkspaceConflict[]>([]);
  const [isLeader, setIsLeader] = useState(!enabled);
  const [canUndo, setCanUndo] = useState(false);
  const [metrics, setMetrics] = useState<WorkspaceSyncMetrics>(EMPTY_METRICS);
  const dataRef = useRef(data);
  const baseDataRef = useRef(emptyData);
  const baseRevisionRef = useRef(0);
  const patchesRef = useRef<WorkspacePatch[]>([]);
  const dirtyRef = useRef(false);
  const lastCheckedAtRef = useRef(0);
  const coordinatorRef = useRef<TabSyncCoordinator<TabPayload> | null>(null);
  const writeInFlightRef = useRef<Promise<void> | null>(null);
  const readInFlightRef = useRef(false);
  const activeKeyRef = useRef(storageKey);
  const undoRef = useRef<{ before: ResolveData; after: ResolveData } | null>(
    null,
  );
  const undoTimerRef = useRef<number | null>(null);
  const conflictsRef = useRef<WorkspaceConflict[]>([]);
  const metricsRef = useRef<WorkspaceSyncMetrics>(EMPTY_METRICS);
  const isLeaderRef = useRef(!enabled);
  const cloudWriteBlockedRef = useRef(false);

  const workspaceSize = useMemo<WorkspaceSizeReport>(
    () => estimateWorkspaceSize(data),
    [data],
  );

  useEffect(() => {
    dataRef.current = data;
  }, [data]);

  useEffect(() => {
    conflictsRef.current = conflicts;
  }, [conflicts]);

  useEffect(() => {
    isLeaderRef.current = isLeader;
  }, [isLeader]);

  const persistMetadata = useCallback(
    (
      dirty = dirtyRef.current,
      patches = patchesRef.current,
      checkedAt = lastCheckedAtRef.current,
      nextMetrics = metricsRef.current,
    ) => {
      dirtyRef.current = dirty;
      patchesRef.current = patches;
      lastCheckedAtRef.current = checkedAt;
      writeJson(metadataKey, {
        dirty,
        lastCheckedAt: checkedAt,
        baseRevision: baseRevisionRef.current,
        schemaVersion: CURRENT_WORKSPACE_SCHEMA_VERSION,
        patches,
        metrics: nextMetrics,
      } satisfies LocalSyncMetadata);
    },
    [metadataKey],
  );

  const updateMetrics = useCallback(
    (change: Partial<WorkspaceSyncMetrics>) => {
      setMetrics((current) => {
        const next = Object.fromEntries(
          Object.entries(current).map(([key, value]) => [
            key,
            value + (change[key as keyof WorkspaceSyncMetrics] ?? 0),
          ]),
        ) as WorkspaceSyncMetrics;
        metricsRef.current = next;
        persistMetadata(
          dirtyRef.current,
          patchesRef.current,
          lastCheckedAtRef.current,
          next,
        );
        return next;
      });
    },
    [persistMetadata],
  );

  const acceptBase = useCallback(
    (nextBase: ResolveData, revision: number, checkedAt = Date.now()) => {
      baseDataRef.current = clone(nextBase);
      baseRevisionRef.current = revision;
      lastCheckedAtRef.current = checkedAt;
      writeJson(baseKey, nextBase);
    },
    [baseKey],
  );

  const setLocalData = useCallback(
    (next: ResolveData, { broadcast = true, undo = true } = {}) => {
      const current = dataRef.current;
      if (JSON.stringify(current) === JSON.stringify(next)) return;
      if (undo) {
        undoRef.current = { before: clone(current), after: clone(next) };
        setCanUndo(true);
        if (undoTimerRef.current !== null) {
          window.clearTimeout(undoTimerRef.current);
        }
        undoTimerRef.current = window.setTimeout(() => {
          undoRef.current = null;
          setCanUndo(false);
        }, UNDO_WINDOW_MS);
      }
      const patches = buildWorkspacePatches(
        baseDataRef.current,
        next,
        coordinatorRef.current?.tabId ?? "local-tab",
      );
      dataRef.current = next;
      setData(next);
      persistMetadata(patches.length > 0, patches);
      if (patches.length) {
        setStatus(enabled ? "saving" : "demo");
        if (broadcast) {
          coordinatorRef.current?.publish({
            type: "workspace-change",
            payload: { patches },
          });
        }
      }
    },
    [enabled, persistMetadata],
  );

  const mutateData = useCallback(
    (updater: (current: ResolveData) => ResolveData) => {
      const current = dataRef.current;
      const next = updater(current);
      if (next !== current) setLocalData(next);
    },
    [setLocalData],
  );

  const prepareRemote = useCallback(
    async (
      remote: unknown,
      schemaVersion: number,
      revision: number,
      clientId: string,
    ) => {
      let value = remote;
      let nextRevision = revision;
      if (schemaVersion > CURRENT_WORKSPACE_SCHEMA_VERSION) {
        throw new Error(
          "This workspace was saved by a newer Resolve version. Update the app before syncing.",
        );
      }
      if (schemaVersion < CURRENT_WORKSPACE_SCHEMA_VERSION) {
        setStatus("migrating");
        const snapshot = createRecoverySnapshot(
          remote,
          "migration",
          schemaVersion,
        );
        await saveRecoverySnapshot(snapshot);
        try {
          await saveCloudRecoverySnapshot(identity, snapshot);
        } catch {
          // The IndexedDB recovery copy is the required safety layer.
        }
        value = migrateWorkspaceData(
          remote,
          schemaVersion,
          dataRef.current.preferences.timeZone,
        ).data;
        const normalized = normalize(value, identity);
        const validation = validateWorkspaceData(normalized);
        if (!validation.valid) throw new Error(validation.errors.join(" "));
        const upgraded = await upgradeWorkspaceTransaction({
          userId: identity,
          expectedRevision: revision,
          data: normalized,
          clientId,
        });
        value = upgraded.data;
        nextRevision = upgraded.revision;
        updateMetrics({ reads: 1, writes: 1 });
      }
      const normalized = normalize(value, identity);
      const validation = validateWorkspaceData(normalized);
      if (!validation.valid) throw new Error(validation.errors.join(" "));
      return { data: normalized, revision: nextRevision };
    },
    [identity, normalize, updateMetrics],
  );

  const refreshFromCloud = useCallback(
    async (force = false) => {
      if (!enabled || writeInFlightRef.current || readInFlightRef.current) return;
      if (
        !force &&
        Date.now() - lastCheckedAtRef.current < CLOUD_REFRESH_INTERVAL_MS
      ) {
        setCloudReady(true);
        return;
      }
      readInFlightRef.current = true;
      setStatus("connecting");
      setError("");
      try {
        updateMetrics({ reads: 1 });
        const result = await loadWorkspace<ResolveData>(identity);
        const checkedAt = Date.now();
        if (result.kind === "missing") {
          cloudWriteBlockedRef.current = false;
          const base = clone(emptyData);
          const local = dataRef.current;
          acceptBase(base, 0, checkedAt);
          const patches = buildWorkspacePatches(
            base,
            local,
            coordinatorRef.current?.tabId ?? "local-tab",
          );
          persistMetadata(patches.length > 0, patches, checkedAt);
          setCloudReady(true);
          setStatus(patches.length ? "saving" : "synced");
          return;
        }
        const remote = await prepareRemote(
          result.snapshot.data,
          result.snapshot.schemaVersion,
          result.snapshot.revision,
          coordinatorRef.current?.tabId ?? "local-tab",
        );
        cloudWriteBlockedRef.current = false;
        const localPatches = patchesRef.current.length
          ? patchesRef.current
          : dirtyRef.current
            ? buildWorkspacePatches(
                baseDataRef.current,
                dataRef.current,
                coordinatorRef.current?.tabId ?? "local-tab",
              )
            : [];
        acceptBase(remote.data, remote.revision, checkedAt);
        if (localPatches.length) {
          const merged = mergeWorkspacePatches(remote.data, localPatches);
          dataRef.current = merged.data;
          setData(merged.data);
          const rebased = buildWorkspacePatches(
            remote.data,
            merged.data,
            coordinatorRef.current?.tabId ?? "local-tab",
          );
          setConflicts(merged.conflicts);
          persistMetadata(rebased.length > 0, rebased, checkedAt);
          setStatus(merged.conflicts.length ? "conflict" : "saving");
        } else {
          dataRef.current = remote.data;
          setData(remote.data);
          setConflicts([]);
          persistMetadata(false, [], checkedAt);
          setStatus("synced");
          setLastSyncedAt(new Date(checkedAt).toISOString());
        }
        setCloudReady(true);
      } catch (caught: unknown) {
        const message =
          caught instanceof Error
            ? caught.message
            : "Could not check the cloud workspace.";
        setCloudReady(true);
        const permanentlyBlocked = message.includes("newer Resolve version");
        cloudWriteBlockedRef.current = permanentlyBlocked;
        setStatus(permanentlyBlocked ? "error" : "offline");
        setError(message);
      } finally {
        readInFlightRef.current = false;
      }
    },
    [
      acceptBase,
      emptyData,
      enabled,
      identity,
      persistMetadata,
      prepareRemote,
      updateMetrics,
    ],
  );

  const flushToCloud = useCallback(async () => {
    if (!enabled) return;
    if (cloudWriteBlockedRef.current) {
      setStatus("error");
      return;
    }
    if (!isLeaderRef.current) {
      coordinatorRef.current?.requestSync();
      return;
    }
    if (conflictsRef.current.length) {
      setStatus("conflict");
      return;
    }
    if (writeInFlightRef.current) return writeInFlightRef.current;

    const snapshot = clone(dataRef.current);
    const patches = buildWorkspacePatches(
      baseDataRef.current,
      snapshot,
      coordinatorRef.current?.tabId ?? "local-tab",
    );
    if (!patches.length) {
      persistMetadata(false, []);
      setStatus("synced");
      updateMetrics({ noOpFlushes: 1 });
      return;
    }
    setStatus("saving");
    setError("");
    const write = (async () => {
      try {
        const result = await syncWorkspaceTransaction({
          userId: identity,
          localData: snapshot,
          baseRevision: baseRevisionRef.current,
          patches,
          clientId: coordinatorRef.current?.tabId ?? "local-tab",
        });
        updateMetrics({
          reads: 1,
          writes: 1,
          patchesFlushed: patches.length,
        });
        const current = dataRef.current;
        const afterSnapshotPatches = buildWorkspacePatches(
          snapshot,
          current,
          coordinatorRef.current?.tabId ?? "local-tab",
        );
        const latest = afterSnapshotPatches.length
          ? mergeWorkspacePatches(result.data, afterSnapshotPatches).data
          : result.data;
        acceptBase(result.data, result.revision);
        dataRef.current = latest;
        setData(latest);
        const pending = buildWorkspacePatches(
          result.data,
          latest,
          coordinatorRef.current?.tabId ?? "local-tab",
        );
        persistMetadata(pending.length > 0, pending, Date.now());
        const savedAt = Date.now();
        setLastSyncedAt(new Date(savedAt).toISOString());
        setStatus(pending.length ? "saving" : "synced");
        coordinatorRef.current?.publish({
          type: "sync-complete",
          payload: { data: result.data, revision: result.revision },
        });
      } catch (caught: unknown) {
        if (caught instanceof WorkspaceConflictError) {
          updateMetrics({ reads: 1, conflictedFlushes: 1 });
          acceptBase(caught.remoteData, caught.remoteRevision);
          dataRef.current = caught.mergedData;
          setData(caught.mergedData);
          setConflicts(caught.conflicts);
          const rebased = buildWorkspacePatches(
            caught.remoteData,
            caught.mergedData,
            coordinatorRef.current?.tabId ?? "local-tab",
          );
          persistMetadata(true, rebased);
          setStatus("conflict");
          setError(caught.message);
          return;
        }
        setStatus("offline");
        setError(
          caught instanceof Error
            ? caught.message
            : "Cloud sync failed. Changes remain saved in this browser.",
        );
        persistMetadata(true, patches);
      }
    })();
    writeInFlightRef.current = write;
    try {
      await write;
    } finally {
      if (writeInFlightRef.current === write) writeInFlightRef.current = null;
    }
  }, [
    acceptBase,
    enabled,
    identity,
    persistMetadata,
    updateMetrics,
  ]);

  useEffect(() => {
    activeKeyRef.current = storageKey;
    let cancelled = false;
    const hydrate = async () => {
      const metadata = readMetadata(metadataKey);
      const legacyMetadata =
        window.localStorage.getItem(metadataKey) === null
          ? readJson<{ dirty?: boolean; lastCheckedAt?: number }>(
              `resolve-sync-v1:${identity}`,
            )
          : undefined;
      if (legacyMetadata) {
        metadata.dirty = legacyMetadata.dirty === true;
        metadata.lastCheckedAt = Number.isFinite(legacyMetadata.lastCheckedAt)
          ? legacyMetadata.lastCheckedAt!
          : 0;
        metadata.schemaVersion = 3;
      }
      const raw = readJson<unknown>(storageKey);
      const storedBase = readJson<unknown>(baseKey);
      let local = clone(emptyData);
      let base = clone(emptyData);
      try {
        if (raw !== undefined) {
          let candidate: unknown = raw;
          if (metadata.schemaVersion < CURRENT_WORKSPACE_SCHEMA_VERSION) {
            const snapshot = createRecoverySnapshot(
              raw,
              "migration",
              metadata.schemaVersion,
            );
            await saveRecoverySnapshot(snapshot);
            candidate = migrateWorkspaceData(
              raw,
              metadata.schemaVersion,
              emptyData.preferences.timeZone,
            ).data;
          }
          local = normalize(candidate, identity);
        }
        base =
          storedBase !== undefined
            ? normalize(storedBase, identity)
            : metadata.dirty
              ? clone(emptyData)
              : local;
        const validation = validateWorkspaceData(local);
        if (!validation.valid) throw new Error(validation.errors.join(" "));
      } catch (caught: unknown) {
        const snapshot = createRecoverySnapshot(
          raw,
          "migration",
          metadata.schemaVersion,
        );
        try {
          await saveRecoverySnapshot(snapshot);
        } catch {
          // The raw localStorage payload is still left untouched for recovery.
        }
        if (!cancelled) {
          setStatus("error");
          setError(
            caught instanceof Error
              ? `Workspace recovery is required: ${caught.message}`
              : "Workspace recovery is required.",
          );
        }
      }
      if (cancelled || activeKeyRef.current !== storageKey) return;
      dataRef.current = local;
      baseDataRef.current = base;
      baseRevisionRef.current = metadata.baseRevision;
      patchesRef.current = metadata.dirty
        ? metadata.patches.length
          ? metadata.patches
          : buildWorkspacePatches(base, local, "recovered-tab")
        : [];
      dirtyRef.current = patchesRef.current.length > 0;
      lastCheckedAtRef.current = metadata.lastCheckedAt;
      setMetrics(metadata.metrics);
      metricsRef.current = metadata.metrics;
      setData(local);
      setHydrated(true);
      setLastSyncedAt(
        metadata.lastCheckedAt
          ? new Date(metadata.lastCheckedAt).toISOString()
          : null,
      );
      persistMetadata(dirtyRef.current, patchesRef.current);
      if (!enabled) {
        setCloudReady(true);
        setStatus("demo");
      } else if (
        storedBase !== undefined &&
        Date.now() - metadata.lastCheckedAt < CLOUD_REFRESH_INTERVAL_MS
      ) {
        setCloudReady(true);
        setStatus(dirtyRef.current ? "saving" : "synced");
      } else {
        await refreshFromCloud(true);
      }
    };
    void hydrate();
    return () => {
      cancelled = true;
    };
  }, [
    baseKey,
    emptyData,
    enabled,
    identity,
    metadataKey,
    normalize,
    persistMetadata,
    refreshFromCloud,
    storageKey,
  ]);

  useEffect(() => {
    if (!enabled) return;
    const coordinator = new TabSyncCoordinator<TabPayload>(identity);
    coordinatorRef.current = coordinator;
    coordinator.start(setIsLeader, (message: WorkspaceTabMessage<TabPayload>) => {
      if (!message.payload) {
        if (message.type === "sync-request" && isLeaderRef.current) {
          void flushToCloud();
        }
        return;
      }
      if (message.type === "workspace-change" && "patches" in message.payload) {
        const merged = mergeWorkspacePatches(
          dataRef.current,
          message.payload.patches,
        );
        dataRef.current = merged.data;
        setData(merged.data);
        if (merged.conflicts.length) {
          setConflicts((current) => [...current, ...merged.conflicts]);
          setStatus("conflict");
        }
        const patches = buildWorkspacePatches(
          baseDataRef.current,
          merged.data,
          coordinator.tabId,
        );
        persistMetadata(patches.length > 0, patches);
      }
      if (message.type === "sync-complete" && "data" in message.payload) {
        const localPatches = buildWorkspacePatches(
          baseDataRef.current,
          dataRef.current,
          coordinator.tabId,
        );
        acceptBase(message.payload.data, message.payload.revision);
        const merged = mergeWorkspacePatches(message.payload.data, localPatches);
        dataRef.current = merged.data;
        setData(merged.data);
        setConflicts(merged.conflicts);
        const patches = buildWorkspacePatches(
          message.payload.data,
          merged.data,
          coordinator.tabId,
        );
        persistMetadata(patches.length > 0, patches);
        setStatus(
          merged.conflicts.length
            ? "conflict"
            : patches.length
              ? "saving"
              : "synced",
        );
      }
    });
    return () => {
      coordinator.stop();
      if (coordinatorRef.current === coordinator) coordinatorRef.current = null;
    };
  }, [acceptBase, enabled, flushToCloud, identity, persistMetadata]);

  useEffect(() => {
    if (hydrated) writeJson(storageKey, data);
  }, [data, hydrated, storageKey]);

  useEffect(() => {
    if (!enabled || !hydrated || !cloudReady || !dirtyRef.current || !isLeader) {
      return;
    }
    if (conflicts.length) return;
    const timer = window.setTimeout(() => void flushToCloud(), CLOUD_SAVE_DEBOUNCE_MS);
    return () => window.clearTimeout(timer);
  }, [
    cloudReady,
    conflicts.length,
    data,
    enabled,
    flushToCloud,
    hydrated,
    isLeader,
  ]);

  useEffect(() => {
    if (!enabled || !hydrated || !cloudReady) return;
    const refreshIfStale = () => {
      if (
        document.visibilityState === "visible" &&
        !dirtyRef.current &&
        Date.now() - lastCheckedAtRef.current >= CLOUD_REFRESH_INTERVAL_MS
      ) {
        void refreshFromCloud();
      }
    };
    const timer = window.setInterval(refreshIfStale, CLOUD_REFRESH_INTERVAL_MS);
    window.addEventListener("focus", refreshIfStale);
    document.addEventListener("visibilitychange", refreshIfStale);
    return () => {
      window.clearInterval(timer);
      window.removeEventListener("focus", refreshIfStale);
      document.removeEventListener("visibilitychange", refreshIfStale);
    };
  }, [cloudReady, enabled, hydrated, refreshFromCloud]);

  useEffect(
    () => () => {
      if (undoTimerRef.current !== null) window.clearTimeout(undoTimerRef.current);
    },
    [],
  );

  const resolveConflict = useCallback(
    (conflictId: string, choice: "local" | "remote") => {
      const conflict = conflictsRef.current.find((item) => item.id === conflictId);
      if (!conflict) return;
      const next = applyConflictChoice(dataRef.current, conflict, choice);
      const remaining = conflictsRef.current.filter((item) => item.id !== conflictId);
      dataRef.current = next;
      setData(next);
      setConflicts(remaining);
      const patches = buildWorkspacePatches(
        baseDataRef.current,
        next,
        coordinatorRef.current?.tabId ?? "local-tab",
      );
      persistMetadata(patches.length > 0, patches);
      setStatus(remaining.length ? "conflict" : patches.length ? "saving" : "synced");
    },
    [persistMetadata],
  );

  const undoLastChange = useCallback(() => {
    const undo = undoRef.current;
    if (!undo || JSON.stringify(dataRef.current) !== JSON.stringify(undo.after)) {
      return;
    }
    undoRef.current = null;
    setCanUndo(false);
    setLocalData(undo.before, { undo: false });
  }, [setLocalData]);

  const importWorkspace = useCallback(
    async (value: unknown) => {
      const backup = createRecoverySnapshot(
        dataRef.current,
        "import",
        CURRENT_WORKSPACE_SCHEMA_VERSION,
      );
      await saveRecoverySnapshot(backup);
      const envelope =
        value && typeof value === "object" && !Array.isArray(value)
          ? (value as { data?: unknown; schemaVersion?: unknown })
          : undefined;
      const payload =
        envelope && "data" in envelope ? envelope.data : value;
      const sourceVersion =
        typeof envelope?.schemaVersion === "number"
          ? envelope.schemaVersion
          : CURRENT_WORKSPACE_SCHEMA_VERSION;
      const migrated = migrateWorkspaceData(
        payload,
        sourceVersion,
        dataRef.current.preferences.timeZone,
      );
      const normalized = normalize(migrated.data, identity);
      const validation = validateWorkspaceData(normalized);
      if (!validation.valid) throw new Error(validation.errors.join(" "));
      const importedSize = estimateWorkspaceSize(normalized);
      if (
        importedSize.estimatedFirestoreBytes > WORKSPACE_SAFE_CEILING_BYTES
      ) {
        throw new Error(
          "This backup is larger than Resolve's safe active-workspace limit. Archive or trim the source workspace before importing it.",
        );
      }
      setLocalData(normalized);
    },
    [identity, normalize, setLocalData],
  );

  const archiveWorkspace = useCallback(
    async (next: ResolveData) => {
      const snapshot = createRecoverySnapshot(
        dataRef.current,
        "manual",
        CURRENT_WORKSPACE_SCHEMA_VERSION,
      );
      await saveRecoverySnapshot(snapshot);
      if (enabled) {
        await saveCloudSemesterArchive(identity, dataRef.current);
        updateMetrics({ writes: 1 });
      }
      setLocalData(next);
    },
    [enabled, identity, setLocalData, updateMetrics],
  );

  return {
    data,
    hydrated,
    storageMode: enabled ? ("cloud" as const) : ("browser" as const),
    syncStatus: status,
    syncError: error,
    lastSyncedAt,
    conflicts,
    isSyncLeader: isLeader,
    workspaceSize,
    syncMetrics: metrics,
    canUndo,
    mutateData,
    syncWorkspaceNow: async () => {
      if (dirtyRef.current) await flushToCloud();
      else await refreshFromCloud(true);
    },
    resolveConflict,
    undoLastChange,
    exportWorkspace: () =>
      downloadWorkspaceJson({
        product: "Resolve!",
        schemaVersion: CURRENT_WORKSPACE_SCHEMA_VERSION,
        exportedAt: new Date().toISOString(),
        data: dataRef.current,
      }),
    exportTasksCsv: () => downloadTasksCsv(dataRef.current),
    exportCalendarIcs: () => downloadCalendarIcs(dataRef.current),
    importWorkspace,
    archiveWorkspace,
    listRecoverySnapshots,
    deleteRecoverySnapshot,
  };
}
