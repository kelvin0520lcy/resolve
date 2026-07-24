import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  createEmptyData,
  normalizeStoredData,
} from "@/contexts/resolve-context";
import {
  addAssessmentToData,
  addAlgorithmLogToData,
  addApplicationToData,
  addGoalToData,
  addGuitarSessionToData,
  addHabitToData,
  addModuleToData,
  addTaskToData,
  moveTaskInData,
  saveReflectionToData,
  toggleHabitInData,
  toggleTaskInData,
  updateApplicationStageInData,
  updateAssessmentProgressInData,
  updateGoalProgressInData,
  updateModuleStudyMinutesInData,
  updatePrioritiesInData,
  updateSemesterInData,
  updateTaskActualMinutesInData,
} from "@/lib/resolve-actions";

const META = {
  identity: "test-user",
  id: "new-id",
  timestamp: "2026-07-24T04:00:00.000Z",
};

function createActionFixture(userId = "test-user") {
  const data = createEmptyData(userId);
  const timestamp = "2026-07-24T00:00:00.000Z";
  return {
    ...data,
    goals: [
      {
        id: "goal-career",
        userId,
        semesterId: data.semester.id,
        title: "Interview practice",
        description: "Build pattern recognition.",
        category: "career",
        priority: "high" as const,
        measurementType: "count" as const,
        targetValue: 60,
        currentValue: 18,
        unit: "problems",
        startDate: "2026-07-01",
        status: "active" as const,
        createdAt: timestamp,
        updatedAt: timestamp,
      },
    ],
    tasks: [
      {
        id: "task-review",
        userId,
        semesterId: data.semester.id,
        title: "Review notes",
        category: "academics",
        scheduledDate: "2026-07-24",
        priority: "high" as const,
        status: "planned" as const,
        createdAt: timestamp,
        updatedAt: timestamp,
      },
      {
        id: "task-leetcode",
        userId,
        semesterId: data.semester.id,
        title: "Solve one problem",
        category: "career",
        scheduledDate: "2026-07-24",
        priority: "medium" as const,
        status: "completed" as const,
        completedAt: timestamp,
        createdAt: timestamp,
        updatedAt: timestamp,
      },
    ],
    habits: [
      {
        id: "habit-plan",
        userId,
        semesterId: data.semester.id,
        title: "Plan tomorrow",
        category: "personal",
        measurementType: "boolean" as const,
        targetDays: [1, 2, 3, 4, 5],
        isActive: true,
      },
    ],
    weeklyPriorities: ["One", "Two", "Three"],
  };
}

beforeEach(() => {
  vi.useFakeTimers();
  vi.setSystemTime(new Date(2026, 6, 24, 12));
});

afterEach(() => {
  vi.useRealTimers();
});

describe("empty data and storage normalization", () => {
  it("creates a completely blank workspace for the active identity", () => {
    const data = createEmptyData("test-user");
    expect(data.semester.userId).toBe("test-user");
    expect(data.goals).toEqual([]);
    expect(data.tasks).toEqual([]);
    expect(data.habits).toEqual([]);
    expect(data.modules).toEqual([]);
    expect(data.weeklyPriorities).toEqual(["", "", ""]);
  });

  it("falls back safely for malformed storage", () => {
    const normalized = normalizeStoredData("bad-data", "restored-user");
    expect(normalized.semester.userId).toBe("restored-user");
    expect(normalized.goals).toEqual([]);
  });

  it("accepts valid arrays, dates, and exactly three trimmed priorities", () => {
    const seed = createActionFixture("old-user");
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
    const seed = createActionFixture("restored-user");
    const empty = createEmptyData("restored-user");
    const normalized = normalizeStoredData(
      {
        semester: { ...seed.semester, endDate: seed.semester.startDate },
        weeklyPriorities: ["Only one"],
      },
      "restored-user",
    );
    expect(normalized.semester.endDate).toBe(empty.semester.endDate);
    expect(normalized.weeklyPriorities).toEqual(empty.weeklyPriorities);
  });
});

