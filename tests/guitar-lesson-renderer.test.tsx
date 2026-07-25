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
import type {
  GuitarLearningState,
  GuitarToolId,
} from "@/features/guitar-learning/types";

const lesson = GUITAR_LESSON_BY_ID.get(
  "rhythm:feeling-and-identifying-the-pulse",
)!;

function Harness({
  onOpenTool = vi.fn(),
  initialStage,
  onStageChange,
}: {
  onOpenTool?: (toolId: GuitarToolId) => void;
  initialStage?: number;
  onStageChange?: (stage: number) => void;
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
      initialStage={initialStage}
      onStageChange={onStageChange}
      onExit={vi.fn()}
    />
  );
}

describe("LessonRenderer", () => {
  it("guides one stage at a time and keeps mastery gated", async () => {
    const user = userEvent.setup();
    render(<Harness />);
    expect(
      screen.getByRole("heading", { name: lesson.title }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("img", {
        name: /Learning route for Feeling and identifying the pulse/,
      }),
    ).toBeInTheDocument();
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
    expect(
      screen.getByRole("img", {
        name: /Simplified control-and-result diagram/,
      }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Play slower example" }),
    ).toBeInTheDocument();
  });

  it("opens the related Explore tool from the visual stage", async () => {
    const user = userEvent.setup();
    const onOpenTool = vi.fn();
    render(
      <Harness onOpenTool={onOpenTool} />,
    );
    await user.click(screen.getByRole("button", { name: "Next" }));
    await user.click(screen.getByRole("button", { name: "Next" }));
    expect(
      screen.getByRole("img", {
        name: /Count, hand direction, and sounding-stroke grid/,
      }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", {
        name: "I traced and explained it",
      }),
    ).toBeDisabled();
    await user.click(
      screen.getByRole("button", { name: "Open full rhythm tool" }),
    );
    expect(onOpenTool).toHaveBeenCalledWith("rhythm");
    expect(screen.getAllByText("0/9 lesson stages")).toHaveLength(2);

    await user.click(
      screen.getByRole("checkbox", {
        name: /I traced the diagram and can state the relationship/,
      }),
    );
    await user.click(
      screen.getByRole("button", {
        name: "I traced and explained it",
      }),
    );
    expect(screen.getAllByText("1/9 lesson stages")).toHaveLength(2);
  });

  it("restores and reports the active stage for tool round trips", async () => {
    const user = userEvent.setup();
    const onStageChange = vi.fn();
    render(<Harness initialStage={2} onStageChange={onStageChange} />);
    expect(screen.getByText("Stage 3 of 12")).toBeInTheDocument();
    expect(
      screen.getByRole("img", {
        name: /Count, hand direction, and sounding-stroke grid/,
      }),
    ).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Next" }));
    expect(onStageChange).toHaveBeenCalledWith(3);
  });

  it.each([
    [1, /Connection from .* to Feeling and identifying the pulse/],
    [4, /Unstable and controlled motion comparison/],
    [5, /Four-step practice loop/],
    [7, /Simple, changed, and compared musical use/],
  ] as const)(
    "renders the additional teaching visual at stage %s",
    (initialStage, accessibleName) => {
      render(<Harness initialStage={initialStage} />);
      expect(
        screen.getByRole("img", { name: accessibleName }),
      ).toBeInTheDocument();
    },
  );
});
