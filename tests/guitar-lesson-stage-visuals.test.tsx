import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import {
  ConnectionBridgeVisual,
  LessonConceptRoute,
  MusicalUseVisual,
  PracticeLoopVisual,
  TechniqueControlVisual,
} from "@/features/guitar-learning/components/lesson-stage-visuals";

describe("lesson stage visual companions", () => {
  it("turns the rhythm lesson route, connection, technique, practice, and use into diagrams", () => {
    render(
      <>
        <LessonConceptRoute
          conceptTitle="Syncopation"
          category="rhythm"
        />
        <ConnectionBridgeVisual
          conceptTitle="Syncopation"
          knownConcept="Eighth-note subdivisions"
          category="rhythm"
        />
        <TechniqueControlVisual
          conceptTitle="Syncopation"
          category="rhythm"
        />
        <PracticeLoopVisual
          conceptTitle="Syncopation"
          category="rhythm"
        />
        <MusicalUseVisual
          conceptTitle="Syncopation"
          category="rhythm"
        />
      </>,
    );

    expect(
      screen.getByRole("img", {
        name: "Learning route for Syncopation: hear, see, play, and use",
      }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("img", {
        name: "Connection from Eighth-note subdivisions to Syncopation",
      }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("img", {
        name: "Unstable and controlled motion comparison for Syncopation",
      }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("img", {
        name: "Four-step practice loop for Syncopation",
      }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("img", {
        name: "Simple, changed, and compared musical use for Syncopation",
      }),
    ).toBeInTheDocument();
    expect(screen.getAllByText("Steady pulse").length).toBeGreaterThan(0);
    expect(screen.getByText("Count the grid")).toBeInTheDocument();
    expect(screen.getByText("Add a chord change")).toBeInTheDocument();
  });

  it("changes the visual language for ear training instead of reusing rhythm instructions", () => {
    render(
      <PracticeLoopVisual
        conceptTitle="Major versus minor"
        category="ear"
      />,
    );
    expect(screen.getByText("Listen before labels")).toBeInTheDocument();
    expect(screen.getByText("Hum or clap it")).toBeInTheDocument();
    expect(screen.getByText("Match it on guitar")).toBeInTheDocument();
    expect(screen.queryByText("Count the grid")).not.toBeInTheDocument();
  });
});
