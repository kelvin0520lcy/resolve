"use client";

import { useState, type FormEvent } from "react";
import {
  BookOpen,
  CheckCircle2,
  Clock3,
  GraduationCap,
  Minus,
  Plus,
  X,
} from "lucide-react";
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
} from "@/components/ui/resolve";
import { offsetDate, useResolve } from "@/contexts/resolve-context";
import { formatDate } from "@/lib/utils";
import type { Assessment } from "@/types";

export default function AcademicsPage() {
  const {
    modules,
    addModule,
    addAssessment,
    updateAssessmentProgress,
    updateModuleStudyMinutes,
  } = useResolve();
  const [showForm, setShowForm] = useState(false);
  const [showAssessment, setShowAssessment] = useState(false);
  const [code, setCode] = useState("");
  const [name, setName] = useState("");
  const [credits, setCredits] = useState("4");
  const [targetGrade, setTargetGrade] = useState("A");
  const [assessmentModuleId, setAssessmentModuleId] = useState("");
  const [assessmentTitle, setAssessmentTitle] = useState("");
  const [assessmentType, setAssessmentType] =
    useState<Assessment["type"]>("assignment");
  const [assessmentWeight, setAssessmentWeight] = useState("20");
  const [assessmentDeadline, setAssessmentDeadline] = useState(offsetDate(7));

  function submit(event: FormEvent) {
    event.preventDefault();
    if (!code.trim() || !name.trim()) return;
    addModule({
      code,
      name,
      credits: Number(credits),
      targetGrade,
      color: "#7eb8da",
    });
    setCode("");
    setName("");
    setShowForm(false);
  }

  function submitAssessment(event: FormEvent) {
    event.preventDefault();
    const moduleId = assessmentModuleId || modules[0]?.id;
    if (!moduleId || !assessmentTitle.trim()) return;
    addAssessment({
      moduleId,
      title: assessmentTitle,
      type: assessmentType,
      weight: Number(assessmentWeight),
      deadline: assessmentDeadline,
    });
    setAssessmentTitle("");
    setShowAssessment(false);
  }
  const studyMinutes = modules.reduce(
    (sum, module) => sum + module.weeklyStudyMinutes,
    0,
  );
  const assessments = modules
    .flatMap((module) =>
      module.assessments.map((assessment) => ({
        ...assessment,
        moduleCode: module.code,
        moduleColor: module.color,
      })),
    )
    .sort((a, b) => a.deadline.localeCompare(b.deadline));
  const leastAttention = [...modules].sort(
    (a, b) => a.weeklyStudyMinutes - b.weeklyStudyMinutes,
  )[0];

  return (
    <PageShell title="Academics">
      <div className="mx-auto max-w-7xl space-y-6">
        <PageIntro
          eyebrow="Classroom"
          title="Know where your attention is going"
          description="Module health combines assessment progress, the next deadline, and actual weekly study time."
          action={
            <div className="flex flex-wrap gap-2">
              <Button
                onClick={() => {
                  setShowForm((value) => !value);
                  setShowAssessment(false);
                }}
              >
                {showForm ? <X className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
                {showForm ? "Close" : "Module"}
              </Button>
              <Button
                variant="secondary"
                disabled={!modules.length}
                onClick={() => {
                  setShowAssessment((value) => !value);
                  setShowForm(false);
                }}
              >
                {showAssessment ? <X className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
                Assessment
              </Button>
            </div>
          }
        />

        {showForm && (
          <Card className="border-accent/30">
            <CardHeader>
              <CardTitle>Add a module</CardTitle>
              <CardDescription>
                Start with the course identity. Study time and assessments will
                build its health signal.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form
                onSubmit={submit}
                className="grid gap-3 sm:grid-cols-[120px_1fr_100px_110px_auto]"
              >
                <input
                  className={fieldClassName}
                  value={code}
                  onChange={(event) => setCode(event.target.value)}
                  aria-label="Module code"
                  autoFocus
                  required
                />
                <input
                  className={fieldClassName}
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  aria-label="Module name"
                  required
                />
                <input
                  className={fieldClassName}
                  value={credits}
                  onChange={(event) => setCredits(event.target.value)}
                  type="number"
                  min="1"
                  max="30"
                  aria-label="Credits"
                  required
                />
                <input
                  className={fieldClassName}
                  value={targetGrade}
                  onChange={(event) => setTargetGrade(event.target.value)}
                  aria-label="Target grade"
                  required
                />
                <Button type="submit">Add</Button>
              </form>
            </CardContent>
          </Card>
        )}

        {showAssessment && (
          <Card className="border-accent/30">
            <CardHeader>
              <CardTitle>Add an assessment</CardTitle>
              <CardDescription>
                Attach the deadline and weight to the module it affects.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form
                onSubmit={submitAssessment}
                className="grid gap-3 md:grid-cols-2 xl:grid-cols-[160px_1fr_160px_110px_170px_auto]"
              >
                <select
                  className={fieldClassName}
                  value={assessmentModuleId || modules[0]?.id}
                  onChange={(event) =>
                    setAssessmentModuleId(event.target.value)
                  }
                  aria-label="Assessment module"
                >
                  {modules.map((module) => (
                    <option key={module.id} value={module.id}>
                      {module.code}
                    </option>
                  ))}
                </select>
                <input
                  className={fieldClassName}
                  value={assessmentTitle}
                  onChange={(event) =>
                    setAssessmentTitle(event.target.value)
                  }
                  aria-label="Assessment title"
                  autoFocus
                  required
                />
                <select
                  className={fieldClassName}
                  value={assessmentType}
                  onChange={(event) =>
                    setAssessmentType(
                      event.target.value as Assessment["type"],
                    )
                  }
                  aria-label="Assessment type"
                >
                  <option value="assignment">Assignment</option>
                  <option value="project">Project</option>
                  <option value="quiz">Quiz</option>
                  <option value="midterm">Midterm</option>
                  <option value="presentation">Presentation</option>
                  <option value="exam">Exam</option>
                </select>
                <input
                  className={fieldClassName}
                  value={assessmentWeight}
                  onChange={(event) =>
                    setAssessmentWeight(event.target.value)
                  }
                  type="number"
                  min="0"
                  max="100"
                  aria-label="Assessment weight"
                  required
                />
                <input
                  className={fieldClassName}
                  value={assessmentDeadline}
                  onChange={(event) =>
                    setAssessmentDeadline(event.target.value)
                  }
                  type="date"
                  aria-label="Assessment deadline"
                  required
                />
                <Button type="submit">Add</Button>
              </form>
            </CardContent>
          </Card>
        )}

        <div className="grid gap-4 sm:grid-cols-3">
          <MetricCard
            label="Modules"
            value={modules.length}
            detail={`${modules.reduce((sum, item) => sum + item.credits, 0)} total credits`}
            icon={<BookOpen className="h-5 w-5" />}
          />
          <MetricCard
            label="Study this week"
            value={`${Math.floor(studyMinutes / 60)}h ${studyMinutes % 60}m`}
            detail="across tracked modules"
            icon={<Clock3 className="h-5 w-5" />}
          />
          <MetricCard
            label="Needs attention"
            value={leastAttention?.code ?? "No modules"}
            detail={
              leastAttention
                ? `${leastAttention.weeklyStudyMinutes} minutes this week`
                : "Add a module to begin tracking"
            }
            icon={<GraduationCap className="h-5 w-5" />}
          />
        </div>

        {modules.length ? <div className="grid gap-5 lg:grid-cols-3">
          {modules.map((module) => {
            const sortedAssessments = [...module.assessments].sort((a, b) =>
              a.deadline.localeCompare(b.deadline),
            );
            const nextAssessment =
              sortedAssessments.find(
                (assessment) =>
                  assessment.status !== "submitted" &&
                  assessment.status !== "graded",
              ) ?? sortedAssessments[0];
            return (
              <Card key={module.id} className="overflow-hidden">
                <div
                  className="h-2"
                  style={{ backgroundColor: module.color }}
                />
                <CardHeader>
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p
                        className="text-xs font-black uppercase tracking-[0.15em]"
                        style={{ color: module.color }}
                      >
                        {module.code}
                      </p>
                      <CardTitle className="mt-2 text-base">
                        {module.name}
                      </CardTitle>
                    </div>
                    <Badge>{module.credits} CU</Badge>
                  </div>
                  <CardDescription>{module.lecturer}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-3 gap-3">
                    <div className="rounded-xl bg-surface-muted p-3">
                      <p className="text-xs text-muted">Target</p>
                      <p className="mt-1 text-xl font-black">
                        {module.targetGrade}
                      </p>
                    </div>
                    <div className="rounded-xl bg-surface-muted p-3">
                      <p className="text-xs text-muted">Estimated</p>
                      <p className="mt-1 text-xl font-black">
                        {module.estimatedGrade ?? "—"}
                      </p>
                    </div>
                    <div className="rounded-xl bg-surface-muted p-3">
                      <p className="text-xs text-muted">Study</p>
                      <p className="mt-1 text-xl font-black">
                        {module.weeklyStudyMinutes}
                        <span className="ml-1 text-xs font-semibold text-muted">
                          min
                        </span>
                      </p>
                    </div>
                  </div>
                  <div className="mt-3 flex items-center justify-between gap-3 rounded-xl border border-border px-3 py-2">
                    <span className="text-xs font-bold text-muted">
                      Weekly study log
                    </span>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() =>
                          updateModuleStudyMinutes(
                            module.id,
                            module.weeklyStudyMinutes - 25,
                          )
                        }
                        className="flex h-8 w-8 items-center justify-center rounded-lg border border-border bg-surface-muted transition hover:border-accent"
                        aria-label={`Remove 25 study minutes from ${module.code}`}
                      >
                        <Minus className="h-3.5 w-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          updateModuleStudyMinutes(
                            module.id,
                            module.weeklyStudyMinutes + 25,
                          )
                        }
                        className="flex h-8 items-center gap-1 rounded-lg border border-border bg-surface-muted px-2 text-xs font-black transition hover:border-accent"
                        aria-label={`Add 25 study minutes to ${module.code}`}
                      >
                        <Plus className="h-3.5 w-3.5" />
                        25 min
                      </button>
                    </div>
                  </div>
                  {nextAssessment && (
                    <div className="mt-4 border-t border-border pt-4">
                      <div className="flex justify-between gap-3 text-sm">
                        <span className="font-bold">{nextAssessment.title}</span>
                        <span className="shrink-0 text-muted">
                          {nextAssessment.weight}%
                        </span>
                      </div>
                      <ProgressBar
                        className="mt-3"
                        value={nextAssessment.progress}
                        color={module.color}
                      />
                      <p className="mt-2 text-xs text-muted">
                        {nextAssessment.progress}% prepared · due{" "}
                        {formatDate(`${nextAssessment.deadline}T12:00:00`)}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div> : (
          <EmptyState
            icon={<BookOpen className="h-6 w-6" />}
            title="Add your first module"
            description="Once your real modules are here, this page can compare workload and show where attention is needed."
            action={<Button onClick={() => setShowForm(true)}>Add module</Button>}
          />
        )}

        <Card>
          <CardHeader>
            <CardTitle>Assessment runway</CardTitle>
            <CardDescription>
              Preparation should rise before urgency does.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {assessments.map((assessment) => (
              <div
                key={assessment.id}
                className="grid items-center gap-3 rounded-2xl border border-border bg-surface p-4 md:grid-cols-[100px_1fr_minmax(180px,0.8fr)_150px]"
              >
                <Badge
                  style={{
                    backgroundColor: `${assessment.moduleColor}18`,
                    color: assessment.moduleColor,
                  }}
                >
                  {assessment.moduleCode}
                </Badge>
                <div>
                  <p className="font-bold">{assessment.title}</p>
                  <p className="mt-1 text-xs capitalize text-muted">
                    {assessment.type.replace("_", " ")} · {assessment.weight}%
                  </p>
                </div>
                <div>
                  <ProgressBar
                    value={assessment.progress}
                    color={assessment.moduleColor}
                  />
                  <div className="mt-2 flex items-center justify-between gap-3">
                    <label
                      className="flex-1 text-xs font-bold text-muted"
                      htmlFor={`assessment-progress-${assessment.id}`}
                    >
                      {assessment.progress}% prepared
                    </label>
                    <Badge
                      variant={
                        assessment.status === "submitted" ||
                        assessment.status === "graded"
                          ? "success"
                          : assessment.status === "in_progress"
                            ? "accent"
                            : "default"
                      }
                    >
                      {assessment.status === "submitted"
                        ? "complete"
                        : assessment.status.replace("_", " ")}
                    </Badge>
                  </div>
                  <input
                    id={`assessment-progress-${assessment.id}`}
                    className="mt-2 w-full accent-pink-500"
                    type="range"
                    min="0"
                    max="100"
                    step="5"
                    value={assessment.progress}
                    onChange={(event) =>
                      updateAssessmentProgress(
                        assessment.moduleId,
                        assessment.id,
                        Number(event.target.value),
                      )
                    }
                    aria-label={`Preparation progress for ${assessment.title}`}
                  />
                </div>
                <div className="space-y-2 md:text-right">
                  <p className="text-sm font-semibold">
                    {formatDate(`${assessment.deadline}T12:00:00`)}
                  </p>
                  <Button
                    type="button"
                    size="sm"
                    variant={
                      assessment.progress === 100 ? "secondary" : "default"
                    }
                    disabled={assessment.progress === 100}
                    onClick={() =>
                      updateAssessmentProgress(
                        assessment.moduleId,
                        assessment.id,
                        100,
                      )
                    }
                  >
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    {assessment.progress === 100
                      ? "Completed"
                      : "Mark complete"}
                  </Button>
                </div>
              </div>
            ))}
            {!assessments.length && (
              <EmptyState
                title="No assessment deadlines yet"
                description="Add the first real deadline to turn this runway into a preparation plan."
                action={
                  modules.length ? (
                    <Button onClick={() => setShowAssessment(true)}>
                      Add assessment
                    </Button>
                  ) : undefined
                }
              />
            )}
          </CardContent>
        </Card>
      </div>
    </PageShell>
  );
}
