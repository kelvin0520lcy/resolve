import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  createSeedData,
  normalizeStoredData,
} from "@/contexts/resolve-context";
import {
  addGoalToData,
  addGuitarSessionToData,
  addTaskToData,
  moveTaskInData,
  saveReflectionToData,
  toggleHabitInData,
  toggleTaskInData,
  updateGoalProgressInData,
  updatePrioritiesInData,
  updateSemesterInData,
} from "@/lib/resolve-actions";

const META = {
  identity: "test-user",
  id: "new-id",
  timestamp: "2026-07-24T04:00:00.000Z",
};

beforeEach(() => {
  vi.useFakeTimers();
  vi.setSystemTime(new Date(2026, 6, 24, 12));
});

afterEach(() => {
  vi.useRealTimers();
});

describe("seed data and storage normalization", () => {
  it("creates a relationally consistent workspace for the active identity", () => {
    const data = createSeedData("test-user");
    expect(data.semester.userId).toBe("test-user");
    expect(data.goals.every((goal) => goal.userId === "test-user")).toBe(true);
    expect(data.tasks.every((task) => task.semesterId === data.semester.id)).toBe(
      true,
    );
    expect(data.weeklyPriorities).toHaveLength(3);
  });

  it("falls back safely for malformed storage", () => {
    const normalized = normalizeStoredData("bad-data", "restored-user");
    expect(normalized.semester.userId).toBe("restored-user");
    expect(normalized.goals.length).toBeGreaterThan(0);
  });

  it("accepts valid arrays, dates, and exactly three trimmed priorities", () => {
    const seed = createSeedData("old-user");
    const normalized = normalizeStoredData(
      {
        ...seed,
        goals: [],
        semester: { ...seed.semester, userId: "wrong-user" },
        weeklyPriorities: ["  One ", "Two", " Three  "],
      },
      "restored-user",
    );
    expect(normalized.goals).toEqual([]);
    expect(normalized.semester.userId).toBe("restored-user");
    expect(normalized.weeklyPriorities).toEqual(["One", "Two", "Three"]);
  });

  it("rejects invalid semester storage and malformed priorities", () => {
    const seed = createSeedData("restored-user");
    const normalized = normalizeStoredData(
      {
        semester: { ...seed.semester, endDate: seed.semester.startDate },
        weeklyPriorities: ["Only one"],
      },
      "restored-user",
    );
    expect(normalized.semester.endDate).toBe(seed.semester.endDate);
    expect(normalized.weeklyPriorities).toEqual(seed.weeklyPriorities);
  });
});

describe("task actions", () => {
  it("adds a trimmed, clamped task with safe date defaults", () => {
    const data = createSeedData("test-user");
    const next = addTaskToData(
      data,
      {
        title: "  Rehearse chorus  ",
        category: "guitar",
        priority: "high",
        estimatedMinutes: 999,
        scheduledDate: "bad-date",
        deadline: "2026-07-31",
      },
      META,
    );
    expect(next.tasks).toHaveLength(data.tasks.length + 1);
    expect(next.tasks.at(-1)).toMatchObject({
      id: "new-id",
      title: "Rehearse chorus",
      estimatedMinutes: 720,
      scheduledDate: "2026-07-24",
      deadline: "2026-07-31",
      status: "planned",
    });
    expect(addTaskToData(data, { title: " ", category: "custom", priority: "low" }, META)).toBe(data);
  });

  it("toggles tasks both ways and ignores unknown ids", () => {
    const data = createSeedData("test-user");
    const completed = toggleTaskInData(data, "task-review", META.timestamp);
    expect(completed.tasks.find((task) => task.id === "task-review")).toMatchObject({
      status: "completed",
      completedAt: META.timestamp,
    });
    const planned = toggleTaskInData(completed, "task-review", META.timestamp);
    expect(planned.tasks.find((task) => task.id === "task-review")?.status).toBe(
      "planned",
    );
    expect(
      planned.tasks.find((task) => task.id === "task-review")?.completedAt,
    ).toBeUndefined();
    expect(toggleTaskInData(data, "missing", META.timestamp)).toBe(data);
  });

  it("moves only known tasks to valid dates and preserves completed status", () => {
    const data = createSeedData("test-user");
    const moved = moveTaskInData(
      data,
      "task-review",
      "2026-07-27",
      META.timestamp,
    );
    expect(moved.tasks.find((task) => task.id === "task-review")).toMatchObject({
      scheduledDate: "2026-07-27",
      status: "rescheduled",
    });
    const completed = moveTaskInData(
      data,
      "task-leetcode",
      "2026-07-28",
      META.timestamp,
    );
    expect(
      completed.tasks.find((task) => task.id === "task-leetcode")?.status,
    ).toBe("completed");
    expect(moveTaskInData(data, "task-review", "invalid")).toBe(data);
    expect(moveTaskInData(data, "missing", "2026-07-27")).toBe(data);
  });
});

