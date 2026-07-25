"use client";

import { useEffect, useMemo, useState, type FormEvent } from "react";
import {
  ArrowRight,
  BookHeart,
  CalendarCheck,
  Cloud,
  HardDrive,
  Lightbulb,
  Save,
  Sparkles,
} from "lucide-react";
import { CharacterCompanion } from "@/components/character/character-companion";
import { PageShell } from "@/components/layout/page-shell";
import { Button } from "@/components/ui/button";
import { ConfirmDeleteButton } from "@/components/ui/confirm-delete-button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  MetricCard,
  PageIntro,
  textAreaClassName,
} from "@/components/ui/resolve";
import { offsetDate, useResolve } from "@/contexts/resolve-context";
import { summarizeReflections } from "@/lib/reflection-summary";
import { formatDate } from "@/lib/utils";

const ENERGY_LEVELS = [
  { value: 1, label: "Drained" },
  { value: 2, label: "Low" },
  { value: 3, label: "Steady" },
  { value: 4, label: "Good" },
  { value: 5, label: "Charged" },
] as const;

export default function ReflectionsPage() {
  const {
    reflections,
    saveReflection,
    removeReflection,
    storageMode,
    syncStatus,
  } = useResolve();
  const today = offsetDate(0);
  const [wins, setWins] = useState("");
  const [difficulties, setDifficulties] = useState("");
  const [lessons, setLessons] = useState("");
  const [nextChanges, setNextChanges] = useState("");
  const [energy, setEnergy] = useState(3);
  const [saved, setSaved] = useState(false);
  const recentReviews = useMemo(
    () =>
      [...reflections].sort((a, b) =>
        b.createdAt.localeCompare(a.createdAt),
      ),
    [reflections],
  );
  const summary = useMemo(
    () => summarizeReflections(reflections),
    [reflections],
  );
  const todayReflection = reflections.find(
    (reflection) =>
      reflection.type === "daily" &&
      reflection.periodStart === today &&
      reflection.periodEnd === today,
  );
  const carryOver = recentReviews.find(
    (reflection) => reflection.nextChanges?.trim(),
  );

  useEffect(() => {
    if (!todayReflection) return;
    const frame = window.requestAnimationFrame(() => {
      setWins(todayReflection.wins ?? "");
      setDifficulties(todayReflection.difficulties ?? "");
      setLessons(todayReflection.lessons ?? "");
      setNextChanges(todayReflection.nextChanges ?? "");
      setEnergy(todayReflection.energy ?? 3);
    });
    return () => window.cancelAnimationFrame(frame);
  }, [todayReflection]);

  function submit(event: FormEvent) {
    event.preventDefault();
    saveReflection({
      type: "daily",
      periodStart: today,
      periodEnd: today,
      wins: wins.trim(),
      difficulties: difficulties.trim(),
      lessons: lessons.trim(),
      nextChanges: nextChanges.trim(),
      mood: energy,
      energy,
    });
    setSaved(true);
  }

  const storageLabel =
    storageMode === "cloud"
      ? syncStatus === "synced"
        ? "Stored in your account"
        : syncStatus === "saving" || syncStatus === "connecting"
          ? "Saving to your account"
          : "Saved on this device; cloud will retry"
      : "Saved on this device";

  return (
    <PageShell title="Reflections">
      <div className="mx-auto max-w-6xl space-y-6">
        <PageIntro
          eyebrow="Quiet rooftop"
          title="Turn today into tomorrow’s adjustment"
          description="This is a private review, not a diary requirement: save what worked, name the friction, and carry one specific change into the next day."
          action={
            <div className="flex items-center gap-2 rounded-xl border border-border bg-surface/80 px-3 py-2 text-xs font-bold">
              {storageMode === "cloud" ? (
                <Cloud className="h-4 w-4 text-accent" />
              ) : (
                <HardDrive className="h-4 w-4 text-accent" />
              )}
              {storageLabel}
            </div>
          }
        />

        <Card className="border-accent/25">
          <CardContent className="grid gap-4 pt-6 sm:grid-cols-3">
            {[
              ["1 · Notice", "Record one win and the friction that mattered."],
              ["2 · Learn", "Keep the pattern you want to remember next week."],
              ["3 · Adjust", "Write one change that becomes tomorrow’s cue."],
            ].map(([title, description]) => (
              <div
                key={title}
                className="rounded-2xl border border-border bg-surface p-4"
              >
                <p className="text-xs font-black uppercase tracking-wider text-accent">
                  {title}
                </p>
                <p className="mt-2 text-sm leading-6 text-muted">
                  {description}
                </p>
              </div>
            ))}
          </CardContent>
        </Card>

        <div className="grid gap-4 sm:grid-cols-3">
          <MetricCard
            label="Recent check-ins"
            value={summary.reviewCount}
            detail="used in your pattern summary"
            icon={<BookHeart className="h-5 w-5" />}
          />
          <MetricCard
            label="Current rhythm"
            value={todayReflection ? "Reviewed" : "Open"}
            detail="today’s review can be updated"
            icon={<CalendarCheck className="h-5 w-5" />}
          />
          <MetricCard
            label="Today’s energy"
            value={`${energy}/5`}
            detail="use it to plan tomorrow"
            icon={<Sparkles className="h-5 w-5" />}
          />
        </div>

        <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          <Card>
            <CardHeader>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <CardTitle>Today&apos;s review</CardTitle>
                  <CardDescription className="mt-1">
                    {todayReflection
                      ? "Your saved review is loaded below. Edit it and save again at any time."
                      : "You only need to answer the prompts that reveal something useful."}
                  </CardDescription>
                </div>
                {todayReflection && (
                  <ConfirmDeleteButton
                    itemLabel="today's review"
                    onConfirm={() => {
                      removeReflection(todayReflection.id);
                      setWins("");
                      setDifficulties("");
                      setLessons("");
                      setNextChanges("");
                      setEnergy(3);
                      setSaved(false);
                    }}
                    className="flex-wrap justify-end"
                  />
                )}
              </div>
            </CardHeader>
            <CardContent>
              <form
                onSubmit={submit}
                className="grid gap-5 sm:grid-cols-2"
              >
                <label className="block text-sm font-bold">
                  What was today&apos;s small win?
                  <textarea
                    className={`${textAreaClassName} mt-2`}
                    value={wins}
                    onChange={(event) => {
                      setWins(event.target.value);
                      setSaved(false);
                    }}
                  />
                </label>
                <label className="block text-sm font-bold">
                  What made the day harder?
                  <textarea
                    className={`${textAreaClassName} mt-2`}
                    value={difficulties}
                    onChange={(event) => {
                      setDifficulties(event.target.value);
                      setSaved(false);
                    }}
                  />
                </label>
                <label className="block text-sm font-bold">
                  What did you learn?
                  <textarea
                    className={`${textAreaClassName} mt-2`}
                    value={lessons}
                    onChange={(event) => {
                      setLessons(event.target.value);
                      setSaved(false);
                    }}
                  />
                </label>
                <label className="block text-sm font-bold">
                  What changes tomorrow?
                  <textarea
                    className={`${textAreaClassName} mt-2`}
                    value={nextChanges}
                    onChange={(event) => {
                      setNextChanges(event.target.value);
                      setSaved(false);
                    }}
                  />
                </label>
                <fieldset className="sm:col-span-2">
                  <legend className="text-sm font-bold">Energy level</legend>
                  <p className="mt-1 text-xs text-muted">
                    1 means drained; 5 means fully charged.
                  </p>
                  <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-5">
                    {ENERGY_LEVELS.map(({ value, label }) => (
                      <button
                        key={value}
                        type="button"
                        onClick={() => {
                          setEnergy(value);
                          setSaved(false);
                        }}
                        className={`min-h-12 rounded-xl border px-2 py-2 text-xs font-bold ${
                          energy === value
                            ? "border-accent bg-accent text-white"
                            : "border-border bg-surface"
                        }`}
                      >
                        <span className="block text-base">{value}/5</span>
                        <span className="block font-medium">{label}</span>
                      </button>
                    ))}
                  </div>
                </fieldset>
                <Button
                  type="submit"
                  className="w-full sm:col-span-2"
                  disabled={
                    !wins.trim() &&
                    !difficulties.trim() &&
                    !lessons.trim() &&
                    !nextChanges.trim()
                  }
                >
                  <Save className="h-4 w-4" />
                  {todayReflection
                    ? "Update today’s review"
                    : "Save today’s review"}
                </Button>
                {saved && (
                  <p className="text-center text-sm font-semibold text-success sm:col-span-2">
                    Saved. Your recent pattern summary is updated.
                  </p>
                )}
              </form>
            </CardContent>
          </Card>

          <div className="space-y-6">
            <Card className="overflow-hidden border-warning/30 bg-warning/5">
              <CardHeader>
                <div className="flex items-center gap-2 text-warning">
                  <ArrowRight className="h-4 w-4" />
                  <CardDescription className="font-black uppercase tracking-wider text-warning">
                    Carry into tomorrow
                  </CardDescription>
                </div>
                <CardTitle className="text-base">
                  {carryOver?.nextChanges ??
                    "Save one specific adjustment and it will stay visible here."}
                </CardTitle>
              </CardHeader>
              {carryOver && (
                <CardContent className="text-xs text-muted">
                  From your review on{" "}
                  {formatDate(`${carryOver.periodStart}T12:00:00`)}
                </CardContent>
              )}
            </Card>
            <CharacterCompanion
              compact
              state={{
                expression: reflections.length ? "proud" : "encouraging",
                dialogue: reflections.length
                  ? "You turned the day into something we can learn from. That counts."
                  : "No performance review here. Just tell the truth about the day.",
                scene: "bedroom",
                triggerReason: "reflection",
              }}
            />
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Lightbulb className="h-4 w-4 text-accent" />
                  <CardTitle>Recent pattern summary</CardTitle>
                </div>
                <CardDescription>
                  A useful signal from your latest seven daily check-ins—not a
                  wall of old diary entries.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {summary.reviewCount ? (
                  <>
                    <div className="rounded-2xl border border-accent/25 bg-accent/5 p-4">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <p className="text-xs font-black uppercase tracking-wider text-accent">
                            Seven-check-in signal
                          </p>
                          <p className="mt-2 text-sm font-bold leading-6">
                            {summary.headline}
                          </p>
                        </div>
                        <div className="shrink-0 text-right">
                          <p className="font-display text-3xl">
                            {summary.averageEnergy ?? "—"}
                          </p>
                          <p className="text-[10px] font-black uppercase tracking-wider text-muted">
                            avg energy / 5
                          </p>
                        </div>
                      </div>
                      <p className="mt-3 text-xs text-muted">
                        {summary.reviewedDays} reviewed day
                        {summary.reviewedDays === 1 ? "" : "s"} ·{" "}
                        {summary.winsCaptured} win
                        {summary.winsCaptured === 1 ? "" : "s"} noticed ·{" "}
                        {summary.frictionCaptured} friction note
                        {summary.frictionCaptured === 1 ? "" : "s"}
                      </p>
                    </div>
                    <div className="grid gap-3">
                      {summary.latestWin && (
                        <div className="rounded-2xl border border-border bg-surface p-4">
                          <p className="text-[10px] font-black uppercase tracking-wider text-success">
                            What is working
                          </p>
                          <p className="mt-2 text-sm leading-6">
                            {summary.latestWin}
                          </p>
                        </div>
                      )}
                      {summary.latestFriction && (
                        <div className="rounded-2xl border border-border bg-surface p-4">
                          <p className="text-[10px] font-black uppercase tracking-wider text-warning">
                            Watch this friction
                          </p>
                          <p className="mt-2 text-sm leading-6">
                            {summary.latestFriction}
                          </p>
                        </div>
                      )}
                      {summary.latestLesson && (
                        <div className="rounded-2xl border border-border bg-surface p-4">
                          <p className="text-[10px] font-black uppercase tracking-wider text-accent">
                            Latest useful lesson
                          </p>
                          <p className="mt-2 text-sm leading-6">
                            {summary.latestLesson}
                          </p>
                        </div>
                      )}
                    </div>
                  </>
                ) : (
                  <div className="py-8 text-center text-sm text-muted">
                    <BookHeart className="mx-auto mb-3 h-6 w-6 text-accent" />
                    Your first review will create a compact pattern summary and
                    feed the carry-over panel above.
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </PageShell>
  );
}
