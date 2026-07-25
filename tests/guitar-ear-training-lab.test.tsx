import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { EarTrainingLab } from "@/features/guitar-learning/components/tools/ear-training-lab";

describe("EarTrainingLab", () => {
  it("does not reveal the answer until a choice is submitted", async () => {
    const user = userEvent.setup();
    render(<EarTrainingLab />);
    expect(screen.queryByText("Correct.")).not.toBeInTheDocument();
    await user.click(screen.getByRole("radio", { name: "Higher" }));
    await user.click(
      screen.getByRole("button", { name: "Check answer" }),
    );
    expect(screen.getByRole("status")).toHaveTextContent("Correct.");
    expect(
      screen.getByRole("progressbar", {
        name: "Recent ear training accuracy 100 percent",
      }),
    ).toBeInTheDocument();
  });

  it("switches between all ear-training categories", async () => {
    const user = userEvent.setup();
    render(<EarTrainingLab />);
    await user.selectOptions(
      screen.getByLabelText("Listening exercise"),
      "rhythm-imitation",
    );
    expect(
      screen.getByText("Which written attack pattern matches the played bar?"),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Play rhythm" }),
    ).toBeInTheDocument();
  });
});
