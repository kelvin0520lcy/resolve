import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { PlacementAssessment } from "@/features/guitar-learning/components/placement-assessment";
import { PLACEMENT_QUESTIONS } from "@/features/guitar-learning/data/placement";

describe("PlacementAssessment", () => {
  it("keeps answers explicit and returns a complete placement result", async () => {
    const user = userEvent.setup();
    const onComplete = vi.fn();
    render(<PlacementAssessment onComplete={onComplete} />);

    expect(
      screen.getByText("Friendly placement · about 3 minutes"),
    ).toBeInTheDocument();
    await user.click(
      screen.getByRole("button", { name: "Start the soundcheck" }),
    );

    for (let index = 0; index < PLACEMENT_QUESTIONS.length; index += 1) {
      await user.click(
        screen.getByRole("radio", { name: /Not yet/ }),
      );
      await user.click(
        screen.getByRole("button", {
          name:
            index === PLACEMENT_QUESTIONS.length - 1
              ? "Build my learning plan"
              : "Next soundcheck",
        }),
      );
    }

    expect(onComplete).toHaveBeenCalledTimes(1);
    expect(onComplete.mock.calls[0][0]).toMatchObject({
      recommendedPathId: "rhythm",
      alreadyKnownLessonIds: [],
      completedAt: expect.any(String),
    });
  });
});
