"use client";

import { useState, type FormEvent } from "react";
import { AlertTriangle, CheckCircle2, Plus, Target, X } from "lucide-react";
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
  CategoryBadge,
  MetricCard,
  PageIntro,
  fieldClassName,
  textAreaClassName,
} from "@/components/ui/resolve";
import { offsetDate, useResolve } from "@/contexts/resolve-context";
import { formatDate } from "@/lib/utils";
import type { GoalCategory } from "@/types";

export default function GoalsPage() {
  const { goals, milestones, addGoal, updateGoalProgress } = useResolve();
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState<GoalCategory>("academics");
  const [target, setTarget] = useState("10");
  const [unit, setUnit] = useState("sessions");

  function submit(event: FormEvent) {
    event.preventDefault();
    if (!title.trim() || !description.trim()) return;
    addGoal({
      title: title.trim(),
      description: description.trim(),
      category,
      priority: "medium",
      targetValue: Number(target) || 1,
      unit: unit.trim() || "steps",
      deadline: offsetDate(60),
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
          description="Every goal has a finish line, a reason, and progress you can update without managing a spreadsheet."
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
              <CardTitle>Create a measurable goal</CardTitle>
              <CardDescription>
                Describe the outcome first; tasks come later.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={submit} className="grid gap-4 md:grid-cols-2">
                <input
                  className={fieldClassName}
                  value={title}
                  onChange={(event) => setTitle(event.target.value)}
                  placeholder="Goal title"
                  aria-label="Goal title"
                  autoFocus
                  required
                />
                <select
                  className={fieldClassName}
                  value={category}
                  onChange={(event) =>
                    setCategory(event.target.value as GoalCategory)
                  }
                  aria-label="Goal category"
                >
                  <option value="academics">Academics</option>
                  <option value="career">Career</option>
                  <option value="technical">Technical skills</option>
                  <option value="guitar">Guitar</option>
                  <option value="health">Health</option>
                  <option value="personal">Personal project</option>
                </select>
                <textarea
                  className={`${textAreaClassName} md:col-span-2`}
                  value={description}
                  onChange={(event) => setDescription(event.target.value)}
                  placeholder="What does done look like?"
                  aria-label="Goal description"
                  required
                />
                <input
                  className={fieldClassName}
                  value={target}
                  onChange={(event) => setTarget(event.target.value)}
                  type="number"
                  min="1"
                  max="1000000"
                  aria-label="Target value"
                  required
                />
                <input
                  className={fieldClassName}
                  value={unit}
                  onChange={(event) => setUnit(event.target.value)}
                  placeholder="Unit, e.g. sessions"
                  aria-label="Target unit"
                  required
                />
                <Button className="md:col-span-2" type="submit">
                  Add semester goal
                </Button>
              </form>
            </CardContent>
          </Card>
        )}

        <div className="grid gap-5 lg:grid-cols-2">
          {goals.map((goal) => {
            const progress =
              ((goal.currentValue ?? 0) /
                Math.max(goal.targetValue ?? 1, 1)) *
              100;
            const goalMilestones = milestones.filter(
              (milestone) => milestone.goalId === goal.id,
            );
            return (
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
                  </div>
                  <CardTitle className="pt-3">{goal.title}</CardTitle>
                  <CardDescription className="leading-6">
                    {goal.description}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="mb-2 flex items-end justify-between gap-4">
                    <p className="text-2xl font-black">
                      {goal.currentValue ?? 0}
                      <span className="ml-1 text-sm font-medium text-muted">
                        / {goal.targetValue} {goal.unit}
                      </span>
                    </p>
                    {goal.deadline && (
                      <p className="text-xs text-muted">
                        Due {formatDate(`${goal.deadline}T12:00:00`)}
                      </p>
                    )}
                  </div>
                  <ProgressBar
                    value={progress}
                    color={
                      goal.status === "at_risk"
                        ? "var(--warning)"
                        : "var(--accent)"
                    }
                  />
                  <label className="mt-4 block text-xs font-bold text-muted">
                    Update progress
                    <input
                      className="mt-2 w-full accent-pink-500"
                      type="range"
                      min="0"
                      max={goal.targetValue ?? 100}
                      value={goal.currentValue ?? 0}
                      onChange={(event) =>
                        updateGoalProgress(goal.id, Number(event.target.value))
                      }
                    />
                  </label>
                  {!!goalMilestones.length && (
                    <div className="mt-5 border-t border-border pt-4">
                      <p className="mb-3 text-xs font-black uppercase tracking-wider text-muted">
                        Milestones
                      </p>
                      <div className="space-y-2">
                        {goalMilestones.map((milestone) => (
                          <div
                            key={milestone.id}
                            className="flex items-center gap-2 text-sm"
                          >
                            <CheckCircle2
                              className={`h-4 w-4 ${
                                milestone.completed
                                  ? "text-success"
                                  : "text-border"
                              }`}
                            />
                            <span
                              className={
                                milestone.completed
                                  ? "text-muted line-through"
                                  : "font-medium"
                              }
                            >
                              {milestone.title}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </PageShell>
  );
}
