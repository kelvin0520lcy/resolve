import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

const learningState = vi.hoisted(() => ({
  profile: {
    userId: "learner",
    preferredTuning: ["E2", "A2", "D3", "G3", "B3", "E4"],
    handedness: "right" as const,
    selectedPathIds: [],
    placementCompleted: false,
    confusingConceptIds: [],
    bookmarkedLessonIds: [],
    hiddenRecommendationIds: [],
    updatedAt: "2026-07-25T00:00:00Z",
  },
  progress: [],
}));
const pageActions = vi.hoisted(() => ({
  addTask: vi.fn(),
}));

vi.mock("@/contexts/resolve-context", () => ({
  offsetDate: () => "2026-07-25",
  useResolve: () => ({
    guitarSessions: [],
    goals: [],
    tasks: [],
    guitarLearning: learningState,
    addTask: pageActions.addTask,
    addGuitarSession: vi.fn(),
    updateGuitarLearning: vi.fn(),
  }),
}));

vi.mock("@/components/layout/page-shell", () => ({
  PageShell: ({ children }: { children: React.ReactNode }) => (
    <main>{children}</main>
  ),
}));

vi.mock("@/components/ui/resolve", async (importOriginal) => {
  const actual =
    await importOriginal<typeof import("@/components/ui/resolve")>();
  return {
    ...actual,
    PageIntro: ({
      title,
      description,
      action,
    }: {
      title: string;
      description: string;
      action?: React.ReactNode;
    }) => (
      <header>
        <h1>{title}</h1>
        <p>{description}</p>
        {action}
      </header>
    ),
  };
});

import GuitarPage from "@/app/(dashboard)/guitar/page";
import { GUITAR_LESSONS } from "@/features/guitar-learning/data/curriculum";

beforeEach(() => {
  learningState.profile.placementCompleted = false;
  pageActions.addTask.mockClear();
  window.history.replaceState({}, "", "/guitar");
});

describe("Guitar Studio page integration", () => {
  it("preserves practice overview and exposes all new modes in one route", async () => {
    const user = userEvent.setup();
    render(<GuitarPage />);
    expect(screen.getByText("Make improvement audible")).toBeInTheDocument();
    expect(screen.getByText("Practice assessment")).toBeInTheDocument();

    await user.click(screen.getByRole("tab", { name: "Learn" }));
    expect(
      screen.getByText("Understand it, hear it, use it"),
    ).toBeInTheDocument();
    expect(
      await screen.findByText("Friendly placement · about 3 minutes"),
    ).toBeInTheDocument();

    await user.click(
      screen.getByRole("tab", { name: /Learning Map/ }),
    );
    expect(
      screen.getByText("See the route behind the next note"),
    ).toBeInTheDocument();
    expect(
      await screen.findByText("See why each concept comes next"),
    ).toBeInTheDocument();

    await user.click(screen.getByRole("tab", { name: /Overview/ }));
    expect(screen.getByText("Practice-area coverage")).toBeInTheDocument();
  });

  it("opens a deep-linked lesson and preserves it across refreshable URLs", async () => {
    learningState.profile.placementCompleted = true;
    const lesson = GUITAR_LESSONS[0];
    window.history.replaceState(
      {},
      "",
      `/guitar?mode=learn&lesson=${encodeURIComponent(lesson.id)}`,
    );

    render(<GuitarPage />);

    expect(
      await screen.findByRole("heading", { name: lesson.title }),
    ).toBeInTheDocument();
    expect(new URLSearchParams(window.location.search).get("lesson")).toBe(
      lesson.id,
    );
  });

  it("creates one canonical practice task from a recommended lesson", async () => {
    const user = userEvent.setup();
    learningState.profile.placementCompleted = true;
    render(<GuitarPage />);

    await user.click(screen.getByRole("tab", { name: "Learn" }));
    await user.click(
      await screen.findByRole("button", { name: "Add practice task" }),
    );

    expect(pageActions.addTask).toHaveBeenCalledWith(
      expect.objectContaining({
        category: "guitar",
        origin: expect.objectContaining({ kind: "guitar-lesson" }),
      }),
    );
  });
});
