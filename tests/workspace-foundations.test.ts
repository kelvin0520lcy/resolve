import { describe, expect, it } from "vitest";
import { createEmptyData, normalizeStoredData } from "@/contexts/resolve-context";
import {
  CURRENT_WORKSPACE_SCHEMA_VERSION,
  migrateWorkspaceData,
  validateWorkspaceData,
} from "@/features/workspace/lib/migrations";
import {
  buildWorkspacePatches,
  mergeWorkspacePatches,
} from "@/features/workspace/lib/patches";
import {
  dateDeadline,
  getDeadlineDateKey,
  getDerivedDeadlines,
  zonedLocalDateTimeToIso,
} from "@/features/workspace/lib/deadlines";
import { expandEvents } from "@/features/workspace/lib/events";
import {
  WORKSPACE_SAFE_CEILING_BYTES,
  canAddEmbeddedData,
  estimateWorkspaceSize,
} from "@/features/workspace/lib/workspace-size";
import {
  addTaskToData,
  moveTaskInData,
  planAssessmentPreparationToData,
  setMilestoneCompletionModeInData,
  setTaskDailyPriorityInData,
  toggleTaskInData,
} from "@/features/workspace/lib/resolve-actions";
import { parseQuickCapture } from "@/features/workspace/lib/quick-capture";
import { canAcquireLease } from "@/features/workspace/sync/tab-coordinator";
import { workspaceToIcs } from "@/features/workspace/lib/recovery";

function seededWorkspace() {
  const data = createEmptyData("user-1");
  data.modules = [
    {
      id: "module-1",
      userId: "user-1",
      semesterId: data.semester.id,
      code: "CS101",
      name: "Foundations",
      credits: 4,
      targetGrade: "A",
      color: "#7eb8da",
      weeklyStudyMinutes: 0,
      assessments: [
        {
          id: "assessment-1",
          moduleId: "module-1",
          title: "Final",
          type: "exam",
          weight: 50,
          deadline: "2026-12-10",
          deadlineInfo: dateDeadline("2026-12-10"),
          progress: 0,
          status: "not_started",
          preparation: { generatedTaskIds: [] },
        },
      ],
    },
  ];
  return data;
}

describe("workspace migration and recovery contracts", () => {
  it("migrates legacy dates without turning them into midnight timestamps", () => {
    const legacy = {
      ...createEmptyData("user-1"),
      tasks: [
        {
          id: "task-1",
          userId: "user-1",
          semesterId: "semester-user-1",
          title: "Submit report",
          category: "academics",
          priority: "high",
          scheduledDate: "2026-08-01",
          deadline: "2026-08-03",
          status: "planned",
          createdAt: "2026-07-01T00:00:00.000Z",
          updatedAt: "2026-07-01T00:00:00.000Z",
        },
      ],
    };
    delete (legacy as Partial<typeof legacy>).events;
    delete (legacy as Partial<typeof legacy>).preferences;
    delete (legacy as Partial<typeof legacy>).archiveSummaries;

    const migration = migrateWorkspaceData(legacy, 3, "Asia/Kuala_Lumpur");
    const normalized = normalizeStoredData(migration.data, "user-1");

    expect(migration.toVersion).toBe(CURRENT_WORKSPACE_SCHEMA_VERSION);
    expect(normalized.tasks[0].deadlineInfo).toEqual({
      kind: "date",
      date: "2026-08-03",
    });
    expect(normalized.tasks[0].schedule).toMatchObject({
      date: "2026-08-01",
      timeZone: "Asia/Kuala_Lumpur",
    });
    expect(validateWorkspaceData(normalized).valid).toBe(true);
    expect(
      migrateWorkspaceData(
        migration.data,
        CURRENT_WORKSPACE_SCHEMA_VERSION,
      ).data,
    ).toEqual(migration.data);
  });
});

describe("derived deadlines", () => {
  it("uses stable identities and preserves equal-titled records", () => {
    const data = seededWorkspace();
    data.tasks = [
      {
        id: "task-1",
        userId: "user-1",
        semesterId: data.semester.id,
        title: "Final",
        category: "academics",
        priority: "high",
        deadline: "2026-12-10",
        deadlineInfo: dateDeadline("2026-12-10"),
        status: "planned",
        createdAt: "",
        updatedAt: "",
      },
    ];
    const deadlines = getDerivedDeadlines(data);
    expect(deadlines.map((deadline) => deadline.id)).toEqual([
      "assessment:assessment-1:deadline",
      "task:task-1:deadline",
    ]);
    expect(deadlines.every((deadline) => deadline.deadline.kind === "date")).toBe(
      true,
    );
  });

  it("converts an exact Kuala Lumpur wall time without changing its date", () => {
    const at = zonedLocalDateTimeToIso(
      "2026-08-03",
      "23:30",
      "Asia/Kuala_Lumpur",
    );
    expect(at).toBe("2026-08-03T15:30:00.000Z");
    expect(
      getDeadlineDateKey({
        kind: "dateTime",
        at,
        timeZone: "Asia/Kuala_Lumpur",
      }),
    ).toBe("2026-08-03");
  });
});

