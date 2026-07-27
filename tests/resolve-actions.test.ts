import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  createEmptyData,
  normalizeStoredData,
} from "@/contexts/resolve-context";
import {
  addSemesterResolutionToData,
  addAssessmentToData,
  addAlgorithmLogToData,
  addApplicationToData,
  addGoalToData,
  addGuitarSessionToData,
  addHabitToData,
  addMilestoneToData,
  addModuleToData,
  addTaskToData,
  moveTaskInData,
  removeAlgorithmLogFromData,
  removeApplicationFromData,
  removeAssessmentFromData,
  removeGoalFromData,
  removeGuitarSessionFromData,
  removeHabitFromData,
  removeMilestoneFromData,
  removeModuleFromData,
  removeReflectionFromData,
  removeSemesterResolutionFromData,
  removeTaskFromData,
  saveReflectionToData,
  setGoalCompletedInData,
  toggleHabitInData,
  toggleMilestoneInData,
  toggleSemesterResolutionInData,
  toggleTaskInData,
  updateApplicationStageInData,
  updateApplicationInData,
  updateAssessmentInData,
  updateAssessmentProgressInData,
  markAssessmentSubmittedInData,
  updateAlgorithmLogInData,
  updateGoalInData,
  updateGuitarSessionInData,
  updateHabitInData,
  updateMilestoneInData,
  updateModuleInData,
  updateModuleStudyMinutesInData,
  updatePrioritiesInData,
  updateSemesterInData,
  updateSemesterResolutionInData,
  updateTaskInData,
  updateTaskActualMinutesInData,
} from "@/features/workspace/lib/resolve-actions";
import type { ResolveData } from "@/features/workspace/types";
import { validateWorkspaceData } from "@/features/workspace/lib/migrations";

const META = {
  identity: "test-user",
  id: "new-id",
  timestamp: "2026-07-24T04:00:00.000Z",
};

