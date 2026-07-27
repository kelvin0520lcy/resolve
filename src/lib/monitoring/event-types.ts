export const OPERATIONAL_EVENT_NAMES = [
  "client_runtime_error",
  "workspace_migration_failed",
  "workspace_sync_retry_exhausted",
  "workspace_conflict_failed",
  "workspace_import_failed",
] as const;

export type OperationalEventName =
  (typeof OPERATIONAL_EVENT_NAMES)[number];
