import type {
  RhythmCell,
  RhythmStrokeState,
} from "@/features/guitar-learning/types";

export type RhythmSubdivision = 4 | 8 | 12 | 16;

export const RHYTHM_LABELS: Record<RhythmSubdivision, string[]> = {
  4: ["1", "2", "3", "4"],
  8: ["1", "&", "2", "&", "3", "&", "4", "&"],
  12: ["1", "trip", "let", "2", "trip", "let", "3", "trip", "let", "4", "trip", "let"],
  16: [
    "1",
    "e",
    "&",
    "a",
    "2",
    "e",
    "&",
    "a",
    "3",
    "e",
    "&",
    "a",
    "4",
    "e",
    "&",
    "a",
  ],
};

export function getHandDirection(
  index: number,
  subdivision: RhythmSubdivision,
): "D" | "U" {
  if (!Number.isInteger(index) || index < 0 || index >= subdivision) {
    throw new Error("Subdivision index is outside the bar.");
  }
  if (subdivision === 4) return "D";
  return index % 2 === 0 ? "D" : "U";
}

export function createRhythmGrid(
  subdivision: RhythmSubdivision,
  initialState: RhythmStrokeState = "missed",
): RhythmCell[] {
  return RHYTHM_LABELS[subdivision].map((count, index) => ({
    index,
    count,
    direction: getHandDirection(index, subdivision),
    state: initialState,
    accented: false,
    palmMuted: false,
  }));
}

export function createMultiBeatRhythmGrid(
  beats: number,
  slotsPerBeat: 1 | 2 | 3 | 4,
  initialState: RhythmStrokeState = "missed",
): RhythmCell[] {
  const safeBeats = Math.max(1, Math.min(32, Math.round(beats)));
  const subdivision = (slotsPerBeat * 4) as RhythmSubdivision;
  const template = createRhythmGrid(subdivision, initialState);
  return Array.from(
    { length: safeBeats * slotsPerBeat },
    (_value, index) => ({
      ...template[index % template.length],
      index,
    }),
  );
}

export function rhythmCountCue(
  step: number,
  slotsPerBeat: 1 | 2 | 3 | 4,
): string {
  const beat = Math.floor(step / slotsPerBeat) % 4 + 1;
  const position = step % slotsPerBeat;
  if (position === 0) return String(beat);
  if (slotsPerBeat === 2) return "and";
  if (slotsPerBeat === 3) return position === 1 ? "trip" : "let";
  return position === 1 ? "e" : position === 2 ? "and" : "a";
}

export function deconstructStrummingPattern(
  pattern: string | string[],
  subdivision: RhythmSubdivision = 8,
): RhythmCell[] {
  const strokes = (Array.isArray(pattern) ? pattern : pattern.split(/\s+/))
    .map((stroke) => stroke.trim().toUpperCase())
    .filter((stroke): stroke is "D" | "U" => stroke === "D" || stroke === "U");
  const grid = createRhythmGrid(subdivision);
  let cursor = 0;

  for (const stroke of strokes) {
    while (
      cursor < grid.length &&
      grid[cursor].direction !== stroke
    ) {
      cursor += 1;
    }
    if (cursor >= grid.length) {
      throw new Error(
        `Pattern does not fit a ${subdivision}-subdivision bar while preserving continuous hand motion.`,
      );
    }
    grid[cursor] = { ...grid[cursor], state: "played" };
    cursor += 1;
  }

  return grid;
}

export function cycleRhythmState(
  state: RhythmStrokeState,
): RhythmStrokeState {
  const states: RhythmStrokeState[] = [
    "played",
    "missed",
    "muted",
    "rest",
  ];
  return states[(states.indexOf(state) + 1) % states.length];
}

export type RhythmTransformation =
  | "accent-backbeat"
  | "add-muted"
  | "palm-mute"
  | "add-syncopation"
  | "simplify"
  | "open-chorus";

export function transformRhythm(
  cells: RhythmCell[],
  transformation: RhythmTransformation,
): RhythmCell[] {
  return cells.map((cell) => {
    if (transformation === "accent-backbeat") {
      return {
        ...cell,
        accented:
          cell.state === "played" &&
          (cell.count === "2" || cell.count === "4"),
      };
    }
    if (transformation === "add-muted") {
      return cell.index % 4 === 2
        ? { ...cell, state: "muted" as const }
        : cell;
    }
    if (transformation === "palm-mute") {
      return cell.state === "played" ? { ...cell, palmMuted: true } : cell;
    }
    if (transformation === "add-syncopation") {
      return cell.count === "&"
        ? { ...cell, state: "played" as const, accented: true }
        : cell;
    }
    if (transformation === "simplify") {
      return cell.index % 2 === 0
        ? { ...cell, state: "played" as const }
        : { ...cell, state: "missed" as const, accented: false };
    }
    return {
      ...cell,
      palmMuted: false,
      accented: cell.state === "played" && cell.index % 4 === 0,
    };
  });
}

export function describeRhythmChange(
  transformation: RhythmTransformation,
): string {
  const descriptions: Record<RhythmTransformation, string> = {
    "accent-backbeat":
      "Accenting beats two and four gives the groove a stronger backbeat without changing the hand motion.",
    "add-muted":
      "Muted strokes add percussion between chord attacks while the fretting hand releases pressure.",
    "palm-mute":
      "Palm muting shortens each played stroke, making the part tighter and leaving room for a later lift.",
    "add-syncopation":
      "Accented offbeats pull attention away from the numbered beats and create forward motion.",
    simplify:
      "Removing offbeat attacks preserves the pulse while creating more space and a clearer foundation.",
    "open-chorus":
      "Opening the strokes and removing palm muting increases sustain, width, and perceived intensity.",
  };
  return descriptions[transformation];
}

export function rhythmCellToSymbol(cell: RhythmCell): string {
  if (cell.state === "missed") return "–";
  if (cell.state === "rest") return "R";
  if (cell.state === "muted") return "X";
  return cell.direction;
}

export type PickingStep = {
  string: number;
  fret: number;
  direction: "D" | "U";
};

export function describeStringCrossing(
  current: PickingStep,
  next: PickingStep,
): "same string" | "inside" | "outside" {
  if (current.string === next.string) return "same string";
  const movingTowardHigherString = next.string > current.string;
  const pickMovesTowardNextString =
    (current.direction === "D" && movingTowardHigherString) ||
    (current.direction === "U" && !movingTowardHigherString);
  return pickMovesTowardNextString ? "inside" : "outside";
}
