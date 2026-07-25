import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { MainResolutionPanel } from "@/components/resolution/main-resolution-panel";
import type { MotivationQuote } from "@/lib/daily-motivation";

const quote: MotivationQuote = {
  id: "nijika-test",
  member: "nijika",
  memberName: "Nijika",
  trait: "rhythm",
  text: "Find the count and come back in.",
};

function renderPanel(
  onSave = vi.fn(),
  resolution: string | undefined = "Finish the semester with steady work.",
) {
  return {
    onSave,
    ...render(
      <MainResolutionPanel
        resolution={resolution}
        theme="Steady encore"
        semesterName="Semester 1"
        weekNumber={4}
        percentComplete={32}
        daysRemaining={76}
        focus="Complete the project outline"
        quote={quote}
        onSave={onSave}
      />,
    ),
  };
}

describe("main resolution panel", () => {
  it("keeps the resolution, next proof, and daily quote together", () => {
    renderPanel();
    expect(
      screen.getByRole("heading", {
        name: "Finish the semester with steady work.",
      }),
    ).toBeInTheDocument();
    expect(screen.getByText(/Complete the project outline/)).toBeInTheDocument();
    expect(screen.getByText(quote.text)).toBeInTheDocument();
    expect(screen.getByText(/Today · Nijika/)).toBeInTheDocument();
  });

  it("lets the user edit and save the central resolution", async () => {
    const user = userEvent.setup();
    const { onSave } = renderPanel();
    await user.click(screen.getByRole("button", { name: "Edit" }));
    const input = screen.getByRole("textbox", {
      name: "Main semester resolution",
    });
    await user.clear(input);
    await user.type(input, "Ship one meaningful project.");
    await user.click(
      screen.getByRole("button", { name: "Save resolution" }),
    );
    expect(onSave).toHaveBeenCalledWith("Ship one meaningful project.");
  });

  it("opens the editor immediately when no resolution exists", () => {
    const onSave = vi.fn();
    render(
      <MainResolutionPanel
        semesterName="Semester 1"
        weekNumber={1}
        percentComplete={0}
        daysRemaining={100}
        quote={quote}
        onSave={onSave}
      />,
    );
    expect(
      screen.getByRole("textbox", { name: "Main semester resolution" }),
    ).toBeInTheDocument();
  });
});
