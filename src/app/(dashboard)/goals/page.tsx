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
  const { goals, addGoal, updateGoalProgress } = useResolve();
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState<GoalCategory>("academics");
  const [target, setTarget] = useState("10");
  const [unit, setUnit] = useState("sessions");
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
      targetValue: Number(target) || 1,
      unit: unit.trim() || "steps",
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
                  Target value
                  <input
                    className={`${fieldClassName} mt-2`}
                    value={target}
                    onChange={(event) => setTarget(event.target.value)}
                    type="number"
                    min="1"
                    max="1000000"
                    required
                  />
                </label>
                <label className="text-sm font-bold">
                  Unit
                  <input
                    className={`${fieldClassName} mt-2`}
                    value={unit}
                    onChange={(event) => setUnit(event.target.value)}
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

        {goals.length ? <div className="grid gap-5 lg:grid-cols-2">
          {goals.map((goal) => {
            const progress =
              ((goal.currentValue ?? 0) /
                Math.max(goal.targetValue ?? 1, 1)) *
              100;
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
                </CardContent>
              </Card>
            );
          })}
        </div> : (
          <EmptyState
            icon={<Target className="h-6 w-6" />}
            title="No goals yet"
            description="Create one measurable outcome. The rest of Resolve will use it to connect tasks and progress."
            action={<Button onClick={() => setShowForm(true)}>Create a goal</Button>}
          />
        )}
      </div>
    </PageShell>
  );
}
