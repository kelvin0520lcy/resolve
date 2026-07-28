import {
  fireEvent,
  render,
  screen,
  within,
} from "@testing-library/react";
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
    expect(screen.getByText(/spoken count cues on/i)).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "Place on the grid" }),
    ).not.toBeInTheDocument();
    expect(screen.getByText("Completed loops: 0")).toBeInTheDocument();
    expect(screen.getByLabelText("Example")).toHaveClass(
      "w-full",
      "max-w-full",
    );
  });

  it("opens directly in sandbox mode when a caller requests it", async () => {
    render(
      <GuitarExploreMode
        selectedToolId="rhythm"
        selectedPresetId="lesson:rhythm:feeling-and-identifying-the-pulse"
        initialToolMode="sandbox"
        onSelectTool={vi.fn()}
        onSelectPreset={vi.fn()}
        onOpenLesson={vi.fn()}
        state={state}
        updateState={vi.fn()}
      />,
    );

    expect(
      screen.getByRole("button", { name: "sandbox" }),
    ).toHaveAttribute("aria-pressed", "true");
    expect(
      await screen.findByRole("button", { name: "Place on the grid" }),
    ).toBeInTheDocument();
    expect(
      screen.queryByText("Find the repeating pulse"),
    ).not.toBeInTheDocument();
  });

  it("resets the current guided example instead of selecting the same preset", async () => {
    const user = userEvent.setup();
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
    fireEvent.change(screen.getByLabelText("Tempo · 60 BPM"), {
      target: { value: "96" },
    });
    expect(screen.getByLabelText("Tempo · 96 BPM")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Reset example" }));
    expect(screen.getByLabelText("Tempo · 60 BPM")).toBeInTheDocument();
  });

  it("does not show a non-functional mode switch for sandbox-only tools", () => {
    render(
      <GuitarExploreMode
        selectedToolId="chords"
        onSelectTool={vi.fn()}
        onSelectPreset={vi.fn()}
        onOpenLesson={vi.fn()}
        state={state}
        updateState={vi.fn()}
      />,
    );
    expect(
      screen.queryByRole("group", { name: "Tool mode" }),
    ).not.toBeInTheDocument();
    expect(
      screen.getByText("Sandbox tool · no guided lesson preset yet"),
    ).toBeInTheDocument();
  });

  it("offers a grouped, scannable mobile tool picker", async () => {
    const user = userEvent.setup();
    const { rerender } = render(
      <GuitarExploreMode
        selectedToolId="fretboard"
        onSelectTool={vi.fn()}
        onSelectPreset={vi.fn()}
        onOpenLesson={vi.fn()}
        state={state}
        updateState={vi.fn()}
      />,
    );
    const picker = screen.getByRole("complementary", {
      name: "Mobile tool picker",
    });
    const category = within(picker).getByLabelText("Tool category");
    expect(category).toHaveValue("Fretboard");
    expect(
      within(picker).getByRole("button", { name: "Fretboard" }),
    ).toBeInTheDocument();

    await user.selectOptions(category, "Harmony");
    expect(
      within(picker).getByRole("button", { name: "Chord changes" }),
    ).toBeInTheDocument();
    expect(
      within(picker).getByRole("button", { name: "Theory" }),
    ).toBeInTheDocument();
    expect(
      within(picker).queryByRole("button", { name: "Fretboard" }),
    ).not.toBeInTheDocument();

    rerender(
      <GuitarExploreMode
        selectedToolId="rhythm"
        onSelectTool={vi.fn()}
        onSelectPreset={vi.fn()}
        onOpenLesson={vi.fn()}
        state={state}
        updateState={vi.fn()}
      />,
    );
    expect(
      within(
        screen.getByRole("complementary", {
          name: "Mobile tool picker",
        }),
      ).getByLabelText("Tool category"),
    ).toHaveValue("Rhythm");
    expect(
      within(
        screen.getByRole("complementary", {
          name: "Mobile tool picker",
        }),
      ).getByRole("button", { name: "Rhythm" }),
    ).toHaveAttribute("aria-pressed", "true");
  });
});
