import { useState } from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { GuitarLearningMap } from "@/features/guitar-learning/components/learning-map";
import { createEmptyGuitarLearningState } from "@/features/guitar-learning/lib/learning-state";
import type { GuitarLearningState } from "@/features/guitar-learning/types";

function Harness() {
  const [state, setState] = useState<GuitarLearningState>(() =>
    createEmptyGuitarLearningState("learner"),
  );
  return (
    <GuitarLearningMap
      state={state}
      updateState={(updater) => setState(updater)}
      onOpenLesson={vi.fn()}
    />
  );
}

describe("GuitarLearningMap", () => {
  it("explains locked nodes and supports an already-known override", async () => {
    const user = userEvent.setup();
    render(<Harness />);
    await user.click(
      screen.getByRole("button", {
        name: "Quarter-note counting, Locked",
      }),
    );
    expect(
      screen.getByText(/stays locked until its prerequisite/),
    ).toBeInTheDocument();
    await user.click(
      screen.getByRole("button", {
        name: "Override · I already know this",
      }),
    );
    expect(
      screen.getByRole("button", {
        name: "Quarter-note counting, Already known",
      }),
    ).toBeInTheDocument();
  });

  it("switches paths without rendering the full curriculum at once", async () => {
    const user = userEvent.setup();
    render(<Harness />);
    expect(
      screen.getByRole("button", {
        name: "Feeling and identifying the pulse, Ready",
      }),
    ).toBeInTheDocument();
    await user.click(
      screen.getByRole("button", { name: /Lead Guitar/ }),
    );
    expect(
      screen.getByRole("button", {
        name: "Relaxed pick grip, Ready",
      }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("button", {
        name: "Feeling and identifying the pulse, Ready",
      }),
    ).not.toBeInTheDocument();
  });
});