describe("daily task priorities", () => {
  it("keeps three unique slots and clears the slot when a task moves days", () => {
    let data = createEmptyData("user-1");
    for (const [index, title] of ["First", "Second", "Third"].entries()) {
      data = addTaskToData(
        data,
        {
          title,
          category: "personal",
          priority: "medium",
          scheduledDate: "2026-07-26",
        },
        {
          identity: "user-1",
          id: `task-${index + 1}`,
          timestamp: `2026-07-2${index + 1}T00:00:00.000Z`,
        },
      );
    }

    data = setTaskDailyPriorityInData(data, "task-1", 1);
    data = setTaskDailyPriorityInData(data, "task-2", 1);
    expect(data.tasks.find((task) => task.id === "task-1")?.dailyPriorityRank)
      .toBeUndefined();
    expect(data.tasks.find((task) => task.id === "task-2")?.dailyPriorityRank)
      .toBe(1);

    data = moveTaskInData(data, "task-2", "2026-07-27");
    expect(data.tasks.find((task) => task.id === "task-2")?.dailyPriorityRank)
      .toBeUndefined();
  });
});

describe("calendar export", () => {
  it("preserves all-day dates and limited recurring-event rules", () => {
    let data = createEmptyData("user-1");
    data = addTaskToData(
      data,
      {
        title: "Submit report",
        category: "academics",
        priority: "high",
        scheduledDate: "2026-08-01",
        deadline: "2026-08-03",
      },
      {
        identity: "user-1",
        id: "task-report",
        timestamp: "2026-07-24T00:00:00.000Z",
      },
    );
    data.events = [
      {
        id: "event-class",
        userId: "user-1",
        semesterId: data.semester.id,
        title: "Tutorial",
        category: "academics",
        date: "2026-08-04",
        startTime: "10:00",
        durationMinutes: 60,
        timeZone: "Asia/Kuala_Lumpur",
        recurrence: {
          kind: "fortnightly",
          weekdays: [2],
          startsOn: "2026-08-04",
          excludedDates: ["2026-08-18"],
        },
        createdAt: "2026-07-24T00:00:00.000Z",
        updatedAt: "2026-07-24T00:00:00.000Z",
      },
    ];

    const calendar = workspaceToIcs(data);

    expect(calendar).toContain("DTSTART;VALUE=DATE:20260803");
    expect(calendar).not.toContain("20260803T000000");
    expect(calendar).toContain("RRULE:FREQ=WEEKLY;INTERVAL=2;BYDAY=TU");
    expect(calendar).toContain(
      "EXDATE;TZID=Asia/Kuala_Lumpur:20260818T100000",
    );
  });
});

describe("patch-based three-way merge", () => {
  it("merges different fields and reports same-field conflicts", () => {
    const base = createEmptyData("user-1");
    base.tasks = [
      {
        id: "task-1",
        userId: "user-1",
        semesterId: base.semester.id,
        title: "Original",
        category: "personal",
        priority: "medium",
        scheduledDate: "2026-08-01",
        status: "planned",
        createdAt: "",
        updatedAt: "",
      },
    ];
    const local = structuredClone(base);
    local.tasks[0].title = "Local title";
    const remote = structuredClone(base);
    remote.tasks[0].scheduledDate = "2026-08-02";
    const patches = buildWorkspacePatches(base, local, "device-a", "now");
    const merged = mergeWorkspacePatches(remote, patches);
    expect(merged.conflicts).toHaveLength(0);
    expect(merged.data.tasks[0]).toMatchObject({
      title: "Local title",
      scheduledDate: "2026-08-02",
    });

    remote.tasks[0].title = "Remote title";
    const conflicted = mergeWorkspacePatches(remote, patches);
    expect(conflicted.conflicts).toHaveLength(1);
    expect(conflicted.conflicts[0].field).toBe("title");
  });

  it("never merges stable entity arrays by index", () => {
    const base = createEmptyData("user-1");
    const local = addTaskToData(
      base,
      { title: "A", category: "personal", priority: "medium" },
      { identity: "user-1", id: "task-a", timestamp: "now" },
    );
    const remote = addTaskToData(
      base,
      { title: "B", category: "personal", priority: "medium" },
      { identity: "user-1", id: "task-b", timestamp: "now" },
    );
    const merged = mergeWorkspacePatches(
      remote,
      buildWorkspacePatches(base, local, "device-a", "now"),
    );
    expect(merged.data.tasks.map((task) => task.id).sort()).toEqual([
      "task-a",
      "task-b",
    ]);
  });
});

