import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { PickingVisualizer } from "@/features/guitar-learning/components/tools/picking-visualizer";

describe("PickingVisualizer", () => {
  it("labels string-crossing relationships for each sequence", async () => {
    const user = userEvent.setup();
    render(<PickingVisualizer />);
    await user.selectOptions(
      screen.getByLabelText("Technique sequence"),
      "two-string",
    );
    expect(screen.getAllByText(/next (inside|outside)/).length)
      .toBeGreaterThan(0);
    await user.click(
      screen.getByRole("button", { name: /Step 2/ }),
    );
    expect(screen.getByText(/crossing$/)).toBeInTheDocument();
  });

  it("shows the audible and physical consequence of excessive motion", async () => {
    const user = userEvent.setup();
    render(<PickingVisualizer />);
    expect(screen.getByRole("status")).toHaveTextContent(
      "Efficient motion",
    );
    await user.click(
      screen.getByRole("button", { name: "Show excessive motion" }),
    );
    expect(screen.getByRole("status")).toHaveTextContent(
      "Why this fails",
    );
  });
});
