import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { RhythmLab } from "@/features/guitar-learning/components/tools/rhythm-lab";

describe("RhythmLab", () => {
  it("deconstructs shorthand and preserves visible hand direction", async () => {
    const user = userEvent.setup();
    render(<RhythmLab />);
    expect(
      screen.getByLabelText("8-step rhythm grid"),
    ).toBeInTheDocument();
    expect(screen.getAllByText(/hand [DU]/)).toHaveLength(8);
    await user.click(
      screen.getByRole("button", { name: "Place on the grid" }),
    );
    expect(screen.getByRole("status")).toHaveTextContent(
      "continuous down-up grid",
    );
  });

  it("changes subdivision and explains a groove transformation", async () => {
    const user = userEvent.setup();
    render(<RhythmLab />);
    await user.selectOptions(screen.getByLabelText("Subdivision"), "16");
    expect(
      screen.getByLabelText("16-step rhythm grid"),
    ).toBeInTheDocument();
    expect(screen.getAllByText(/hand [DU]/)).toHaveLength(16);
    await user.click(
      screen.getByRole("button", { name: "Add syncopation" }),
    );
    expect(screen.getByRole("status")).toHaveTextContent(
      "Accented offbeats",
    );
  });

  it("renders every step and chord change in an eight-beat guided project", () => {
    render(
      <RhythmLab
        guided
        presetSettings={{
          bpm: 84,
          beats: 8,
          slotsPerBeat: 2,
          pattern: Array.from({ length: 16 }, (_value, index) => index),
          beatChords: ["Am", "Am", "Am", "Am", "F", "F", "F", "F"],
          voiceCount: true,
        }}
      />,
    );
    expect(screen.getByLabelText("16-step rhythm grid")).toBeInTheDocument();
    expect(screen.getAllByText(/hand [DU]/)).toHaveLength(16);
    expect(screen.getAllByText("Am")).toHaveLength(4);
    expect(screen.getAllByText("F")).toHaveLength(4);
    expect(screen.getByText(/8 beats/)).toBeInTheDocument();
  });

  it("speaks beat one immediately when a counted sequence starts", async () => {
    const user = userEvent.setup();
    const speak = vi.fn();
    Object.defineProperty(window, "speechSynthesis", {
      configurable: true,
      value: { cancel: vi.fn(), speak },
    });
    class MockUtterance {
      constructor(public text: string) {}
    }
    vi.stubGlobal("SpeechSynthesisUtterance", MockUtterance);
    render(
      <RhythmLab
        guided
        presetSettings={{
          bpm: 60,
          beats: 4,
          slotsPerBeat: 2,
          voiceCount: true,
        }}
      />,
    );
    await user.click(screen.getByRole("button", { name: "Play sequence" }));
    expect(speak).toHaveBeenCalledTimes(1);
    expect(speak.mock.calls[0][0]).toMatchObject({ text: "1" });
    await user.click(screen.getByRole("button", { name: "Stop" }));
    vi.unstubAllGlobals();
    Reflect.deleteProperty(window, "speechSynthesis");
  });
});
