import { afterEach, describe, expect, it, vi } from "vitest";
import {
  getWeekDateKeys,
  isDateKey,
  offsetDate,
  parseLocalDate,
  toDateKey,
} from "@/lib/date";
import { cn, formatDate, getSemesterWeek } from "@/lib/utils";

afterEach(() => {
  vi.useRealTimers();
});

describe("date helpers", () => {
  it("parses date-only values at local noon", () => {
    const parsed = parseLocalDate("2026-07-24");
    expect(parsed.getFullYear()).toBe(2026);
    expect(parsed.getMonth()).toBe(6);
    expect(parsed.getDate()).toBe(24);
    expect(parsed.getHours()).toBe(12);
  });

  it("clones Date inputs instead of mutating them", () => {
    const source = new Date(2026, 6, 24, 9);
    const parsed = parseLocalDate(source);
    expect(parsed).not.toBe(source);
    expect(parsed.getTime()).toBe(source.getTime());
  });

  it("creates stable local date keys and offsets", () => {
    const reference = new Date(2026, 6, 31, 23, 30);
    expect(toDateKey(reference)).toBe("2026-07-31");
    expect(offsetDate(1, reference)).toBe("2026-08-01");
    expect(offsetDate(-31, reference)).toBe("2026-06-30");
  });

  it("returns Monday through Sunday for any reference day", () => {
    expect(getWeekDateKeys(new Date(2026, 6, 22))).toEqual([
      "2026-07-20",
      "2026-07-21",
      "2026-07-22",
      "2026-07-23",
      "2026-07-24",
      "2026-07-25",
      "2026-07-26",
    ]);
    expect(getWeekDateKeys(new Date(2026, 6, 26))[0]).toBe("2026-07-20");
  });

  it("validates real calendar dates", () => {
    expect(isDateKey("2028-02-29")).toBe(true);
    expect(isDateKey("2027-02-29")).toBe(false);
    expect(isDateKey("2026-13-01")).toBe(false);
    expect(isDateKey("24/07/2026")).toBe(false);
    expect(isDateKey(null)).toBe(false);
  });
});

describe("display and semester calculations", () => {
  it("merges conditional Tailwind classes without conflicting utilities", () => {
    expect(cn("px-2 text-sm", false && "hidden", "px-4")).toBe(
      "text-sm px-4",
    );
  });

  it("formats valid dates and labels invalid dates", () => {
    expect(formatDate("2026-07-24")).toBe("Fri, 24 Jul");
    expect(formatDate("not-a-date")).toBe("Invalid date");
  });

  it("calculates an in-progress semester", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2026, 6, 15, 12));
    expect(getSemesterWeek("2026-07-01", "2026-07-29")).toEqual({
      weekNumber: 2,
      totalWeeks: 4,
      percentComplete: 50,
      daysRemaining: 14,
    });
  });

  it("clamps semesters before start and after completion", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2026, 5, 1, 12));
    expect(getSemesterWeek("2026-07-01", "2026-07-29").percentComplete).toBe(0);

    vi.setSystemTime(new Date(2026, 7, 1, 12));
    expect(getSemesterWeek("2026-07-01", "2026-07-29")).toMatchObject({
      weekNumber: 4,
      percentComplete: 100,
      daysRemaining: 0,
    });
  });

  it("returns a safe fallback for invalid date ranges", () => {
    expect(getSemesterWeek("invalid", "2026-07-01")).toEqual({
      weekNumber: 1,
      totalWeeks: 1,
      percentComplete: 0,
      daysRemaining: 0,
    });
    expect(getSemesterWeek("2026-07-02", "2026-07-01").totalWeeks).toBe(1);
  });
});