describe("controlled recurrence and retention", () => {
  it("expands fortnightly events and honours excluded dates", () => {
    const data = createEmptyData("user-1");
    const occurrences = expandEvents(
      [
        {
          id: "event-1",
          userId: "user-1",
          semesterId: data.semester.id,
          title: "Tutorial",
          category: "academics",
          date: "2026-08-03",
          timeZone: "Asia/Kuala_Lumpur",
          recurrence: {
            kind: "fortnightly",
            weekdays: [1],
            startsOn: "2026-08-03",
            excludedDates: ["2026-08-17"],
          },
          createdAt: "",
          updatedAt: "",
        },
      ],
      "2026-08-01",
      "2026-08-31",
    );
    expect(occurrences.map((event) => event.date)).toEqual([
      "2026-08-03",
      "2026-08-31",
    ]);
  });

  it("uses deterministic workspace size states and never silently deletes", () => {
    const small = estimateWorkspaceSize(createEmptyData("user-1"));
    expect(small.state).toBe("healthy");
    expect(
      canAddEmbeddedData(small, WORKSPACE_SAFE_CEILING_BYTES),
    ).toBe(false);
  });
});

describe("integrated workflows", () => {
  it("deduplicates assessment preparation templates", () => {
    const data = seededWorkspace();
    const first = planAssessmentPreparationToData(
      data,
      "assessment-1",
      "exam-v1",
      [{ title: "Timed paper", estimatedMinutes: 90 }],
      { identity: "user-1", timestamp: "now" },
    );
    const second = planAssessmentPreparationToData(
      first,
      "assessment-1",
      "exam-v1",
      [{ title: "Timed paper", estimatedMinutes: 90 }],
      { identity: "user-1", timestamp: "later" },
    );
    expect(second.tasks).toHaveLength(1);
  });

  it("reopens automatically completed milestones when a required task reopens", () => {
    let data = createEmptyData("user-1");
    data.goals = [
      {
        id: "goal-1",
        userId: "user-1",
        semesterId: data.semester.id,
        title: "Ship",
        description: "Done",
        category: "personal",
        priority: "high",
        measurementType: "milestone",
        startDate: "2026-07-01",
        status: "active",
        createdAt: "",
        updatedAt: "",
      },
    ];
    data.milestones = [
      {
        id: "milestone-1",
        goalId: "goal-1",
        title: "Release",
        completed: false,
        order: 1,
        completionMode: "manual",
      },
    ];
    data = addTaskToData(
      data,
      {
        title: "Deploy",
        category: "personal",
        priority: "high",
        milestoneId: "milestone-1",
        requiredForMilestone: true,
      },
      { identity: "user-1", id: "task-1", timestamp: "start" },
    );
    data = setMilestoneCompletionModeInData(
      data,
      "milestone-1",
      "required_tasks",
      "mode",
    );
    data = toggleTaskInData(data, "task-1", "complete");
    expect(data.milestones[0].completed).toBe(true);
    data = toggleTaskInData(data, "task-1", "reopen");
    expect(data.milestones[0].completed).toBe(false);
  });

  it("previews limited quick-capture rules before creation", () => {
    const preview = parseQuickCapture(
      "Review calculus tomorrow 45m high priority #academics",
      "Asia/Kuala_Lumpur",
    );
    expect(preview.title).toBe("Review calculus");
    expect(preview.task).toMatchObject({
      category: "academics",
      priority: "high",
      estimatedMinutes: 45,
    });
    expect(preview.understood).toHaveLength(4);
  });

  it("transfers an expired tab lease but not a live one", () => {
    expect(
      canAcquireLease(
        { tabId: "a", acquiredAt: 0, expiresAt: 100 },
        "b",
        50,
      ),
    ).toBe(false);
    expect(
      canAcquireLease(
        { tabId: "a", acquiredAt: 0, expiresAt: 100 },
        "b",
        101,
      ),
    ).toBe(true);
  });
});
