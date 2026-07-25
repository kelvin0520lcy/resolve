import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
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
});
