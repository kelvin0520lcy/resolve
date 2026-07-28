import {
  ArrowRight,
  Ear,
  Eye,
  Guitar,
  Lightbulb,
  Music2,
  Repeat2,
  Target,
} from "lucide-react";
import type { GuitarLessonCategory } from "@/features/guitar-learning/types";

type VisualLanguage = {
  anchor: string;
  relationship: string;
  result: string;
  observe: string;
  isolate: string;
  repeat: string;
  transfer: string;
};

const VISUAL_LANGUAGE: Record<GuitarLessonCategory, VisualLanguage> = {
  rhythm: {
    anchor: "Steady pulse",
    relationship: "Stroke location",
    result: "Trustworthy groove",
    observe: "Count the grid",
    isolate: "Mute the strings",
    repeat: "Loop one bar",
    transfer: "Add a chord change",
  },
  lead: {
    anchor: "Relaxed motion",
    relationship: "Pick + articulation",
    result: "Expressive phrase",
    observe: "Watch pick depth",
    isolate: "Use one note",
    repeat: "Match five motions",
    transfer: "Place it in a phrase",
  },
  fretboard: {
    anchor: "Known root",
    relationship: "Interval distance",
    result: "New location",
    observe: "Find the roots",
    isolate: "Name one interval",
    repeat: "Find another octave",
    transfer: "Hide the diagram",
  },
  improvisation: {
    anchor: "Tonal centre",
    relationship: "Phrase decision",
    result: "Clear resolution",
    observe: "Hear the home note",
    isolate: "Use three notes",
    repeat: "Make call + answer",
    transfer: "Change the ending",
  },
  chords: {
    anchor: "Chord root",
    relationship: "Interval recipe",
    result: "Playable voicing",
    observe: "Read the formula",
    isolate: "Locate each tone",
    repeat: "Check every string",
    transfer: "Move to a voicing",
  },
  ear: {
    anchor: "Heard sound",
    relationship: "Audible clue",
    result: "Playable answer",
    observe: "Listen before labels",
    isolate: "Hum or clap it",
    repeat: "Name one clue",
    transfer: "Match it on guitar",
  },
  theory: {
    anchor: "Heard sound",
    relationship: "Interval / function",
    result: "Predicted note choice",
    observe: "Keep one root",
    isolate: "Change one interval",
    repeat: "Compare both sounds",
    transfer: "Find both on guitar",
  },
  application: {
    anchor: "Song section",
    relationship: "One musical edit",
    result: "Complete arrangement",
    observe: "Mark the section",
    isolate: "Loop the edit",
    repeat: "Join its boundaries",
    transfer: "Play the full section",
  },
};

function FlowArrow({ compact = false }: { compact?: boolean }) {
  return (
    <ArrowRight
      className={`mx-auto h-4 w-4 shrink-0 text-muted ${
        compact ? "" : "rotate-90 sm:rotate-0"
      }`}
      aria-hidden="true"
    />
  );
}

function VisualFrame({
  label,
  children,
  className = "",
}: {
  label: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      role="img"
      aria-label={label}
      className={`rounded-2xl border border-border bg-surface-muted/45 p-3 sm:p-4 ${className}`}
    >
      {children}
    </div>
  );
}

export function LessonConceptRoute({
  conceptTitle,
  category,
}: {
  conceptTitle: string;
  category: GuitarLessonCategory;
}) {
  const language = VISUAL_LANGUAGE[category];
  const stages = [
    { icon: Ear, label: "Hear", detail: language.anchor },
    { icon: Eye, label: "See", detail: language.relationship },
    { icon: Guitar, label: "Play", detail: conceptTitle },
    { icon: Music2, label: "Use", detail: language.result },
  ];

  return (
    <VisualFrame
      label={`Learning route for ${conceptTitle}: hear, see, play, and use`}
      className="mt-4"
    >
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        {stages.map((stage, index) => {
          const Icon = stage.icon;
          return (
            <div
              key={stage.label}
              className="min-w-0 rounded-xl border border-border bg-surface p-3 text-center"
            >
              <div className="flex items-center justify-center gap-2">
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-accent/12 text-[11px] font-black text-accent">
                  {index + 1}
                </span>
                <Icon
                  className="h-4 w-4 text-accent"
                  aria-hidden="true"
                />
              </div>
              <p className="mt-2 text-xs font-black uppercase tracking-wide text-accent">
                {stage.label}
              </p>
              <p className="mt-1 line-clamp-2 break-words text-xs font-bold leading-5 text-muted">
                {stage.detail}
              </p>
            </div>
          );
        })}
      </div>
    </VisualFrame>
  );
}

