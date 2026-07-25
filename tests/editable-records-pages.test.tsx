import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type {
  AcademicModule,
  AlgorithmLog,
  Goal,
  GuitarPracticeSession,
  Habit,
  JobApplication,
  Task,
} from "@/types";

const spies = vi.hoisted(() => ({
  updateTask: vi.fn(),
  updateHabit: vi.fn(),
  updateGoal: vi.fn(),
  updateMilestone: vi.fn(),
  updateModule: vi.fn(),
  updateAssessment: vi.fn(),
  updateAlgorithmLog: vi.fn(),
  updateApplication: vi.fn(),
  updateGuitarSession: vi.fn(),
}));

const workspace = vi.hoisted(() => {
  const timestamp = "2026-07-25T00:00:00.000Z";
  const task: Task = {
    id: "task-1",
    userId: "user-1",
    semesterId: "semester-1",
    title: "Review lecture notes",
    category: "academics",
    scheduledDate: "2026-07-25",
    estimatedMinutes: 45,
    priority: "medium",
    status: "planned",
    createdAt: timestamp,
    updatedAt: timestamp,
  };
  const habit: Habit = {
    id: "habit-1",
    userId: "user-1",
    semesterId: "semester-1",
    title: "Strength training",
    category: "health",
    measurementType: "boolean",
    scheduleType: "times_per_week",
    targetDays: [],
    targetFrequency: 2,
    isActive: true,
  };
  const goal: Goal = {
    id: "goal-1",
    userId: "user-1",
    semesterId: "semester-1",
    title: "Ship portfolio",
    description: "Publish a polished portfolio.",
    category: "career",
    priority: "high",
    measurementType: "manual",
    startDate: "2026-07-25",
    deadline: "2026-09-01",
    status: "active",
    createdAt: timestamp,
    updatedAt: timestamp,
  };
  const moduleRecord: AcademicModule = {
    id: "module-1",
    userId: "user-1",
    semesterId: "semester-1",
    code: "CS1010",
    name: "Programming",
    lecturer: "Dr Tan",
    credits: 4,
    targetGrade: "A",
    color: "#7eb8da",
    weeklyStudyMinutes: 0,
    assessments: [
      {
        id: "assessment-1",
        moduleId: "module-1",
        title: "Midterm",
        type: "midterm",
        weight: 30,
        deadline: "2026-08-20",
        progress: 20,
        status: "in_progress",
      },
    ],
  };
  const algorithmLog: AlgorithmLog = {
    id: "log-1",
    userId: "user-1",
    semesterId: "semester-1",
    platform: "LeetCode",
    problemName: "Two Sum",
    topic: "Arrays",
    difficulty: "Easy",
    completedDate: "2026-07-24",
    minutes: 25,
    usedHints: false,
    confidence: 4,
    lesson: "Use a map.",
  };
  const application: JobApplication = {
    id: "application-1",
    userId: "user-1",
    company: "Acme",
    role: "Software Intern",
    applicationDate: "2026-07-20",
    stage: "applied",
    nextAction: "Follow up",
    nextActionDate: "2026-07-28",
  };
  const guitarSession: GuitarPracticeSession = {
    id: "session-1",
    userId: "user-1",
    semesterId: "semester-1",
    date: "2026-07-24",
    durationMinutes: 30,
    instrument: "Electric guitar",
    category: "Foundations",
    techniques: ["Posture and fretting"],
    confidence: 3,
    difficulty: 2,
    nextFocus: "Keep the wrist relaxed.",
  };

  return {
    tasks: [task],
    habits: [habit],
    habitLogs: [],
    goals: [goal],
    milestones: [],
    modules: [moduleRecord],
    algorithmLogs: [algorithmLog],
    applications: [application],
    guitarSessions: [guitarSession],
    guitarLearning: {
      profile: {
        userId: "user-1",
        preferredTuning: ["E2", "A2", "D3", "G3", "B3", "E4"],
        handedness: "right" as const,
        selectedPathIds: [],
        placementCompleted: false,
        confusingConceptIds: [],
        bookmarkedLessonIds: [],
        hiddenRecommendationIds: [],
        updatedAt: timestamp,
      },
      progress: [],
    },
    weeklyPriorities: ["One", "Two", "Three"],
    updatePriorities: vi.fn(),
    addTask: vi.fn(),
    updateTask: spies.updateTask,
    toggleTask: vi.fn(),
    moveTask: vi.fn(),
    removeTask: vi.fn(),
    toggleHabit: vi.fn(),
    updateTaskActualMinutes: vi.fn(),
    addHabit: vi.fn(),
    updateHabit: spies.updateHabit,
    removeHabit: vi.fn(),
    addGoal: vi.fn(),
    updateGoal: spies.updateGoal,
    removeGoal: vi.fn(),
    addMilestone: vi.fn(),
    updateMilestone: spies.updateMilestone,
    toggleMilestone: vi.fn(),
    removeMilestone: vi.fn(),
    setGoalCompleted: vi.fn(),
    addModule: vi.fn(),
    updateModule: spies.updateModule,
    removeModule: vi.fn(),
    addAssessment: vi.fn(),
    updateAssessment: spies.updateAssessment,
    removeAssessment: vi.fn(),
    updateAssessmentProgress: vi.fn(),
    updateModuleStudyMinutes: vi.fn(),
    addAlgorithmLog: vi.fn(),
    updateAlgorithmLog: spies.updateAlgorithmLog,
    removeAlgorithmLog: vi.fn(),
    addApplication: vi.fn(),
    updateApplication: spies.updateApplication,
    removeApplication: vi.fn(),
    updateApplicationStage: vi.fn(),
    addGuitarSession: vi.fn(),
    updateGuitarSession: spies.updateGuitarSession,
    removeGuitarSession: vi.fn(),
    updateGuitarLearning: vi.fn(),
  };
});

