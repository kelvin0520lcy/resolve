"use client";

import { useState } from "react";
import { AlertTriangle, Download, RefreshCw, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { fieldClassName } from "@/components/ui/resolve";
import type { WorkspaceRecoveryState } from "@/features/workspace/sync/use-workspace-sync";

export function WorkspaceRecovery({
  recovery,
  downloadRaw,
  retry,
  restoreLatest,
  startFresh,
}: {
  recovery: WorkspaceRecoveryState;
  downloadRaw: () => void;
  retry: () => void;
  restoreLatest: () => Promise<void>;
  startFresh: () => Promise<void>;
}) {
  const [confirmation, setConfirmation] = useState("");
  const [actionError, setActionError] = useState("");
  const [restoring, setRestoring] = useState(false);

  async function handleRestore() {
    setActionError("");
    setRestoring(true);
    try {
      await restoreLatest();
    } catch (error) {
      setActionError(
        error instanceof Error ? error.message : "Could not restore the backup.",
      );
      setRestoring(false);
    }
  }

  async function handleStartFresh() {
    setActionError("");
    setRestoring(true);
    try {
      await startFresh();
    } catch (error) {
      setActionError(
        error instanceof Error
          ? error.message
          : "Could not safely start a fresh workspace.",
      );
      setRestoring(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-background p-4 sm:p-8">
      <section
        className="manga-panel w-full max-w-2xl rounded-[28px] p-5 sm:p-8"
        aria-labelledby="workspace-recovery-title"
      >
        <div className="flex items-start gap-4">
          <span className="rounded-2xl bg-warning/15 p-3 text-warning">
            <AlertTriangle className="h-7 w-7" />
          </span>
          <div className="min-w-0">
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-warning">
              Protected recovery mode
            </p>
            <h1
              id="workspace-recovery-title"
              className="mt-1 font-display text-3xl sm:text-4xl"
            >
              Your workspace was not replaced
            </h1>
            <p className="mt-3 text-sm leading-6 text-muted">
              Resolve could not safely migrate or validate the saved workspace.
              Editing and cloud sync are paused, and the original browser data
              remains untouched.
            </p>
          </div>
        </div>

        <div className="mt-5 rounded-2xl border border-warning/35 bg-warning/8 p-4">
          <p className="text-xs font-black uppercase tracking-wider text-warning">
            What failed
          </p>
          <p className="mt-2 break-words text-sm leading-6">{recovery.message}</p>
          <p className="mt-2 text-xs text-muted">
            Saved schema: {recovery.schemaVersion}
            {recovery.snapshotId ? " · Recovery copy secured" : ""}
          </p>
        </div>

        {actionError && (
          <p className="mt-4 rounded-xl border border-danger/40 bg-danger/10 p-3 text-sm text-danger">
            {actionError}
          </p>
        )}

        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          <Button type="button" onClick={downloadRaw}>
            <Download className="h-4 w-4" />
            Download untouched data
          </Button>
          <Button type="button" variant="secondary" onClick={retry}>
            <RefreshCw className="h-4 w-4" />
            Retry migration
          </Button>
          <Button
            type="button"
            variant="secondary"
            disabled={restoring}
            onClick={() => void handleRestore()}
          >
            <RotateCcw className="h-4 w-4" />
            {restoring ? "Restoring…" : "Restore latest recovery copy"}
          </Button>
        </div>

        <div className="mt-7 border-t border-border pt-5">
          <label className="text-sm font-bold" htmlFor="fresh-workspace-confirm">
            Start with an empty browser workspace
          </label>
          <p className="mt-1 text-xs leading-5 text-muted">
            Download the untouched data first. Then type START FRESH to enable
            this destructive recovery option.
          </p>
          <div className="mt-3 flex flex-col gap-2 sm:flex-row">
            <input
              id="fresh-workspace-confirm"
              className={fieldClassName}
              value={confirmation}
              onChange={(event) => setConfirmation(event.target.value)}
              placeholder="START FRESH"
              autoComplete="off"
            />
            <Button
              type="button"
              variant="destructive"
              disabled={confirmation !== "START FRESH" || restoring}
              onClick={() => void handleStartFresh()}
            >
              {restoring ? "Preparing…" : "Start fresh"}
            </Button>
          </div>
        </div>
      </section>
    </main>
  );
}