export function ConnectionBridgeVisual({
  conceptTitle,
  knownConcept,
  category,
}: {
  conceptTitle: string;
  knownConcept: string;
  category: GuitarLessonCategory;
}) {
  const language = VISUAL_LANGUAGE[category];
  return (
    <VisualFrame
      label={`Connection from ${knownConcept} to ${conceptTitle}`}
      className="mt-4"
    >
      <div className="grid gap-2 sm:grid-cols-[1fr_auto_1fr_auto_1fr] sm:items-center">
        <div className="rounded-xl border-2 border-cyan/35 bg-cyan/8 p-3">
          <p className="text-[11px] font-black uppercase tracking-wide text-cyan">
            Keep familiar
          </p>
          <p className="mt-1 text-xs font-black leading-5">{knownConcept}</p>
        </div>
        <FlowArrow />
        <div className="rounded-xl border-2 border-warning/45 bg-warning/10 p-3 text-center">
          <Lightbulb
            className="mx-auto h-4 w-4 text-warning"
            aria-hidden="true"
          />
          <p className="mt-1 text-[11px] font-black uppercase tracking-wide text-warning">
            Notice one change
          </p>
          <p className="mt-1 text-xs font-black">{language.relationship}</p>
        </div>
        <FlowArrow />
        <div className="rounded-xl border-2 border-accent/35 bg-accent/8 p-3">
          <p className="text-[11px] font-black uppercase tracking-wide text-accent">
            New idea
          </p>
          <p className="mt-1 text-xs font-black leading-5">{conceptTitle}</p>
        </div>
      </div>
    </VisualFrame>
  );
}

function MotionPath({
  controlled,
}: {
  controlled: boolean;
}) {
  return (
    <svg
      viewBox="0 0 220 74"
      className="h-20 w-full"
      aria-hidden="true"
    >
      <path
        d={
          controlled
            ? "M12 38 C48 18, 72 58, 108 38 S170 18, 208 38"
            : "M12 54 C30 4, 58 68, 82 15 S120 70, 142 10 S180 68, 208 24"
        }
        fill="none"
        stroke={controlled ? "var(--success)" : "var(--danger)"}
        strokeWidth={controlled ? 5 : 7}
        strokeLinecap="round"
        strokeDasharray={controlled ? undefined : "11 7"}
      />
      {[12, 61, 110, 159, 208].map((x, index) => (
        <circle
          key={x}
          cx={x}
          cy={controlled ? (index % 2 === 0 ? 38 : 34) : index % 2 === 0 ? 54 : 14}
          r={controlled ? 5 : 7}
          fill={controlled ? "var(--success)" : "var(--danger)"}
        />
      ))}
    </svg>
  );
}

export function TechniqueControlVisual({
  conceptTitle,
  category,
}: {
  conceptTitle: string;
  category: GuitarLessonCategory;
}) {
  const language = VISUAL_LANGUAGE[category];
  return (
    <VisualFrame
      label={`Unstable and controlled motion comparison for ${conceptTitle}`}
      className="mt-4"
    >
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="rounded-xl border border-danger/30 bg-danger/8 p-3">
          <p className="text-[11px] font-black uppercase tracking-wide text-danger">
            Unstable · too many corrections
          </p>
          <MotionPath controlled={false} />
          <div className="grid grid-cols-4 gap-1">
            {["Tense", "Large", "Late", "Uneven"].map((label, index) => (
              <span
                key={label}
                className={`rounded-md bg-danger/15 py-1 text-center text-[11px] font-black ${
                  index === 1 ? "translate-y-1" : ""
                }`}
              >
                {label}
              </span>
            ))}
          </div>
        </div>
        <div className="rounded-xl border border-success/30 bg-success/8 p-3">
          <p className="text-[11px] font-black uppercase tracking-wide text-success">
            Controlled · one repeatable decision
          </p>
          <MotionPath controlled />
          <div className="grid grid-cols-4 gap-1">
            {[language.anchor, "Small", "Early", "Even"].map((label) => (
              <span
                key={label}
                className="rounded-md bg-success/15 py-1 text-center text-[11px] font-black"
              >
                {label}
              </span>
            ))}
          </div>
        </div>
      </div>
    </VisualFrame>
  );
}