vi.mock("@/contexts/resolve-context", () => ({
  getWeekDateKeys: () => [
    "2026-07-19",
    "2026-07-20",
    "2026-07-21",
    "2026-07-22",
    "2026-07-23",
    "2026-07-24",
    "2026-07-25",
  ],
  offsetDate: (offset: number) =>
    offset === 0 ? "2026-07-25" : offset === 3 ? "2026-07-28" : "2026-08-01",
  useResolve: () => workspace,
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ replace: vi.fn() }),
  usePathname: () => "/dashboard",
}));

vi.mock("@/components/layout/page-shell", () => ({
  PageShell: ({ children }: { children: React.ReactNode }) => (
    <main>{children}</main>
  ),
}));

import AcademicsPage from "@/app/(dashboard)/academics/page";
import CareerPage from "@/app/(dashboard)/career/page";
import GoalsPage from "@/app/(dashboard)/goals/page";
import GuitarPage from "@/app/(dashboard)/guitar/page";
import HabitsPage from "@/app/(dashboard)/habits/page";
import TodayPage from "@/app/(dashboard)/today/page";
import WeeklyPage from "@/app/(dashboard)/weekly/page";

beforeEach(() => {
  Object.values(spies).forEach((spy) => spy.mockClear());
  Object.defineProperty(Element.prototype, "scrollIntoView", {
    configurable: true,
    value: vi.fn(),
  });
});

