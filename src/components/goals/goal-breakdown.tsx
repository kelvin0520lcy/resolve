"use client";

import { useState, type FormEvent } from "react";
import {
  CalendarClock,
  Check,
  CheckCircle2,
  ListChecks,
  Pencil,
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
import type {
  NewMilestoneInput,
  UpdateMilestoneInput,
} from "@/features/workspace/lib/resolve-actions";

export function GoalBreakdown({
  goal,
  milestones,
  addMilestone,
  updateMilestone,
  toggleMilestone,
  removeMilestone,
  setGoalCompleted,
}: {
  goal: Goal;
  milestones: Milestone[];
  addMilestone: (goalId: string, milestone: NewMilestoneInput) => void;
  updateMilestone: (
    milestoneId: string,
    milestone: UpdateMilestoneInput,
  ) => void;
  toggleMilestone: (milestoneId: string) => void;
  removeMilestone: (milestoneId: string) => void;
  setGoalCompleted: (goalId: string, completed: boolean) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
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
    orderedMilestones.length === 0 ||
    completed === orderedMilestones.length;

  function resetForm() {
    setEditingId(null);
    setTitle("");
    setDeadline("");
    setShowForm(false);
  }

  function openBreakdown() {
    if (expanded) {
      setExpanded(false);
      resetForm();
      return;
    }
    setExpanded(true);
    if (!orderedMilestones.length) setShowForm(true);
  }

  function startAdding() {
    setEditingId(null);
    setTitle("");
    setDeadline("");
    setShowForm(true);
  }

  function startEditing(milestone: Milestone) {
    setEditingId(milestone.id);
    setTitle(milestone.title);
    setDeadline(milestone.deadline ?? "");
    setShowForm(true);
  }

  function submit(event: FormEvent) {
    event.preventDefault();
    if (!title.trim()) return;
    const changes = {
      title: title.trim(),
      deadline: deadline || undefined,
    };
    if (editingId) {
      updateMilestone(editingId, changes);
    } else {
      addMilestone(goal.id, changes);
    }
    resetForm();
  }

  return (
    <section
      className="mt-5 border-t border-border pt-4"
      aria-label={`Progress options for ${goal.title}`}
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.12em] text-muted">
            {orderedMilestones.length
              ? `${completed}/${orderedMilestones.length} breakdown steps complete`
              : "Breakdown is optional"}
          </p>
          <p className="mt-1 text-xs leading-5 text-muted">
            {orderedMilestones.length
              ? "All attached steps must be complete before the goal can finish."
              : "Complete this goal directly, or add smaller steps if they would help."}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button
            type="button"
            size="sm"
            variant="secondary"
            onClick={openBreakdown}
            aria-expanded={expanded}
          >
            {expanded ? (
              <X className="h-3.5 w-3.5" />
            ) : orderedMilestones.length ? (
              <ListChecks className="h-3.5 w-3.5" />
            ) : (
              <Plus className="h-3.5 w-3.5" />
            )}
            {expanded
              ? "Hide breakdown"
              : orderedMilestones.length
                ? `View breakdown (${orderedMilestones.length})`
                : "Add breakdown"}
          </Button>
          {goal.status === "completed" ? (
            <Button
              type="button"
              size="sm"
              variant="secondary"
              onClick={() => setGoalCompleted(goal.id, false)}
            >
              <RotateCcw className="h-3.5 w-3.5" />
              Reopen goal
            </Button>
          ) : (
            <Button
              type="button"
              size="sm"
              disabled={!allMilestonesComplete}
              onClick={() => setGoalCompleted(goal.id, true)}
            >
              <CheckCircle2 className="h-3.5 w-3.5" />
              Mark complete
            </Button>
          )}
        </div>
      </div>

      {expanded && (
        <div className="mt-4 rounded-2xl border border-border bg-surface-muted/35 p-4">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <ListChecks className="h-4 w-4 text-accent" />
                <h3 className="text-sm font-black">Goal breakdown</h3>
              </div>
              <p className="mt-1 text-xs leading-5 text-muted">
                {orderedMilestones.length
                  ? `${completed} of ${orderedMilestones.length} smaller steps completed`
                  : "Add only the finish lines that make this goal easier to act on."}
              </p>
            </div>
            {!showForm && (
              <Button
                type="button"
                size="sm"
                variant="secondary"
                onClick={startAdding}
              >
                <Plus className="h-3.5 w-3.5" />
                Add step
              </Button>
            )}
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
                  Due{" "}
                  <span className="ml-1 font-medium text-muted">
                    (optional)
                  </span>
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
              <div className="flex items-end gap-2">
                <Button type="submit" className="flex-1">
                  {editingId ? "Save step" : "Add step"}
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={resetForm}
                  aria-label="Cancel breakdown form"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </form>
          )}

          {orderedMilestones.length > 0 && (
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
                        Due{" "}
                        {formatDate(`${milestone.deadline}T12:00:00`)}
                      </p>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => startEditing(milestone)}
                    aria-label={`Edit ${milestone.title}`}
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-muted transition hover:bg-accent/10 hover:text-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                  >
                    <Pencil className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => removeMilestone(milestone.id)}
                    aria-label={`Remove ${milestone.title}`}
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-muted transition hover:bg-danger/10 hover:text-danger focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-danger"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </section>
  );
}
