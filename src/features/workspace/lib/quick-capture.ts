import { offsetDate } from "@/lib/date";
import type { NewTaskInput } from "@/features/workspace/lib/resolve-actions";

export type QuickCapturePreview = {
  valid: boolean;
  title: string;
  task: NewTaskInput;
  understood: string[];
};

const CATEGORIES = new Set([
  "academics",
  "career",
  "technical",
  "guitar",
  "health",
  "personal",
  "finance",
  "social",
]);

export function parseQuickCapture(
  input: string,
  timeZone: string,
): QuickCapturePreview {
  let title = input.trim();
  const understood: string[] = [];
  let scheduledDate: string | undefined;
  let deadline: string | undefined;
  let estimatedMinutes: number | undefined;
  let priority: NewTaskInput["priority"] = "medium";
  let category = "personal";

  title = title.replace(/\b(today|tomorrow)\b/gi, (match) => {
    scheduledDate = match.toLowerCase() === "today" ? offsetDate(0) : offsetDate(1);
    understood.push(`plan ${match.toLowerCase()}`);
    return "";
  });
  title = title.replace(/\bdue\s+(\d{4}-\d{2}-\d{2})\b/i, (_, date: string) => {
    deadline = date;
    understood.push(`due ${date}`);
    return "";
  });
  title = title.replace(/\b(\d{1,3})\s*(m|min|mins|minutes)\b/i, (_, amount: string) => {
    estimatedMinutes = Math.min(720, Math.max(5, Number(amount)));
    understood.push(`${estimatedMinutes} minutes`);
    return "";
  });
  title = title.replace(/\b(low|medium|high)\s+priority\b/i, (_, value: string) => {
    priority = value.toLowerCase() as NewTaskInput["priority"];
    understood.push(`${priority} priority`);
    return "";
  });
  title = title.replace(/#([a-z-]+)/gi, (match, value: string) => {
    const normalized = value.toLowerCase();
    if (!CATEGORIES.has(normalized)) return match;
    category = normalized;
    understood.push(category);
    return "";
  });
  title = title.replace(/\s+/g, " ").replace(/[,\s]+$/, "").trim();

  return {
    valid: title.length > 0,
    title,
    task: {
      title,
      category,
      priority,
      scheduledDate,
      schedule: scheduledDate
        ? {
            date: scheduledDate,
            estimatedMinutes,
            timeZone,
          }
        : undefined,
      estimatedMinutes,
      deadline,
      origin: { kind: "quick-capture" },
    },
    understood,
  };
}
