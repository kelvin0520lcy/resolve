import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { parseLocalDate } from "@/lib/date";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: string | Date): string {
  const d = parseLocalDate(date);
  if (Number.isNaN(d.getTime())) return "Invalid date";
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
  const start = parseLocalDate(startDate);
  const end = parseLocalDate(endDate);
  const now = new Date();

  const totalMs = end.getTime() - start.getTime();
  if (
    Number.isNaN(start.getTime()) ||
    Number.isNaN(end.getTime()) ||
    totalMs <= 0
  ) {
    return {
      weekNumber: 1,
      totalWeeks: 1,
      percentComplete: 0,
      daysRemaining: 0,
    };
  }

  const elapsedMs = Math.min(
    totalMs,
    Math.max(0, now.getTime() - start.getTime()),
  );
  const totalWeeks = Math.max(
    1,
    Math.ceil(totalMs / (7 * 24 * 60 * 60 * 1000)),
  );
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
