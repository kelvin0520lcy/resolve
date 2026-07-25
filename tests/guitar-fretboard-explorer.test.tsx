import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { FretboardExplorer } from "@/features/guitar-learning/components/tools/fretboard-explorer";

describe("FretboardExplorer", () => {
  it("renders a complete 24-fret board and supports alternate tunings", async () => {
    const user = userEvent.setup();
    render(<FretboardExplorer />);
    expect(
      screen.getByLabelText("24-fret interactive guitar fretboard"),
    ).toBeInTheDocument();
    expect(screen.getAllByRole("gridcell")).toHaveLength(150);

    await user.selectOptions(screen.getByLabelText("Tuning"), "drop-d");
    expect(
      screen.getByRole("gridcell", {
        name: /D2, string 6, fret 0/,
      }),
    ).toBeInTheDocument();
  });

  it("reveals comparison language and gives trainer feedback", async () => {
    const user = userEvent.setup();
    render(<FretboardExplorer />);
    await user.click(
      screen.getByRole("button", { name: "Compare scale + chord" }),
    );
    expect(screen.getByText("Shared tones")).toBeInTheDocument();

    await user.click(
      screen.getByRole("gridcell", {
        name: /A2, string 6, fret 5/,
      }),
    );
    expect(screen.getByRole("status")).toHaveTextContent(
      "That is A. Keep looking for C.",
    );
  });
});