function createActionFixture(userId = "test-user"): ResolveData {
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
        measurementType: "milestone" as const,
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
        scheduleType: "days_of_week" as const,
        targetDays: [1, 2, 3, 4, 5],
        targetFrequency: 5,
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
    expect(data.guitarLearning.profile).toMatchObject({
      userId: "test-user",
      placementCompleted: false,
    });
    expect(data.guitarLearning.progress).toEqual([]);
    expect(data.weeklyPriorities).toEqual(["", "", ""]);
  });

  it("falls back safely for malformed storage", () => {
    const normalized = normalizeStoredData("bad-data", "restored-user");
    expect(normalized.semester.userId).toBe("restored-user");
    expect(normalized.goals).toEqual([]);
    expect(normalized.guitarLearning.profile.userId).toBe(
      "restored-user",
    );
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

  it("preserves numeric goal measurements when no breakdown exists", () => {
    const seed = createActionFixture("restored-user");
    const normalized = normalizeStoredData(
      {
        ...seed,
        goals: [
          {
            ...seed.goals[0],
            measurementType: "count",
            targetValue: 60,
            currentValue: 60,
            unit: "sessions",
            status: "completed",
          },
        ],
        milestones: [],
      },
      "restored-user",
    );

    expect(normalized.goals[0]).toMatchObject({
      measurementType: "count",
      targetValue: 60,
      currentValue: 60,
      unit: "sessions",
      status: "completed",
    });
  });

  it("migrates the legacy main resolution into the resolution list", () => {
    const seed = createActionFixture("restored-user");
    const normalized = normalizeStoredData(
      {
        ...seed,
        semester: {
          ...seed.semester,
          resolutions: undefined,
          mainResolution: "  Finish the semester well.  ",
        },
      },
      "restored-user",
    );

    expect(normalized.semester.resolutions).toEqual([
      expect.objectContaining({
        id: "legacy-main-resolution",
        title: "Finish the semester well.",
        completed: false,
      }),
    ]);
  });

  it("repairs nested collections without retaining malformed records", () => {
    const seed = createActionFixture("old-user");
    const normalized = normalizeStoredData(
      {
        ...seed,
        semester: { ...seed.semester, id: "kept-semester" },
        goals: [
          { ...seed.goals[0], userId: "wrong-user" },
          null,
          { id: "missing-title" },
        ],
        milestones: [
          {
            id: "step-1",
            goalId: "goal-career",
            title: "  First step  ",
            completed: "yes",
            order: Number.NaN,
          },
          { id: "orphan", goalId: "missing-goal", title: "Orphan" },
          null,
        ],
        tasks: [
          {
            ...seed.tasks[0],
            userId: "wrong-user",
            goalId: "missing-goal",
            milestoneId: "missing-step",
            estimatedMinutes: "many",
          },
          null,
        ],
        habits: [
          {
            ...seed.habits[0],
            targetDays: [1, 1, 9, "2"],
          },
          null,
        ],
        habitLogs: [
          {
            id: "habit-log",
            habitId: "habit-plan",
            userId: "wrong-user",
            date: "2026-07-24",
            completed: true,
          },
          {
            id: "orphan-log",
            habitId: "missing-habit",
            date: "2026-07-24",
            completed: true,
          },
        ],
        guitarSessions: [
          {
            id: "guitar-1",
            userId: "wrong-user",
            semesterId: "wrong-semester",
            date: "2026-07-24",
            durationMinutes: 30,
            category: "Foundations",
            techniques: "not-an-array",
          },
        ],
        modules: [
          {
            id: "module-1",
            userId: "wrong-user",
            semesterId: "wrong-semester",
            code: " cs1010 ",
            name: " Programming ",
            credits: 4,
            targetGrade: "A",
            color: "#7eb8da",
            weeklyStudyMinutes: 0,
            assessments: "not-an-array",
          },
          null,
        ],
        algorithmLogs: [null, {}],
        applications: [null, {}],
      },
      "restored-user",
    );

    expect(normalized.semester.id).toBe("kept-semester");
    expect(normalized.goals).toHaveLength(1);
    expect(normalized.goals[0]).toMatchObject({
      userId: "restored-user",
      semesterId: "kept-semester",
    });
    expect(normalized.milestones).toEqual([
      expect.objectContaining({
        id: "step-1",
        title: "First step",
        completed: false,
        order: 1,
      }),
    ]);
    expect(normalized.tasks).toHaveLength(1);
    expect(normalized.tasks[0]).toMatchObject({
      userId: "restored-user",
      semesterId: "kept-semester",
      goalId: undefined,
      milestoneId: undefined,
      estimatedMinutes: undefined,
    });
    expect(normalized.habits[0].targetDays).toEqual([1]);
    expect(normalized.habits[0]).toMatchObject({
      scheduleType: "days_of_week",
      targetFrequency: 1,
    });
    expect(normalized.habitLogs).toHaveLength(1);
    expect(normalized.guitarSessions[0].techniques).toEqual([]);
    expect(normalized.modules[0]).toMatchObject({
      code: "CS1010",
      name: "Programming",
      assessments: [],
    });
    expect(normalized.algorithmLogs).toEqual([]);
    expect(normalized.applications).toEqual([]);
  });

  it("derives a task goal from its valid milestone during normalization", () => {
    const seed = createActionFixture("old-user");
    const normalized = normalizeStoredData(
      {
        ...seed,
        milestones: [
          {
            id: "milestone-career",
            goalId: "goal-career",
            title: "Complete the interview set",
            completed: false,
            order: 1,
          },
        ],
        tasks: [
          {
            ...seed.tasks[0],
            goalId: undefined,
            milestoneId: "milestone-career",
            requiredForMilestone: true,
          },
        ],
      },
      "restored-user",
    );

    expect(normalized.tasks[0]).toMatchObject({
      goalId: "goal-career",
      milestoneId: "milestone-career",
      requiredForMilestone: true,
    });
    expect(validateWorkspaceData(normalized).valid).toBe(true);
  });
});

