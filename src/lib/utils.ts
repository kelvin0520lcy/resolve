import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: string | Date): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleDateString("en-SG", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
}

export function getSemesterWeek(startDate: string, endDate: string): {
  weekNumber: number;
  totalWeeks: number;
  percentComplete: number;
  daysRemaining: number;
} {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const now = new Date();

  const totalMs = end.getTime() - start.getTime();
  const elapsedMs = Math.max(0, now.getTime() - start.getTime());
  const totalWeeks = Math.ceil(totalMs / (7 * 24 * 60 * 60 * 1000));
  const weekNumber = Math.min(
    totalWeeks,
    Math.max(1, Math.ceil(elapsedMs / (7 * 24 * 60 * 60 * 1000))),
  );
  const percentComplete = Math.min(
    100,
    Math.round((elapsedMs / totalMs) * 100),
  );
  const daysRemaining = Math.max(
    0,
    Math.ceil((end.getTime() - now.getTime()) / (24 * 60 * 60 * 1000)),
  );

  return { weekNumber, totalWeeks, percentComplete, daysRemaining };
}