export function PracticeLoopVisual({
  conceptTitle,
  category,
}: {
  conceptTitle: string;
  category: GuitarLessonCategory;
}) {
  const language = VISUAL_LANGUAGE[category];
  const steps = [
    { label: "Observe", detail: language.observe, icon: Eye },
    { label: "Isolate", detail: language.isolate, icon: Target },
    { label: "Repeat", detail: language.repeat, icon: Repeat2 },
    { label: "Transfer", detail: language.transfer, icon: Guitar },
  ];
  return (
    <VisualFrame
      label={`Four-step practice loop for ${conceptTitle}`}
      className="mt-4"
    >
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        {steps.map((step, index) => {
          const Icon = step.icon;
          return (
            <div
              key={step.label}
              className="relative rounded-xl border border-border bg-surface p-3"
            >
              <span className="absolute right-2 top-2 text-[11px] font-black text-muted">
                0{index + 1}
              </span>
              <Icon className="h-4 w-4 text-accent" aria-hidden="true" />
              <p className="mt-2 text-xs font-black uppercase tracking-wide text-accent">
                {step.label}
              </p>
              <p className="mt-1 text-xs font-bold leading-5">
                {step.detail}
              </p>
            </div>
          );
        })}
      </div>
      <p className="mt-3 text-center text-xs font-bold leading-5 text-muted">
        If Transfer breaks down, return to Isolate—do not hide the problem with
        speed.
      </p>
    </VisualFrame>
  );
}

export function MusicalUseVisual({
  conceptTitle,
  category,
}: {
  conceptTitle: string;
  category: GuitarLessonCategory;
}) {
  const language = VISUAL_LANGUAGE[category];
  return (
    <VisualFrame
      label={`Simple, changed, and compared musical use for ${conceptTitle}`}
      className="mt-4"
    >
      <div className="grid gap-2 sm:grid-cols-[1fr_auto_1fr_auto_1fr] sm:items-center">
        <div className="rounded-xl border border-border bg-surface p-3">
          <p className="text-[11px] font-black uppercase tracking-wide text-muted">
            Version A · establish
          </p>
          <div className="mt-2 grid grid-cols-4 gap-1">
            {[1, 2, 3, 4].map((bar) => (
              <span
                key={bar}
                className="flex h-8 items-center justify-center rounded-md bg-cyan/12 text-[11px] font-black text-cyan"
              >
                {bar}
              </span>
            ))}
          </div>
          <p className="mt-2 text-xs font-bold">{language.anchor}</p>
        </div>
        <FlowArrow />
        <div className="rounded-xl border-2 border-accent/35 bg-accent/8 p-3">
          <p className="text-[11px] font-black uppercase tracking-wide text-accent">
            Version B · one change
          </p>
          <div className="mt-2 grid grid-cols-4 gap-1">
            {[1, 2, 3, 4].map((bar) => (
              <span
                key={bar}
                className={`flex h-8 items-center justify-center rounded-md text-[11px] font-black ${
                  bar === 3
                    ? "bg-warning text-[#18121f]"
                    : "bg-accent/15 text-accent"
                }`}
              >
                {bar === 3 ? "EDIT" : bar}
              </span>
            ))}
          </div>
          <p className="mt-2 line-clamp-1 text-xs font-bold">
            {conceptTitle}
          </p>
        </div>
        <FlowArrow />
        <div className="rounded-xl border border-success/30 bg-success/8 p-3 text-center">
          <Target
            className="mx-auto h-5 w-5 text-success"
            aria-hidden="true"
          />
          <p className="mt-2 text-[11px] font-black uppercase tracking-wide text-success">
            Compare the role
          </p>
          <p className="mt-1 text-xs font-bold leading-5">
            Keep the version that makes {language.result.toLowerCase()} clearer.
          </p>
        </div>
      </div>
    </VisualFrame>
  );
}
