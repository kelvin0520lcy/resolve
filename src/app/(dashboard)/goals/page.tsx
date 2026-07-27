"use client";

import Link from "next/link";
import { useEffect, useState, type FormEvent } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  Pencil,
  Plus,
  Target,
  X,
} from "lucide-react";
import { GoalBreakdown } from "@/components/goals/goal-breakdown";
import { PageShell } from "@/components/layout/page-shell";
import { Badge, ProgressBar } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { LinkedRecordDeleteButton } from "@/components/ui/linked-record-delete-button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  CategoryBadge,
  EmptyState,
  MetricCard,
  PageIntro,
  fieldClassName,
  textAreaClassName,
} from "@/components/ui/resolve";
import { offsetDate, useResolve } from "@/contexts/resolve-context";
import { formatDate } from "@/lib/utils";
import type { Goal, GoalCategory } from "@/types";

export default function GoalsPage() {
  const {
    goals,
    tasks,
    milestones,
    addGoal,
    updateGoal,
    removeGoal,
    addMilestone,
    updateMilestone,
    toggleMilestone,
    removeMilestone,
    setGoalCompleted,
    setMilestoneCompletionMode,
  } = useResolve();
  const [showForm, setShowForm] = useState(false);
  const [editingGoalId, setEditingGoalId] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState<GoalCategory>("academics");
  const [priority, setPriority] = useState<Goal["priority"]>("medium");
  const [deadline, setDeadline] = useState(offsetDate(60));
  const [measurementType, setMeasurementType] =
    useState<Goal["measurementType"]>("manual");
  const [targetValue, setTargetValue] = useState("");
  const [currentValue, setCurrentValue] = useState("");
  const [unit, setUnit] = useState("");

  useEffect(() => {
    let frame = 0;
    const openLinkedGoal = (href = window.location.href) => {
      const goalId = new URL(href, window.location.origin).searchParams.get(
        "goal",
      );
      if (!goalId) return;
      frame = window.requestAnimationFrame(() =>
        document
          .getElementById(`goal-${goalId}`)
          ?.scrollIntoView({ behavior: "smooth", block: "center" }),
      );
    };
    const handleRecord = (event: Event) => {
      const href = (event as CustomEvent<{ href?: string }>).detail?.href;
      if (href?.startsWith("/goals")) openLinkedGoal(href);
    };
    openLinkedGoal();
    window.addEventListener("resolve:open-record", handleRecord);
    return () => {
      window.cancelAnimationFrame(frame);
      window.removeEventListener("resolve:open-record", handleRecord);
    };
  }, [goals.length]);
  const activeTaskByGoal = new Map(
    tasks
      .filter(
        (task) =>
          task.goalId &&
          !["completed", "cancelled", "skipped"].includes(task.status),
      )
      .map((task) => [task.goalId!, task]),
  );

  function resetForm() {
    setTitle("");
    setDescription("");
    setCategory("academics");
    setPriority("medium");
    setDeadline(offsetDate(60));
    setMeasurementType("manual");
    setTargetValue("");
    setCurrentValue("");
    setUnit("");
    setEditingGoalId(null);
    setShowForm(false);
  }

  function startNewGoal() {
    resetForm();
    setShowForm(true);
  }

  function startEditingGoal(goal: Goal) {
    setEditingGoalId(goal.id);
    setTitle(goal.title);
    setDescription(goal.description);
    setCategory(goal.category as GoalCategory);
    setPriority(goal.priority);
    setDeadline(goal.deadline ?? offsetDate(60));
    setMeasurementType(
      goal.measurementType === "milestone" ? "manual" : goal.measurementType,
    );
    setTargetValue(
      goal.targetValue === undefined ? "" : String(goal.targetValue),
    );
    setCurrentValue(
      goal.currentValue === undefined ? "" : String(goal.currentValue),
    );
    setUnit(goal.unit ?? "");
    setShowForm(true);
    window.requestAnimationFrame(() => {
      document
        .getElementById("goal-editor")
        ?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  }

  function submit(event: FormEvent) {
    event.preventDefault();
    if (!title.trim() || !description.trim()) return;
    const changes = {
      title: title.trim(),
      description: description.trim(),
      category,
      priority,
      deadline,
      measurementType,
      targetValue: targetValue ? Number(targetValue) : undefined,
      currentValue: currentValue ? Number(currentValue) : undefined,
      unit: unit.trim() || undefined,
    };
    if (editingGoalId) {
      updateGoal(editingGoalId, changes);
    } else {
      addGoal(changes);
    }
    resetForm();
  }

  return (
    <PageShell title="Goals">
      <div className="mx-auto max-w-7xl space-y-6">
        <PageIntro
          eyebrow="Semester resolutions"
          title="Turn intention into evidence"
          description="Give every goal a clear outcome, then add smaller finish lines only when they are useful."
          action={
            <Button
              onClick={() => {
                if (showForm) resetForm();
                else startNewGoal();
              }}
            >
              {showForm ? <X className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
              {showForm ? "Close" : "New goal"}
            </Button>
          }
        />

        <div className="grid gap-4 sm:grid-cols-3">
          <MetricCard
            label="Active goals"
            value={goals.filter((goal) => goal.status === "active").length}
            detail="moving this semester"
            icon={<Target className="h-5 w-5" />}
          />
          <MetricCard
            label="At risk"
            value={goals.filter((goal) => goal.status === "at_risk").length}
            detail="needs a scheduled action"
            icon={<AlertTriangle className="h-5 w-5" />}
          />
          <MetricCard
            label="Completed"
            value={goals.filter((goal) => goal.status === "completed").length}
            detail="resolution arcs finished"
            icon={<CheckCircle2 className="h-5 w-5" />}
          />
        </div>

        {showForm && (
          <Card id="goal-editor" className="border-accent/30">
            <CardHeader>
              <CardTitle>
                {editingGoalId ? "Edit goal" : "Create a goal"}
              </CardTitle>
              <CardDescription>
                Describe the outcome. Add smaller finish lines only when they
                make the goal easier to act on.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={submit} className="grid gap-4 md:grid-cols-2">
                <label className="text-sm font-bold">
                  Goal title
                  <input
                    className={`${fieldClassName} mt-2`}
                    value={title}
                    onChange={(event) => setTitle(event.target.value)}
                    autoFocus
                    required
                  />
                </label>
                <label className="text-sm font-bold">
                  Category
                  <select
                    className={`${fieldClassName} mt-2`}
                    value={category}
                    onChange={(event) =>
                      setCategory(event.target.value as GoalCategory)
                    }
                  >
                    <option value="academics">Academics</option>
                    <option value="career">Career</option>
                    <option value="technical">Technical skills</option>
                    <option value="guitar">Guitar</option>
                    <option value="health">Health</option>
                    <option value="personal">Personal project</option>
                    <option value="finance">Finance</option>
                    <option value="social">Social</option>
                    <option value="custom">Other</option>
                  </select>
                </label>
                <label className="text-sm font-bold md:col-span-2">
                  What does done look like?
                  <textarea
                    className={`${textAreaClassName} mt-2`}
                    value={description}
                    onChange={(event) => setDescription(event.target.value)}
                    required
                  />
                </label>
                <label className="text-sm font-bold">
                  Priority
                  <select
                    className={`${fieldClassName} mt-2`}
                    value={priority}
                    onChange={(event) =>
                      setPriority(event.target.value as Goal["priority"])
                    }
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </label>
                <label className="text-sm font-bold">
                  Deadline
                  <input
                    className={`${fieldClassName} mt-2`}
                    value={deadline}
                    onChange={(event) => setDeadline(event.target.value)}
                    type="date"
                    min={editingGoalId ? undefined : offsetDate(0)}
                    required
                  />
                </label>
                <label className="text-sm font-bold">
                  Progress tracking
                  <select
                    className={`${fieldClassName} mt-2`}
                    value={measurementType}
                    onChange={(event) =>
                      setMeasurementType(
                        event.target.value as Goal["measurementType"],
                      )
                    }
                  >
                    <option value="manual">Complete manually</option>
                    <option value="percentage">Percentage</option>
                    <option value="count">Count</option>
                    <option value="duration">Duration</option>
                  </select>
                </label>
                {measurementType !== "manual" && (
                  <>
                    <label className="text-sm font-bold">
                      Current value
                      <input
                        className={`${fieldClassName} mt-2`}
                        type="number"
                        min="0"
                        value={currentValue}
                        onChange={(event) => setCurrentValue(event.target.value)}
                        placeholder="0"
                      />
                    </label>
                    <label className="text-sm font-bold">
                      Target value
                      <input
                        className={`${fieldClassName} mt-2`}
                        type="number"
                        min="1"
                        value={targetValue}
                        onChange={(event) => setTargetValue(event.target.value)}
                        required
                      />
                    </label>
                    <label className="text-sm font-bold">
                      Unit
                      <input
                        className={`${fieldClassName} mt-2`}
                        value={unit}
                        onChange={(event) => setUnit(event.target.value)}
                        placeholder={
                          measurementType === "duration"
                            ? "hours"
                            : measurementType === "percentage"
                              ? "%"
                              : "items"
                        }
                      />
                    </label>
                  </>
                )}
                <Button className="md:col-span-2" type="submit">
                  {editingGoalId ? "Save goal changes" : "Add semester goal"}
                </Button>
              </form>
            </CardContent>
          </Card>
        )}

        {goals.length ? (
          <div className="grid gap-5 lg:grid-cols-2">
            {goals.map((goal) => (
              <Card
                key={goal.id}
                id={`goal-${goal.id}`}
                className="scroll-mt-24 overflow-hidden"
              >
                <div
                  className="h-1.5"
                  style={{
                    backgroundColor:
                      goal.status === "at_risk"
                        ? "var(--warning)"
                        : "var(--accent)",
                  }}
                />
                <CardHeader>
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <CategoryBadge category={goal.category} />
                    <div className="flex flex-wrap items-center justify-end gap-2">
                      <Badge
                        variant={
                          goal.status === "completed"
                            ? "success"
                            : goal.status === "at_risk"
                              ? "warning"
                              : "accent"
                        }
                        className="capitalize"
                      >
                        {goal.status.replace("_", " ")}
                      </Badge>
                      <Button
                        type="button"
                        size="sm"
                        variant="ghost"
                        onClick={() => startEditingGoal(goal)}
                        aria-label={`Edit goal ${goal.title}`}
                      >
                        <Pencil className="h-3.5 w-3.5" />
                        Edit
                      </Button>
                      <LinkedRecordDeleteButton
                        itemLabel={`goal ${goal.title}`}
                        linkedTaskCount={tasks.filter(
                          (task) =>
                            task.goalId === goal.id ||
                            milestones.some(
                              (milestone) =>
                                milestone.goalId === goal.id &&
                                task.milestoneId === milestone.id,
                            ),
                        ).length}
                        onConfirm={(policy) => removeGoal(goal.id, policy)}
                      />
                    </div>
                  </div>
                  {goal.measurementType !== "manual" &&
                    goal.measurementType !== "milestone" &&
                    goal.targetValue !== undefined && (
                      <div className="mt-3 rounded-xl border border-border bg-surface/60 p-3">
                        <ProgressBar
                          value={
                            ((goal.currentValue ?? 0) / goal.targetValue) * 100
                          }
                          label={`${goal.title} measured progress`}
                        />
                        <p className="mt-2 text-xs text-muted">
                          {goal.currentValue ?? 0} of {goal.targetValue}{" "}
                          {goal.unit ?? ""}
                        </p>
                      </div>
                    )}
                  <CardTitle className="pt-3">{goal.title}</CardTitle>
                  <CardDescription className="leading-6">
                    {goal.description}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border bg-surface/60 px-3 py-2">
                    <p className="text-xs font-black uppercase tracking-[0.12em] text-muted">
                      {milestones.some(
                        (milestone) => milestone.goalId === goal.id,
                      )
                        ? "Breakdown steps control completion"
                        : "Ready for direct completion"}
                    </p>
                    {goal.deadline && (
                      <p className="text-xs text-muted">
                        Due {formatDate(`${goal.deadline}T12:00:00`)}
                      </p>
                    )}
                  </div>
                  {goal.status !== "completed" && (
                    <div className="mt-3 rounded-xl border border-accent/25 bg-accent/5 p-3">
                      {activeTaskByGoal.get(goal.id) ? (
                        <>
                          <p className="text-[10px] font-black uppercase tracking-wider text-accent">
                            Visible next action
                          </p>
                          <p className="mt-1 break-words text-sm font-bold">
                            {activeTaskByGoal.get(goal.id)!.title}
                          </p>
                        </>
                      ) : (
                        <div className="flex flex-wrap items-center justify-between gap-3">
                          <div>
                            <p className="text-sm font-black">
                              This goal needs a concrete next action
                            </p>
                            <p className="mt-1 text-xs text-muted">
                              Create one shared task; it will also appear in
                              Today and Weekly Plan.
                            </p>
                          </div>
                          <Link
                            href={`/today?add=true&goal=${encodeURIComponent(goal.id)}`}
                            className="inline-flex min-h-9 max-w-full items-center rounded-xl bg-accent px-3 py-2 text-center text-xs font-black leading-tight text-white"
                          >
                            Create task
                          </Link>
                        </div>
                      )}
                    </div>
                  )}
                  <GoalBreakdown
                    goal={goal}
                    milestones={milestones.filter(
                      (milestone) => milestone.goalId === goal.id,
                    )}
                    addMilestone={addMilestone}
                    updateMilestone={updateMilestone}
                    toggleMilestone={toggleMilestone}
                    removeMilestone={removeMilestone}
                    setGoalCompleted={setGoalCompleted}
                    setMilestoneCompletionMode={setMilestoneCompletionMode}
                  />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <EmptyState
            icon={<Target className="h-6 w-6" />}
            title="No goals yet"
            description="Create one meaningful outcome. You can complete it directly or add a breakdown later."
            action={
              <Button onClick={startNewGoal}>Create a goal</Button>
            }
          />
        )}
      </div>
    </PageShell>
  );
}
