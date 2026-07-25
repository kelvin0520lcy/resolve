"use client";

import { useState, type FormEvent } from "react";
import {
  CalendarClock,
  Check,
  CheckCircle2,
  ListChecks,
  Plus,
  RotateCcw,
  Trash2,
  X,
} from "lucide-react";
import { ProgressBar } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  alignedFieldLabelClassName,
  fieldClassName,
} from "@/components/ui/resolve";
import { offsetDate } from "@/lib/date";
import { formatDate } from "@/lib/utils";
import type { Goal, Milestone } from "@/types";
import type { NewMilestoneInput } from "@/lib/resolve-actions";

export function GoalBreakdown({
  goal,
  milestones,
  addMilestone,
  toggleMilestone,
  removeMilestone,
  setGoalCompleted,
}: {
  goal: Goal;
  milestones: Milestone[];
  addMilestone: (goalId: string, milestone: NewMilestoneInput) => void;
  toggleMilestone: (milestoneId: string) => void;
  removeMilestone: (milestoneId: string) => void;
  setGoalCompleted: (goalId: string, completed: boolean) => void;
}) {
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState("");
  const [deadline, setDeadline] = useState("");
  const orderedMilestones = [...milestones].sort(
    (a, b) => a.order - b.order,
  );
  const completed = orderedMilestones.filter(
    (milestone) => milestone.completed,
  ).length;
  const progress = orderedMilestones.length
    ? (completed / orderedMilestones.length) * 100
    : 0;
  const allMilestonesComplete =
    orderedMilestones.length > 0 &&
    completed === orderedMilestones.length;

  function submit(event: FormEvent) {
    event.preventDefault();
    if (!title.trim()) return;
    addMilestone(goal.id, {
      title: title.trim(),
      deadline: deadline || undefined,
    });
    setTitle("");
    setDeadline("");
  }

  return (
    <section
      className="mt-6 border-t border-border pt-5"
      aria-label={`Breakdown for ${goal.title}`}
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <ListChecks className="h-4 w-4 text-accent" />
            <h3 className="text-sm font-black">Goal breakdown</h3>
          </div>
          <p className="mt-1 text-xs leading-5 text-muted">
            {orderedMilestones.length
              ? `${completed} of ${orderedMilestones.length} smaller steps completed`
              : "Turn this outcome into a few concrete finish lines."}
          </p>
        </div>
        <Button
          type="button"
          size="sm"
          variant="secondary"
          onClick={() => setShowForm((value) => !value)}
          aria-expanded={showForm}
        >
          {showForm ? <X className="h-3.5 w-3.5" /> : <Plus className="h-3.5 w-3.5" />}
          {showForm ? "Close" : "Add step"}
        </Button>
      </div>

      {orderedMilestones.length > 0 && (
        <div className="mt-4">
          <div className="mb-2 flex items-center justify-between text-xs font-bold text-muted">
            <span>Breakdown progress</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <ProgressBar
            value={progress}
            color={
              completed === orderedMilestones.length
                ? "var(--success)"
                : "var(--accent)"
            }
            label={`${goal.title} breakdown progress`}
          />
        </div>
      )}

      {showForm && (
        <form
          onSubmit={submit}
          className="mt-4 grid gap-3 rounded-2xl border border-accent/25 bg-accent/5 p-4 sm:grid-cols-[minmax(0,1fr)_180px_auto]"
        >
          <label className={alignedFieldLabelClassName}>
            <span className="flex items-end">Smaller step</span>
            <input
              className={fieldClassName}
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              maxLength={120}
              autoFocus
              required
            />
          </label>
          <label className={alignedFieldLabelClassName}>
            <span className="flex items-end">
              Due <span className="ml-1 font-medium text-muted">(optional)</span>
            </span>
            <input
              className={fieldClassName}
              type="date"
              value={deadline}
              min={offsetDate(0)}
              max={goal.deadline}
              onChange={(event) => setDeadline(event.target.value)}
            />
          </label>
          <Button type="submit" className="self-end">
            Add step
          </Button>
        </form>
      )}

      {orderedMilestones.length > 0 ? (
        <div className="mt-4 max-h-80 space-y-2 overflow-y-auto pr-1">
          {orderedMilestones.map((milestone, index) => (
            <div
              key={milestone.id}
              className="group flex min-h-14 items-center gap-3 rounded-2xl border border-border bg-surface p-2.5"
            >
              <button
                type="button"
                onClick={() => toggleMilestone(milestone.id)}
                aria-label={
                  milestone.completed
                    ? `Mark ${milestone.title} incomplete`
                    : `Complete ${milestone.title}`
                }
                aria-pressed={milestone.completed}
                className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border-2 font-black transition ${
                  milestone.completed
                    ? "border-success bg-success text-white"
                    : "border-border text-muted hover:border-accent hover:text-accent"
                }`}
              >
                {milestone.completed ? (
                  <Check className="h-4 w-4" />
                ) : (
                  index + 1
                )}
              </button>
              <div className="min-w-0 flex-1">
                <p
                  className={`text-sm font-bold ${
                    milestone.completed ? "text-muted line-through" : ""
                  }`}
                >
                  {milestone.title}
                </p>
                {milestone.deadline && (
                  <p className="mt-1 flex items-center gap-1 text-[11px] text-muted">
                    <CalendarClock className="h-3 w-3" />
                    Due {formatDate(`${milestone.deadline}T12:00:00`)}
                  </p>
                )}
              </div>
              <button
                type="button"
                onClick={() => removeMilestone(milestone.id)}
                aria-label={`Remove ${milestone.title}`}
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-muted opacity-70 transition hover:bg-danger/10 hover:text-danger focus-visible:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-danger group-hover:opacity-100"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      ) : (
        !showForm && (
          <button
            type="button"
            onClick={() => setShowForm(true)}
            className="mt-4 w-full rounded-2xl border-2 border-dashed border-border px-4 py-5 text-sm font-bold text-muted transition hover:border-accent hover:bg-accent/5 hover:text-accent"
          >
            Add the first smaller step
          </button>
        )
      )}

      <div
        className={`mt-4 rounded-2xl border p-4 ${
          goal.status === "completed"
            ? "border-success/35 bg-success/10"
            : allMilestonesComplete
              ? "border-accent/35 bg-accent/5"
              : "border-border bg-surface-muted/40"
        }`}
      >
        {goal.status === "completed" ? (
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="flex items-center gap-2 text-sm font-black text-success">
                <CheckCircle2 className="h-4 w-4" />
                Goal complete
              </p>
              <p className="mt-1 text-xs text-muted">
                Every breakdown step is finished.
              </p>
            </div>
            <Button
              type="button"
              size="sm"
              variant="secondary"
              onClick={() => setGoalCompleted(goal.id, false)}
            >
              <RotateCcw className="h-3.5 w-3.5" />
              Reopen goal
            </Button>
          </div>
        ) : (
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="max-w-sm text-xs leading-5 text-muted">
              {!orderedMilestones.length
                ? "Add at least one breakdown step before completing this goal."
                : allMilestonesComplete
                  ? "Every breakdown step is complete. The goal is ready to finish."
                  : `Complete the remaining ${orderedMilestones.length - completed} step${orderedMilestones.length - completed === 1 ? "" : "s"} to unlock goal completion.`}
            </p>
            <Button
              type="button"
              size="sm"
              disabled={!allMilestonesComplete}
              onClick={() => setGoalCompleted(goal.id, true)}
            >
              <CheckCircle2 className="h-3.5 w-3.5" />
              Mark goal complete
            </Button>
          </div>
        )}
      </div>
    </section>
  );
}