describe("editable user-created records", () => {
  it("edits a task through the existing task form", async () => {
    const user = userEvent.setup();
    render(<TodayPage />);

    await user.click(
      screen.getByRole("button", { name: "Edit task Review lecture notes" }),
    );
    const title = screen.getByRole("textbox", { name: "Task" });
    await user.clear(title);
    await user.type(title, "Review tutorial notes");
    await user.click(
      screen.getByRole("button", { name: "Save task changes" }),
    );

    expect(spies.updateTask).toHaveBeenCalledWith(
      "task-1",
      expect.objectContaining({
        title: "Review tutorial notes",
        priority: "medium",
      }),
    );
  });

  it("edits a scheduled task from the Weekly Plan", async () => {
    const user = userEvent.setup();
    render(<WeeklyPage />);

    await user.click(
      screen.getByRole("button", { name: "Edit task Review lecture notes" }),
    );
    const title = screen.getByRole("textbox", { name: "Task" });
    await user.clear(title);
    await user.type(title, "Review notes on Saturday");
    await user.selectOptions(
      screen.getByRole("combobox", { name: "Priority" }),
      "high",
    );
    await user.click(
      screen.getByRole("button", { name: "Save task changes" }),
    );

    expect(spies.updateTask).toHaveBeenCalledWith(
      "task-1",
      expect.objectContaining({
        title: "Review notes on Saturday",
        priority: "high",
        scheduledDate: "2026-07-25",
      }),
    );
  });

  it("edits a flexible habit and its weekly frequency", async () => {
    const user = userEvent.setup();
    render(<HabitsPage />);

    await user.click(
      screen.getByRole("button", { name: "Edit habit Strength training" }),
    );
    await user.selectOptions(
      screen.getByRole("combobox", { name: "Weekly target" }),
      "3",
    );
    await user.click(
      screen.getByRole("button", { name: "Save habit changes" }),
    );

    expect(spies.updateHabit).toHaveBeenCalledWith(
      "habit-1",
      expect.objectContaining({
        scheduleType: "times_per_week",
        targetFrequency: 3,
      }),
    );
  });

  it("edits a goal without forcing a breakdown", async () => {
    const user = userEvent.setup();
    render(<GoalsPage />);

    await user.click(
      screen.getByRole("button", { name: "Edit goal Ship portfolio" }),
    );
    const title = screen.getByRole("textbox", { name: "Goal title" });
    await user.clear(title);
    await user.type(title, "Ship personal portfolio");
    await user.click(
      screen.getByRole("button", { name: "Save goal changes" }),
    );

    expect(spies.updateGoal).toHaveBeenCalledWith(
      "goal-1",
      expect.objectContaining({ title: "Ship personal portfolio" }),
    );
  });

  it("edits modules and assessments from the Academics page", async () => {
    const user = userEvent.setup();
    render(<AcademicsPage />);

    await user.click(
      screen.getByRole("button", { name: "Edit module CS1010" }),
    );
    const moduleName = screen.getByRole("textbox", { name: "Module name" });
    await user.clear(moduleName);
    await user.type(moduleName, "Programming Methodology");
    await user.click(screen.getByRole("button", { name: "Save module" }));
    expect(spies.updateModule).toHaveBeenCalledWith(
      "module-1",
      expect.objectContaining({ name: "Programming Methodology" }),
    );

    await user.click(
      screen.getByRole("button", { name: "Edit assessment Midterm" }),
    );
    const assessmentTitle = screen.getByRole("textbox", {
      name: "Assessment title",
    });
    await user.clear(assessmentTitle);
    await user.type(assessmentTitle, "Final project");
    await user.click(
      screen.getByRole("button", { name: "Save assessment" }),
    );
    expect(spies.updateAssessment).toHaveBeenCalledWith(
      "assessment-1",
      expect.objectContaining({ title: "Final project" }),
    );
  });

  it("edits career evidence and applications", async () => {
    const user = userEvent.setup();
    render(<CareerPage />);

    await user.click(
      screen.getByRole("button", {
        name: "Edit practice log Two Sum",
      }),
    );
    const problem = screen.getByRole("textbox", { name: "Problem" });
    await user.clear(problem);
    await user.type(problem, "Three Sum");
    await user.click(
      screen.getByRole("button", { name: "Save practice changes" }),
    );
    expect(spies.updateAlgorithmLog).toHaveBeenCalledWith(
      "log-1",
      expect.objectContaining({ problemName: "Three Sum" }),
    );

    await user.click(
      screen.getByRole("button", {
        name: "Edit application Acme Software Intern",
      }),
    );
    const company = screen.getByRole("textbox", { name: "Company" });
    await user.clear(company);
    await user.type(company, "Acme Labs");
    await user.click(
      screen.getByRole("button", { name: "Save application changes" }),
    );
    expect(spies.updateApplication).toHaveBeenCalledWith(
      "application-1",
      expect.objectContaining({ company: "Acme Labs" }),
    );
  });

  it("edits a Guitar Studio practice session", async () => {
    const user = userEvent.setup();
    render(<GuitarPage />);

    await user.click(
      screen.getByRole("button", {
        name: "Edit practice session from 2026-07-24",
      }),
    );
    const duration = screen.getByRole("spinbutton", { name: /Duration/ });
    await user.clear(duration);
    await user.type(duration, "45");
    await user.click(
      screen.getByRole("button", { name: "Save session changes" }),
    );

    expect(spies.updateGuitarSession).toHaveBeenCalledWith(
      "session-1",
      expect.objectContaining({ durationMinutes: 45 }),
    );
  });
});
