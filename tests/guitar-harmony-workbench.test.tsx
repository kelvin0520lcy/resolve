import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { HarmonyWorkbench } from "@/features/guitar-learning/components/tools/harmony-workbench";

describe("HarmonyWorkbench", () => {
  it("recalculates scale notes and formulas from the selected root", async () => {
    const user = userEvent.setup();
    render(<HarmonyWorkbench mode="scales" />);
    expect(screen.getByText("A minor pentatonic")).toBeInTheDocument();
    expect(screen.getByTestId("harmony-fretboard-map")).not.toHaveClass(
      "min-w-[620px]",
    );
    await user.selectOptions(screen.getByLabelText("Root note"), "C");
    await user.selectOptions(screen.getByLabelText("Scale colour"), "major");
    expect(screen.getByText("C major")).toBeInTheDocument();
    expect(screen.getByText("Steps: W · W · H · W · W · W · H"))
      .toBeInTheDocument();
  });

  it("shows all triad inversions and their changing bass notes", () => {
    render(<HarmonyWorkbench mode="triads" />);
    expect(screen.getByText("Root position")).toBeInTheDocument();
    expect(screen.getByText("First inversion")).toBeInTheDocument();
    expect(screen.getByText("Second inversion")).toBeInTheDocument();
    expect(screen.getAllByText(/Bass note/)).toHaveLength(3);
  });

  it("transposes Roman-numeral progressions when the key changes", async () => {
    const user = userEvent.setup();
    render(<HarmonyWorkbench mode="progressions" />);
    expect(screen.getByText("E major")).toBeInTheDocument();
    await user.selectOptions(screen.getByLabelText("Root note"), "C");
    expect(screen.getByText("G major")).toBeInTheDocument();
    expect(screen.getByText("A minor")).toBeInTheDocument();
    expect(screen.getByText("F major")).toBeInTheDocument();
  });

  it("turns emotional controls into concrete musical constraints", () => {
    render(<HarmonyWorkbench mode="emotional" />);
    expect(screen.getByText("Generated musical recipe")).toBeInTheDocument();
    expect(screen.getByText(/Pair A/)).toHaveTextContent(
      "8th-note motion",
    );
  });
});
