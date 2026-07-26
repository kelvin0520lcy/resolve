"use client";

import { useState, type FormEvent } from "react";
import {
  BrainCircuit,
  Briefcase,
  Clock3,
  Pencil,
  Plus,
  X,
} from "lucide-react";
import { PageShell } from "@/components/layout/page-shell";
import { Badge } from "@/components/ui/badge";
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
    updateAlgorithmLog,
    removeAlgorithmLog,
    addApplication,
    updateApplication,
    removeApplication,
    updateApplicationStage,
  } = useResolve();
  const [activeForm, setActiveForm] = useState<
    "practice" | "application" | null
  >(null);
  const [editingPracticeId, setEditingPracticeId] = useState<string | null>(
    null,
  );
  const [editingApplicationId, setEditingApplicationId] = useState<
    string | null
  >(null);
  const [platform, setPlatform] = useState("LeetCode");
  const [problemName, setProblemName] = useState("");
  const [topic, setTopic] = useState("");
  const [completedDate, setCompletedDate] = useState(offsetDate(0));
  const [minutes, setMinutes] = useState("30");
  const [difficulty, setDifficulty] =
    useState<AlgorithmLog["difficulty"]>("Medium");
  const [confidence, setConfidence] = useState("3");
  const [usedHints, setUsedHints] = useState(false);
  const [lesson, setLesson] = useState("");
  const [company, setCompany] = useState("");
  const [role, setRole] = useState("");
  const [applicationDate, setApplicationDate] = useState(offsetDate(0));
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

  function resetPracticeForm() {
    setPlatform("LeetCode");
    setProblemName("");
    setTopic("");
    setCompletedDate(offsetDate(0));
    setMinutes("30");
    setDifficulty("Medium");
    setConfidence("3");
    setUsedHints(false);
    setLesson("");
    setEditingPracticeId(null);
    setActiveForm(null);
  }

  function startNewPractice() {
    resetPracticeForm();
    setEditingApplicationId(null);
    setActiveForm("practice");
  }

  function startEditingPractice(log: AlgorithmLog) {
    setEditingPracticeId(log.id);
    setPlatform(log.platform);
    setProblemName(log.problemName);
    setTopic(log.topic);
    setCompletedDate(log.completedDate);
    setMinutes(String(log.minutes));
    setDifficulty(log.difficulty);
    setConfidence(String(log.confidence));
    setUsedHints(log.usedHints);
    setLesson(log.lesson);
    setEditingApplicationId(null);
    setActiveForm("practice");
    window.requestAnimationFrame(() => {
      document
        .getElementById("practice-log-editor")
        ?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  }

  function resetApplicationForm() {
    setCompany("");
    setRole("");
    setApplicationDate(offsetDate(0));
    setStage("applied");
    setNextAction("");
    setNextActionDate(offsetDate(3));
    setEditingApplicationId(null);
    setActiveForm(null);
  }

  function startNewApplication() {
    resetApplicationForm();
    setEditingPracticeId(null);
    setActiveForm("application");
  }

  function startEditingApplication(application: JobApplication) {
    setEditingApplicationId(application.id);
    setCompany(application.company);
    setRole(application.role);
    setApplicationDate(application.applicationDate);
    setStage(application.stage);
    setNextAction(application.nextAction ?? "");
    setNextActionDate(application.nextActionDate ?? offsetDate(3));
    setEditingPracticeId(null);
    setActiveForm("application");
    window.requestAnimationFrame(() => {
      document
        .getElementById("application-editor")
        ?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  }

  function submitPractice(event: FormEvent) {
    event.preventDefault();
    if (!problemName.trim() || !topic.trim() || !lesson.trim()) return;
    const changes = {
      platform,
      problemName,
      topic,
      difficulty,
      completedDate,
      minutes: Number(minutes),
      usedHints,
      confidence: Number(confidence),
      lesson,
    };
    if (editingPracticeId) {
      updateAlgorithmLog(editingPracticeId, changes);
    } else {
      addAlgorithmLog(changes);
    }
    resetPracticeForm();
  }

  function submitApplication(event: FormEvent) {
    event.preventDefault();
    if (!company.trim() || !role.trim()) return;
    const changes = {
      company,
      role,
      applicationDate,
      stage,
      nextAction,
      nextActionDate: nextAction.trim() ? nextActionDate : undefined,
    };
    if (editingApplicationId) {
      updateApplication(editingApplicationId, changes);
    } else {
      addApplication(changes);
    }
    resetApplicationForm();
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
                onClick={() => {
                  if (activeForm === "practice") resetPracticeForm();
                  else startNewPractice();
                }}
              >
                {activeForm === "practice" ? <X className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
                Practice
              </Button>
              <Button
                size="sm"
                variant="secondary"
                onClick={() => {
                  if (activeForm === "application") resetApplicationForm();
                  else startNewApplication();
                }}
              >
                {activeForm === "application" ? <X className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
                Application
              </Button>
            </div>
          }
        />

        {activeForm === "practice" && (
          <Card id="practice-log-editor" className="border-accent/30">
            <CardHeader>
              <CardTitle>
                {editingPracticeId
                  ? "Edit interview practice"
                  : "Log interview practice"}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form
                onSubmit={submitPractice}
                className="grid gap-3 md:grid-cols-2 xl:grid-cols-6"
              >
                <label className={alignedFieldLabelClassName}>
                  <span className="flex items-end">Platform</span>
                  <input
                    className={fieldClassName}
                    value={platform}
                    onChange={(event) => setPlatform(event.target.value)}
                    required
                  />
                </label>
                <label
                  className={`${alignedFieldLabelClassName} md:col-span-1 xl:col-span-2`}
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
                  <span className="flex items-end">Practice date</span>
                  <input
                    className={fieldClassName}
                    value={completedDate}
                    onChange={(event) => setCompletedDate(event.target.value)}
                    type="date"
                    max={offsetDate(0)}
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
                  {editingPracticeId
                    ? "Save practice changes"
                    : "Save practice evidence"}
                </Button>
              </form>
            </CardContent>
          </Card>
        )}

        {activeForm === "application" && (
          <Card id="application-editor" className="border-accent/30">
            <CardHeader>
              <CardTitle>
                {editingApplicationId
                  ? "Edit application"
                  : "Add an application"}
              </CardTitle>
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
                  <span className="flex items-end">Application date</span>
                  <input
                    className={fieldClassName}
                    value={applicationDate}
                    onChange={(event) =>
                      setApplicationDate(event.target.value)
                    }
                    type="date"
                    max={offsetDate(0)}
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
                  {editingApplicationId
                    ? "Save application changes"
                    : "Add application"}
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
                    <div className="flex flex-wrap items-center justify-end gap-2">
                      <Badge>{log.confidence}/5 confidence</Badge>
                      <Button
                        type="button"
                        size="sm"
                        variant="ghost"
                        onClick={() => startEditingPractice(log)}
                        aria-label={`Edit practice log ${log.problemName}`}
                      >
                        <Pencil className="h-3.5 w-3.5" />
                        Edit
                      </Button>
                      <ConfirmDeleteButton
                        itemLabel={`practice log ${log.problemName}`}
                        onConfirm={() => removeAlgorithmLog(log.id)}
                        className="flex-wrap justify-end"
                      />
                    </div>
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
                  action={<Button onClick={startNewPractice}>Log practice</Button>}
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
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div className="min-w-0">
                      <p className="break-words font-black">
                        {application.company}
                      </p>
                      <p className="mt-1 break-words text-sm text-muted">
                        {application.role}
                      </p>
                    </div>
                    <div className="flex w-full min-w-0 flex-wrap items-end gap-2 sm:w-auto sm:justify-end">
                      <Badge
                        variant={stageVariant[application.stage]}
                        className="capitalize"
                      >
                        {application.stage}
                      </Badge>
                      <label className="text-left text-[10px] font-black uppercase tracking-wider text-muted sm:text-right">
                        Move stage
                        <select
                          className="mt-1 block max-w-full rounded-lg border border-border bg-surface-muted px-2 py-1 text-xs font-bold normal-case tracking-normal text-foreground outline-none focus:border-accent"
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
                      <ConfirmDeleteButton
                        itemLabel={`application ${application.company} ${application.role}`}
                        onConfirm={() => removeApplication(application.id)}
                        className="flex-wrap justify-end"
                      />
                      <Button
                        type="button"
                        size="sm"
                        variant="ghost"
                        onClick={() => startEditingApplication(application)}
                        aria-label={`Edit application ${application.company} ${application.role}`}
                      >
                        <Pencil className="h-3.5 w-3.5" />
                        Edit
                      </Button>
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
                  action={<Button onClick={startNewApplication}>Add application</Button>}
                />
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </PageShell>
  );
}
