"use client";

import { useState, type FormEvent } from "react";
import {
  Check,
  Edit3,
  Flag,
  Plus,
  Quote,
  Save,
  Sparkles,
} from "lucide-react";
import { ProgressBar } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ConfirmDeleteButton } from "@/components/ui/confirm-delete-button";
import { textAreaClassName } from "@/components/ui/resolve";
import type { MotivationQuote } from "@/lib/daily-motivation";
import type { SemesterResolution } from "@/types";

type ResolutionEditor = "new" | string | null;

export function MainResolutionPanel({
  resolutions,
  theme,
  semesterName,
  weekNumber,
  percentComplete,
  daysRemaining,
  focus,
  quote,
  onAdd,
  onUpdate,
  onToggle,
  onRemove,
}: {
  resolutions: SemesterResolution[];
  theme?: string;
  semesterName: string;
  weekNumber: number;
  percentComplete: number;
  daysRemaining: number;
  focus?: string;
  quote: MotivationQuote;
  onAdd: (resolution: { title: string }) => void;
  onUpdate: (resolutionId: string, resolution: { title: string }) => void;
  onToggle: (resolutionId: string) => void;
  onRemove: (resolutionId: string) => void;
}) {
  const [editor, setEditor] = useState<ResolutionEditor>(null);
  const [draft, setDraft] = useState("");
  const completedCount = resolutions.filter(
    (resolution) => resolution.completed,
  ).length;
  const editorOpen = editor !== null || resolutions.length === 0;

  function startAdding() {
    setEditor("new");
    setDraft("");
  }

  function startEditing(resolution: SemesterResolution) {
    setEditor(resolution.id);
    setDraft(resolution.title);
  }

  function closeEditor() {
    setEditor(null);
    setDraft("");
  }

  function submit(event: FormEvent) {
    event.preventDefault();
    const title = draft.trim();
    if (!title) return;

    if (editor && editor !== "new") {
      onUpdate(editor, { title });
    } else {
      onAdd({ title });
    }
    closeEditor();
  }

  function removeResolution(resolutionId: string) {
    if (editor === resolutionId) closeEditor();
    if (resolutions.length === 1) setDraft("");
    onRemove(resolutionId);
  }

  return (
    <section className="manga-panel speed-lines relative min-h-[360px] overflow-hidden rounded-[28px] p-5 sm:p-7">
      <div className="relative z-10 flex h-full flex-col">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.22em] text-accent">
              <Flag className="h-3.5 w-3.5" />
              Semester resolutions · episode{" "}
              {String(weekNumber).padStart(2, "0")}
            </p>
            <p className="mt-2 text-xs font-bold text-[#756879]">
              {semesterName}
              {theme ? ` · ${theme}` : ""}
            </p>
          </div>
          {!editorOpen && (
            <Button
              type="button"
              size="sm"
              variant="secondary"
              onClick={startAdding}
            >
              <Plus className="h-3.5 w-3.5" />
              Add resolution
            </Button>
          )}
        </div>

        <div className="mt-5 flex flex-wrap items-end justify-between gap-2">
          <h1 className="font-display text-4xl leading-none tracking-wide text-[#18121f] sm:text-5xl">
            Your semester promises
          </h1>
          {resolutions.length > 0 && (
            <p className="rounded-full border border-[#18121f]/15 bg-white/55 px-3 py-1 text-[10px] font-black uppercase tracking-wider text-[#514659]">
              {completedCount}/{resolutions.length} complete
            </p>
          )}
        </div>

        {resolutions.length > 0 && (
          <ol className="mt-5 space-y-2">
            {resolutions.map((resolution, index) => (
              <li
                key={resolution.id}
                className={`grid grid-cols-[2.25rem_minmax(0,1fr)] items-start gap-x-3 gap-y-2 rounded-2xl border-2 p-3 transition sm:grid-cols-[2.25rem_minmax(0,1fr)_auto] sm:items-center ${
                  resolution.completed
                    ? "border-success/35 bg-success/10"
                    : "border-[#18121f]/15 bg-white/60"
                }`}
              >
                <button
                  type="button"
                  onClick={() => onToggle(resolution.id)}
                  className={`flex h-9 w-9 items-center justify-center rounded-xl border-2 transition ${
                    resolution.completed
                      ? "border-success bg-success text-white"
                      : "border-[#18121f]/20 bg-white/70 text-[#756879] hover:border-accent hover:text-accent"
                  }`}
                  aria-label={
                    resolution.completed
                      ? `Reopen resolution ${resolution.title}`
                      : `Complete resolution ${resolution.title}`
                  }
                >
                  {resolution.completed ? (
                    <Check className="h-4 w-4" />
                  ) : (
                    <span className="font-mono text-xs font-black">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                  )}
                </button>
                <div className="min-w-0">
                  <p className="text-[9px] font-black uppercase tracking-[0.16em] text-[#756879]">
                    Resolution {String(index + 1).padStart(2, "0")}
                  </p>
                  <p
                    className={`mt-0.5 break-words text-sm font-black leading-6 text-[#18121f] [overflow-wrap:anywhere] ${
                      resolution.completed ? "opacity-60 line-through" : ""
                    }`}
                  >
                    {resolution.title}
                  </p>
                </div>
                <div className="col-start-2 row-start-2 flex flex-wrap items-center gap-1 sm:col-start-3 sm:row-start-1 sm:justify-end">
                  <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    onClick={() => startEditing(resolution)}
                    aria-label={`Edit resolution ${resolution.title}`}
                  >
                    <Edit3 className="h-3.5 w-3.5" />
                    Edit
                  </Button>
                  <ConfirmDeleteButton
                    itemLabel={`resolution ${resolution.title}`}
                    onConfirm={() => removeResolution(resolution.id)}
                  />
                </div>
              </li>
            ))}
          </ol>
        )}

        {editorOpen && (
          <form
            onSubmit={submit}
            className="mt-5 rounded-2xl border-2 border-[#18121f]/15 bg-white/60 p-4"
          >
            <label className="text-xs font-black uppercase tracking-wider text-[#756879]">
              {editor && editor !== "new"
                ? "Update this resolution"
                : "What should this semester change?"}
              <textarea
                className={`${textAreaClassName} mt-2 min-h-24 bg-white/80 text-base font-semibold leading-7 text-[#18121f]`}
                value={draft}
                onChange={(event) => setDraft(event.target.value)}
                autoFocus
                required
                aria-label={
                  editor && editor !== "new"
                    ? "Edit semester resolution"
                    : "New semester resolution"
                }
              />
            </label>
            <div className="mt-3 flex flex-wrap gap-2">
              <Button type="submit" size="sm" disabled={!draft.trim()}>
                <Save className="h-3.5 w-3.5" />
                {editor && editor !== "new"
                  ? "Save resolution changes"
                  : "Add resolution"}
              </Button>
              {resolutions.length > 0 && (
                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  onClick={closeEditor}
                >
                  Cancel
                </Button>
              )}
            </div>
          </form>
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
