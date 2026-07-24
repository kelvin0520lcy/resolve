"use client";

import { useState, type FormEvent } from "react";
import { BookHeart, CalendarCheck, Save, Sparkles } from "lucide-react";
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
  const { reflections, saveReflection } = useResolve();
  const [wins, setWins] = useState("");
  const [difficulties, setDifficulties] = useState("");
  const [lessons, setLessons] = useState("");
  const [nextChanges, setNextChanges] = useState("");
  const [energy, setEnergy] = useState(3);
  const [saved, setSaved] = useState(false);

  function submit(event: FormEvent) {
    event.preventDefault();
    saveReflection({
      type: "daily",
      periodStart: offsetDate(0),
      periodEnd: offsetDate(0),
      wins: wins.trim(),
      difficulties: difficulties.trim(),
      lessons: lessons.trim(),
      nextChanges: nextChanges.trim(),
      mood: energy,
      energy,
    });
    setWins("");
    setDifficulties("");
    setLessons("");
    setNextChanges("");
    setSaved(true);
  }

  return (
    <PageShell title="Reflections">
      <div className="mx-auto max-w-6xl space-y-6">
        <PageIntro
          eyebrow="Quiet rooftop"
          title="Close the loop, not just the tasks"
          description="A short reflection turns a good or difficult day into a better plan for tomorrow."
        />

        <div className="grid gap-4 sm:grid-cols-3">
          <MetricCard
            label="Reflections"
            value={reflections.length}
            detail="saved this semester"
            icon={<BookHeart className="h-5 w-5" />}
          />
          <MetricCard
            label="Current rhythm"
            value={reflections.length ? "Active" : "Start today"}
            detail="consistency beats length"
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
              <CardTitle>Daily debrief</CardTitle>
              <CardDescription>
                Four useful prompts. A few honest lines are enough.
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
                    placeholder="Something that moved, however small…"
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
                    placeholder="A distraction, an unrealistic estimate, low energy…"
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
                    placeholder="A pattern worth remembering…"
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
                    placeholder="One specific adjustment…"
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
                  Save today&apos;s reflection
                </Button>
                {saved && (
                  <p className="text-center text-sm font-semibold text-success">
                    Reflection saved. Tomorrow already has better context.
                  </p>
                )}
              </form>
            </CardContent>
          </Card>

          <div className="space-y-6">
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
                <CardTitle>Recent notes</CardTitle>
                <CardDescription>Your semester’s memory.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {reflections.slice(0, 4).map((reflection) => (
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
                    <p className="mt-3 text-sm leading-6">
                      {reflection.wins ||
                        reflection.lessons ||
                        reflection.nextChanges}
                    </p>
                  </div>
                ))}
                {!reflections.length && (
                  <p className="py-8 text-center text-sm text-muted">
                    Your first saved reflection will appear here.
                  </p>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </PageShell>
  );
}
