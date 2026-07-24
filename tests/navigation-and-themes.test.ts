import { describe, expect, it } from "vitest";
import {
  DASHBOARD_NAV,
  MAIN_NAV,
  MOBILE_NAV,
  NAV_ARCS,
  SETTINGS_NAV,
  getNavArc,
} from "@/lib/constants/navigation";
import {
  PAGE_THEMES,
  getPageTheme,
  getThemeRoutes,
} from "@/lib/page-themes";

describe("character-owned navigation", () => {
  it("assigns member pages to one arc and keeps common pages separate", () => {
    const arcRoutes = NAV_ARCS.flatMap((arc) => arc.items.map((item) => item.href));
    expect(new Set(arcRoutes).size).toBe(arcRoutes.length);
    expect(MAIN_NAV.map((item) => item.href)).toEqual([
      DASHBOARD_NAV.href,
      ...arcRoutes,
      SETTINGS_NAV.href,
    ]);
  });

  it.each([
    ["/today", "nijika"],
    ["/weekly/details", "nijika"],
    ["/guitar", "bocchi"],
    ["/reflections", "bocchi"],
    ["/academics", "ryo"],
    ["/goals", "kita"],
    ["/career", "kita"],
  ])("maps %s to the %s arc", (path, key) => {
    expect(getNavArc(path)?.key).toBe(key);
    expect(getPageTheme(path).key).toBe(key);
  });

  it("keeps settings outside every member arc", () => {
    expect(getNavArc("/settings")).toBeUndefined();
    expect(getPageTheme("/settings")).toBe(PAGE_THEMES.ensemble);
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
      "/academics",
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
    expect(getThemeRoutes("ensemble")).toEqual(["/dashboard", "/settings"]);
  });

  it("provides dedicated cut-in artwork for every band member", () => {
    for (const key of ["bocchi", "nijika", "ryo", "kita"] as const) {
      expect(PAGE_THEMES[key].cutInImage).toMatch(
        new RegExp(`/cut-in-${key}-v2\\.webp$`),
      );
      expect(PAGE_THEMES[key].cutInImageAlt).toBeTruthy();
    }
  });
});
