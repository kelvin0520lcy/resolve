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
  MetricCard,
  PageIntro,
  textAreaClassName,
} from "@/components/ui/resolve";
import { offsetDate, useResolve } from "@/contexts/resolve-context";
import { formatDate } from "@/lib/utils";

export default function ReflectionsPage() {
  const {
    reflections,
    saveReflection,
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
  const savedReviews = useMemo(
    () =>
      [...reflections].sort((a, b) =>
        b.createdAt.localeCompare(a.createdAt),
      ),
    [reflections],
  );
  const todayReflection = reflections.find(
    (reflection) =>
      reflection.type === "daily" &&
      reflection.periodStart === today &&
      reflection.periodEnd === today,
  );
  const carryOver = savedReviews.find(
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
            label="Reflections"
            value={reflections.length}
            detail="saved this semester"
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
              <CardTitle>Today&apos;s review</CardTitle>
              <CardDescription>
                {todayReflection
                  ? "Your saved review is loaded below. Edit it and save again at any time."
                  : "You only need to answer the prompts that reveal something useful."}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={submit} className="space-y-5">
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
                <fieldset>
                  <legend className="text-sm font-bold">Energy</legend>
                  <div className="mt-2 grid grid-cols-5 gap-2">
                    {[1, 2, 3, 4, 5].map((value) => (
                      <button
                        key={value}
                        type="button"
                        onClick={() => {
                          setEnergy(value);
                          setSaved(false);
                        }}
                        className={`h-10 rounded-xl border font-bold ${
                          energy === value
                            ? "border-accent bg-accent text-white"
                            : "border-border bg-surface"
                        }`}
                      >
                        {value}
                      </button>
                    ))}
                  </div>
                </fieldset>
                <Button
                  type="submit"
                  className="w-full"
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
                  <p className="text-center text-sm font-semibold text-success">
                    Saved. This review is now part of your workspace history.
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
                  <CardTitle>Saved reviews</CardTitle>
                </div>
                <CardDescription>
                  Every field below is retained with its date and synced with
                  the rest of your workspace.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {savedReviews.slice(0, 6).map((reflection) => (
                  <div
                    key={reflection.id}
                    className="rounded-2xl border border-border bg-surface p-4"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <Badge className="capitalize">{reflection.type}</Badge>
                      <span className="text-xs text-muted">
                        {formatDate(`${reflection.periodStart}T12:00:00`)}
                      </span>
                    </div>
                    <div className="mt-3 space-y-2 text-sm leading-6">
                      {reflection.wins && (
                        <p>
                          <strong>Win:</strong> {reflection.wins}
                        </p>
                      )}
                      {reflection.difficulties && (
                        <p>
                          <strong>Friction:</strong>{" "}
                          {reflection.difficulties}
                        </p>
                      )}
                      {reflection.lessons && (
                        <p>
                          <strong>Lesson:</strong> {reflection.lessons}
                        </p>
                      )}
                      {reflection.nextChanges && (
                        <p className="rounded-xl bg-accent/5 p-2">
                          <strong>Next change:</strong>{" "}
                          {reflection.nextChanges}
                        </p>
                      )}
                    </div>
                    <p className="mt-3 text-xs text-muted">
                      Energy {reflection.energy ?? "—"}/5
                    </p>
                  </div>
                ))}
                {!reflections.length && (
                  <div className="py-8 text-center text-sm text-muted">
                    <BookHeart className="mx-auto mb-3 h-6 w-6 text-accent" />
                    Your first review will become a dated record here, and its
                    next change will feed the carry-over panel above.
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
