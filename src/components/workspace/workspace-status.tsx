"use client";

import { AlertTriangle, Check, CloudOff, RefreshCw, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useResolve } from "@/contexts/resolve-context";

function preview(value: unknown) {
  if (value === undefined) return "Not set";
  if (typeof value === "string") return value || "Empty";
  const json = JSON.stringify(value);
  return json.length > 140 ? `${json.slice(0, 137)}…` : json;
}

export function WorkspaceStatus() {
  const {
    syncStatus,
    syncError,
    conflicts,
    resolveConflict,
    canUndo,
    undoLastChange,
    workspaceSize,
    exportWorkspace,
  } = useResolve();
  const conflict = conflicts[0];
  const needsSizeWarning =
    workspaceSize.state === "archive_recommended" ||
    workspaceSize.state === "approaching_limit";

  return (
    <>
      <div
        className="pointer-events-none fixed bottom-24 right-4 z-[60] flex max-w-[min(24rem,calc(100vw-2rem))] flex-col items-end gap-2 lg:bottom-5"
        aria-live="polite"
      >
        {canUndo && (
          <div className="pointer-events-auto flex items-center gap-3 rounded-2xl border-2 border-border bg-[#18121f] px-4 py-3 text-xs font-bold text-white shadow-xl">
            Change saved locally.
            <Button size="sm" variant="secondary" onClick={undoLastChange}>
              <RotateCcw className="h-3.5 w-3.5" />
              Undo
            </Button>
          </div>
        )}
        {needsSizeWarning && (
          <div className="pointer-events-auto rounded-2xl border-2 border-warning/70 bg-[#18121f] p-4 text-white shadow-xl">
            <div className="flex items-start gap-3">
              <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-warning" />
              <div>
                <p className="text-sm font-black">
                  Workspace is {workspaceSize.percentage}% of its safe budget
                </p>
                <p className="mt-1 text-xs leading-5 text-white/70">
                  Archive a completed semester soon. Essential edits remain
                  available and Resolve will never delete data automatically.
                </p>
                <button
                  type="button"
                  onClick={exportWorkspace}
                  className="mt-2 text-xs font-black text-warning underline underline-offset-4"
                >
                  Export a backup now
                </button>
              </div>
            </div>
          </div>
        )}
        {(syncStatus === "offline" || syncStatus === "error") && syncError && (
          <div className="pointer-events-auto flex items-start gap-3 rounded-2xl border-2 border-danger/60 bg-[#18121f] p-4 text-white shadow-xl">
            <CloudOff className="mt-0.5 h-5 w-5 shrink-0 text-danger" />
            <div>
              <p className="text-sm font-black">Cloud sync needs attention</p>
              <p className="mt-1 text-xs leading-5 text-white/70">{syncError}</p>
            </div>
          </div>
        )}
      </div>

      {conflict && (
        <div
          className="fixed inset-0 z-[80] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-labelledby="workspace-conflict-title"
        >
          <div className="manga-panel max-h-[min(42rem,calc(100vh-2rem))] w-full max-w-2xl overflow-y-auto rounded-[28px] p-5 sm:p-7">
            <div className="flex items-start gap-3">
              <RefreshCw className="mt-1 h-6 w-6 shrink-0 text-warning" />
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-warning">
                  Sync review · {conflicts.length} remaining
                </p>
                <h2 id="workspace-conflict-title" className="mt-1 font-display text-3xl">
                  This changed in two places
                </h2>
                <p className="mt-2 text-sm leading-6 text-muted">
                  Resolve merged the safe changes. Choose which value to keep
                  for this {conflict.entityType} field.
                </p>
              </div>
            </div>

            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              <button
                type="button"
                onClick={() => resolveConflict(conflict.id, "local")}
                className="rounded-2xl border-2 border-accent/50 bg-accent/8 p-4 text-left transition hover:border-accent"
              >
                <span className="text-[10px] font-black uppercase tracking-wider text-accent">
                  Keep this device
                </span>
                <span className="mt-2 block break-words text-sm font-bold leading-6">
                  {preview(conflict.localValue)}
                </span>
              </button>
              <button
                type="button"
                onClick={() => resolveConflict(conflict.id, "remote")}
                className="rounded-2xl border-2 border-border bg-surface p-4 text-left transition hover:border-warning"
              >
                <span className="text-[10px] font-black uppercase tracking-wider text-warning">
                  Keep cloud value
                </span>
                <span className="mt-2 block break-words text-sm font-bold leading-6">
                  {preview(conflict.remoteValue)}
                </span>
              </button>
            </div>
            <p className="mt-4 flex items-center gap-2 text-xs text-muted">
              <Check className="h-4 w-4 text-success" />
              Other records and fields were preserved automatically.
            </p>
          </div>
        </div>
      )}
    </>
  );
}
