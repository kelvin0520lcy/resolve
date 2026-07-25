import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { PracticeAudioTools } from "@/features/guitar-learning/components/tools/practice-audio-tools";

describe("PracticeAudioTools", () => {
  it("exposes labelled tempo and subdivision controls", async () => {
    const user = userEvent.setup();
    render(<PracticeAudioTools mode="metronome" />);
    expect(screen.getByLabelText("Tempo · 84 BPM")).toBeInTheDocument();
    await user.selectOptions(
      screen.getByLabelText("Muted-string subdivision"),
      "4",
    );
    expect(screen.getAllByLabelText(/Beat \d/)).toHaveLength(16);
    expect(
      screen.getByRole("button", { name: "Start metronome" }),
    ).toBeInTheDocument();
  });

  it("builds single-note, power, major, and minor drone contexts", async () => {
    const user = userEvent.setup();
    render(<PracticeAudioTools mode="drone" />);
    await user.selectOptions(
      screen.getByLabelText("Harmonic context"),
      "power",
    );
    expect(screen.getByText(/power harmonic context/)).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Sound 4-second drone" }),
    ).toBeInTheDocument();
  });
});
