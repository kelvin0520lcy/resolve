import { expect, test, type Page } from "@playwright/test";

async function seedPopulatedWorkspace(page: Page) {
  await page.goto("/dashboard");
  await page.waitForFunction(
    () => window.localStorage.getItem("resolve-data-v2:demo-user") !== null,
  );
  await page.evaluate(() => {
    const storageKey = "resolve-data-v2:demo-user";
    const raw = window.localStorage.getItem(storageKey);
    if (!raw) throw new Error("The demo workspace did not initialize.");
    const data = JSON.parse(raw);
    const now = new Date();
    const dateKey = (date: Date) => {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const day = String(date.getDate()).padStart(2, "0");
      return `${year}-${month}-${day}`;
    };
    const addDays = (date: Date, amount: number) => {
      const next = new Date(date);
      next.setDate(next.getDate() + amount);
      return next;
    };
    const today = dateKey(now);
    const deadline = dateKey(addDays(now, 7));
    const monday = addDays(now, -((now.getDay() + 6) % 7));
    const weekStart = dateKey(monday);
    const timestamp = now.toISOString();
    const semesterId = data.semester.id;
    const userId = "demo-user";

    data.semester.name = "Seeded Semester";
    data.semester.resolutions = [
      {
        id: "resolution-seeded",
        title: "Make steady progress",
        completed: false,
        createdAt: timestamp,
        updatedAt: timestamp,
      },
    ];
    data.goals = [
      {
        id: "goal-seeded",
        userId,
        semesterId,
        title: "Ship the seeded project",
        description: "Complete a tested end-to-end project.",
        category: "personal",
        priority: "high",
        measurementType: "milestone",
        startDate: today,
        deadline,
        deadlineInfo: { kind: "date", date: deadline },
        status: "active",
        createdAt: timestamp,
        updatedAt: timestamp,
      },
    ];
    data.milestones = [
      {
        id: "milestone-seeded",
        goalId: "goal-seeded",
        title: "Verify the release",
        deadline,
        deadlineInfo: { kind: "date", date: deadline },
        completed: false,
        order: 1,
        completionMode: "required_tasks",
      },
    ];
    data.tasks = [
      {
        id: "task-seeded",
        userId,
        semesterId,
        title: "Run the populated workspace audit",
        category: "personal",
        scheduledDate: today,
        schedule: {
          date: today,
          startTime: "14:00",
          estimatedMinutes: 45,
          timeZone: data.preferences.timeZone,
        },
        deadline,
        deadlineInfo: { kind: "date", date: deadline },
        estimatedMinutes: 45,
        priority: "high",
        status: "planned",
        goalId: "goal-seeded",
        milestoneId: "milestone-seeded",
        requiredForMilestone: true,
        prerequisiteTaskIds: [],
        deferral: { deferCount: 0 },
        createdAt: timestamp,
        updatedAt: timestamp,
      },
    ];
    data.habits = [
      {
        id: "habit-seeded",
        userId,
        semesterId,
        title: "Seeded daily review",
        category: "personal",
        measurementType: "boolean",
        scheduleType: "days_of_week",
        targetDays: [now.getDay()],
        targetFrequency: 1,
        isActive: true,
      },
    ];
    data.habitLogs = [
      {
        id: "habit-log-seeded",
        habitId: "habit-seeded",
        userId,
        date: today,
        completed: true,
      },
    ];
    data.modules = [
      {
        id: "module-seeded",
        userId,
        semesterId,
        code: "E2E101",
        name: "Runtime Reliability",
        credits: 4,
        targetGrade: "A",
        color: "#7eb8da",
        weeklyStudyMinutes: 0,
        assessments: [
          {
            id: "assessment-seeded",
            moduleId: "module-seeded",
            title: "Reliability report",
            type: "project",
            weight: 30,
            deadline,
            deadlineInfo: { kind: "date", date: deadline },
            status: "in_progress",
            progress: 50,
            preparation: { generatedTaskIds: [] },
          },
        ],
      },
    ];
    data.moduleStudyLogs = [
      {
        id: "study-seeded",
        moduleId: "module-seeded",
        userId,
        date: today,
        minutes: 25,
        note: "Seeded study log",
      },
    ];
    data.guitarSessions = [
      {
        id: "guitar-seeded",
        userId,
        semesterId,
        date: today,
        durationMinutes: 30,
        category: "Technique",
        techniques: ["alternate picking"],
        song: "Seeded song",
        notes: "Clean and relaxed",
      },
    ];
    data.reflections = [
      {
        id: "reflection-seeded",
        userId,
        semesterId,
        type: "daily",
        periodStart: today,
        periodEnd: today,
        wins: "The populated audit passed.",
        createdAt: timestamp,
      },
    ];
    data.algorithmLogs = [
      {
        id: "algorithm-seeded",
        userId,
        semesterId,
        platform: "Practice",
        problemName: "Seeded graph problem",
        topic: "Graphs",
        difficulty: "Medium",
        completedDate: today,
        minutes: 30,
        confidence: 4,
        lesson: "Check edge cases.",
        usedHints: false,
      },
    ];
    data.applications = [
      {
        id: "application-seeded",
        userId,
        company: "Seeded Studio",
        role: "Frontend Engineer",
        applicationDate: today,
        stage: "applied",
        nextAction: "Prepare interview examples",
        nextActionDate: deadline,
        nextActionDeadline: { kind: "date", date: deadline },
      },
    ];
    data.events = [
      {
        id: "event-seeded",
        userId,
        semesterId,
        title: "Seeded fixed commitment",
        category: "class",
        date: today,
        startTime: "10:00",
        durationMinutes: 60,
        timeZone: data.preferences.timeZone,
        recurrence: { kind: "none" },
        createdAt: timestamp,
        updatedAt: timestamp,
      },
    ];
    data.weeklyPriorities = ["Audit", "Test", "Review"];
    data.weeklyPrioritiesByWeek = {
      [weekStart]: ["Audit", "Test", "Review"],
    };

    window.localStorage.setItem(storageKey, JSON.stringify(data));
    window.localStorage.setItem(
      "resolve-sync-v2:demo-user",
      JSON.stringify({
        dirty: false,
        lastCheckedAt: Date.now(),
        baseRevision: 0,
        schemaVersion: 6,
        patches: [],
        metrics: {
          reads: 0,
          writes: 0,
          conflictedFlushes: 0,
          patchesFlushed: 0,
          noOpFlushes: 0,
        },
      }),
    );
  });
}

