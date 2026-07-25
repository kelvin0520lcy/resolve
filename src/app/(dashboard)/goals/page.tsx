"use client";

import { useState, type FormEvent } from "react";
import { AlertTriangle, CheckCircle2, Plus, Target, X } from "lucide-react";
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
    removeGoal,
    addMilestone,
    toggleMilestone,
    removeMilestone,
    setGoalCompleted,
  } = useResolve();
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState<GoalCategory>("academics");
  const [priority, setPriority] = useState<Goal["priority"]>("medium");
  const [deadline, setDeadline] = useState(offsetDate(60));

  function submit(event: FormEvent) {
    event.preventDefault();
    if (!title.trim() || !description.trim()) return;
    addGoal({
      title: title.trim(),
      description: description.trim(),
      category,
      priority,
      deadline,
    });
    setTitle("");
    setDescription("");
    setShowForm(false);
  }

  return (
    <PageShell title="Goals">
      <div className="mx-auto max-w-7xl space-y-6">
        <PageIntro
          eyebrow="Semester resolutions"
          title="Turn intention into evidence"
          description="Every goal gets a clear outcome, smaller finish lines, and a completion rule you can trust."
          action={
            <Button onClick={() => setShowForm((value) => !value)}>
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
          <Card className="border-accent/30">
            <CardHeader>
              <CardTitle>Create a goal</CardTitle>
              <CardDescription>
                Describe the outcome, then break it into smaller finish lines.
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
                  Add semester goal
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
                      Complete every breakdown step to finish this goal
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
            description="Create one meaningful outcome, then add the smaller steps that make it achievable."
            action={
              <Button onClick={() => setShowForm(true)}>Create a goal</Button>
            }
          />
        )}
      </div>
    </PageShell>
  );
}
