import { afterEach, describe, expect, it, vi } from "vitest";
import { createEmptyData } from "@/contexts/resolve-context";
import {
  addEventToData,
  addTaskToData,
  startNewSemesterInData,
  updateWorkspacePreferencesInData,
} from "@/features/workspace/lib/resolve-actions";
import {
  getDerivedDeadlines,
  isDeadlineActive,
  zonedLocalDateTimeToIso,
} from "@/features/workspace/lib/deadlines";
import { getScheduleConflicts } from "@/features/workspace/lib/scheduling";
import {
  getActualMinutesByCategory,
  getAverageGoalProgress,
  getModuleStudyMinutes,
  getPlannedMinutesByCategory,
} from "@/features/workspace/lib/analytics";
import { TabSyncCoordinator } from "@/features/workspace/sync/tab-coordinator";
import { detectWorkspaceImportVersion } from "@/features/workspace/sync/use-workspace-sync";
import type { Goal, Milestone, Task } from "@/types";

const META = {
  identity: "user-1",
  id: "record-1",
  timestamp: "2026-07-27T01:00:00.000Z",
};

afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllGlobals();
  window.localStorage.clear();
});

describe("post-audit data integrity", () => {
  it("starts a semester without carrying module study logs into it", () => {
    const data = createEmptyData("user-1");
    data.moduleStudyLogs = [
      {
        id: "log-1",
        moduleId: "old-module",
        userId: "user-1",
        date: "2026-07-20",
        minutes: 30,
      },
    ];

    const next = startNewSemesterInData(
      data,
      {
        id: "semester-next",
        userId: "user-1",
        name: "Next",
        academicYear: "2026/2027",
        startDate: "2026-08-01",
        endDate: "2026-12-01",
        status: "active",
      },
      META.timestamp,
    );

    expect(next.moduleStudyLogs).toEqual([]);
    expect(data.moduleStudyLogs).toHaveLength(1);
    expect(next.archiveSummaries.at(-1)?.semesterId).toBe(data.semester.id);
  });

  it("rejects invalid time zones at every mutation boundary", () => {
    const data = createEmptyData("user-1");
    expect(
      updateWorkspacePreferencesInData(data, {
        timeZone: "Mars/Olympus_Mons",
      }).preferences.timeZone,
    ).toBe(data.preferences.timeZone);
    expect(
      addTaskToData(
        data,
        {
          title: "Invalid schedule",
          category: "personal",
          priority: "medium",
          schedule: {
            date: "2026-07-27",
            timeZone: "Mars/Olympus_Mons",
          },
        },
        META,
      ),
    ).toBe(data);
    expect(
      addEventToData(
        data,
        {
          title: "Invalid event",
          category: "personal",
          date: "2026-07-27",
          timeZone: "Mars/Olympus_Mons",
          recurrence: { kind: "none" },
        },
        META,
      ),
    ).toBe(data);
  });

  it("rejects a nonexistent local time during a daylight-saving jump", () => {
    expect(() =>
      zonedLocalDateTimeToIso(
        "2026-03-29",
        "01:30",
        "Europe/London",
      ),
    ).toThrow(/does not exist/);
  });

  it("rejects an ambiguous repeated local time during a daylight-saving fall-back", () => {
    expect(() =>
      zonedLocalDateTimeToIso(
        "2026-10-25",
        "01:30",
        "Europe/London",
      ),
    ).toThrow(/occurs twice/);
  });

  it("warns for untimed same-day work and work ending after an exact deadline", () => {
    const deadline = {
      kind: "dateTime" as const,
      at: "2026-07-27T04:00:00.000Z",
      timeZone: "Asia/Kuala_Lumpur",
    };
    const task = (startTime?: string): Task =>
      ({
        id: startTime ? "timed" : "untimed",
        userId: "user-1",
        semesterId: "semester-1",
        title: "Submit",
        category: "academics",
        priority: "high",
        status: "planned",
        schedule: {
          date: "2026-07-27",
          startTime,
          estimatedMinutes: 60,
          timeZone: "Asia/Kuala_Lumpur",
        },
        deadlineInfo: deadline,
        createdAt: "",
        updatedAt: "",
      }) as Task;

    expect(getScheduleConflicts([task()], [])).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ kind: "after_deadline" }),
      ]),
    );
    expect(getScheduleConflicts([task("11:30")], [])).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          message: expect.stringContaining("exact deadline"),
        }),
      ]),
    );
  });

  it("classifies cancelled and abandoned deadlines as dismissed", () => {
    const data = createEmptyData("user-1");
    data.tasks.push({
      id: "cancelled",
      userId: "user-1",
      semesterId: data.semester.id,
      title: "Cancelled",
      category: "personal",
      priority: "medium",
      status: "cancelled",
      deadlineInfo: { kind: "date", date: "2026-07-20" },
      createdAt: "",
      updatedAt: "",
    });
    data.goals.push({
      id: "abandoned",
      userId: "user-1",
      semesterId: data.semester.id,
      title: "Abandoned",
      description: "",
      category: "personal",
      priority: "medium",
      measurementType: "manual",
      startDate: "2026-07-01",
      status: "abandoned",
      deadlineInfo: { kind: "date", date: "2026-07-21" },
      createdAt: "",
      updatedAt: "",
    });

    expect(getDerivedDeadlines(data).some(isDeadlineActive)).toBe(false);
  });
});

