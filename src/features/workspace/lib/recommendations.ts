import type { ResolveData } from "@/features/workspace/types";
import {
  getDeadlineDateKey,
  getTaskDeadline,
  getTaskEstimatedMinutes,
  getTaskScheduleDate,
} from "@/features/workspace/lib/deadlines";
import type { Task } from "@/types";

export type TaskRecommendation = {
  task: Task;
  reasons: string[];
  score: number;
};

function daysUntil(date: string, today: string) {
  const due = new Date(`${date}T12:00:00Z`).getTime();
  const now = new Date(`${today}T12:00:00Z`).getTime();
  return Math.round((due - now) / 86_400_000);
}

export function taskIsAvailable(task: Task, tasks: Task[]) {
  return (task.prerequisiteTaskIds ?? []).every((id) =>
    tasks.some((candidate) => candidate.id === id && candidate.status === "completed"),
  );
}

export function rankNextActions(
  data: ResolveData,
  today: string,
  availableMinutes?: number,
): TaskRecommendation[] {
  if (!data.preferences.autoNextAction) return [];
  if (data.preferences.hiddenRecommendationDate === today) return [];

  return data.tasks
    .filter(
      (task) =>
        !["completed", "cancelled", "skipped"].includes(task.status) &&
        taskIsAvailable(task, data.tasks),
    )
    .map((task) => {
      let score = 0;
      const reasons: string[] = [];
      const scheduleDate = getTaskScheduleDate(task);
      const deadline = getTaskDeadline(task);
      const deadlineDate = deadline ? getDeadlineDateKey(deadline) : undefined;
      const estimate = getTaskEstimatedMinutes(task);

      if (data.preferences.pinnedTaskId === task.id) {
        score += 10_000;
        reasons.push("Pinned by you");
      }
      if (deadlineDate && deadlineDate < today) {
        score += 800;
        reasons.push("Overdue");
      }
      if (scheduleDate === today) {
        score += 500;
        reasons.push("Planned for today");
      }
      if (deadlineDate) {
        const remaining = daysUntil(deadlineDate, today);
        if (remaining >= 0 && remaining <= 2) {
          score += 350 - remaining * 75;
          reasons.push(remaining === 0 ? "Due today" : `Due in ${remaining} days`);
        } else if (remaining <= 7) {
          score += 120;
          reasons.push("Due this week");
        }
      }
      if (task.priority === "high") {
        score += 160;
        reasons.push("High priority");
      } else if (task.priority === "medium") {
        score += 60;
      }
      const linkedGoal = task.goalId
        ? data.goals.find((goal) => goal.id === task.goalId)
        : undefined;
      if (linkedGoal?.status === "at_risk") {
        score += 140;
        reasons.push("Supports an at-risk goal");
      }
      if (
        availableMinutes !== undefined &&
        estimate !== undefined &&
        estimate <= availableMinutes
      ) {
        score += 80;
        reasons.push(`Fits ${availableMinutes} available minutes`);
      }
      const origin = task.origin;
      const assessmentOrigin =
        origin?.kind === "assessment-preparation"
          ? data.modules
              .flatMap((module) => module.assessments)
              .find((assessment) => assessment.id === origin.assessmentId)
          : undefined;
      if (assessmentOrigin) {
        score += Math.min(120, assessmentOrigin.weight * 1.2);
        reasons.push("Assessment preparation");
      }

      return { task, reasons: reasons.slice(0, 3), score };
    })
    .sort((a, b) => b.score - a.score || a.task.createdAt.localeCompare(b.task.createdAt));
}
