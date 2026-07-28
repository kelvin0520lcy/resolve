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
  GuitarLesson,
  GuitarToolId,
} from "@/features/guitar-learning/types";

const lesson = GUITAR_LESSON_BY_ID.get(
  "rhythm:feeling-and-identifying-the-pulse",
)!;

function Harness({
  activeLesson = lesson,
  onOpenTool = vi.fn(),
  initialStage,
  onStageChange,
}: {
  activeLesson?: GuitarLesson;
  onOpenTool?: (toolId: GuitarToolId, presetId?: string) => void;
  initialStage?: number;
  onStageChange?: (stage: number) => void;
}) {
  const [state, setState] = useState<GuitarLearningState>(() =>
    openGuitarLesson(
      createEmptyGuitarLearningState("learner"),
      activeLesson.id,
    ),
  );
  return (
    <LessonRenderer
      lesson={activeLesson}
      state={state}
      updateState={(updater) => setState(updater)}
      onOpenTool={onOpenTool}
      initialStage={initialStage}
      onStageChange={onStageChange}
      onExit={vi.fn()}
    />
  );
}

describe("LessonRenderer authored flow", () => {
  it("shows plain language, glossary help, and gated mastery", async () => {
    const user = userEvent.setup();
    render(<Harness />);
    expect(screen.getByRole("heading", { name: lesson.title })).toBeInTheDocument();
    expect(
      screen.getByRole("img", {
        name: /Learning route for Find the repeating pulse/,
      }),
    ).toBeInTheDocument();
    expect(screen.getByRole("region", { name: "Words used in this lesson" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Confirm understanding" })).toBeDisabled();

    await user.click(screen.getByRole("button", { name: "I can say this in my own words" }));
    expect(screen.getAllByText("1/5 lesson stages")).toHaveLength(2);
    await user.click(screen.getByRole("button", { name: "Explain differently" }));
    expect(screen.getByText(lesson.alternativeExplanation)).toBeInTheDocument();
  });

  it("opens the exact guided preset from the authored visual", async () => {
    const user = userEvent.setup();
    const onOpenTool = vi.fn();
    render(<Harness onOpenTool={onOpenTool} initialStage={1} />);
    expect(
      screen.getByRole("img", { name: /Explicit 4-beat rhythm with 1 timing position/ }),
    ).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: /Open guided rhythm example/ }));
    expect(onOpenTool).toHaveBeenCalledWith(
      "rhythm",
      "lesson:rhythm:feeling-and-identifying-the-pulse",
    );
  });

  it("restores and reports the active stage for tool round trips", async () => {
    const user = userEvent.setup();
    const onStageChange = vi.fn();
    render(<Harness initialStage={1} onStageChange={onStageChange} />);
    expect(screen.getAllByText("Stage 2 of 8")).toHaveLength(2);
    expect(
      screen.getByRole("combobox", { name: "Lesson stage" }),
    ).toHaveValue("1");
    await user.selectOptions(
      screen.getByRole("combobox", { name: "Lesson stage" }),
      "2",
    );
    expect(onStageChange).toHaveBeenCalledWith(2);
  });

  it("uses one clear visual-stage confirmation instead of a duplicate checkbox", async () => {
    const user = userEvent.setup();
    render(<Harness initialStage={1} />);

    expect(
      screen.queryByRole("checkbox", { name: /I traced the diagram/ }),
    ).not.toBeInTheDocument();
    const completeButton = screen.getByRole("button", {
      name: "I traced and explained it",
    });
    expect(completeButton).toBeEnabled();
    await user.click(completeButton);
    expect(screen.getAllByText("1/5 lesson stages")).toHaveLength(2);
  });

  it("records every honest musical-application outcome", async () => {
    const user = userEvent.setup();
    render(<Harness initialStage={lesson.sections.length + 1} />);
    const finalOption =
      lesson.applicationActivity.options[
        lesson.applicationActivity.options.length - 1
      ];

    await user.click(screen.getByRole("radio", { name: finalOption }));
    await user.click(
      screen.getByRole("button", { name: "Save application result" }),
    );

    expect(screen.getByText(/review queue so you can retry it slowly/i))
      .toBeInTheDocument();
  });

  it("does not offer a generic tool for a visual it cannot represent exactly", () => {
    const phraseLesson = GUITAR_LESSON_BY_ID.get(
      "improvisation:call-and-response",
    )!;
    render(<Harness activeLesson={phraseLesson} initialStage={1} />);
    expect(
      screen.queryByRole("button", { name: /Open guided/ }),
    ).not.toBeInTheDocument();
  });

  it.each([
    [2, "Hear the difference"],
    [3, "Try it on the guitar"],
    [5, "Prove the idea"],
  ])("renders authored stage %s: %s", (initialStage, heading) => {
    render(<Harness initialStage={initialStage as number} />);
    expect(screen.getByRole("heading", { name: heading })).toBeInTheDocument();
  });
});