describe("post-audit analytics semantics", () => {
  it("keeps planned estimates and actual logs in separate category totals", () => {
    const tasks = [
      {
        id: "task-1",
        category: "academics",
        status: "completed",
        scheduledDate: "2026-07-20",
        estimatedMinutes: 60,
        actualMinutes: 45,
        completedAt: "2026-07-27T02:00:00.000Z",
      },
    ] as Task[];
    const range = { startDate: "2026-07-20", endDate: "2026-07-27" };

    expect(getPlannedMinutesByCategory(tasks, range)).toEqual({
      academics: 60,
    });
    expect(getActualMinutesByCategory(tasks, [], range)).toEqual({
      academics: 45,
    });
  });

  it("uses a goal's selected measurement mode and excludes inactive goals", () => {
    const goals = [
      {
        id: "numeric",
        measurementType: "count",
        targetValue: 10,
        currentValue: 5,
        status: "active",
      },
      {
        id: "paused",
        measurementType: "manual",
        status: "paused",
      },
    ] as Goal[];
    const milestones = [
      { id: "step", goalId: "numeric", completed: false },
    ] as Milestone[];

    expect(getAverageGoalProgress(goals, milestones)).toBe(50);
  });

  it("counts ordinary linked module work on completion date without double counting", () => {
    const tasks = [
      {
        id: "task-1",
        moduleId: "module-1",
        status: "completed",
        actualMinutes: 50,
        scheduledDate: "2026-07-01",
        completedAt: "2026-07-25T02:00:00.000Z",
      },
    ] as Task[];
    expect(
      getModuleStudyMinutes(
        "module-1",
        [
          {
            id: "derived-log",
            moduleId: "module-1",
            userId: "user-1",
            date: "2026-07-25",
            minutes: 50,
            sourceTaskId: "task-1",
          },
        ],
        tasks,
        { startDate: "2026-07-20", endDate: "2026-07-26" },
      ),
    ).toBe(50);
  });
});

describe("multi-tab communication fallback", () => {
  it("uses storage events when BroadcastChannel is unavailable", async () => {
    vi.useFakeTimers();
    vi.stubGlobal("BroadcastChannel", undefined);
    Object.defineProperty(navigator, "locks", {
      configurable: true,
      value: undefined,
    });
    const received = vi.fn();
    const leadership = vi.fn();
    const coordinator = new TabSyncCoordinator("user-1", "tab-a");

    coordinator.start(leadership, received);
    await vi.advanceTimersByTimeAsync(1);
    window.dispatchEvent(
      new StorageEvent("storage", {
        key: "resolve-sync-message:user-1",
        newValue: JSON.stringify({
          type: "sync-request",
          tabId: "tab-b",
          messageId: "message-1",
        }),
      }),
    );

    expect(leadership).toHaveBeenCalledWith(true);
    expect(received).toHaveBeenCalledWith(
      expect.objectContaining({ type: "sync-request", tabId: "tab-b" }),
    );
    coordinator.requestSync();
    expect(
      window.localStorage.getItem("resolve-sync-message:user-1"),
    ).toContain('"sync-request"');
    coordinator.stop();
  });

  it("falls back to an expiring lease when Web Locks rejects", async () => {
    vi.useFakeTimers();
    vi.stubGlobal("BroadcastChannel", undefined);
    Object.defineProperty(navigator, "locks", {
      configurable: true,
      value: {
        request: vi.fn().mockRejectedValue(new Error("locks blocked")),
      },
    });
    const leadership = vi.fn();
    const coordinator = new TabSyncCoordinator("user-2", "tab-a");

    coordinator.start(leadership, vi.fn());
    await vi.advanceTimersByTimeAsync(1);

    expect(leadership).toHaveBeenCalledWith(true);
    expect(window.localStorage.getItem("resolve-sync-leader:user-2")).toContain(
      '"tabId":"tab-a"',
    );
    coordinator.stop();
  });
});

describe("versionless import detection", () => {
  it("recognizes current raw workspaces without an envelope", () => {
    const data = createEmptyData("user-1");
    expect(
      detectWorkspaceImportVersion(data, "Asia/Kuala_Lumpur"),
    ).toMatchObject({
      payload: data,
      sourceVersion: 6,
    });
  });

  it("rejects unrelated versionless JSON instead of assuming it is current", () => {
    expect(() =>
      detectWorkspaceImportVersion(
        { tasks: [{ title: "not enough fields" }] },
        "Asia/Kuala_Lumpur",
      ),
    ).toThrow(/does not match any supported/);
  });
});
