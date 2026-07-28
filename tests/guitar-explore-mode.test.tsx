import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { GuitarExploreMode } from "@/features/guitar-learning/components/explore-mode";
import { createEmptyGuitarLearningState } from "@/features/guitar-learning/lib/learning-state";

const state = createEmptyGuitarLearningState("test");

describe("GuitarExploreMode guidance", () => {
  it("gives every tool a visible start, action, and success condition", () => {
    render(
      <GuitarExploreMode
        selectedToolId="fretboard"
        onSelectTool={vi.fn()}
        onSelectPreset={vi.fn()}
        onOpenLesson={vi.fn()}
        state={state}
        updateState={vi.fn()}
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
        onSelectPreset={vi.fn()}
        onOpenLesson={onOpenLesson}
        state={state}
        updateState={vi.fn()}
      />,
    );
    await user.click(
      screen.getByRole("button", {
        name: "Why does my strumming hand stop?",
      }),
    );
    await user.click(
      screen.getByRole("button", {
        name: /Keep the strumming hand moving/,
      }),
    );
    expect(onOpenLesson).toHaveBeenCalledWith(
      "rhythm:continuous-strumming-hand-movement",
    );
  });

  it("applies a guided lesson preset to the real rhythm tool", async () => {
    render(
      <GuitarExploreMode
        selectedToolId="rhythm"
        selectedPresetId="lesson:rhythm:feeling-and-identifying-the-pulse"
        onSelectTool={vi.fn()}
        onSelectPreset={vi.fn()}
        onOpenLesson={vi.fn()}
        state={state}
        updateState={vi.fn()}
      />,
    );

    expect(await screen.findByLabelText("4-step rhythm grid")).toBeInTheDocument();
    expect(screen.getByText("Tempo · 60 BPM")).toBeInTheDocument();
    expect(screen.getByText(/spoken beat cues on/i)).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "Place on the grid" }),
    ).not.toBeInTheDocument();
    expect(screen.getByText("Completed bars: 0")).toBeInTheDocument();
  });
});