test("all private pages render a populated workspace without runtime failures", async ({
  page,
}) => {
  const runtimeErrors: string[] = [];
  page.on("pageerror", (error) => runtimeErrors.push(error.message));
  page.on("console", (message) => {
    if (message.type() === "error") runtimeErrors.push(message.text());
  });
  await seedPopulatedWorkspace(page);

  const routesAndContent = [
    ["/dashboard", "Run the populated workspace audit"],
    ["/today", "Run the populated workspace audit"],
    ["/weekly", "Seeded fixed commitment"],
    ["/habits", "Seeded daily review"],
    ["/guitar", "Seeded song"],
    ["/academics", "E2E101"],
    ["/analytics", "Rule-based insights"],
    ["/career", "Seeded Studio"],
    ["/goals", "Ship the seeded project"],
    ["/reflections", "The populated audit passed."],
    ["/settings", "Data status"],
    ["/timeline", "Reliability report"],
  ] as const;

  for (const [route, expectedContent] of routesAndContent) {
    const response = await page.goto(route, { waitUntil: "load" });
    expect(response?.status(), `${route} returned an HTTP error`).toBeLessThan(400);
    await expect(page.locator("body")).toContainText(expectedContent);
    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth - window.innerWidth,
    );
    expect(overflow, `${route} overflows the viewport`).toBeLessThanOrEqual(1);
  }

  expect(runtimeErrors).toEqual([]);
});