describe("task actions", () => {
  it("adds a trimmed, clamped backlog task without inventing a schedule", () => {
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
      scheduledDate: undefined,
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

  it("removes only the requested task", () => {
    const data = createActionFixture("test-user");
    const next = removeTaskFromData(data, "task-review");

    expect(next.tasks.map((task) => task.id)).toEqual(["task-leetcode"]);
    expect(removeTaskFromData(data, "missing")).toBe(data);
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

  it("edits task fields without losing completion evidence", () => {
    const data = createActionFixture("test-user");
    const next = updateTaskInData(
      data,
      "task-leetcode",
      {
        title: "  Solve two problems ",
        category: "career",
        priority: "high",
        scheduledDate: "2026-07-25",
        deadline: "2026-07-30",
        estimatedMinutes: 90,
      },
      META.timestamp,
    );

    expect(
      next.tasks.find((task) => task.id === "task-leetcode"),
    ).toMatchObject({
      title: "Solve two problems",
      priority: "high",
      scheduledDate: "2026-07-25",
      deadline: "2026-07-30",
      estimatedMinutes: 90,
      status: "completed",
      completedAt: expect.any(String),
      updatedAt: META.timestamp,
    });
    expect(
      updateTaskInData(
        data,
        "missing",
        {
          title: "No",
          category: "custom",
          priority: "low",
        },
      ),
    ).toBe(data);
  });

  it("preserves omitted task details and only clears explicitly edited fields", () => {
    const data = createActionFixture("test-user");
    data.tasks[0] = {
      ...data.tasks[0],
      description: "Keep the examples",
      schedule: {
        date: "2026-07-24",
        startTime: "09:30",
        estimatedMinutes: 45,
        timeZone: "Asia/Kuala_Lumpur",
      },
      prerequisiteTaskIds: ["task-leetcode"],
      origin: {
        kind: "reflection-action",
        reflectionDate: "2026-07-23",
      },
    };

    const renamed = updateTaskInData(
      data,
      "task-review",
      { title: "Review chapter two" },
      META.timestamp,
    );
    expect(renamed.tasks[0]).toMatchObject({
      title: "Review chapter two",
      description: "Keep the examples",
      schedule: {
        date: "2026-07-24",
        startTime: "09:30",
        estimatedMinutes: 45,
      },
      prerequisiteTaskIds: ["task-leetcode"],
      origin: {
        kind: "reflection-action",
        reflectionDate: "2026-07-23",
      },
    });
    const retimed = updateTaskInData(
      renamed,
      "task-review",
      { schedule: { startTime: "10:15" } },
      META.timestamp,
    );
    expect(retimed.tasks[0].schedule).toMatchObject({
      date: "2026-07-24",
      startTime: "10:15",
      estimatedMinutes: 45,
      timeZone: "Asia/Kuala_Lumpur",
    });

    const cleared = updateTaskInData(
      retimed,
      "task-review",
      {
        description: undefined,
        prerequisiteTaskIds: [],
        origin: undefined,
        schedule: {
          date: "2026-07-24",
          startTime: undefined,
          estimatedMinutes: 45,
          timeZone: "Asia/Kuala_Lumpur",
        },
      },
      META.timestamp,
    );
    expect(cleared.tasks[0].description).toBeUndefined();
    expect(cleared.tasks[0].schedule?.startTime).toBeUndefined();
    expect(cleared.tasks[0].prerequisiteTaskIds).toEqual([]);
    expect(cleared.tasks[0].origin).toBeUndefined();
  });

  it("unlinks an existing milestone when its task goal is cleared", () => {
    const data = createActionFixture("test-user");
    data.milestones = [
      {
        id: "milestone-career",
        goalId: "goal-career",
        title: "Complete the set",
        completed: false,
        order: 1,
      },
    ];
    data.tasks[0] = {
      ...data.tasks[0],
      goalId: "goal-career",
      milestoneId: "milestone-career",
      requiredForMilestone: true,
    };

    const next = updateTaskInData(
      data,
      "task-review",
      { goalId: undefined },
      META.timestamp,
    );
    expect(next.tasks[0]).toMatchObject({ requiredForMilestone: false });
    expect(next.tasks[0].goalId).toBeUndefined();
    expect(next.tasks[0].milestoneId).toBeUndefined();
  });

  it("supports explicit task workflow states for focus and cancellation", () => {
    const data = createActionFixture("test-user");
    const task = data.tasks.find((item) => item.id === "task-review")!;
    const inProgress = updateTaskInData(
      data,
      task.id,
      { ...task, status: "in_progress" },
      META.timestamp,
    );
    expect(
      inProgress.tasks.find((item) => item.id === task.id)?.status,
    ).toBe("in_progress");
    const cancelled = updateTaskInData(
      inProgress,
      task.id,
      { ...task, status: "cancelled" },
      META.timestamp,
    );
    expect(
      cancelled.tasks.find((item) => item.id === task.id)?.status,
    ).toBe("cancelled");
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
        deadline: "not-a-date",
      },
      META,
    );
    expect(next.goals.at(-1)).toMatchObject({
      id: "new-id",
      title: "Play a live set",
      description: "Finish three songs",
      measurementType: "manual",
      deadline: undefined,
      status: "active",
    });
    expect(next.goals.at(-1)).not.toHaveProperty("targetValue");
    expect(next.goals.at(-1)).not.toHaveProperty("currentValue");
    expect(next.goals.at(-1)).not.toHaveProperty("unit");
    expect(
      addGoalToData(
        data,
        {
          title: "",
          description: "Something",
          category: "custom",
          priority: "low",
        },
        META,
      ),
    ).toBe(data);
  });

  it("completes goals directly unless an incomplete breakdown is attached", () => {
    const data = createActionFixture("test-user");
    const direct = setGoalCompletedInData(
      data,
      "goal-career",
      true,
      META.timestamp,
    );
    expect(direct.goals[0]).toMatchObject({
      measurementType: "manual",
      status: "completed",
    });

    const incomplete = {
      ...data,
      milestones: [
        {
          id: "milestone-1",
          goalId: "goal-career",
          title: "Finish the first set",
          completed: false,
          order: 1,
        },
      ],
    };
    expect(
      setGoalCompletedInData(
        incomplete,
        "goal-career",
        true,
        META.timestamp,
      ),
    ).toBe(incomplete);

    const ready = {
      ...incomplete,
      milestones: incomplete.milestones.map((milestone) => ({
        ...milestone,
        completed: true,
      })),
    };
    const complete = setGoalCompletedInData(
      ready,
      "goal-career",
      true,
      META.timestamp,
    );
    expect(
      complete.goals.find((goal) => goal.id === "goal-career"),
    ).toMatchObject({
      measurementType: "milestone",
      targetValue: undefined,
      currentValue: undefined,
      unit: undefined,
      status: "completed",
      updatedAt: META.timestamp,
    });
    const reopened = setGoalCompletedInData(
      complete,
      "goal-career",
      false,
      META.timestamp,
    );
    expect(
      reopened.goals.find((goal) => goal.id === "goal-career"),
    ).toMatchObject({ status: "active" });
    expect(
      setGoalCompletedInData(data, "missing", true, META.timestamp),
    ).toBe(data);
  });

  it("adds ordered goal milestones with optional valid deadlines", () => {
    const data = createActionFixture("test-user");
    const first = addMilestoneToData(
      data,
      "goal-career",
      {
        title: "  Learn array patterns  ",
        description: "  Work through the core set  ",
        deadline: "2026-08-01",
      },
      META,
    );
    expect(first.milestones[0]).toMatchObject({
      id: "new-id",
      goalId: "goal-career",
      title: "Learn array patterns",
      description: "Work through the core set",
      deadline: "2026-08-01",
      completed: false,
      order: 1,
    });

    const second = addMilestoneToData(
      first,
      "goal-career",
      { title: "Mock interview", deadline: "bad-date" },
      { ...META, id: "second-milestone" },
    );
    expect(second.milestones[1]).toMatchObject({
      id: "second-milestone",
      deadline: undefined,
      order: 2,
    });
    expect(second.goals[0]).toMatchObject({
      measurementType: "milestone",
      targetValue: undefined,
      currentValue: undefined,
      unit: undefined,
    });

    const completedFirst = setGoalCompletedInData(
      toggleMilestoneInData(first, "new-id", META.timestamp),
      "goal-career",
      true,
      META.timestamp,
    );
    const reopenedByNewStep = addMilestoneToData(
      completedFirst,
      "goal-career",
      { title: "Add another finish line" },
      { ...META, id: "reopening-milestone" },
    );
    expect(reopenedByNewStep.goals[0].status).toBe("active");

    expect(
      addMilestoneToData(data, "missing", { title: "Step" }, META),
    ).toBe(data);
    expect(
      addMilestoneToData(data, "goal-career", { title: "   " }, META),
    ).toBe(data);
  });

  it("toggles and removes milestones without leaving linked tasks behind", () => {
    const data = createActionFixture("test-user");
    const withMilestone = {
      ...data,
      milestones: [
        {
          id: "milestone-1",
          goalId: "goal-career",
          title: "Finish the first set",
          completed: false,
          order: 1,
        },
      ],
      tasks: data.tasks.map((task, index) =>
        index === 0 ? { ...task, milestoneId: "milestone-1" } : task,
      ),
    };
    const completed = toggleMilestoneInData(
      withMilestone,
      "milestone-1",
      META.timestamp,
    );
    expect(completed.milestones[0]).toMatchObject({
      completed: true,
      completedAt: META.timestamp,
    });
    const reopened = toggleMilestoneInData(
      completed,
      "milestone-1",
      META.timestamp,
    );
    expect(reopened.milestones[0]).toMatchObject({
      completed: false,
      completedAt: undefined,
    });

    const completedGoal = {
      ...completed,
      goals: completed.goals.map((goal) => ({
        ...goal,
        status: "completed" as const,
      })),
    };
    const milestoneReopened = toggleMilestoneInData(
      completedGoal,
      "milestone-1",
      META.timestamp,
    );
    expect(milestoneReopened.goals[0].status).toBe("active");

    const removed = removeMilestoneFromData(
      completedGoal,
      "milestone-1",
      META.timestamp,
    );
    expect(removed.milestones).toEqual([]);
    expect(removed.goals[0]).toMatchObject({
      status: "completed",
      measurementType: "manual",
    });
    expect(removed.tasks[0]).toMatchObject({
      milestoneId: undefined,
      requiredForMilestone: false,
      updatedAt: META.timestamp,
    });
    expect(toggleMilestoneInData(data, "missing")).toBe(data);
    expect(removeMilestoneFromData(data, "missing")).toBe(data);
  });

  it("edits goals and breakdown steps while preserving their progress", () => {
    const data = createActionFixture("test-user");
    const withStep = addMilestoneToData(
      data,
      "goal-career",
      { title: "First draft", deadline: "2026-08-01" },
      META,
    );
    const completed = toggleMilestoneInData(
      withStep,
      "new-id",
      META.timestamp,
    );
    const editedGoal = updateGoalInData(
      completed,
      "goal-career",
      {
        title: "  Interview readiness ",
        description: "  Build reliable patterns ",
        category: "career",
        priority: "medium",
        deadline: "2026-09-01",
      },
      META.timestamp,
    );
    const editedStep = updateMilestoneInData(
      editedGoal,
      "new-id",
      { title: "  Complete mock interview ", deadline: "2026-08-15" },
      META.timestamp,
    );

    expect(editedStep.goals[0]).toMatchObject({
      title: "Interview readiness",
      description: "Build reliable patterns",
      priority: "medium",
      deadline: "2026-09-01",
    });
    expect(editedStep.milestones[0]).toMatchObject({
      title: "Complete mock interview",
      deadline: "2026-08-15",
      completed: true,
    });
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
      scheduleType: "days_of_week",
      targetDays: [1, 3],
      targetFrequency: 2,
      userId: "test-user",
    });

    const flexibleHabit = addHabitToData(
      data,
      {
        title: "Practice movement",
        category: "health",
        measurementType: "boolean",
        scheduleType: "times_per_week",
        targetFrequency: 12,
      },
      { ...META, id: "flexible-habit" },
    );
    expect(flexibleHabit.habits[0]).toMatchObject({
      scheduleType: "times_per_week",
      targetDays: [],
      targetFrequency: 7,
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
      status: "ready_to_submit",
    });
    const submitted = markAssessmentSubmittedInData(
      completed,
      "new-id",
      "assessment-1",
      true,
      META.timestamp,
    );
    expect(submitted.modules[0].assessments[0]).toMatchObject({
      status: "submitted",
      submittedAt: META.timestamp,
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

    const removedAssessment = removeAssessmentFromData(
      withAssessment,
      "new-id",
      "assessment-1",
    );
    expect(removedAssessment.modules[0].assessments).toEqual([]);
    expect(
      removeAssessmentFromData(
        withAssessment,
        "new-id",
        "missing",
      ),
    ).toBe(withAssessment);

    const studied = updateModuleStudyMinutesInData(
      withAssessment,
      "new-id",
      12000,
    );
    expect(studied.modules[0].weeklyStudyMinutes).toBe(0);
    expect(studied.moduleStudyLogs).toMatchObject([
      {
        moduleId: "new-id",
        minutes: 1440,
      },
    ]);
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

  it("edits habits, modules, assessments, career records, and guitar sessions", () => {
    const data = createEmptyData("test-user");
    const withHabit = addHabitToData(
      data,
      {
        title: "Walk",
        category: "health",
        measurementType: "boolean",
        targetDays: [1, 3, 5],
      },
      { ...META, id: "habit-1" },
    );
    const editedHabit = updateHabitInData(withHabit, "habit-1", {
      title: "Strength training",
      category: "health",
      measurementType: "boolean",
      scheduleType: "times_per_week",
      targetFrequency: 2,
    });
    expect(editedHabit.habits[0]).toMatchObject({
      title: "Strength training",
      scheduleType: "times_per_week",
      targetDays: [],
      targetFrequency: 2,
    });

    const withModule = addModuleToData(
      data,
      {
        code: "CS1010",
        name: "Programming",
        credits: 4,
        targetGrade: "A",
        color: "#7eb8da",
      },
      { ...META, id: "module-1" },
    );
    const secondModule = addModuleToData(
      withModule,
      {
        code: "CS2040",
        name: "Data Structures",
        credits: 4,
        targetGrade: "A",
        color: "#d989b5",
      },
      { ...META, id: "module-2" },
    );
    const editedModule = updateModuleInData(secondModule, "module-1", {
      code: "cs1010s",
      name: "Programming Methodology",
      lecturer: "Dr Tan",
      credits: 5,
      targetGrade: "A+",
      color: "#123456",
    });
    const withAssessment = addAssessmentToData(
      editedModule,
      {
        moduleId: "module-1",
        title: "Midterm",
        type: "midterm",
        weight: 30,
        deadline: "2026-08-20",
      },
      { ...META, id: "assessment-1" },
    );
    const progressed = updateAssessmentProgressInData(
      withAssessment,
      "module-1",
      "assessment-1",
      60,
    );
    const withPreparationTask = {
      ...progressed,
      tasks: [
        ...progressed.tasks,
        {
          id: "prep-task",
          userId: "test-user",
          semesterId: progressed.semester.id,
          title: "Prepare for Midterm",
          category: "academics",
          priority: "high" as const,
          status: "planned" as const,
          origin: {
            kind: "assessment-preparation" as const,
            moduleId: "module-1",
            assessmentId: "assessment-1",
            templateId: "exam-v1",
            templateStepId: "review",
          },
          createdAt: META.timestamp,
          updatedAt: META.timestamp,
        },
      ],
    };
    const movedAssessment = updateAssessmentInData(
      withPreparationTask,
      "assessment-1",
      {
        moduleId: "module-2",
        title: "Final project",
        type: "project",
        weight: 40,
        deadline: "2026-09-15",
      },
    );
    expect(movedAssessment.modules[0]).toMatchObject({
      code: "CS1010S",
      name: "Programming Methodology",
      lecturer: "Dr Tan",
      credits: 5,
      targetGrade: "A+",
      color: "#123456",
      assessments: [],
    });
    expect(movedAssessment.modules[1].assessments[0]).toMatchObject({
      id: "assessment-1",
      moduleId: "module-2",
      title: "Final project",
      progress: 60,
      status: "in_progress",
    });
    expect(
      movedAssessment.tasks.find((task) => task.id === "prep-task")?.origin,
    ).toMatchObject({
      kind: "assessment-preparation",
      moduleId: "module-2",
      assessmentId: "assessment-1",
    });

    const withLog = addAlgorithmLogToData(
      data,
      {
        platform: "LeetCode",
        problemName: "Two Sum",
        topic: "Arrays",
        difficulty: "Easy",
        completedDate: "2026-07-24",
        minutes: 20,
        usedHints: false,
        confidence: 3,
        lesson: "Use a map.",
      },
      { ...META, id: "log-1" },
    );
    const editedLog = updateAlgorithmLogInData(withLog, "log-1", {
      platform: "NeetCode",
      problemName: "Three Sum",
      topic: "Two pointers",
      difficulty: "Medium",
      completedDate: "2026-07-25",
      minutes: 45,
      usedHints: true,
      confidence: 4,
      lesson: "Sort first.",
    });
    expect(editedLog.algorithmLogs[0]).toMatchObject({
      problemName: "Three Sum",
      usedHints: true,
      confidence: 4,
    });

    const withApplication = addApplicationToData(
      data,
      {
        company: "Acme",
        role: "Intern",
        applicationDate: "2026-07-24",
        stage: "applied",
      },
      { ...META, id: "application-1" },
    );
    const editedApplication = updateApplicationInData(
      withApplication,
      "application-1",
      {
        company: "Acme Labs",
        role: "Software Intern",
        applicationDate: "2026-07-23",
        stage: "interview",
        nextAction: "Prepare stories",
        nextActionDate: "2026-07-30",
      },
    );
    expect(editedApplication.applications[0]).toMatchObject({
      company: "Acme Labs",
      role: "Software Intern",
      stage: "interview",
      nextAction: "Prepare stories",
    });

    const withSession = addGuitarSessionToData(
      data,
      {
        date: "2026-07-24",
        durationMinutes: 30,
        category: "Foundations",
        techniques: ["Clean chord changes"],
      },
      { ...META, id: "session-1" },
    );
    const editedSession = updateGuitarSessionInData(
      withSession,
      "session-1",
      {
        date: "2026-07-25",
        durationMinutes: 45,
        category: "Rhythm guitar",
        techniques: ["Palm muting"],
        cleanBpm: 110,
        confidence: 4,
        difficulty: 3,
        nextFocus: "Keep the wrist loose.",
      },
    );
    expect(editedSession.guitarSessions[0]).toMatchObject({
      id: "session-1",
      date: "2026-07-25",
      durationMinutes: 45,
      category: "Rhythm guitar",
      techniques: ["Palm muting"],
      cleanBpm: 110,
      nextFocus: "Keep the wrist loose.",
    });
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
        techniques: [" Bends "],
        cleanBpm: 900,
        confidence: 8,
        difficulty: -2,
        notes: "  Cleaner release  ",
      },
      META,
    );
    expect(next.guitarSessions[0]).toMatchObject({
      id: "new-id",
      durationMinutes: 720,
      cleanBpm: 400,
      techniques: ["Bends"],
      confidence: 5,
      difficulty: 1,
      notes: "Cleaner release",
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

describe("top-level record removal", () => {
  it("removes a goal, its breakdown, and safely detaches linked tasks", () => {
    const data = createActionFixture();
    const linked = {
      ...data,
      milestones: [
        {
          id: "milestone-1",
          goalId: "goal-career",
          title: "Finish mock interview",
          completed: false,
          order: 1,
        },
      ],
      tasks: data.tasks.map((task, index) =>
        index === 0
          ? {
              ...task,
              goalId: "goal-career",
              milestoneId: "milestone-1",
              requiredForMilestone: true,
            }
          : task,
      ),
    };

    const next = removeGoalFromData(linked, "goal-career", META.timestamp);
    expect(next.goals).toEqual([]);
    expect(next.milestones).toEqual([]);
    expect(next.tasks[0]).toMatchObject({
      goalId: undefined,
      milestoneId: undefined,
      requiredForMilestone: false,
      updatedAt: META.timestamp,
    });
    const removedWithTasks = removeGoalFromData(
      linked,
      "goal-career",
      META.timestamp,
      "delete",
    );
    expect(
      removedWithTasks.tasks.some((task) => task.id === linked.tasks[0].id),
    ).toBe(false);
    expect(removeGoalFromData(data, "missing")).toBe(data);
  });

  it("removes dependent habit logs and other user-created records", () => {
    const data = createActionFixture();
    const withHabitLog = toggleHabitInData(
      data,
      "habit-plan",
      "2026-07-24",
      META,
    );
    const withoutHabit = removeHabitFromData(withHabitLog, "habit-plan");
    expect(withoutHabit.habits).toEqual([]);
    expect(withoutHabit.habitLogs).toEqual([]);

    const withModule = addModuleToData(
      data,
      {
        code: "CS101",
        name: "Foundations",
        credits: 4,
        targetGrade: "A",
        color: "#7eb8da",
      },
      { ...META, id: "module-1" },
    );
    expect(removeModuleFromData(withModule, "module-1").modules).toEqual([]);

    const withLog = addAlgorithmLogToData(
      data,
      {
        platform: "Practice",
        problemName: "Two Sum",
        topic: "Arrays",
        difficulty: "Easy",
        completedDate: "2026-07-24",
        minutes: 20,
        usedHints: false,
        confidence: 4,
        lesson: "Check complements first.",
      },
      { ...META, id: "log-1" },
    );
    expect(
      removeAlgorithmLogFromData(withLog, "log-1").algorithmLogs,
    ).toEqual([]);

    const withApplication = addApplicationToData(
      data,
      {
        company: "Acme",
        role: "Engineer",
        applicationDate: "2026-07-24",
        stage: "applied",
      },
      { ...META, id: "application-1" },
    );
    expect(
      removeApplicationFromData(withApplication, "application-1")
        .applications,
    ).toEqual([]);

    const withSession = addGuitarSessionToData(
      data,
      {
        date: "2026-07-24",
        durationMinutes: 30,
        category: "Technique",
        techniques: ["Alternate picking"],
      },
      { ...META, id: "session-1" },
    );
    expect(
      removeGuitarSessionFromData(withSession, "session-1").guitarSessions,
    ).toEqual([]);

    const withReflection = saveReflectionToData(
      data,
      {
        type: "daily",
        periodStart: "2026-07-24",
        periodEnd: "2026-07-24",
        wins: "Practised",
      },
      { ...META, id: "reflection-1" },
    );
    expect(
      removeReflectionFromData(withReflection, "reflection-1").reflections,
    ).toEqual([]);
  });
});

describe("semester and priority actions", () => {
  it("adds, edits, completes, reopens, and removes resolutions", () => {
    const data = createActionFixture("test-user");
    const added = addSemesterResolutionToData(
      data,
      { title: "  Build a sustainable routine.  " },
      META,
    );
    expect(added.semester.resolutions).toEqual([
      {
        id: META.id,
        title: "Build a sustainable routine.",
        completed: false,
        createdAt: META.timestamp,
        updatedAt: META.timestamp,
      },
    ]);

    const edited = updateSemesterResolutionInData(
      added,
      META.id,
      { title: "Build two sustainable routines." },
      "2026-07-25T00:00:00.000Z",
    );
    expect(edited.semester.resolutions?.[0]).toMatchObject({
      title: "Build two sustainable routines.",
      updatedAt: "2026-07-25T00:00:00.000Z",
    });

    const completed = toggleSemesterResolutionInData(
      edited,
      META.id,
      "2026-07-26T00:00:00.000Z",
    );
    expect(completed.semester.resolutions?.[0]).toMatchObject({
      completed: true,
      completedAt: "2026-07-26T00:00:00.000Z",
    });

    const reopened = toggleSemesterResolutionInData(
      completed,
      META.id,
      "2026-07-27T00:00:00.000Z",
    );
    expect(reopened.semester.resolutions?.[0]).toMatchObject({
      completed: false,
      completedAt: undefined,
    });

    expect(
      removeSemesterResolutionFromData(reopened, META.id).semester
        .resolutions,
    ).toEqual([]);
  });

  it("does not recreate a removed migrated resolution", () => {
    const data = createActionFixture("test-user");
    const migrated = {
      ...data,
      semester: {
        ...data.semester,
        mainResolution: "Legacy promise",
        resolutions: [
          {
            id: "legacy-main-resolution",
            title: "Legacy promise",
            completed: false,
            createdAt: META.timestamp,
            updatedAt: META.timestamp,
          },
        ],
      },
    };

    const removed = removeSemesterResolutionFromData(
      migrated,
      "legacy-main-resolution",
    );
    expect(removed.semester.resolutions).toEqual([]);
    expect(removed.semester.mainResolution).toBeUndefined();
    expect(
      normalizeStoredData(removed, "test-user").semester.resolutions,
    ).toEqual([]);
  });

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

  it("stores up to three weekly priorities against the selected week", () => {
    const data = createActionFixture("test-user");
    expect(
      updatePrioritiesInData(data, [" One ", "Two", " Three "])
        .weeklyPriorities,
    ).toEqual(["One", "Two", "Three"]);
    expect(updatePrioritiesInData(data, ["One", ""])).toBe(data);
    expect(updatePrioritiesInData(data, ["One", "Two", "Three", "Four"])).toBe(
      data,
    );
    const dated = updatePrioritiesInData(
      data,
      [" First ", "", ""],
      "2026-07-20",
    );
    expect(dated.weeklyPrioritiesByWeek).toEqual({
      "2026-07-20": ["First", "", ""],
    });
  });
});
