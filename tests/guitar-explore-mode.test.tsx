import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { GuitarExploreMode } from "@/features/guitar-learning/components/explore-mode";

describe("GuitarExploreMode guidance", () => {
  it("gives every tool a visible start, action, and success condition", () => {
    render(
      <GuitarExploreMode
        selectedToolId="fretboard"
        onSelectTool={vi.fn()}
        onOpenLesson={vi.fn()}
      />,
    );
    expect(screen.getByText("1 · Set up")).toBeInTheDocument();
    expect(screen.getByText("2 · Try it")).toBeInTheDocument();
    expect(screen.getByText("3 · You’ve got it when")).toBeInTheDocument();
    expect(
      screen.getByText(/Choose a root and one display layer/),
    ).toBeInTheDocument();
  });

  it("opens a related lesson from a contextual answer", async () => {
    const user = userEvent.setup();
    const onOpenLesson = vi.fn();
    render(
      <GuitarExploreMode
        selectedToolId="fretboard"
        onSelectTool={vi.fn()}
        onOpenLesson={onOpenLesson}
      />,
    );
    await user.click(
      screen.getByRole("button", {
        name: "Why does my strumming hand stop?",
      }),
    );
    await user.click(
      screen.getByRole("button", {
        name: /Continuous strumming-hand movement/,
      }),
    );
    expect(onOpenLesson).toHaveBeenCalledWith(
      "rhythm:continuous-strumming-hand-movement",
    );
  });
});
