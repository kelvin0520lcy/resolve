import { BookOpenText, ChevronDown, Sparkles } from "lucide-react";

export const QUICK_CAPTURE_EXAMPLES = [
  {
    label: "Study tomorrow",
    input: "Review calculus tomorrow 45m high priority #academics",
  },
  {
    label: "Add a deadline",
    input: "Submit portfolio due 2026-08-15 90m #career",
  },
  {
    label: "Plan practice",
    input: "Practice chord changes today 20m #guitar",
  },
] as const;

const QUICK_CAPTURE_RULES = [
  {
    label: "Plan date",
    syntax: "today · tomorrow",
    explanation: "Puts the task on that day.",
  },
  {
    label: "Deadline",
    syntax: "due YYYY-MM-DD",
    explanation: "Adds a date-only deadline.",
  },
  {
    label: "Duration",
    syntax: "45m · 45 min · 45 minutes",
    explanation: "Adds an estimate between 5 and 720 minutes.",
  },
  {
    label: "Priority",
    syntax: "low priority · medium priority · high priority",
    explanation: "Sets how urgently the task should be ranked.",
  },
  {
    label: "Category",
    syntax:
      "#academics · #career · #technical · #guitar · #health · #personal · #finance · #social",
    explanation: "Adds one supported category tag.",
  },
] as const;

export function QuickCaptureGuide({
  onUseExample,
}: {
  onUseExample: (example: string) => void;
}) {
  return (
    <section
      className="rounded-2xl border-2 border-[#18121f]/15 bg-[#fff0b5]/65 p-3 text-[#18121f] sm:p-4"
      aria-labelledby="quick-capture-guide-title"
    >
      <div className="flex items-start gap-3">
        <span className="sticker flex h-9 w-9 shrink-0 -rotate-2 items-center justify-center rounded-lg bg-warning text-[#18121f]">
          <Sparkles className="h-4 w-4" aria-hidden="true" />
        </span>
        <div className="min-w-0">
          <p
            id="quick-capture-guide-title"
            className="font-display text-lg tracking-wide"
          >
            Write one line. Preview it. Create it.
          </p>
          <p className="mt-1 text-xs font-medium leading-5 text-[#675a71]">
            Start with the task name, then add any optional cues below in any
            order. Resolve removes recognized cues from the title and shows
            exactly what it understood before saving.
          </p>
        </div>
      </div>

      <div className="mt-3">
        <p className="text-[10px] font-black uppercase tracking-[0.16em] text-[#675a71]">
          Try an example
        </p>
        <div className="mt-2 grid gap-2 sm:grid-cols-3">
          {QUICK_CAPTURE_EXAMPLES.map((example) => (
            <button
              key={example.label}
              type="button"
              className="min-w-0 rounded-xl border-2 border-[#18121f]/15 bg-white/65 p-2.5 text-left transition hover:-translate-y-0.5 hover:border-accent focus-visible:border-accent"
              onClick={() => onUseExample(example.input)}
              aria-label={`Use example: ${example.input}`}
            >
              <span className="block text-[10px] font-black uppercase tracking-wide text-accent">
                {example.label}
              </span>
              <span className="mt-1 block break-words text-[11px] font-bold leading-4 text-[#33283d]">
                {example.input}
              </span>
            </button>
          ))}
        </div>
      </div>

      <details className="group mt-3 rounded-xl border border-[#18121f]/15 bg-white/55">
        <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-3 py-2.5 text-xs font-black uppercase tracking-wide">
          <span className="flex items-center gap-2">
            <BookOpenText className="h-4 w-4 text-accent" aria-hidden="true" />
            View all supported rules
          </span>
          <ChevronDown
            className="h-4 w-4 transition group-open:rotate-180"
            aria-hidden="true"
          />
        </summary>
        <div className="border-t border-[#18121f]/10 p-3">
          <div className="grid gap-2 sm:grid-cols-2">
            {QUICK_CAPTURE_RULES.map((rule) => (
              <div
                key={rule.label}
                className="rounded-lg bg-[#18121f] p-2.5 text-[#fff8e9]"
              >
                <p className="text-[10px] font-black uppercase tracking-wide text-accent">
                  {rule.label}
                </p>
                <code className="mt-1 block break-words text-[11px] font-bold leading-4 text-[#fff8e9]">
                  {rule.syntax}
                </code>
                <p className="mt-1 text-[10px] leading-4 text-[#cfc4d8]">
                  {rule.explanation}
                </p>
              </div>
            ))}
          </div>
          <p className="mt-3 text-[11px] font-medium leading-5 text-[#51445d]">
            Use at most one cue of each type. Everything else stays in the task
            title. With no cues, Resolve creates a medium-priority Personal task
            in your backlog.
          </p>
        </div>
      </details>
    </section>
  );
}
