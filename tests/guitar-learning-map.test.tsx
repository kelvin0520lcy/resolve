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
  it("uses a three-column desktop path grid so the final row stays balanced", () => {
    render(<Harness />);
    expect(screen.getByTestId("guitar-path-grid")).toHaveClass(
      "xl:grid-cols-3",
    );
    expect(screen.getByTestId("guitar-path-grid")).not.toHaveClass(
      "xl:grid-cols-4",
    );
  });

  it("explains locked nodes and supports an already-known override", async () => {
    const user = userEvent.setup();
    render(<Harness />);
    await user.click(
      screen.getByRole("button", {
        name: "Count four beats, Locked",
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
        name: "Count four beats, Already known",
      }),
    ).toBeInTheDocument();
  });

  it("switches paths without rendering the full curriculum at once", async () => {
    const user = userEvent.setup();
    render(<Harness />);
    expect(
      screen.getByRole("button", {
        name: "Find the repeating pulse, Ready",
      }),
    ).toBeInTheDocument();
    await user.click(
      screen.getByRole("button", { name: /Guitar Language Without Jargon/ }),
    );
    expect(
      screen.getByRole("button", {
        name: "Meet the guitar without jargon, Ready",
      }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("button", {
        name: "Find the repeating pulse, Ready",
      }),
    ).not.toBeInTheDocument();
  });
});
