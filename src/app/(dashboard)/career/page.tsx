"use client";

import { useState, type FormEvent } from "react";
import { BrainCircuit, Briefcase, Clock3, Plus, X } from "lucide-react";
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
  EmptyState,
  MetricCard,
  PageIntro,
  alignedFieldLabelClassName,
  fieldClassName,
  textAreaClassName,
} from "@/components/ui/resolve";
import { offsetDate, useResolve } from "@/contexts/resolve-context";
import { formatDate } from "@/lib/utils";
import type { AlgorithmLog, JobApplication } from "@/types";

const stageVariant = {
  saved: "default",
  applied: "accent",
  assessment: "warning",
  interview: "success",
  offer: "success",
  closed: "danger",
} as const;

export default function CareerPage() {
  const {
    algorithmLogs,
    applications,
    addAlgorithmLog,
    addApplication,
    updateApplicationStage,
  } = useResolve();
  const [activeForm, setActiveForm] = useState<
    "practice" | "application" | null
  >(null);
  const [problemName, setProblemName] = useState("");
  const [topic, setTopic] = useState("");
  const [minutes, setMinutes] = useState("30");
  const [difficulty, setDifficulty] =
    useState<AlgorithmLog["difficulty"]>("Medium");
  const [confidence, setConfidence] = useState("3");
  const [usedHints, setUsedHints] = useState(false);
  const [lesson, setLesson] = useState("");
  const [company, setCompany] = useState("");
  const [role, setRole] = useState("");
  const [stage, setStage] =
    useState<JobApplication["stage"]>("applied");
  const [nextAction, setNextAction] = useState("");
  const [nextActionDate, setNextActionDate] = useState(offsetDate(3));
  const algorithmMinutes = algorithmLogs.reduce(
    (sum, log) => sum + log.minutes,
    0,
  );
  const averageConfidence = Math.round(
    algorithmLogs.reduce((sum, log) => sum + log.confidence, 0) /
      Math.max(algorithmLogs.length, 1),
  );

  function submitPractice(event: FormEvent) {
    event.preventDefault();
    if (!problemName.trim() || !topic.trim() || !lesson.trim()) return;
    addAlgorithmLog({
      platform: "LeetCode",
      problemName,
      topic,
      difficulty,
      completedDate: offsetDate(0),
      minutes: Number(minutes),
      usedHints,
      confidence: Number(confidence),
      lesson,
    });
    setProblemName("");
    setTopic("");
    setLesson("");
    setConfidence("3");
    setUsedHints(false);
    setActiveForm(null);
  }

  function submitApplication(event: FormEvent) {
    event.preventDefault();
    if (!company.trim() || !role.trim()) return;
    addApplication({
      company,
      role,
      applicationDate: offsetDate(0),
      stage,
      nextAction,
      nextActionDate: nextAction.trim() ? nextActionDate : undefined,
    });
    setCompany("");
    setRole("");
    setNextAction("");
    setNextActionDate(offsetDate(3));
    setActiveForm(null);
  }

  return (
    <PageShell title="Career">
      <div className="mx-auto max-w-7xl space-y-6">
        <PageIntro
          eyebrow="Development room"
          title="Build proof, not just preparation"
          description="Track interview practice and applications together so career work becomes a steady weekly system."
          action={
            <div className="flex flex-wrap gap-2">
              <Button
                size="sm"
                onClick={() =>
                  setActiveForm((value) =>
                    value === "practice" ? null : "practice",
                  )
                }
              >
                {activeForm === "practice" ? <X className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
                Practice
              </Button>
              <Button
                size="sm"
                variant="secondary"
                onClick={() =>
                  setActiveForm((value) =>
                    value === "application" ? null : "application",
                  )
                }
              >
                {activeForm === "application" ? <X className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
                Application
              </Button>
            </div>
          }
        />

        {activeForm === "practice" && (
          <Card className="border-accent/30">
            <CardHeader>
              <CardTitle>Log interview practice</CardTitle>
            </CardHeader>
            <CardContent>
              <form
                onSubmit={submitPractice}
                className="grid gap-3 md:grid-cols-2 xl:grid-cols-6"
              >
                <label
                  className={`${alignedFieldLabelClassName} md:col-span-2 xl:col-span-2`}
                >
                  <span className="flex items-end">Problem</span>
                  <input
                    className={fieldClassName}
                    value={problemName}
                    onChange={(event) => setProblemName(event.target.value)}
                    autoFocus
                    required
                  />
                </label>
                <label className={alignedFieldLabelClassName}>
                  <span className="flex items-end">Topic</span>
                  <input
                    className={fieldClassName}
                    value={topic}
                    onChange={(event) => setTopic(event.target.value)}
                    required
                  />
                </label>
                <label className={alignedFieldLabelClassName}>
                  <span className="flex items-end">Difficulty</span>
                  <select
                    className={fieldClassName}
                    value={difficulty}
                    onChange={(event) =>
                      setDifficulty(
                        event.target.value as AlgorithmLog["difficulty"],
                      )
                    }
                  >
                    <option>Easy</option>
                    <option>Medium</option>
                    <option>Hard</option>
                  </select>
                </label>
                <label className={alignedFieldLabelClassName}>
                  <span className="flex items-end">
                    Time spent{" "}
                    <span className="ml-1 font-medium text-muted">
                      (minutes)
                    </span>
                  </span>
                  <input
                    className={fieldClassName}
                    value={minutes}
                    onChange={(event) => setMinutes(event.target.value)}
                    type="number"
                    min="1"
                    max="720"
                    required
                  />
                </label>
                <label className={alignedFieldLabelClassName}>
                  <span className="flex items-end">Confidence</span>
                  <select
                    className={fieldClassName}
                    value={confidence}
                    onChange={(event) => setConfidence(event.target.value)}
                  >
                    <option value="1">1/5 · Lost</option>
                    <option value="2">2/5 · Unsure</option>
                    <option value="3">3/5 · Steady</option>
                    <option value="4">4/5 · Confident</option>
                    <option value="5">5/5 · Ready</option>
                  </select>
                </label>
                <label
                  className={`${alignedFieldLabelClassName} md:col-span-2 xl:col-span-5`}
                >
                  <span className="flex items-end">Reusable lesson</span>
                  <textarea
                    className={textAreaClassName}
                    value={lesson}
                    onChange={(event) => setLesson(event.target.value)}
                    required
                  />
                </label>
                <label className="flex items-center gap-3 self-end rounded-xl border-2 border-border bg-surface px-3 py-3 text-sm font-bold">
                  <input
                    type="checkbox"
                    checked={usedHints}
                    onChange={(event) => setUsedHints(event.target.checked)}
                    className="h-4 w-4 accent-pink-500"
                  />
                  Used hints
                </label>
                <Button type="submit" className="md:col-span-2 xl:col-span-6">
                  Save practice evidence
                </Button>
              </form>
            </CardContent>
          </Card>
        )}

        {activeForm === "application" && (
          <Card className="border-accent/30">
            <CardHeader>
              <CardTitle>Add an application</CardTitle>
            </CardHeader>
            <CardContent>
              <form
                onSubmit={submitApplication}
                className="grid gap-3 md:grid-cols-2"
              >
                <label className={alignedFieldLabelClassName}>
                  <span className="flex items-end">Company</span>
                  <input
                    className={fieldClassName}
                    value={company}
                    onChange={(event) => setCompany(event.target.value)}
                    autoFocus
                    required
                  />
                </label>
                <label className={alignedFieldLabelClassName}>
                  <span className="flex items-end">Role</span>
                  <input
                    className={fieldClassName}
                    value={role}
                    onChange={(event) => setRole(event.target.value)}
                    required
                  />
                </label>
                <label className={alignedFieldLabelClassName}>
                  <span className="flex items-end">Current stage</span>
                  <select
                    className={fieldClassName}
                    value={stage}
                    onChange={(event) =>
                      setStage(event.target.value as JobApplication["stage"])
                    }
                  >
                    <option value="saved">Saved</option>
                    <option value="applied">Applied</option>
                    <option value="assessment">Assessment</option>
                    <option value="interview">Interview</option>
                    <option value="offer">Offer</option>
                    <option value="closed">Closed</option>
                  </select>
                </label>
                <label className={alignedFieldLabelClassName}>
                  <span className="flex items-end">Next action</span>
                  <input
                    className={fieldClassName}
                    value={nextAction}
                    onChange={(event) => setNextAction(event.target.value)}
                    required={stage !== "closed"}
                  />
                </label>
                <label className={alignedFieldLabelClassName}>
                  <span className="flex items-end">Next-action date</span>
                  <input
                    className={fieldClassName}
                    value={nextActionDate}
                    onChange={(event) => setNextActionDate(event.target.value)}
                    type="date"
                    required={Boolean(nextAction.trim())}
                  />
                </label>
                <Button type="submit" className="md:col-span-2">
                  Add application
                </Button>
              </form>
            </CardContent>
          </Card>
        )}

        <div className="grid gap-4 sm:grid-cols-3">
          <MetricCard
            label="Problems solved"
            value={algorithmLogs.length}
            detail="practice problems logged this semester"
            icon={<BrainCircuit className="h-5 w-5" />}
          />
          <MetricCard
            label="Practice time"
            value={`${algorithmMinutes} min`}
            detail={`average confidence ${averageConfidence}/5`}
            icon={<Clock3 className="h-5 w-5" />}
          />
          <MetricCard
            label="Applications"
            value={applications.length}
            detail={`${applications.filter((item) => item.stage === "assessment" || item.stage === "interview").length} active next stages`}
            icon={<Briefcase className="h-5 w-5" />}
          />
        </div>

        <div className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
          <Card>
            <CardHeader>
              <CardTitle>Algorithm practice log</CardTitle>
              <CardDescription>
                The lesson is more reusable than the green checkmark.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {algorithmLogs.map((log) => (
                <div
                  key={log.id}
                  className="rounded-2xl border border-border bg-surface p-4"
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="font-black">{log.problemName}</p>
                        <Badge
                          variant={
                            log.difficulty === "Hard"
                              ? "danger"
                              : log.difficulty === "Medium"
                                ? "warning"
                                : "success"
                          }
                        >
                          {log.difficulty}
                        </Badge>
                      </div>
                      <p className="mt-1 text-xs text-muted">
                        {log.platform} · {log.topic} · {log.minutes} minutes
                      </p>
                    </div>
                    <Badge>{log.confidence}/5 confidence</Badge>
                  </div>
                  {log.lesson && (
                    <p className="mt-3 rounded-xl bg-surface-muted p-3 text-sm leading-6">
                      <strong>Key lesson:</strong> {log.lesson}
                    </p>
                  )}
                </div>
              ))}
              {!algorithmLogs.length && (
                <EmptyState
                  icon={<BrainCircuit className="h-6 w-6" />}
                  title="No practice logged"
                  description="Log the problem, topic, and time so preparation becomes visible evidence."
                  action={<Button onClick={() => setActiveForm("practice")}>Log practice</Button>}
                />
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Application board</CardTitle>
              <CardDescription>
                Every active application has one visible next action.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {applications.map((application) => (
                <div
                  key={application.id}
                  className="rounded-2xl border border-border bg-surface p-4"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-black">{application.company}</p>
                      <p className="mt-1 text-sm text-muted">
                        {application.role}
                      </p>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <Badge
                        variant={stageVariant[application.stage]}
                        className="capitalize"
                      >
                        {application.stage}
                      </Badge>
                      <label className="text-right text-[10px] font-black uppercase tracking-wider text-muted">
                        Move stage
                        <select
                          className="mt-1 block rounded-lg border border-border bg-surface-muted px-2 py-1 text-xs font-bold normal-case tracking-normal text-foreground outline-none focus:border-accent"
                          value={application.stage}
                          onChange={(event) =>
                            updateApplicationStage(
                              application.id,
                              event.target.value as JobApplication["stage"],
                            )
                          }
                        >
                          <option value="saved">Saved</option>
                          <option value="applied">Applied</option>
                          <option value="assessment">Assessment</option>
                          <option value="interview">Interview</option>
                          <option value="offer">Offer</option>
                          <option value="closed">Closed</option>
                        </select>
                      </label>
                    </div>
                  </div>
                  {application.nextAction && (
                    <div className="mt-4 border-t border-border pt-3">
                      <p className="text-xs font-black uppercase tracking-wider text-muted">
                        Next action
                      </p>
                      <p className="mt-1 text-sm font-semibold">
                        {application.nextAction}
                      </p>
                      {application.nextActionDate && (
                        <p className="mt-1 text-xs text-muted">
                          By{" "}
                          {formatDate(
                            `${application.nextActionDate}T12:00:00`,
                          )}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              ))}
              {!applications.length && (
                <EmptyState
                  icon={<Briefcase className="h-6 w-6" />}
                  title="No applications yet"
                  description="Add an opportunity and its next action so nothing disappears into a spreadsheet."
                  action={<Button onClick={() => setActiveForm("application")}>Add application</Button>}
                />
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </PageShell>
  );
}
