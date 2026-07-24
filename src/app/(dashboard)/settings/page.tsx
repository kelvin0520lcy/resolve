"use client";

import { useEffect, useState, type FormEvent } from "react";
import { Database, RotateCcw, Save, ShieldCheck } from "lucide-react";
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
  fieldClassName,
  textAreaClassName,
} from "@/components/ui/resolve";
import { useResolve } from "@/contexts/resolve-context";
import { isDateKey } from "@/lib/date";
import type { Semester } from "@/types";

export default function SettingsPage() {
  const {
    semester,
    storageMode,
    updateSemester,
    resetDemo,
  } = useResolve();
  const [draft, setDraft] = useState<Semester>(semester);
  const [saved, setSaved] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [confirmReset, setConfirmReset] = useState(false);

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => setDraft(semester));
    return () => window.cancelAnimationFrame(frame);
  }, [semester]);

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
      mainResolution: draft.mainResolution?.trim() || undefined,
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
                Changes are saved to this account&apos;s local workspace.
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
                  Recess week
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
                  Reading week
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
                <label className="text-sm font-bold">
                  Examination period
                  <input
                    type="date"
                    className={`${fieldClassName} mt-2`}
                    value={draft.examPeriodStart ?? ""}
                    onChange={(event) =>
                      setDraft({
                        ...draft,
                        examPeriodStart: event.target.value || undefined,
                      })
                    }
                  />
                </label>
                <label className="text-sm font-bold">
                  Target GPA
                  <input
                    type="number"
                    min="0"
                    max="5"
                    step="0.01"
                    className={`${fieldClassName} mt-2`}
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
                <label className="text-sm font-bold md:col-span-2">
                  Main resolution
                  <textarea
                    className={`${textAreaClassName} mt-2`}
                    value={draft.mainResolution ?? ""}
                    onChange={(event) =>
                      setDraft({
                        ...draft,
                        mainResolution: event.target.value,
                      })
                    }
                  />
                </label>
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
                    <p className="text-sm font-bold">Browser persistence</p>
                    <p className="mt-1 text-xs leading-5 text-muted">
                      Data is saved automatically in this browser and separated
                      by signed-in account.
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <ShieldCheck className="mt-0.5 h-5 w-5 text-success" />
                  <div>
                    <p className="text-sm font-bold">Account gate</p>
                    <p className="mt-1 text-xs leading-5 text-muted">
                      {storageMode === "account-browser"
                        ? "Firebase authentication is enabled."
                        : "Demo mode is active until Firebase is configured."}
                    </p>
                  </div>
                </div>
                <Badge variant="warning">
                  Firestore sync is not enabled yet
                </Badge>
              </CardContent>
            </Card>

            <Card className="border-danger/25">
              <CardHeader>
                <CardTitle>Reset workspace</CardTitle>
                <CardDescription>
                  Restore the starter semester and sample progress.
                </CardDescription>
              </CardHeader>
              <CardContent>
                {confirmReset ? (
                  <div className="space-y-3">
                    <p className="text-sm font-semibold text-danger">
                      This replaces all locally saved progress for this account.
                    </p>
                    <div className="flex gap-2">
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => {
                          resetDemo();
                          setConfirmReset(false);
                        }}
                      >
                        Confirm reset
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
                    Reset sample data
                  </Button>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </PageShell>
  );
}
