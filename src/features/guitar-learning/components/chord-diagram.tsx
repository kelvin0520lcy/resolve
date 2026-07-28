type GuitarStringNumber = 1 | 2 | 3 | 4 | 5 | 6;

export type ChordDiagramString = {
  string: GuitarStringNumber;
  fret: number | "open" | "muted";
  finger?: number | string;
  marker?: number | string;
  markerDescription?: string;
  root?: boolean;
  shared?: boolean;
};

const STRING_X: Record<GuitarStringNumber, number> = {
  6: 40,
  5: 72,
  4: 104,
  3: 136,
  2: 168,
  1: 200,
};

const FRET_TOP = 48;
const FRET_HEIGHT = 32;
const DISPLAYED_FRETS = 5;

function markerLabel(instruction: ChordDiagramString) {
  if (instruction.fret === "open") {
    return `String ${instruction.string}, open`;
  }
  if (instruction.fret === "muted") {
    return `String ${instruction.string}, muted`;
  }
  return `String ${instruction.string}, fret ${instruction.fret}${
    instruction.markerDescription
      ? `, ${instruction.markerDescription}`
      : instruction.finger !== undefined
        ? `, finger ${instruction.finger}`
        : ""
  }${instruction.root ? ", root note" : ""}${
    instruction.shared ? ", shared position" : ""
  }`;
}

export function GuitarChordDiagram({
  chordName,
  strings,
  startingFret = 1,
  className = "",
}: {
  chordName: string;
  strings: ChordDiagramString[];
  startingFret?: number;
  className?: string;
}) {
  const byString = new Map(
    strings.map((instruction) => [instruction.string, instruction]),
  );
  const orderedStrings = [6, 5, 4, 3, 2, 1] as const;

  return (
    <figure className={`mx-auto w-full max-w-72 ${className}`}>
      <svg
        viewBox="0 0 240 242"
        role="img"
        aria-label={`${chordName} chord diagram`}
        className="block h-auto w-full overflow-visible text-foreground"
      >
        <title>{chordName} chord diagram</title>
        <desc>
          Six guitar strings run from thick string 6 on the left to thin
          string 1 on the right. Horizontal lines mark frets.
        </desc>

        {Array.from(
          { length: DISPLAYED_FRETS + 1 },
          (_unused, index) => {
            const y = FRET_TOP + index * FRET_HEIGHT;
            return (
              <line
                key={`fret-${index}`}
                x1="40"
                x2="200"
                y1={y}
                y2={y}
                stroke="currentColor"
                strokeWidth={index === 0 && startingFret === 1 ? 6 : 2}
                opacity={index === 0 && startingFret === 1 ? 0.72 : 0.34}
                strokeLinecap="round"
              />
            );
          },
        )}

        {orderedStrings.map((string, index) => (
          <line
            key={`string-line-${string}`}
            x1={STRING_X[string]}
            x2={STRING_X[string]}
            y1={FRET_TOP}
            y2={FRET_TOP + DISPLAYED_FRETS * FRET_HEIGHT}
            stroke="currentColor"
            strokeWidth={2.4 - index * 0.18}
            opacity="0.48"
          />
        ))}

        {startingFret > 1 && (
          <text
            x="28"
            y={FRET_TOP + FRET_HEIGHT * 0.68}
            textAnchor="end"
            fill="currentColor"
            className="text-[12px] font-black"
            opacity="0.72"
          >
            {startingFret}fr
          </text>
        )}

        {orderedStrings.map((string) => {
          const instruction = byString.get(string);
          if (!instruction) return null;
          const x = STRING_X[string];

          if (
            instruction.fret === "open" ||
            instruction.fret === "muted"
          ) {
            return (
              <g
                key={`marker-${string}`}
                aria-label={markerLabel(instruction)}
              >
                {instruction.fret === "open" ? (
                  <circle
                    cx={x}
                    cy="25"
                    r="9"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    opacity="0.8"
                  />
                ) : (
                  <text
                    x={x}
                    y="31"
                    textAnchor="middle"
                    fill="currentColor"
                    className="text-[20px] font-black"
                  >
                    ×
                  </text>
                )}
              </g>
            );
          }

          const displayedFret = instruction.fret - startingFret;
          const y =
            FRET_TOP +
            (Math.max(0, displayedFret) + 0.5) * FRET_HEIGHT;
          const fill = instruction.shared
            ? "var(--success)"
            : instruction.root
              ? "var(--warning)"
              : "var(--accent)";
          return (
            <g
              key={`marker-${string}`}
              aria-label={markerLabel(instruction)}
            >
              <circle
                cx={x}
                cy={y}
                r="15"
                fill={fill}
                stroke="var(--surface)"
                strokeWidth="3"
              />
              <text
                x={x}
                y={y + 5}
                textAnchor="middle"
                fill={
                  instruction.root && !instruction.shared
                    ? "#18121f"
                    : "white"
                }
                className="text-[13px] font-black"
              >
                {instruction.marker ?? instruction.finger ?? "●"}
              </text>
            </g>
          );
        })}

        {orderedStrings.map((string) => (
          <text
            key={`string-number-${string}`}
            x={STRING_X[string]}
            y="230"
            textAnchor="middle"
            fill="currentColor"
            className="text-[12px] font-bold"
            opacity="0.7"
          >
            {string}
          </text>
        ))}
      </svg>
      <figcaption className="mt-1 text-center text-xs leading-5 text-muted">
        ○ open · × mute · number inside dot = finger
      </figcaption>
    </figure>
  );
}
