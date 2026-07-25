import { describe, expect, it } from "vitest";
import { summarizeReflections } from "@/lib/reflection-summary";
import type { Reflection } from "@/types";

function reflection(
  day: number,
  values: Partial<Reflection> = {},
): Reflection {
  const date = `2026-07-${String(day).padStart(2, "0")}`;
  return {
    id: `reflection-${day}`,
    userId: "user-1",
    semesterId: "semester-1",
    type: "daily",
    periodStart: date,
    periodEnd: date,
    createdAt: `${date}T20:00:00.000Z`,
    ...values,
  };
}

describe("reflection summary", () => {
  it("returns a useful empty state", () => {
    expect(summarizeReflections([])).toMatchObject({
      reviewCount: 0,
      reviewedDays: 0,
      winsCaptured: 0,
      frictionCaptured: 0,
      energyTrend: "unknown",
    });
  });

  it("summarizes only the latest seven daily check-ins", () => {
    const summary = summarizeReflections([
      reflection(16, { energy: 1, wins: "Old win" }),
      reflection(17, { energy: 1 }),
      reflection(18, { energy: 2, difficulties: "Old friction" }),
      reflection(19, { energy: 2 }),
      reflection(20, { energy: 3, lessons: "Prepare before starting" }),
      reflection(21, { energy: 4, difficulties: "Too many tasks" }),
      reflection(22, { energy: 4, wins: "Started on time" }),
      reflection(23, { energy: 5, wins: "Finished the draft" }),
      reflection(24, { energy: 5, lessons: "Protect the first hour" }),
    ]);

    expect(summary).toMatchObject({
      reviewCount: 7,
      reviewedDays: 7,
      winsCaptured: 2,
      frictionCaptured: 2,
      averageEnergy: 3.6,
      energyTrend: "rising",
      latestWin: "Finished the draft",
      latestFriction: "Too many tasks",
      latestLesson: "Protect the first hour",
    });
  });

  it("marks a meaningful drop as a recharging signal", () => {
    const summary = summarizeReflections([
      reflection(20, { energy: 5 }),
      reflection(21, { energy: 5 }),
      reflection(22, { energy: 4 }),
      reflection(23, { energy: 2 }),
      reflection(24, { energy: 2 }),
    ]);

    expect(summary.energyTrend).toBe("recharging");
    expect(summary.headline).toContain("lighter next step");
  });
});
