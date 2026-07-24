import { describe, expect, it } from "vitest";
import {
  DASHBOARD_NAV,
  MAIN_NAV,
  MOBILE_NAV,
  NAV_ARCS,
  getNavArc,
} from "@/lib/constants/navigation";
import {
  PAGE_THEMES,
  getPageTheme,
  getThemeRoutes,
} from "@/lib/page-themes";

describe("character-owned navigation", () => {
  it("assigns each non-dashboard page to exactly one coherent arc", () => {
    const arcRoutes = NAV_ARCS.flatMap((arc) => arc.items.map((item) => item.href));
    expect(new Set(arcRoutes).size).toBe(arcRoutes.length);
    expect(MAIN_NAV.map((item) => item.href)).toEqual([
      DASHBOARD_NAV.href,
      ...arcRoutes,
    ]);
  });

  it.each([
    ["/today", "nijika"],
    ["/weekly/details", "nijika"],
    ["/guitar", "bocchi"],
    ["/reflections", "bocchi"],
    ["/academics", "ryo"],
    ["/settings", "ryo"],
    ["/goals", "kita"],
    ["/career", "kita"],
  ])("maps %s to the %s arc", (path, key) => {
    expect(getNavArc(path)?.key).toBe(key);
    expect(getPageTheme(path).key).toBe(key);
  });

  it("keeps the dashboard as the ensemble and safely falls back there", () => {
    expect(getPageTheme("/dashboard")).toBe(PAGE_THEMES.ensemble);
    expect(getPageTheme("/unknown")).toBe(PAGE_THEMES.ensemble);
    expect(getNavArc("/dashboard")).toBeUndefined();
  });

  it("provides one purposeful mobile destination per character arc", () => {
    expect(MOBILE_NAV.map((item) => item.href)).toEqual([
      "/dashboard",
      "/today",
      "/guitar",
      "/analytics",
      "/goals",
    ]);
  });

  it("returns all routes owned by a theme", () => {
    expect(getThemeRoutes("bocchi")).toEqual(["/guitar", "/reflections"]);
    expect(getThemeRoutes("nijika")).toEqual([
      "/today",
      "/weekly",
      "/habits",
    ]);
    expect(getThemeRoutes("ensemble")).toEqual(["/dashboard"]);
  });
});
