export const WORKSPACE_SAFE_CEILING_BYTES = 820 * 1024;
export const WORKSPACE_HARD_CEILING_BYTES = 950 * 1024;
export const MAX_OVERSIZE_MUTATION_GROWTH_BYTES = 4 * 1024;

export type WorkspaceSizeState =
  | "healthy"
  | "growing"
  | "archive_recommended"
  | "approaching_limit";

export type WorkspaceSizeReport = {
  jsonBytes: number;
  estimatedFirestoreBytes: number;
  percentage: number;
  state: WorkspaceSizeState;
};

export function estimateWorkspaceSize(value: unknown): WorkspaceSizeReport {
  const json = JSON.stringify(value);
  const jsonBytes = new TextEncoder().encode(json).byteLength;
  // Field names and Firestore value metadata add overhead that raw JSON misses.
  const estimatedFirestoreBytes = Math.ceil(jsonBytes * 1.18 + 4096);
  const percentage = Math.min(
    100,
    Math.round((estimatedFirestoreBytes / WORKSPACE_SAFE_CEILING_BYTES) * 100),
  );
  const state: WorkspaceSizeState =
    percentage >= 85
      ? "approaching_limit"
      : percentage >= 70
        ? "archive_recommended"
        : percentage >= 55
          ? "growing"
          : "healthy";
  return { jsonBytes, estimatedFirestoreBytes, percentage, state };
}

export function canAddEmbeddedData(
  report: WorkspaceSizeReport,
  estimatedAdditionalBytes: number,
) {
  return (
    report.estimatedFirestoreBytes + Math.max(0, estimatedAdditionalBytes) <=
    WORKSPACE_SAFE_CEILING_BYTES
  );
}

export function canApplyWorkspaceMutation(
  current: WorkspaceSizeReport,
  next: WorkspaceSizeReport,
) {
  if (next.estimatedFirestoreBytes <= WORKSPACE_SAFE_CEILING_BYTES) return true;
  if (next.estimatedFirestoreBytes <= current.estimatedFirestoreBytes) {
    return true;
  }
  return (
    next.estimatedFirestoreBytes <= WORKSPACE_HARD_CEILING_BYTES &&
    next.estimatedFirestoreBytes - current.estimatedFirestoreBytes <=
      MAX_OVERSIZE_MUTATION_GROWTH_BYTES
  );
}
