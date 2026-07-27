"use client";

import { useEffect, useState, type ChangeEvent, type FormEvent } from "react";
import Link from "next/link";
import {
  Archive,
  CalendarDays,
  Database,
  Download,
  FileSpreadsheet,
  RefreshCw,
  RotateCcw,
  Save,
  ShieldCheck,
  Trash2,
  Upload,
} from "lucide-react";
import { PageShell } from "@/components/layout/page-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  PageIntro,
  alignedFieldLabelClassName,
  fieldClassName,
} from "@/components/ui/resolve";
import { useResolve } from "@/contexts/resolve-context";
import { useAuth } from "@/contexts/auth-context";
import { isDateKey, isValidTimeZone, offsetDate } from "@/lib/date";
import type { Semester } from "@/types";
import type { RecoverySnapshot } from "@/features/workspace/lib/recovery";
import { useDialogFocus } from "@/hooks/use-dialog-focus";

type BuildInfo = {
  version: string;
  commit: string;
  builtAt: string | null;
  startedAt: string;
  environment: string;
  schemaVersion: number;
  deploymentId: string;
};

export default function SettingsPage() {
  const { deleteAccount, isConfigured } = useAuth();
  const {
    semester,
    storageMode,
    syncStatus,
    syncError,
    lastSyncedAt,
    syncWorkspaceNow,
    workspaceSize,
    syncMetrics,
    preferences,
    updateWorkspacePreferences,
    exportWorkspace,
    exportTasksCsv,
    exportCalendarIcs,
    importWorkspace,
    listRecoverySnapshots,
    deleteRecoverySnapshot,
    archiveSemester,
    updateSemester,
    resetWorkspace,
  } = useResolve();
  const [draft, setDraft] = useState<Semester>(semester);
  const [saved, setSaved] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [confirmReset, setConfirmReset] = useState(false);
  const [accountConfirmation, setAccountConfirmation] = useState("");
  const [accountDeleteError, setAccountDeleteError] = useState("");
  const [deletingAccount, setDeletingAccount] = useState(false);
  const [dataError, setDataError] = useState("");
  const [pendingImport, setPendingImport] = useState<{
    value: unknown;
    tasks: number;
    goals: number;
    modules: number;
    habits: number;
  } | null>(null);
  const [recoverySnapshots, setRecoverySnapshots] = useState<
    RecoverySnapshot[]
  >([]);
  const [archiveOpen, setArchiveOpen] = useState(false);
  const [archiveError, setArchiveError] = useState("");
  const [nextSemesterName, setNextSemesterName] = useState("Next semester");
  const [nextAcademicYear, setNextAcademicYear] = useState(
    semester.academicYear,
  );
  const [nextStartDate, setNextStartDate] = useState(offsetDate(1));
  const [nextEndDate, setNextEndDate] = useState(offsetDate(113));
  const [timeZoneDraft, setTimeZoneDraft] = useState(preferences.timeZone);
  const [timeZoneError, setTimeZoneError] = useState("");
  const [buildInfo, setBuildInfo] = useState<BuildInfo | null>(null);
  const importDialogRef = useDialogFocus<HTMLDivElement>(
    Boolean(pendingImport),
    () => setPendingImport(null),
  );

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => setDraft(semester));
    return () => window.cancelAnimationFrame(frame);
  }, [semester]);

  useEffect(() => {
    void listRecoverySnapshots()
      .then(setRecoverySnapshots)
      .catch(() => setRecoverySnapshots([]));
  }, [listRecoverySnapshots]);

  useEffect(() => {
    const controller = new AbortController();
    void fetch("/api/version", { signal: controller.signal })
      .then((response) => (response.ok ? response.json() : null))
      .then((value: BuildInfo | null) => setBuildInfo(value))
      .catch(() => undefined);
    return () => controller.abort();
  }, []);

  async function importFile(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    setDataError("");
    try {
      const value = JSON.parse(await file.text()) as unknown;
      const envelope =
        value && typeof value === "object" && !Array.isArray(value)
          ? (value as { data?: unknown })
          : undefined;
      const payload =
        envelope && "data" in envelope ? envelope.data : value;
      const record =
        payload && typeof payload === "object" && !Array.isArray(payload)
          ? (payload as Record<string, unknown>)
          : {};
      const count = (key: string) =>
        Array.isArray(record[key]) ? record[key].length : 0;
      setPendingImport({
        value,
        tasks: count("tasks"),
        goals: count("goals"),
        modules: count("modules"),
        habits: count("habits"),
      });
    } catch (caught: unknown) {
      setDataError(
        caught instanceof Error
          ? caught.message
          : "That backup could not be imported.",
      );
    }
  }

  async function startNextSemester() {
    setArchiveError("");
    try {
      await archiveSemester({
        id: `semester-${crypto.randomUUID()}`,
        userId: semester.userId,
        name: nextSemesterName.trim(),
        academicYear: nextAcademicYear.trim(),
        startDate: nextStartDate,
        endDate: nextEndDate,
        resolutions: [],
        status: "active",
      });
      setArchiveOpen(false);
    } catch (caught: unknown) {
      setArchiveError(
        caught instanceof Error
          ? caught.message
          : "The semester could not be archived safely.",
      );
    }
  }

  function submit(event: FormEvent) {
    event.preventDefault();
    setSaved(false);
    setSaveError("");
    if (!draft.name.trim() || !draft.academicYear.trim()) {
      setSaveError("Semester name and academic year are required.");
      return;
    }
    if (
      !isDateKey(draft.startDate) ||
      !isDateKey(draft.endDate) ||
      draft.endDate <= draft.startDate
    ) {
      setSaveError("The end date must be after the start date.");
      return;
    }
    const specialDates = [
      draft.recessWeekStart,
      draft.readingWeekStart,
      draft.examPeriodStart,
    ].filter(Boolean) as string[];
    if (
      specialDates.some(
        (date) =>
          !isDateKey(date) || date < draft.startDate || date > draft.endDate,
      )
    ) {
      setSaveError("Semester events must fall within the semester dates.");
      return;
    }
    updateSemester({
      ...draft,
      name: draft.name.trim(),
      academicYear: draft.academicYear.trim(),
      theme: draft.theme?.trim() || undefined,
      targetGpa:
        draft.targetGpa === undefined
          ? undefined
          : Math.min(5, Math.max(0, draft.targetGpa)),
    });
    setSaved(true);
  }

  return (
    <PageShell title="Settings">
      <div className="mx-auto max-w-5xl space-y-6">
        <PageIntro
          eyebrow="Semester setup"
          title="Set the season before planning the episodes"
          description="These dates drive semester progress, timeline events, and the dashboard’s current week."
        />

        <div className="grid gap-6 lg:grid-cols-[1.35fr_0.65fr]">
          <Card>
            <CardHeader>
              <CardTitle>Active semester</CardTitle>
              <CardDescription>
                Changes save locally at once and are grouped into an efficient
                cloud update.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={submit} className="grid gap-4 md:grid-cols-2">
                <label className="text-sm font-bold md:col-span-2">
                  Semester name
                  <input
                    className={`${fieldClassName} mt-2`}
                    value={draft.name}
                    onChange={(event) =>
                      setDraft({ ...draft, name: event.target.value })
                    }
                    required
                  />
                </label>
                <label className="text-sm font-bold">
                  Academic year
                  <input
                    className={`${fieldClassName} mt-2`}
                    value={draft.academicYear}
                    onChange={(event) =>
                      setDraft({ ...draft, academicYear: event.target.value })
                    }
                    required
                  />
                </label>
                <label className="text-sm font-bold">
                  Personal theme
                  <input
                    className={`${fieldClassName} mt-2`}
                    value={draft.theme ?? ""}
                    onChange={(event) =>
                      setDraft({ ...draft, theme: event.target.value })
                    }
                  />
                </label>
                <label className="text-sm font-bold">
                  Start date
                  <input
                    type="date"
                    className={`${fieldClassName} mt-2`}
                    value={draft.startDate}
                    onChange={(event) =>
                      setDraft({ ...draft, startDate: event.target.value })
                    }
                    required
                  />
                </label>
                <label className="text-sm font-bold">
                  End date
                  <input
                    type="date"
                    className={`${fieldClassName} mt-2`}
                    value={draft.endDate}
                    onChange={(event) =>
                      setDraft({ ...draft, endDate: event.target.value })
                    }
                    min={draft.startDate}
                    required
                  />
                </label>
                <label className="text-sm font-bold">
                  Recess week starts
                  <input
                    type="date"
                    className={`${fieldClassName} mt-2`}
                    value={draft.recessWeekStart ?? ""}
                    onChange={(event) =>
                      setDraft({
                        ...draft,
                        recessWeekStart: event.target.value || undefined,
                      })
                    }
                  />
                </label>
                <label className="text-sm font-bold">
                  Reading week starts
                  <input
                    type="date"
                    className={`${fieldClassName} mt-2`}
                    value={draft.readingWeekStart ?? ""}
                    onChange={(event) =>
                      setDraft({
                        ...draft,
                        readingWeekStart: event.target.value || undefined,
                      })
                    }
                  />
                </label>
                <label className={alignedFieldLabelClassName}>
                  <span className="flex items-end">Exam period starts</span>
                  <input
                    type="date"
                    className={fieldClassName}
                    value={draft.examPeriodStart ?? ""}
                    onChange={(event) =>
                      setDraft({
                        ...draft,
                        examPeriodStart: event.target.value || undefined,
                      })
                    }
                  />
                </label>
                <label className={alignedFieldLabelClassName}>
                  <span className="flex items-end">
                    Target GPA{" "}
                    <span className="ml-1 font-medium text-muted">
                      (0–5 scale)
                    </span>
                  </span>
                  <input
                    type="number"
                    min="0"
                    max="5"
                    step="0.01"
                    className={fieldClassName}
                    value={draft.targetGpa ?? ""}
                    onChange={(event) =>
                      setDraft({
                        ...draft,
                        targetGpa: event.target.value
                          ? Number(event.target.value)
                          : undefined,
                      })
                    }
                  />
                </label>
                <div className="rounded-2xl border border-accent/20 bg-accent/5 p-4 md:col-span-2">
                  <p className="text-sm font-black">Semester resolutions</p>
                  <p className="mt-1 text-xs leading-5 text-muted">
                    Add, edit, complete, or remove individual resolutions from
                    the Dashboard. Semester setup no longer limits you to one.
                  </p>
                </div>
                <Button type="submit" className="md:col-span-2">
                  <Save className="h-4 w-4" />
                  Save semester setup
                </Button>
                {saveError && (
                  <p
                    className="text-center text-sm font-semibold text-danger md:col-span-2"
                    role="alert"
                  >
                    {saveError}
                  </p>
                )}
                {saved && (
                  <p
                    className="text-center text-sm font-semibold text-success md:col-span-2"
                    role="status"
                  >
                    Semester setup saved.
                  </p>
                )}
              </form>
            </CardContent>
          </Card>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Data status</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start gap-3">
                  <Database className="mt-0.5 h-5 w-5 text-accent" />
                  <div>
                    <p className="text-sm font-bold">
                      {storageMode === "cloud"
                        ? "Firestore account sync"
                        : "Browser storage"}
                    </p>
                    <p className="mt-1 text-xs leading-5 text-muted">
                      {storageMode === "cloud"
                        ? "Your workspace follows this account across devices. Cloud checks are cached and rapid edits are saved together."
                        : "Connect Firebase and sign in to sync this workspace across devices."}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <ShieldCheck className="mt-0.5 h-5 w-5 text-success" />
                  <div>
                    <p className="text-sm font-bold">Sync status</p>
                    <p className="mt-1 text-xs leading-5 text-muted">
                      {syncStatus === "synced" && lastSyncedAt
                        ? `Updated ${new Date(lastSyncedAt).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}`
                        : syncStatus === "saving"
                          ? "Saving your latest changes…"
                          : syncStatus === "connecting"
                            ? "Connecting to your workspace…"
                            : syncStatus === "migrating"
                              ? "Creating a recovery copy and upgrading safely…"
                              : syncStatus === "conflict"
                                ? "A field changed on another device and needs review."
                            : syncStatus === "offline"
                              ? "Offline. Changes remain available in this browser."
                              : syncStatus === "error"
                                ? "Cloud sync needs attention."
                                : "Browser-only mode"}
                    </p>
                  </div>
                </div>
                <Badge
                  variant={
                    syncStatus === "synced"
                      ? "success"
                      : syncStatus === "offline" || syncStatus === "error"
                        ? "danger"
                        : "warning"
                  }
                >
                  {syncStatus === "synced"
                    ? "Cloud workspace synced"
                    : syncStatus === "saving"
                      ? "Saving to Firestore"
                      : syncStatus === "connecting"
                        ? "Connecting"
                        : syncStatus === "migrating"
                          ? "Migrating safely"
                          : syncStatus === "conflict"
                            ? "Conflict review required"
                        : syncStatus === "demo"
                          ? "Firebase not connected"
                          : "Using browser backup"}
                </Badge>
                {syncError && (
                  <p className="text-xs leading-5 text-danger" role="alert">
                    {syncError}
                  </p>
                )}
                {storageMode === "cloud" && (
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    className="w-full"
                    disabled={syncStatus === "connecting"}
                    onClick={() => void syncWorkspaceNow()}
                  >
                    <RefreshCw
                      className={`h-4 w-4 ${
                        syncStatus === "connecting" ||
                        syncStatus === "saving"
                          ? "animate-spin"
                          : ""
                      }`}
                    />
                    Check and sync now
                  </Button>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Planning defaults</CardTitle>
                <CardDescription>
                  Capacity warnings and exact-time blocks use these settings.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <label className="block text-xs font-bold">
                  Workspace time zone
                  <input
                    className={`${fieldClassName} mt-2`}
                    value={timeZoneDraft}
                    onChange={(event) => {
                      setTimeZoneDraft(event.target.value);
                      setTimeZoneError("");
                    }}
                    aria-describedby="timezone-help timezone-error"
                  />
                </label>
                <p id="timezone-help" className="text-[11px] leading-5 text-muted">
                  Use an IANA name such as Asia/Kuala_Lumpur or Europe/London.
                </p>
                <Button
                  type="button"
                  size="sm"
                  variant="secondary"
                  onClick={() => {
                    const candidate = timeZoneDraft.trim();
                    if (!isValidTimeZone(candidate)) {
                      setTimeZoneError(
                        "Enter a valid IANA time zone before saving.",
                      );
                      return;
                    }
                    updateWorkspacePreferences({ timeZone: candidate });
                    setTimeZoneDraft(candidate);
                    setTimeZoneError("");
                  }}
                >
                  Save time zone
                </Button>
                {timeZoneError && (
                  <p id="timezone-error" className="text-xs text-danger" role="alert">
                    {timeZoneError}
                  </p>
                )}
                <label className="block text-xs font-bold">
                  Daily planning capacity (minutes)
                  <input
                    className={`${fieldClassName} mt-2`}
                    type="number"
                    min="30"
                    max="1440"
                    step="15"
                    value={preferences.dailyCapacityMinutes}
                    onChange={(event) =>
                      updateWorkspacePreferences({
                        dailyCapacityMinutes: Number(event.target.value),
                      })
                    }
                  />
                </label>
                <label className="flex items-start gap-3 rounded-xl border border-border p-3 text-xs font-bold">
                  <input
                    className="mt-0.5"
                    type="checkbox"
                    checked={preferences.autoNextAction}
                    onChange={(event) =>
                      updateWorkspacePreferences({
                        autoNextAction: event.target.checked,
                        hiddenRecommendationDate: undefined,
                      })
                    }
                  />
                  <span>
                    Recommend a next action
                    <span className="mt-1 block font-medium leading-5 text-muted">
                      Recommendations are explainable and can always be pinned,
                      hidden, or ignored.
                    </span>
                  </span>
                </label>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Backup and transfer</CardTitle>
                <CardDescription>
                  Imports are validated and receive a recovery snapshot first.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="rounded-xl border border-border bg-surface p-3 text-xs">
                  <p className="font-black">
                    {workspaceSize.percentage}% of safe workspace budget
                  </p>
                  <p className="mt-1 capitalize text-muted">
                    {workspaceSize.state.replace("_", " ")} · estimated{" "}
                    {Math.ceil(workspaceSize.estimatedFirestoreBytes / 1024)} KiB
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-2 text-center text-[10px] text-muted">
                  <div className="rounded-xl border border-border p-2">
                    <strong className="block text-base text-foreground">
                      {syncMetrics.reads}
                    </strong>
                    cloud reads
                  </div>
                  <div className="rounded-xl border border-border p-2">
                    <strong className="block text-base text-foreground">
                      {syncMetrics.writes}
                    </strong>
                    cloud writes
                  </div>
                </div>
                <Button
                  type="button"
                  variant="secondary"
                  className="w-full"
                  onClick={exportWorkspace}
                >
                  <Download className="h-4 w-4" />
                  Export JSON backup
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  className="w-full"
                  onClick={exportTasksCsv}
                >
                  <FileSpreadsheet className="h-4 w-4" />
                  Export tasks CSV
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  className="w-full"
                  onClick={exportCalendarIcs}
                >
                  <CalendarDays className="h-4 w-4" />
                  Export calendar (.ics)
                </Button>
                <label className="flex h-10 cursor-pointer items-center justify-center gap-2 rounded-xl bg-accent px-3 text-xs font-black text-white">
                  <Upload className="h-4 w-4" />
                  Import validated backup
                  <input
                    className="sr-only"
                    type="file"
                    accept="application/json,.json"
                    onChange={(event) => void importFile(event)}
                  />
                </label>
                {dataError && (
                  <p className="text-xs leading-5 text-danger" role="alert">
                    {dataError}
                  </p>
                )}
                {pendingImport && (
                  <div
                    className="fixed inset-0 z-[100] flex items-center justify-center bg-[#17111f]/70 p-4 backdrop-blur-sm"
                  >
                  <div
                    ref={importDialogRef}
                    className="w-full max-w-md rounded-2xl border border-warning/40 bg-surface-elevated p-5 shadow-2xl"
                    role="dialog"
                    aria-modal="true"
                    aria-label="Confirm workspace import"
                  >
                    <p className="text-xs font-black">
                      Replace the active workspace?
                    </p>
                    <p className="mt-1 text-[11px] leading-5 text-muted">
                      Found {pendingImport.tasks} tasks, {pendingImport.goals}{" "}
                      goals, {pendingImport.modules} modules, and{" "}
                      {pendingImport.habits} habits. A recovery copy of your
                      current workspace will be created first.
                    </p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      <Button
                        size="sm"
                        onClick={() => {
                          const candidate = pendingImport.value;
                          setPendingImport(null);
                          void importWorkspace(candidate).catch(
                            (caught: unknown) =>
                              setDataError(
                                caught instanceof Error
                                  ? caught.message
                                  : "That backup could not be imported.",
                              ),
                          );
                        }}
                      >
                        Import and replace
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setPendingImport(null)}
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                  </div>
                )}
                {recoverySnapshots.length > 0 && (
                  <div className="space-y-2 border-t border-border pt-3">
                    <p className="text-[10px] font-black uppercase tracking-wider text-muted">
                      Recovery copies on this device
                    </p>
                    {recoverySnapshots.map((snapshot) => (
                      <div
                        key={snapshot.id}
                        className="flex items-center gap-2 rounded-xl border border-border p-2"
                      >
                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-bold capitalize">
                            {snapshot.reason} · schema {snapshot.schemaVersion}
                          </p>
                          <p className="text-[10px] text-muted">
                            {new Date(snapshot.createdAt).toLocaleString()}
                          </p>
                        </div>
                        <Button
                          type="button"
                          size="icon"
                          variant="ghost"
                          aria-label={`Remove recovery snapshot from ${snapshot.createdAt}`}
                          onClick={() =>
                            void deleteRecoverySnapshot(snapshot.id).then(() =>
                              setRecoverySnapshots((current) =>
                                current.filter((item) => item.id !== snapshot.id),
                              ),
                            )
                          }
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="border-warning/30">
              <CardHeader>
                <CardTitle>Semester lifecycle</CardTitle>
                <CardDescription>
                  Archive the complete workspace separately before starting
                  with a clean semester.
                </CardDescription>
              </CardHeader>
              <CardContent>
                {archiveOpen ? (
                  <div className="space-y-3">
                    <input
                      className={fieldClassName}
                      aria-label="Next semester name"
                      value={nextSemesterName}
                      onChange={(event) => setNextSemesterName(event.target.value)}
                    />
                    <input
                      className={fieldClassName}
                      aria-label="Next academic year"
                      value={nextAcademicYear}
                      onChange={(event) => setNextAcademicYear(event.target.value)}
                    />
                    <div className="grid grid-cols-2 gap-2">
                      <label className="text-[10px] font-bold">
                        Starts
                        <input
                          className={`${fieldClassName} mt-1`}
                          type="date"
                          value={nextStartDate}
                          onChange={(event) => setNextStartDate(event.target.value)}
                        />
                      </label>
                      <label className="text-[10px] font-bold">
                        Ends
                        <input
                          className={`${fieldClassName} mt-1`}
                          type="date"
                          min={nextStartDate}
                          value={nextEndDate}
                          onChange={(event) => setNextEndDate(event.target.value)}
                        />
                      </label>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <Button
                        size="sm"
                        onClick={() => void startNextSemester()}
                        disabled={
                          !nextSemesterName.trim() ||
                          nextEndDate <= nextStartDate
                        }
                      >
                        Archive and start
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setArchiveOpen(false)}
                      >
                        Cancel
                      </Button>
                    </div>
                    {archiveError && (
                      <p className="text-xs text-danger">{archiveError}</p>
                    )}
                  </div>
                ) : (
                  <Button
                    variant="secondary"
                    className="w-full"
                    onClick={() => setArchiveOpen(true)}
                  >
                    <Archive className="h-4 w-4" />
                    Close this semester
                  </Button>
                )}
              </CardContent>
            </Card>

            <Card className="border-danger/25">
              <CardHeader>
                <CardTitle>Clear workspace</CardTitle>
                <CardDescription>
                  Remove this account&apos;s tasks, goals, logs, and progress.
                </CardDescription>
              </CardHeader>
              <CardContent>
                {confirmReset ? (
                  <div className="space-y-3">
                    <p className="text-sm font-semibold text-danger">
                      This clears the synced workspace for this account. This
                      action cannot be undone.
                    </p>
                    <div className="flex gap-2">
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => {
                          resetWorkspace();
                          setConfirmReset(false);
                        }}
                      >
                        Clear everything
                      </Button>
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => setConfirmReset(false)}
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                ) : (
                  <Button
                    variant="secondary"
                    className="w-full"
                    onClick={() => setConfirmReset(true)}
                  >
                    <RotateCcw className="h-4 w-4" />
                    Clear workspace data
                  </Button>
                )}
              </CardContent>
            </Card>

            {isConfigured && (
              <Card className="border-danger/40">
                <CardHeader>
                  <CardTitle>Delete account</CardTitle>
                  <CardDescription>
                    Permanently remove the Firebase account, active workspace,
                    recovery copies, and semester archives.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <p className="text-xs leading-5 text-muted">
                    Export a JSON backup first. Then type DELETE ACCOUNT. A
                    recent sign-in is required.
                  </p>
                  {["saving", "offline", "conflict", "error"].includes(
                    syncStatus,
                  ) && (
                    <p
                      className="rounded-xl border border-warning/35 bg-warning/10 p-3 text-xs leading-5 text-foreground"
                      role="status"
                    >
                      Your cloud copy is not currently confirmed as synced.
                      Export the browser copy before deleting this account.
                    </p>
                  )}
                  <Button
                    type="button"
                    variant="secondary"
                    className="w-full"
                    onClick={exportWorkspace}
                  >
                    <Download className="h-4 w-4" />
                    Export account backup
                  </Button>
                  <input
                    className={fieldClassName}
                    value={accountConfirmation}
                    onChange={(event) =>
                      setAccountConfirmation(event.target.value)
                    }
                    placeholder="DELETE ACCOUNT"
                    autoComplete="off"
                    aria-label="Type DELETE ACCOUNT to confirm"
                  />
                  <Button
                    type="button"
                    variant="destructive"
                    className="w-full"
                    disabled={
                      accountConfirmation !== "DELETE ACCOUNT" ||
                      deletingAccount
                    }
                    onClick={() => {
                      setAccountDeleteError("");
                      setDeletingAccount(true);
                      void deleteAccount().catch((caught: unknown) => {
                        setDeletingAccount(false);
                        setAccountDeleteError(
                          caught instanceof Error
                            ? caught.message
                            : "The account could not be deleted.",
                        );
                      });
                    }}
                  >
                    <Trash2 className="h-4 w-4" />
                    {deletingAccount ? "Deleting…" : "Delete account permanently"}
                  </Button>
                  {accountDeleteError && (
                    <p className="text-xs leading-5 text-danger" role="alert">
                      {accountDeleteError}
                    </p>
                  )}
                </CardContent>
              </Card>
            )}

            <Card>
              <CardHeader>
                <CardTitle>Privacy and terms</CardTitle>
                <CardDescription>
                  Review how your workspace is handled or contact the
                  maintainer.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3 text-xs leading-5 text-muted">
                <div className="flex flex-wrap gap-3 font-bold">
                  <Link href="/privacy" className="text-accent hover:underline">
                    Privacy Policy
                  </Link>
                  <Link href="/terms" className="text-accent hover:underline">
                    Terms of Use
                  </Link>
                  <a
                    href="https://github.com/kelvin0520lcy/resolve/issues"
                    className="text-accent hover:underline"
                  >
                    Contact
                  </a>
                </div>
                <p>
                  Resolve! is an unofficial, non-commercial fan project and is
                  not affiliated with Bocchi the Rock! or its rights holders.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
        {buildInfo && (
          <p className="text-center text-[10px] font-bold uppercase tracking-wider text-muted">
            Resolve {buildInfo.version} · {buildInfo.environment} ·{" "}
            {buildInfo.commit.slice(0, 8)} ·{" "}
            {buildInfo.builtAt ? "built" : "started"}{" "}
            {new Date(
              buildInfo.builtAt ?? buildInfo.startedAt,
            ).toLocaleString()}{" "}
            · schema{" "}
            {buildInfo.schemaVersion}
          </p>
        )}
      </div>
    </PageShell>
  );
}
