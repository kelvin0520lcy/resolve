"use client";

import { useState, type FormEvent } from "react";
import { Clock3, Gauge, Guitar, Plus, X } from "lucide-react";
import { PageShell } from "@/components/layout/page-shell";
import { Badge, ProgressBar } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  EmptyState,
  MetricCard,
  PageIntro,
  fieldClassName,
  textAreaClassName,
} from "@/components/ui/resolve";
import { offsetDate, useResolve } from "@/contexts/resolve-context";
import { formatDate } from "@/lib/utils";

export default function GuitarPage() {
  const { guitarSessions, addGuitarSession } = useResolve();
  const [showForm, setShowForm] = useState(false);
  const [duration, setDuration] = useState("30");
  const [category, setCategory] = useState("Lead guitar");
  const [technique, setTechnique] = useState("Alternate picking");
  const [cleanBpm, setCleanBpm] = useState("90");
  const [notes, setNotes] = useState("");
  const [nextFocus, setNextFocus] = useState("");

  const totalMinutes = guitarSessions.reduce(
    (sum, session) => sum + session.durationMinutes,
    0,
  );
  const bestBpm = Math.max(
    ...guitarSessions.map((session) => session.cleanBpm ?? 0),
    0,
  );
  const skillMinutes = guitarSessions.reduce<Record<string, number>>(
    (totals, session) => ({
      ...totals,
      [session.category]:
        (totals[session.category] ?? 0) + session.durationMinutes,
    }),
    {},
  );
  const dominantSkill = Object.entries(skillMinutes).sort(
    (a, b) => b[1] - a[1],
  )[0];

  function submit(event: FormEvent) {
    event.preventDefault();
    const durationMinutes = Number(duration);
    const bpm = Number(cleanBpm);
    if (
      !Number.isFinite(durationMinutes) ||
      durationMinutes < 5 ||
      !Number.isFinite(bpm) ||
      bpm < 20 ||
      !nextFocus.trim()
    ) {
      return;
    }
    addGuitarSession({
      date: offsetDate(0),
      durationMinutes,
      instrument: "Electric guitar",
      category,
      techniques: [technique],
      startingBpm: Math.max(0, bpm - 8),
      endingBpm: bpm + 4,
      cleanBpm: bpm,
      confidence: 3,
      difficulty: 3,
      notes: notes.trim(),
      nextFocus: nextFocus.trim(),
    });
    setNotes("");
    setNextFocus("");
    setShowForm(false);
  }

  return (
    <PageShell title="Guitar">
      <div className="mx-auto max-w-7xl space-y-6">
        <PageIntro
          eyebrow="Practice room"
          title="Make improvement audible"
          description="Log what you practised, the clean tempo you reached, and the exact place to begin next time."
          action={
            <Button onClick={() => setShowForm((value) => !value)}>
              {showForm ? <X className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
              {showForm ? "Close" : "Log practice"}
            </Button>
          }
        />

        <div className="grid gap-4 sm:grid-cols-3">
          <MetricCard
            label="Total practice"
            value={`${Math.floor(totalMinutes / 60)}h ${totalMinutes % 60}m`}
            detail={`${guitarSessions.length} logged sessions`}
            icon={<Clock3 className="h-5 w-5" />}
          />
          <MetricCard
            label="Clean tempo"
            value={`${bestBpm} BPM`}
            detail="latest reliable benchmark"
            icon={<Gauge className="h-5 w-5" />}
          />
          <MetricCard
            label="Main focus"
            value={
              Object.entries(skillMinutes).sort((a, b) => b[1] - a[1])[0]?.[0] ??
              "Not logged"
            }
            detail="most-practised category"
            icon={<Guitar className="h-5 w-5" />}
          />
        </div>

        {showForm && (
          <Card className="border-accent/30">
            <CardHeader>
              <CardTitle>Log this practice session</CardTitle>
              <CardDescription>
                Capture just enough detail to make the next session easier.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={submit} className="grid gap-4 md:grid-cols-2">
                <label className="text-sm font-bold">
                  Duration (minutes)
                  <input
                    className={`${fieldClassName} mt-2`}
                    type="number"
                    min="5"
                    max="720"
                    value={duration}
                    onChange={(event) => setDuration(event.target.value)}
                    required
                  />
                </label>
                <label className="text-sm font-bold">
                  Practice category
                  <select
                    className={`${fieldClassName} mt-2`}
                    value={category}
                    onChange={(event) => setCategory(event.target.value)}
                  >
                    <option>Lead guitar</option>
                    <option>Rhythm guitar</option>
                    <option>Repertoire</option>
                    <option>Scales</option>
                    <option>Ear training</option>
                    <option>Music theory</option>
                  </select>
                </label>
                <label className="text-sm font-bold">
                  Technique
                  <select
                    className={`${fieldClassName} mt-2`}
                    value={technique}
                    onChange={(event) => setTechnique(event.target.value)}
                  >
                    <option>Alternate picking</option>
                    <option>Bends</option>
                    <option>Vibrato</option>
                    <option>Slides</option>
                    <option>String skipping</option>
                    <option>Chords</option>
                  </select>
                </label>
                <label className="text-sm font-bold">
                  Clean BPM
                  <input
                    className={`${fieldClassName} mt-2`}
                    type="number"
                    min="20"
                    max="400"
                    value={cleanBpm}
                    onChange={(event) => setCleanBpm(event.target.value)}
                    required
                  />
                </label>
                <label className="text-sm font-bold">
                  Practice notes
                  <textarea
                    className={`${textAreaClassName} mt-2`}
                    value={notes}
                    onChange={(event) => setNotes(event.target.value)}
                  />
                </label>
                <label className="text-sm font-bold">
                  Exact starting point for next time
                  <textarea
                    className={`${textAreaClassName} mt-2`}
                    value={nextFocus}
                    onChange={(event) => setNextFocus(event.target.value)}
                    required
                  />
                </label>
                <Button type="submit" className="md:col-span-2">
                  Save practice session
                </Button>
              </form>
            </CardContent>
          </Card>
        )}

        <div className="grid gap-6 lg:grid-cols-[0.7fr_1.3fr]">
          <Card>
            <CardHeader>
              <CardTitle>Practice mix</CardTitle>
              <CardDescription>
                Check whether one skill is crowding out the others.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              {Object.entries(skillMinutes)
                .sort((a, b) => b[1] - a[1])
                .map(([skill, minutes]) => (
                  <div key={skill}>
                    <div className="mb-2 flex justify-between text-sm">
                      <span className="font-bold">{skill}</span>
                      <span className="text-muted">{minutes} min</span>
                    </div>
                    <ProgressBar value={(minutes / totalMinutes) * 100} />
                  </div>
                ))}
              {dominantSkill ? (
                <div className="rounded-2xl bg-warning/10 p-4 text-sm leading-6">
                  <strong>Studio note:</strong> {dominantSkill[0]} currently
                  takes the largest share. Keep another skill in the next
                  session if you want a more balanced practice mix.
                </div>
              ) : (
                <EmptyState
                  icon={<Guitar className="h-6 w-6" />}
                  title="No practice mix yet"
                  description="Log a session and the balance between your practice categories will appear here."
                  action={<Button onClick={() => setShowForm(true)}>Log practice</Button>}
                />
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Recent sessions</CardTitle>
              <CardDescription>
                Your next focus is carried forward automatically.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {guitarSessions.map((session) => (
                <div
                  key={session.id}
                  className="rounded-2xl border border-border bg-surface p-4"
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="font-black">{session.category}</p>
                      <p className="mt-1 text-xs text-muted">
                        {formatDate(`${session.date}T12:00:00`)} ·{" "}
                        {session.durationMinutes} minutes
                      </p>
                    </div>
                    <Badge variant="accent">
                      {session.cleanBpm ?? "—"} clean BPM
                    </Badge>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {session.techniques.map((item) => (
                      <Badge key={item}>{item}</Badge>
                    ))}
                  </div>
                  {session.notes && (
                    <p className="mt-3 text-sm leading-6">{session.notes}</p>
                  )}
                  {session.nextFocus && (
                    <p className="mt-3 rounded-xl bg-surface-muted p-3 text-xs leading-5 text-muted">
                      <strong className="text-foreground">Next focus:</strong>{" "}
                      {session.nextFocus}
                    </p>
                  )}
                </div>
              ))}
              {!guitarSessions.length && (
                <EmptyState
                  title="No sessions logged"
                  description="Your real practice history and next-focus notes will appear here."
                />
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </PageShell>
  );
}
