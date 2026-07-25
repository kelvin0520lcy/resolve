import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { GoalBreakdown } from "@/components/goals/goal-breakdown";
import type { Goal, Milestone } from "@/types";

const goal: Goal = {
  id: "goal-1",
  userId: "user-1",
  semesterId: "semester-1",
  title: "Prepare a three-song live set",
  description: "Build a performance-ready set.",
  category: "guitar",
  priority: "high",
  measurementType: "milestone",
  startDate: "2026-07-25",
  deadline: "2026-09-30",
  status: "active",
  createdAt: "2026-07-25T00:00:00.000Z",
  updatedAt: "2026-07-25T00:00:00.000Z",
};

describe("goal breakdown", () => {
  it("opens the inline form and submits a smaller step", async () => {
    const user = userEvent.setup();
    const addMilestone = vi.fn();

    render(
      <GoalBreakdown
        goal={goal}
        milestones={[]}
        addMilestone={addMilestone}
        toggleMilestone={vi.fn()}
        removeMilestone={vi.fn()}
        setGoalCompleted={vi.fn()}
      />,
    );

    await user.click(
      screen.getByRole("button", { name: "Add the first smaller step" }),
    );
    await user.type(
      screen.getByRole("textbox", { name: "Smaller step" }),
      "Learn the first song",
    );
    await user.type(
      screen.getByLabelText("Due (optional)"),
      "2026-08-10",
    );
    await user.click(screen.getByRole("button", { name: "Add step" }));

    expect(addMilestone).toHaveBeenCalledWith("goal-1", {
      title: "Learn the first song",
      deadline: "2026-08-10",
    });
  });

  it("tracks completion and exposes milestone actions", async () => {
    const user = userEvent.setup();
    const toggleMilestone = vi.fn();
    const removeMilestone = vi.fn();
    const setGoalCompleted = vi.fn();
    const milestones: Milestone[] = [
      {
        id: "step-1",
        goalId: "goal-1",
        title: "Choose the songs",
        completed: true,
        completedAt: "2026-07-25T00:00:00.000Z",
        order: 1,
      },
      {
        id: "step-2",
        goalId: "goal-1",
        title: "Learn the first song",
        deadline: "2026-08-10",
        completed: false,
        order: 2,
      },
    ];

    render(
      <GoalBreakdown
        goal={goal}
        milestones={milestones}
        addMilestone={vi.fn()}
        toggleMilestone={toggleMilestone}
        removeMilestone={removeMilestone}
        setGoalCompleted={setGoalCompleted}
      />,
    );

    expect(screen.getByText("1 of 2 smaller steps completed")).toBeInTheDocument();
    expect(
      screen.getByRole("progressbar", {
        name: "Prepare a three-song live set breakdown progress",
      }),
    ).toHaveAttribute("aria-valuenow", "50");
    expect(
      screen.getByRole("button", { name: "Mark goal complete" }),
    ).toBeDisabled();

    await user.click(
      screen.getByRole("button", { name: "Complete Learn the first song" }),
    );
    expect(toggleMilestone).toHaveBeenCalledWith("step-2");

    await user.click(
      screen.getByRole("button", { name: "Remove Choose the songs" }),
    );
    expect(removeMilestone).toHaveBeenCalledWith("step-1");
  });

  it("unlocks completion only when every smaller step is done", async () => {
    const user = userEvent.setup();
    const setGoalCompleted = vi.fn();
    const milestones: Milestone[] = [
      {
        id: "step-1",
        goalId: "goal-1",
        title: "Choose the songs",
        completed: true,
        order: 1,
      },
      {
        id: "step-2",
        goalId: "goal-1",
        title: "Rehearse the set",
        completed: true,
        order: 2,
      },
    ];

    const { rerender } = render(
      <GoalBreakdown
        goal={goal}
        milestones={milestones}
        addMilestone={vi.fn()}
        toggleMilestone={vi.fn()}
        removeMilestone={vi.fn()}
        setGoalCompleted={setGoalCompleted}
      />,
    );

    await user.click(
      screen.getByRole("button", { name: "Mark goal complete" }),
    );
    expect(setGoalCompleted).toHaveBeenCalledWith("goal-1", true);

    rerender(
      <GoalBreakdown
        goal={{ ...goal, status: "completed" }}
        milestones={milestones}
        addMilestone={vi.fn()}
        toggleMilestone={vi.fn()}
        removeMilestone={vi.fn()}
        setGoalCompleted={setGoalCompleted}
      />,
    );
    await user.click(screen.getByRole("button", { name: "Reopen goal" }));
    expect(setGoalCompleted).toHaveBeenLastCalledWith("goal-1", false);
  });
});
