import { useState } from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { LessonRenderer } from "@/features/guitar-learning/components/lesson-renderer";
import { GUITAR_LESSON_BY_ID } from "@/features/guitar-learning/data/curriculum";
import {
  createEmptyGuitarLearningState,
  openGuitarLesson,
} from "@/features/guitar-learning/lib/learning-state";
import type { GuitarLearningState } from "@/features/guitar-learning/types";

const lesson = GUITAR_LESSON_BY_ID.get(
  "rhythm:feeling-and-identifying-the-pulse",
)!;

function Harness({
  onOpenTool = vi.fn(),
}: {
  onOpenTool?: (toolId: never) => void;
}) {
  const [state, setState] = useState<GuitarLearningState>(() =>
    openGuitarLesson(createEmptyGuitarLearningState("learner"), lesson.id),
  );
  return (
    <LessonRenderer
      lesson={lesson}
      state={state}
      updateState={(updater) => setState(updater)}
      onOpenTool={onOpenTool}
      onExit={vi.fn()}
    />
  );
}

describe("LessonRenderer", () => {
  it("guides one stage at a time and keeps mastery gated", async () => {
    const user = userEvent.setup();
    render(<Harness />);
    expect(screen.getByText(lesson.title)).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Confirm understanding" }),
    ).toBeDisabled();

    await user.click(
      screen.getByRole("button", {
        name: "I can say this in my own words",
      }),
    );
    expect(screen.getAllByText("1/9 lesson stages")).toHaveLength(2);

    await user.click(
      screen.getByRole("button", { name: "Explain differently" }),
    );
    expect(
      screen.getByText(lesson.alternativeExplanation),
    ).toBeInTheDocument();
  });

  it("opens the related Explore tool from the visual stage", async () => {
    const user = userEvent.setup();
    const onOpenTool = vi.fn();
    render(
      <Harness
        onOpenTool={onOpenTool as unknown as (toolId: never) => void}
      />,
    );
    await user.click(screen.getByRole("button", { name: "Next" }));
    await user.click(screen.getByRole("button", { name: "Next" }));
    await user.click(
      screen.getByRole("button", { name: "Open rhythm" }),
    );
    expect(onOpenTool).toHaveBeenCalledWith("rhythm");
  });
});
