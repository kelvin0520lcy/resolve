"use client";

import { useState, type FormEvent } from "react";
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
    milestones,
    addGoal,
    updateGoal,
    removeGoal,
    addMilestone,
    updateMilestone,
    toggleMilestone,
    removeMilestone,
    setGoalCompleted,
  } = useResolve();
  const [showForm, setShowForm] = useState(false);
  const [editingGoalId, setEditingGoalId] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState<GoalCategory>("academics");
  const [priority, setPriority] = useState<Goal["priority"]>("medium");
  const [deadline, setDeadline] = useState(offsetDate(60));

  function resetForm() {
    setTitle("");
    setDescription("");
    setCategory("academics");
    setPriority("medium");
    setDeadline(offsetDate(60));
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
                    min={offsetDate(0)}
                    required
                  />
                </label>
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
              <Card key={goal.id} className="overflow-hidden">
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
                  <div className="flex items-start justify-between gap-4">
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
                      <ConfirmDeleteButton
                        itemLabel={`goal ${goal.title}`}
                        onConfirm={() => removeGoal(goal.id)}
                        className="flex-wrap justify-end"
                      />
                    </div>
                  </div>
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
