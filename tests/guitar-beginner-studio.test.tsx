import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { GuitarPracticeMode } from "@/features/guitar-learning/components/practice-mode";
import { GuitarTuner } from "@/features/guitar-learning/components/tools/tuner";
import { ChordChangeTrainer } from "@/features/guitar-learning/components/tools/chord-change-trainer";
import { GuitarGlossarySearch } from "@/features/guitar-learning/components/glossary";
import { createPlacementResultForRoute } from "@/features/guitar-learning/data/placement";
import {
  createEmptyGuitarLearningState,
  recordChordChangeBest,
  recordLessonCheckpoint,
} from "@/features/guitar-learning/lib/learning-state";

describe("beginner-first Guitar Studio", () => {
  it.each([
    ["new-to-guitar", "guitar-language", "guitar-language:guitar-orientation"],
    ["songs-and-tabs", "rhythm", "rhythm:feeling-and-identifying-the-pulse"],
    ["theory-practice", "improvisation", "improvisation:tonal-centre"],
  ] as const)(
    "turns the %s entry route into an immediate starting lesson",
    (route, pathId, lessonId) => {
      expect(createPlacementResultForRoute(route)).toMatchObject({
        learnerRoute: route,
        recommendedPathId: pathId,
        recommendedLessonId: lessonId,
      });
    },
  );

  it("builds a routine from currently actionable lessons only", () => {
    render(
      <GuitarPracticeMode
        state={createEmptyGuitarLearningState("learner")}
        updateState={vi.fn()}
        onOpenLesson={vi.fn()}
        onOpenTool={vi.fn()}
      />,
    );
    expect(screen.getByRole("heading", { name: "A practice session you can finish" })).toBeInTheDocument();
    expect(screen.getByText("Meet the guitar without jargon")).toBeInTheDocument();
    expect(screen.getAllByText(/Why today:/)).toHaveLength(2);
    expect(
      screen.getAllByRole("button", { name: "Open lesson" }),
    ).toHaveLength(2);
    expect(screen.queryByText("String numbers versus string names")).not.toBeInTheDocument();
  });

  it("preserves only a genuinely improved chord-change best", () => {
    const initial = createEmptyGuitarLearningState("learner");
    const first = recordChordChangeBest(initial, "G-C", 8, "2026-07-28T00:00:00Z");
    const lower = recordChordChangeBest(first, "G-C", 6, "2026-07-28T00:01:00Z");
    const higher = recordChordChangeBest(lower, "G-C", 11, "2026-07-28T00:02:00Z");
    expect(first.profile.chordChangeBests?.["G-C"]).toBe(8);
    expect(lower).toBe(first);
    expect(higher.profile.chordChangeBests?.["G-C"]).toBe(11);
  });

  it("puts a failed checkpoint at the front of the next routine", () => {
    const reviewState = recordLessonCheckpoint(
      createEmptyGuitarLearningState("learner"),
      "rhythm:feeling-and-identifying-the-pulse",
      0,
      "2026-07-28T00:00:00Z",
    );
    render(
      <GuitarPracticeMode
        state={reviewState}
        updateState={vi.fn()}
        onOpenLesson={vi.fn()}
        onOpenTool={vi.fn()}
      />,
    );
    const lessons = screen.getAllByRole("button", { name: "Open lesson" });
    expect(lessons[0].closest("div")).toHaveTextContent(
      "Find the repeating pulse",
    );
    expect(lessons[0].closest("div")).toHaveTextContent(
      "latest checkpoint",
    );
  });

  it("keeps a useful tuner fallback when microphone access is unavailable", async () => {
    const user = userEvent.setup();
    render(<GuitarTuner />);
    for (const name of [
      "6 · low E",
      "5 · A",
      "4 · D",
      "3 · G",
      "2 · B",
      "1 · high E",
    ]) {
      expect(screen.getByRole("button", { name })).toBeInTheDocument();
    }
    await user.click(screen.getByRole("button", { name: "Use microphone" }));
    expect(
      screen.getByText(/Microphone tuning is unavailable here/),
    ).toBeInTheDocument();
    expect(screen.getByText(/does not upload or save microphone audio/)).toBeInTheDocument();
  });

  it("supports chromatic, target, bend-target, and alternate tuner modes", async () => {
    const user = userEvent.setup();
    render(<GuitarTuner />);
    const mode = screen.getByLabelText("Tuner mode");

    await user.selectOptions(mode, "chromatic");
    expect(
      screen.getByRole("heading", { name: "Identify and centre any guitar note" }),
    ).toBeInTheDocument();

    await user.selectOptions(mode, "target");
    expect(screen.getByLabelText("Target note")).toBeInTheDocument();

    await user.selectOptions(mode, "bend-target");
    expect(screen.getByLabelText("Bend from")).toBeInTheDocument();

    await user.selectOptions(mode, "alternate");
    expect(screen.getByLabelText("Alternate tuning")).toBeInTheDocument();
  });

  it("shows playable chord positions and prevents identical chord pairs", () => {
    render(
      <ChordChangeTrainer
        state={createEmptyGuitarLearningState("learner")}
        updateState={vi.fn()}
        presetSettings={{ chordA: "C", chordB: "Am" }}
      />,
    );

    expect(screen.getByLabelText("C chord diagram")).toBeInTheDocument();
    expect(screen.getByLabelText("Am chord diagram")).toBeInTheDocument();
    expect(
      screen.getByLabelText(/String 5, fret 3, finger 3, root note/),
    ).toBeInTheDocument();
    expect(
      screen.getByLabelText("Second chord").querySelector('option[value="C"]'),
    ).toBeNull();
    expect(screen.getByText(/string 2/)).toBeInTheDocument();
  });

  it("searches technical and plain-English glossary language", async () => {
    const user = userEvent.setup();
    render(<GuitarGlossarySearch />);
    const search = screen.getByRole("textbox", { name: "Search guitar glossary" });
    await user.type(search, "home note");
    expect(screen.getByText("Tonal centre")).toBeInTheDocument();
    await user.clear(search);
    await user.type(search, "small repeatable musical idea");
    expect(screen.getByText("Motif")).toBeInTheDocument();
  });
});
