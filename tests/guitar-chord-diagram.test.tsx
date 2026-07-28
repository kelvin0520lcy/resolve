import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { GuitarChordDiagram } from "@/features/guitar-learning/components/chord-diagram";

describe("GuitarChordDiagram", () => {
  it("renders one continuous six-string, five-fret coordinate system", () => {
    render(
      <GuitarChordDiagram
        chordName="C"
        strings={[
          { string: 6, fret: "muted" },
          { string: 5, fret: 3, finger: 3, root: true },
          { string: 4, fret: 2, finger: 2 },
          { string: 3, fret: "open" },
          { string: 2, fret: 1, finger: 1 },
          { string: 1, fret: "open" },
        ]}
      />,
    );

    const diagram = screen.getByRole("img", {
      name: "C chord diagram",
    });
    expect(diagram).toHaveAttribute("viewBox", "0 0 240 242");
    expect(diagram.querySelectorAll("line")).toHaveLength(12);
    expect(
      diagram.querySelectorAll('line[x1="40"][x2="200"]'),
    ).toHaveLength(6);
    expect(
      diagram.querySelectorAll('line[y1="48"][y2="208"]'),
    ).toHaveLength(6);
    expect(
      diagram.querySelector('line[x1="40"][y1="48"][y2="208"]'),
    ).toHaveAttribute("stroke-width", "2.4");
    expect(
      diagram.querySelector('line[x1="200"][y1="48"][y2="208"]'),
    ).toHaveAttribute("stroke-width", "1.5");
    expect(
      screen.getByLabelText(
        "String 5, fret 3, finger 3, root note",
      ),
    ).toBeInTheDocument();
    expect(
      screen
        .getByLabelText("String 5, fret 3, finger 3, root note")
        .querySelector("circle"),
    ).toHaveAttribute("cx", "72");
    expect(
      screen
        .getByLabelText("String 5, fret 3, finger 3, root note")
        .querySelector("circle"),
    ).toHaveAttribute("cy", "128");
    expect(screen.getByLabelText("String 6, muted")).toBeInTheDocument();
    expect(screen.getByLabelText("String 3, open")).toBeInTheDocument();
  });

  it("keeps a shared finger visually distinct without changing its position", () => {
    render(
      <GuitarChordDiagram
        chordName="Am to C anchor"
        strings={[
          {
            string: 2,
            fret: 1,
            finger: 1,
            shared: true,
          },
        ]}
      />,
    );

    const marker = screen.getByLabelText(
      "String 2, fret 1, finger 1, shared position",
    );
    expect(marker.querySelector("circle")).toHaveAttribute(
      "fill",
      "var(--success)",
    );
  });

  it("supports interval labels without describing them as finger numbers", () => {
    render(
      <GuitarChordDiagram
        chordName="Interval shape"
        strings={[
          {
            string: 5,
            fret: 3,
            marker: "R",
            markerDescription: "root interval",
            root: true,
          },
        ]}
      />,
    );

    const marker = screen.getByLabelText(
      "String 5, fret 3, root interval, root note",
    );
    expect(marker).toHaveTextContent("R");
    expect(marker).not.toHaveAccessibleName(/finger/i);
  });
});
