import type { CharacterExpression, CharacterState } from "@/types";

export type DialogueContext = {
  tasksCompletedToday: number;
  tasksTotalToday: number;
  overdueTasks: number;
  upcomingDeadlines: number;
  habitStreak: number;
  weeklyWorkloadHours: number;
  hourOfDay: number;
};

const DIALOGUE: Record<CharacterExpression, string[]> = {
  neutral: [
    "Another episode begins. What's the plan today?",
    "Ready when you are. Let's make this week count.",
  ],
  happy: [
    "You finished everything early? I was not emotionally prepared for this.",
    "All tasks done! Time for a victory pose.",
  ],
  proud: [
    "Four guitar sessions this week — the alternate-picking arc is moving.",
    "That streak is looking solid. Keep the momentum going.",
  ],
  excited: [
    "A milestone completed! This calls for dramatic background music.",
    "New personal best! I'm genuinely impressed.",
  ],
  nervous: [
    "Five deadlines next week. Maybe not the best time for another side project?",
    "Your deadline is tomorrow. This may be the part where dramatic background music starts.",
  ],
  tired: [
    "Long week detected. Rest is part of the training arc too.",
    "You've been pushing hard. Consider a lighter day tomorrow.",
  ],
  overwhelmed: [
    "You scheduled eleven hours on Wednesday. Are we training for a productivity tournament?",
    "This workload looks unrealistic. Let's redistribute some tasks.",
  ],
  concerned: [
    "The algorithm practice task looks suspiciously untouched.",
    "A few goals haven't had any action this week.",
  ],
  encouraging: [
    "One missed day does not ruin the entire training arc.",
    "Rough week, but every comeback story starts somewhere.",
  ],
  celebrating: [
    "SEMESTER GOAL COMPLETE! Encore performance incoming!",
    "Perfect habit week! You earned this celebration scene.",
  ],
};

function pickDialogue(expression: CharacterExpression): string {
  const options = DIALOGUE[expression];
  return options[0];
}

export function resolveCharacterState(ctx: DialogueContext): CharacterState {
  const taskRate =
    ctx.tasksTotalToday > 0
      ? ctx.tasksCompletedToday / ctx.tasksTotalToday
      : 0;

  if (ctx.weeklyWorkloadHours > 50) {
    return {
      expression: "overwhelmed",
      dialogue: pickDialogue("overwhelmed"),
      scene: "backstage",
      triggerReason: "excessive_weekly_workload",
    };
  }

  if (ctx.overdueTasks >= 3) {
    return {
      expression: "concerned",
      dialogue: pickDialogue("concerned"),
      scene: "classroom",
      triggerReason: "multiple_overdue_tasks",
    };
  }

  if (ctx.upcomingDeadlines >= 3) {
    return {
      expression: "nervous",
      dialogue: pickDialogue("nervous"),
      scene: "classroom",
      triggerReason: "upcoming_deadlines",
    };
  }

  if (taskRate === 1 && ctx.tasksTotalToday > 0) {
    return {
      expression: "happy",
      dialogue: pickDialogue("happy"),
      scene: "practice-room",
      triggerReason: "all_tasks_complete",
    };
  }

  if (ctx.habitStreak >= 7) {
    return {
      expression: "proud",
      dialogue: pickDialogue("proud"),
      scene: "practice-room",
      triggerReason: "habit_streak",
    };
  }

  if (ctx.hourOfDay < 10) {
    return {
      expression: "neutral",
      dialogue: "Good morning! Let's check what's on today's setlist.",
      scene: "bedroom",
      triggerReason: "morning_greeting",
    };
  }

  return {
    expression: "neutral",
    dialogue: pickDialogue("neutral"),
    scene: "neutral",
    triggerReason: "default",
  };
}
