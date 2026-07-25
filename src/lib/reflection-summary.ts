import type { Reflection } from "@/types";

export type ReflectionEnergyTrend =
  | "rising"
  | "steady"
  | "recharging"
  | "unknown";

export type ReflectionSummary = {
  reviewCount: number;
  reviewedDays: number;
  winsCaptured: number;
  frictionCaptured: number;
  averageEnergy?: number;
  energyTrend: ReflectionEnergyTrend;
  headline: string;
  latestWin?: string;
  latestFriction?: string;
  latestLesson?: string;
};

function average(values: number[]) {
  if (!values.length) return undefined;
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

function latestEntry(
  reflections: Reflection[],
  field: "wins" | "difficulties" | "lessons",
) {
  return reflections.find((reflection) => reflection[field]?.trim())?.[
    field
  ]?.trim();
}

export function summarizeReflections(
  reflections: Reflection[],
): ReflectionSummary {
  const daily = [...reflections]
    .filter((reflection) => reflection.type === "daily")
    .sort((a, b) => {
      const periodOrder = b.periodStart.localeCompare(a.periodStart);
      return periodOrder || b.createdAt.localeCompare(a.createdAt);
    })
    .slice(0, 7);
  const recent = daily.length
    ? daily
    : [...reflections]
        .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
        .slice(0, 7);
  const energyValues = recent
    .map((reflection) => reflection.energy)
    .filter((energy): energy is number => energy !== undefined);
  const newestEnergy = average(energyValues.slice(0, 3));
  const olderEnergy = average(energyValues.slice(3, 6));
  const energyDifference =
    newestEnergy === undefined || olderEnergy === undefined
      ? undefined
      : newestEnergy - olderEnergy;
  const energyTrend: ReflectionEnergyTrend =
    energyDifference === undefined
      ? "unknown"
      : energyDifference >= 0.5
        ? "rising"
        : energyDifference <= -0.5
          ? "recharging"
          : "steady";
  const headline =
    recent.length === 0
      ? "Your pattern summary will appear after the first review."
      : energyTrend === "rising"
        ? "Your recent energy is trending upward."
        : energyTrend === "recharging"
          ? "Your recent energy suggests a lighter next step."
          : energyTrend === "steady"
            ? "Your recent energy is holding steady."
            : "A few more energy check-ins will reveal a trend.";

  return {
    reviewCount: recent.length,
    reviewedDays: new Set(recent.map((reflection) => reflection.periodStart))
      .size,
    winsCaptured: recent.filter((reflection) => reflection.wins?.trim()).length,
    frictionCaptured: recent.filter((reflection) =>
      reflection.difficulties?.trim(),
    ).length,
    averageEnergy:
      energyValues.length > 0
        ? Math.round((average(energyValues) ?? 0) * 10) / 10
        : undefined,
    energyTrend,
    headline,
    latestWin: latestEntry(recent, "wins"),
    latestFriction: latestEntry(recent, "difficulties"),
    latestLesson: latestEntry(recent, "lessons"),
  };
}