describe("task actions", () => {
  it("adds a trimmed, clamped task with safe date defaults", () => {
    const data = createActionFixture("test-user");
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
    const data = createActionFixture("test-user");
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
    const data = createActionFixture("test-user");
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

  it("records clamped actual time for analytics", () => {
    const data = createActionFixture("test-user");
    const updated = updateTaskActualMinutesInData(
      data,
      "task-review",
      999,
      META.timestamp,
    );
    expect(
      updated.tasks.find((task) => task.id === "task-review"),
    ).toMatchObject({
      actualMinutes: 720,
      updatedAt: META.timestamp,
    });
    expect(updateTaskActualMinutesInData(data, "missing", 30)).toBe(data);
    expect(
      updateTaskActualMinutesInData(data, "task-review", Number.NaN),
    ).toBe(data);
  });
});

describe("goal actions", () => {
  it("adds normalized goals and rejects incomplete input", () => {
    const data = createActionFixture("test-user");
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
    const data = createActionFixture("test-user");
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
  it("adds production habit and module records with safe ownership", () => {
    const data = createEmptyData("test-user");
    const withHabit = addHabitToData(
      data,
      {
        title: "  Morning walk ",
        category: "health",
        measurementType: "boolean",
        targetDays: [1, 1, 3, 8],
      },
      META,
    );
    expect(withHabit.habits[0]).toMatchObject({
      id: "new-id",
      title: "Morning walk",
      targetDays: [1, 3],
      userId: "test-user",
    });

    const withModule = addModuleToData(
      data,
      {
        code: " cs1231s ",
        name: " Discrete Structures ",
        credits: 4,
        targetGrade: "A",
        color: "invalid",
      },
      META,
    );
    expect(withModule.modules[0]).toMatchObject({
      code: "CS1231S",
      name: "Discrete Structures",
      color: "#7eb8da",
      weeklyStudyMinutes: 0,
    });

    const withAssessment = addAssessmentToData(
      withModule,
      {
        moduleId: "new-id",
        title: " Midterm ",
        type: "midterm",
        weight: 120,
        deadline: "2026-08-20",
      },
      { ...META, id: "assessment-1" },
    );
    expect(withAssessment.modules[0].assessments[0]).toMatchObject({
      id: "assessment-1",
      title: "Midterm",
      weight: 100,
      progress: 0,
      status: "not_started",
    });

    const started = updateAssessmentProgressInData(
      withAssessment,
      "new-id",
      "assessment-1",
      45,
    );
    expect(started.modules[0].assessments[0]).toMatchObject({
      progress: 45,
      status: "in_progress",
    });
    const completed = updateAssessmentProgressInData(
      started,
      "new-id",
      "assessment-1",
      150,
    );
    expect(completed.modules[0].assessments[0]).toMatchObject({
      progress: 100,
      status: "submitted",
    });
    const reopened = updateAssessmentProgressInData(
      completed,
      "new-id",
      "assessment-1",
      20,
    );
    expect(reopened.modules[0].assessments[0]).toMatchObject({
      progress: 20,
      status: "in_progress",
    });
    expect(
      updateAssessmentProgressInData(
        withAssessment,
        "missing",
        "assessment-1",
        20,
      ),
    ).toBe(withAssessment);

    const studied = updateModuleStudyMinutesInData(
      withAssessment,
      "new-id",
      12000,
    );
    expect(studied.modules[0].weeklyStudyMinutes).toBe(10080);
    expect(
      updateModuleStudyMinutesInData(withAssessment, "missing", 20),
    ).toBe(withAssessment);
  });

  it("adds career practice and application records", () => {
    const data = createEmptyData("test-user");
    const practiced = addAlgorithmLogToData(
      data,
      {
        platform: "LeetCode",
        problemName: " Two Sum ",
        topic: "Arrays",
        difficulty: "Easy",
        completedDate: "2026-07-24",
        minutes: 25,
        usedHints: false,
        confidence: 4,
        lesson: "Use a map.",
      },
      META,
    );
    expect(practiced.algorithmLogs[0]).toMatchObject({
      problemName: "Two Sum",
      minutes: 25,
      userId: "test-user",
    });

    const applied = addApplicationToData(
      data,
      {
        company: " Acme ",
        role: " Engineer ",
        applicationDate: "2026-07-24",
        stage: "applied",
        nextAction: " Follow up ",
      },
      META,
    );
    expect(applied.applications[0]).toMatchObject({
      company: "Acme",
      role: "Engineer",
      nextAction: "Follow up",
    });

    const interviewing = updateApplicationStageInData(
      applied,
      "new-id",
      "interview",
    );
    expect(interviewing.applications[0].stage).toBe("interview");
    expect(
      updateApplicationStageInData(applied, "missing", "closed"),
    ).toBe(applied);
  });

  it("creates and toggles habit logs while rejecting invalid targets", () => {
    const data = createActionFixture("test-user");
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
    const data = createActionFixture("test-user");
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
    const data = createActionFixture("test-user");
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
    const updated = saveReflectionToData(
      next,
      {
        type: "weekly",
        periodStart: "2026-07-20",
        periodEnd: "2026-07-26",
        wins: "  Finished the project  ",
        nextChanges: "  Start earlier  ",
        energy: 99,
      },
      { ...META, id: "should-not-create-a-second-record" },
    );
    expect(updated.reflections).toHaveLength(1);
    expect(updated.reflections[0]).toMatchObject({
      id: "new-id",
      wins: "Finished the project",
      nextChanges: "Start earlier",
      energy: 5,
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
    const data = createActionFixture("test-user");
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
    const data = createActionFixture("test-user");
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