describe("goal actions", () => {
  it("adds normalized goals and rejects incomplete input", () => {
    const data = createSeedData("test-user");
    const next = addGoalToData(
      data,
      {
        title: "  Play a live set ",
        description: "  Finish three songs ",
        category: "guitar",
        priority: "high",
        targetValue: -4,
        unit: "songs",
        deadline: "not-a-date",
      },
      META,
    );
    expect(next.goals.at(-1)).toMatchObject({
      id: "new-id",
      title: "Play a live set",
      description: "Finish three songs",
      targetValue: 1,
      currentValue: 0,
      deadline: undefined,
      status: "active",
    });
    expect(
      addGoalToData(
        data,
        {
          title: "",
          description: "Something",
          category: "custom",
          priority: "low",
          targetValue: 1,
          unit: "items",
        },
        META,
      ),
    ).toBe(data);
  });

  it("clamps progress, completes goals, and reactivates reduced goals", () => {
    const data = createSeedData("test-user");
    const complete = updateGoalProgressInData(
      data,
      "goal-career",
      999,
      META.timestamp,
    );
    expect(
      complete.goals.find((goal) => goal.id === "goal-career"),
    ).toMatchObject({ currentValue: 60, status: "completed" });
    const reduced = updateGoalProgressInData(
      complete,
      "goal-career",
      -10,
      META.timestamp,
    );
    expect(
      reduced.goals.find((goal) => goal.id === "goal-career"),
    ).toMatchObject({ currentValue: 0, status: "active" });
    expect(updateGoalProgressInData(data, "missing", 1)).toBe(data);
    expect(updateGoalProgressInData(data, "goal-career", Number.NaN)).toBe(data);
  });
});

describe("habit, practice, and reflection actions", () => {
  it("creates and toggles habit logs while rejecting invalid targets", () => {
    const data = createSeedData("test-user");
    const created = toggleHabitInData(
      data,
      "habit-plan",
      "2026-07-24",
      META,
    );
    expect(created.habitLogs.at(-1)).toMatchObject({
      id: "new-id",
      habitId: "habit-plan",
      completed: true,
    });
    const toggled = toggleHabitInData(
      created,
      "habit-plan",
      "2026-07-24",
      META,
    );
    expect(
      toggled.habitLogs.find(
        (log) => log.habitId === "habit-plan" && log.date === "2026-07-24",
      )?.completed,
    ).toBe(false);
    expect(toggleHabitInData(data, "missing", "2026-07-24", META)).toBe(data);
    expect(toggleHabitInData(data, "habit-plan", "bad", META)).toBe(data);
  });

  it("adds clamped guitar sessions and rejects invalid sessions", () => {
    const data = createSeedData("test-user");
    const next = addGuitarSessionToData(
      data,
      {
        date: "2026-07-24",
        durationMinutes: 1000,
        category: "Lead guitar",
        techniques: ["Bends"],
        cleanBpm: 900,
      },
      META,
    );
    expect(next.guitarSessions[0]).toMatchObject({
      id: "new-id",
      durationMinutes: 720,
      cleanBpm: 400,
    });
    expect(
      addGuitarSessionToData(
        data,
        {
          date: "bad",
          durationMinutes: 0,
          category: "Practice",
          techniques: [],
        },
        META,
      ),
    ).toBe(data);
  });

  it("saves meaningful reflections with valid periods", () => {
    const data = createSeedData("test-user");
    const next = saveReflectionToData(
      data,
      {
        type: "weekly",
        periodStart: "2026-07-20",
        periodEnd: "2026-07-26",
        wins: "Kept practicing",
      },
      META,
    );
    expect(next.reflections[0]).toMatchObject({
      id: "new-id",
      wins: "Kept practicing",
      createdAt: META.timestamp,
    });
    expect(
      saveReflectionToData(
        data,
        {
          type: "weekly",
          periodStart: "2026-07-26",
          periodEnd: "2026-07-20",
          wins: "",
        },
        META,
      ),
    ).toBe(data);
  });
});

describe("semester and priority actions", () => {
  it("updates valid semesters, trims labels, and clamps GPA", () => {
    const data = createSeedData("test-user");
    const next = updateSemesterInData(
      data,
      {
        ...data.semester,
        id: "wrong-id",
        userId: "wrong-user",
        name: "  New semester ",
        academicYear: " 2027/2028 ",
        targetGpa: 9,
      },
      "test-user",
    );
    expect(next.semester).toMatchObject({
      id: data.semester.id,
      userId: "test-user",
      name: "New semester",
      academicYear: "2027/2028",
      targetGpa: 5,
    });
    expect(
      updateSemesterInData(
        data,
        { ...data.semester, endDate: data.semester.startDate },
        "test-user",
      ),
    ).toBe(data);
  });

  it("requires exactly three non-empty weekly priorities", () => {
    const data = createSeedData("test-user");
    expect(
      updatePrioritiesInData(data, [" One ", "Two", " Three "])
        .weeklyPriorities,
    ).toEqual(["One", "Two", "Three"]);
    expect(updatePrioritiesInData(data, ["One", ""])).toBe(data);
    expect(updatePrioritiesInData(data, ["One", "Two", "Three", "Four"])).toBe(
      data,
    );
  });
});
