import type { GoalCategory } from "@/types";

export const GOAL_CATEGORIES: {
  id: GoalCategory;
  label: string;
  color: string;
  scene: string;
}[] = [
  { id: "academics", label: "Academics", color: "#7eb8da", scene: "classroom" },
  { id: "career", label: "Career", color: "#6b9fff", scene: "dev-room" },
  { id: "technical", label: "Technical Skills", color: "#8b7cf6", scene: "dev-room" },
  { id: "guitar", label: "Guitar", color: "#ff6b9d", scene: "practice-room" },
  { id: "health", label: "Health", color: "#6bcf8e", scene: "outdoor" },
  { id: "personal", label: "Personal Projects", color: "#ffb347", scene: "workshop" },
  { id: "finance", label: "Finance", color: "#ffd166", scene: "desk" },
  { id: "social", label: "Social", color: "#c084fc", scene: "rooftop" },
  { id: "custom", label: "Custom", color: "#94a3b8", scene: "neutral" },
];

export function getCategoryMeta(category: string) {
  return (
    GOAL_CATEGORIES.find((c) => c.id === category) ?? {
      id: "custom" as GoalCategory,
      label: category,
      color: "#94a3b8",
      scene: "neutral",
    }
  );
}
