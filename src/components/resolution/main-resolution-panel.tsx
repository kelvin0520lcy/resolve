"use client";

import { useState, type FormEvent } from "react";
import { Check, Edit3, Flag, Quote, Save, Sparkles } from "lucide-react";
import { ProgressBar } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { textAreaClassName } from "@/components/ui/resolve";
import type { MotivationQuote } from "@/lib/daily-motivation";

export function MainResolutionPanel({
  resolution,
  theme,
  semesterName,
  weekNumber,
  percentComplete,
  daysRemaining,
  focus,
  quote,
  onSave,
}: {
  resolution?: string;
  theme?: string;
  semesterName: string;
  weekNumber: number;
  percentComplete: number;
  daysRemaining: number;
  focus?: string;
  quote: MotivationQuote;
  onSave: (resolution: string) => void;
}) {
  const [editing, setEditing] = useState(!resolution);
  const [draft, setDraft] = useState(resolution ?? "");

  function submit(event: FormEvent) {
    event.preventDefault();
    const nextResolution = draft.trim();
    if (!nextResolution) return;
    onSave(nextResolution);
    setDraft(nextResolution);
    setEditing(false);
  }

  return (
    <section className="manga-panel speed-lines relative min-h-[360px] overflow-hidden rounded-[28px] p-5 sm:p-7">
      <div className="relative z-10 flex h-full flex-col">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.22em] text-accent">
              <Flag className="h-3.5 w-3.5" />
              Main resolution · episode{" "}
              {String(weekNumber).padStart(2, "0")}
            </p>
            <p className="mt-2 text-xs font-bold text-[#756879]">
              {semesterName}
              {theme ? ` · ${theme}` : ""}
            </p>
          </div>
          {!editing && (
            <Button
              type="button"
              size="sm"
              variant="secondary"
              onClick={() => setEditing(true)}
            >
              <Edit3 className="h-3.5 w-3.5" />
              Edit
            </Button>
          )}
        </div>

        {editing ? (
          <form onSubmit={submit} className="mt-5">
            <label className="text-xs font-black uppercase tracking-wider text-[#756879]">
              What should this semester change?
              <textarea
                className={`${textAreaClassName} mt-2 min-h-28 bg-white/80 text-base font-semibold leading-7 text-[#18121f]`}
                value={draft}
                onChange={(event) => setDraft(event.target.value)}
                autoFocus
                required
                aria-label="Main semester resolution"
              />
            </label>
            <div className="mt-3 flex flex-wrap gap-2">
              <Button type="submit" size="sm" disabled={!draft.trim()}>
                <Save className="h-3.5 w-3.5" />
                Save resolution
              </Button>
              {resolution && (
                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  onClick={() => {
                    setDraft(resolution);
                    setEditing(false);
                  }}
                >
                  Cancel
                </Button>
              )}
            </div>
          </form>
        ) : (
          <h1 className="font-display mt-6 max-w-3xl text-4xl leading-[1.02] tracking-wide text-[#18121f] sm:text-5xl">
            {resolution}
          </h1>
        )}

        <div className="mt-auto pt-6">
          {focus && (
            <div className="mb-4 flex items-start gap-2 rounded-xl border border-[#18121f]/15 bg-white/55 p-3">
              <Check className="mt-0.5 h-4 w-4 shrink-0 text-accent" />
              <p className="text-sm font-semibold text-[#4f4457]">
                <span className="font-black">Next proof:</span> {focus}
              </p>
            </div>
          )}
          <div className="mb-2 flex justify-between text-[10px] font-black uppercase tracking-wider text-[#514659]">
            <span>{percentComplete}% through the semester</span>
            <span>{daysRemaining} days left</span>
          </div>
          <ProgressBar
            value={percentComplete}
            className="border-[#18121f]/10 bg-[#18121f]/10"
          />
          <div
            className={`theme-${quote.member} mt-5 rounded-2xl border-2 border-[#18121f]/15 bg-[#100c19] p-4 text-white shadow-[4px_4px_0_#18121f]`}
          >
            <div className="flex items-center justify-between gap-3">
              <p className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.18em] text-accent">
                <Sparkles className="h-3.5 w-3.5" />
                Today · {quote.memberName}
              </p>
              <span className="text-[9px] font-black uppercase tracking-wider text-white/50">
                {quote.trait}
              </span>
            </div>
            <div className="mt-3 flex gap-3">
              <Quote className="h-5 w-5 shrink-0 text-accent" />
              <p className="text-sm font-semibold leading-6">{quote.text}</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
