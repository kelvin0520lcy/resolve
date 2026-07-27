import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { MainResolutionPanel } from "@/components/resolution/main-resolution-panel";
import type { MotivationQuote } from "@/lib/daily-motivation";
import type { SemesterResolution } from "@/types";

const quote: MotivationQuote = {
  id: "nijika-test",
  member: "nijika",
  memberName: "伊地知虹夏",
  memberNameEn: "Nijika Ijichi",
  trait: "rhythm",
  traitJa: "リズム",
  text: "Find the count and come back in.",
  textJa: "カウントを見つけて、もう一度入ろう！",
};

const resolutions: SemesterResolution[] = [
  {
    id: "resolution-1",
    title: "Finish the semester with steady work.",
    completed: false,
    createdAt: "2026-07-01T00:00:00.000Z",
    updatedAt: "2026-07-01T00:00:00.000Z",
  },
  {
    id: "resolution-2",
    title: "Perform one song confidently.",
    completed: true,
    createdAt: "2026-07-02T00:00:00.000Z",
    updatedAt: "2026-07-03T00:00:00.000Z",
    completedAt: "2026-07-03T00:00:00.000Z",
  },
];

function renderPanel(records: SemesterResolution[] = resolutions) {
  const callbacks = {
    onAdd: vi.fn(),
    onUpdate: vi.fn(),
    onToggle: vi.fn(),
    onRemove: vi.fn(),
  };
  return {
    ...callbacks,
    ...render(
      <MainResolutionPanel
        resolutions={records}
        theme="Steady encore"
        semesterName="Semester 1"
        weekNumber={4}
        percentComplete={32}
        daysRemaining={76}
        focus="Complete the project outline"
        quote={quote}
        {...callbacks}
      />,
    ),
  };
}

describe("semester resolutions panel", () => {
  it("keeps multiple resolutions, next proof, and daily quote together", () => {
    renderPanel();

    expect(
      screen.getByText("Finish the semester with steady work."),
    ).toBeInTheDocument();
    expect(
      screen.getByText("Perform one song confidently."),
    ).toBeInTheDocument();
    expect(screen.getByText("1/2 complete")).toBeInTheDocument();
    expect(screen.getByText(/Complete the project outline/)).toBeInTheDocument();
    expect(screen.getByText(quote.text)).toBeInTheDocument();
  });

  it("adds another resolution", async () => {
    const user = userEvent.setup();
    const { onAdd } = renderPanel();

    await user.click(
      screen.getByRole("button", { name: "Add resolution" }),
    );
    await user.type(
      screen.getByRole("textbox", { name: "New semester resolution" }),
      "Ship one meaningful project.",
    );
    await user.click(
      screen.getByRole("button", { name: "Add resolution" }),
    );

    expect(onAdd).toHaveBeenCalledWith({
      title: "Ship one meaningful project.",
    });
  });

  it("edits an individual resolution", async () => {
    const user = userEvent.setup();
    const { onUpdate } = renderPanel();

    await user.click(
      screen.getByRole("button", {
        name: "Edit resolution Finish the semester with steady work.",
      }),
    );
    const input = screen.getByRole("textbox", {
      name: "Edit semester resolution",
    });
    await user.clear(input);
    await user.type(input, "Finish with consistent weekly reviews.");
    await user.click(
      screen.getByRole("button", { name: "Save resolution changes" }),
    );

    expect(onUpdate).toHaveBeenCalledWith("resolution-1", {
      title: "Finish with consistent weekly reviews.",
    });
  });

  it("completes and removes individual resolutions", async () => {
    const user = userEvent.setup();
    const { onToggle, onRemove } = renderPanel();

    await user.click(
      screen.getByRole("button", {
        name: "Complete resolution Finish the semester with steady work.",
      }),
    );
    expect(onToggle).toHaveBeenCalledWith("resolution-1");

    await user.click(
      screen.getByRole("button", {
        name: "Remove resolution Perform one song confidently.",
      }),
    );
    await user.click(
      screen.getByRole("button", {
        name: "Confirm remove resolution Perform one song confidently.",
      }),
    );
    expect(onRemove).toHaveBeenCalledWith("resolution-2");
  });

  it("opens the add editor immediately when no resolution exists", () => {
    renderPanel([]);

    expect(
      screen.getByRole("textbox", { name: "New semester resolution" }),
    ).toBeInTheDocument();
  });
});
