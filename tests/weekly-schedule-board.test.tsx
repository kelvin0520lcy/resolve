import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { WeeklyScheduleBoard } from "@/components/weekly/weekly-schedule-board";
import type { Task } from "@/types";

const DATES = [
  "2026-07-27",
  "2026-07-28",
  "2026-07-29",
  "2026-07-30",
  "2026-07-31",
  "2026-08-01",
  "2026-08-02",
];

function makeTask(index: number): Task {
  return {
    id: `task-${index}`,
    userId: "user-1",
    semesterId: "semester-1",
    title: `Crowded schedule task ${index}`,
    category: index % 2 ? "academics" : "personal",
    priority: index % 3 === 0 ? "high" : "medium",
    status: "planned",
    scheduledDate: DATES[0],
    estimatedMinutes: 30,
    createdAt: "2026-07-27T00:00:00.000Z",
    updatedAt: "2026-07-27T00:00:00.000Z",
  };
}

describe("weekly schedule board", () => {
  it("keeps a crowded day bounded while preserving every task and action", async () => {
    const user = userEvent.setup();
    const tasks = Array.from({ length: 10 }, (_, index) =>
      makeTask(index + 1),
    );
    const moveTask = vi.fn();
    const editTask = vi.fn();

    render(
      <WeeklyScheduleBoard
        dates={DATES}
        tasksByDate={new Map([[DATES[0], tasks]])}
        eventsByDate={new Map()}
        today={DATES[0]}
        onEditTask={editTask}
        onMoveTask={moveTask}
        onRemoveTask={vi.fn()}
      />,
    );

    expect(screen.getByTestId("weekly-schedule-board")).toHaveClass(
      "items-start",
      "xl:auto-cols-[17rem]",
      "xl:overflow-x-auto",
    );
    expect(screen.getByTestId(`weekly-day-scroll-${DATES[0]}`)).toHaveClass(
      "max-h-[34rem]",
      "overflow-y-auto",
    );
    expect(
      screen.getByLabelText("Monday 27 schedule, 10 tasks"),
    ).toBeInTheDocument();
    for (const task of tasks) {
      expect(screen.getByText(task.title)).toBeInTheDocument();
    }

    await user.click(
      screen.getByRole("button", {
        name: "Edit task Crowded schedule task 1",
      }),
    );
    expect(editTask).toHaveBeenCalledWith(tasks[0]);

    await user.selectOptions(
      screen.getByRole("combobox", {
        name: "Move Crowded schedule task 1 to another day",
      }),
      DATES[2],
    );
    expect(moveTask).toHaveBeenCalledWith(tasks[0].id, DATES[2]);

    await user.click(
      screen.getByRole("button", {
        name: "Remove task Crowded schedule task 1",
      }),
    );
    const removalGroup = screen.getByRole("group", {
      name: "Confirm removal of task Crowded schedule task 1",
    });
    expect(removalGroup).not.toHaveClass("h-8", "w-8");
    expect(
      screen.getByRole("button", {
        name: "Confirm remove task Crowded schedule task 1",
      }),
    ).toHaveTextContent("Remove");
  });
});
