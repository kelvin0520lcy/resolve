import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { ImprovisationCoach } from "@/features/guitar-learning/components/tools/improvisation-coach";

describe("ImprovisationCoach", () => {
  it("changes constraint guidance and produces analysed call responses", async () => {
    const user = userEvent.setup();
    render(<ImprovisationCoach mode="improvisation" />);
    await user.selectOptions(
      screen.getByLabelText("Practice constraint"),
      "rests",
    );
    expect(screen.getByText(/Leave at least half/)).toBeInTheDocument();
    await user.click(
      screen.getByRole("button", { name: "Analyse phrase" }),
    );
    expect(
      screen.getByRole("progressbar", { name: /Phrase evidence score/ }),
    ).toBeInTheDocument();
  });

  it("keeps a key-dependent backing context in sync with the key", async () => {
    const user = userEvent.setup();
    render(<ImprovisationCoach mode="improvisation" />);
    await user.selectOptions(screen.getByLabelText("Key centre"), "C");
    expect(screen.getByLabelText("Backing context")).toHaveValue(
      "Cm drone",
    );
    expect(screen.getByText(/over Cm drone/)).toBeInTheDocument();
  });

  it("edits phrase events without saving transient tool state", async () => {
    const user = userEvent.setup();
    render(<ImprovisationCoach mode="phrase-builder" />);
    expect(screen.getAllByLabelText("Pitch or rest")).toHaveLength(5);
    await user.selectOptions(
      screen.getAllByLabelText("Pitch or rest")[0],
      "rest",
    );
    await user.click(
      screen.getByRole("button", { name: "Analyse phrase" }),
    );
    expect(screen.getByText(/deliberate rests?/)).toBeInTheDocument();
  });
});
