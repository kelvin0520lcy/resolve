"use client";

import { useMemo, useState } from "react";
import { BookOpenText, Headphones, Search, Volume2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  GUITAR_GLOSSARY_ENTRIES,
  GUITAR_GLOSSARY_SEARCH_ALIASES,
  getGuitarGlossaryEntry,
} from "@/features/guitar-learning/data/glossary";
import { guitarAudioEngine } from "@/features/guitar-learning/lib/audio-engine";
import type { GlossaryTermId } from "@/features/guitar-learning/types";

export function GlossaryTerm({
  termId,
  showTechnicalName = true,
}: {
  termId: GlossaryTermId;
  showTechnicalName?: boolean;
}) {
  const entry = getGuitarGlossaryEntry(termId);
  if (!entry) return null;
  return (
    <details className="group rounded-xl border border-border bg-surface">
      <summary className="cursor-pointer list-none px-3 py-2 text-left text-xs font-black text-accent">
        {showTechnicalName ? entry.term : entry.plainEnglish}
        <span className="ml-2 font-medium text-muted group-open:hidden">
          Tap for a plain-English definition
        </span>
      </summary>
      <div className="border-t border-border p-3 text-xs leading-5">
        <p className="font-bold">{entry.plainEnglish}</p>
        <p className="mt-2 text-muted">{entry.analogy}</p>
        <p className="mt-2">
          <strong>On guitar:</strong> {entry.guitarExample}
        </p>
        <p className="mt-2">
          <strong>Why it matters:</strong> {entry.whyItMatters}
        </p>
        {entry.audioExample && (
          <Button
            type="button"
            size="sm"
            variant="secondary"
            className="mt-3"
            onClick={() => void guitarAudioEngine.play(entry.audioExample!)}
          >
            <Volume2 className="h-3.5 w-3.5" />
            Hear the example
          </Button>
        )}
      </div>
    </details>
  );
}

export function LessonGlossary({
  introduced,
  assumed,
}: {
  introduced: GlossaryTermId[];
  assumed: GlossaryTermId[];
}) {
  if (!introduced.length && !assumed.length) return null;
  return (
    <section
      className="rounded-2xl border-2 border-cyan/25 bg-cyan/5 p-4"
      aria-labelledby="lesson-language-title"
    >
      <div className="flex items-center gap-2">
        <BookOpenText className="h-4 w-4 text-cyan" aria-hidden="true" />
        <h3 id="lesson-language-title" className="text-xs font-black uppercase tracking-wide">
          Words used in this lesson
        </h3>
      </div>
      {introduced.length > 0 && (
        <>
          <p className="mt-3 text-xs font-black uppercase tracking-wide text-cyan">
            New today · plain English first
          </p>
          <div className="mt-2 grid gap-2 md:grid-cols-2">
            {introduced.map((termId) => (
              <GlossaryTerm key={termId} termId={termId} />
            ))}
          </div>
        </>
      )}
      {assumed.length > 0 && (
        <details className="mt-3">
          <summary className="cursor-pointer text-xs font-bold text-muted">
            Review {assumed.length} familiar term{assumed.length === 1 ? "" : "s"}
          </summary>
          <div className="mt-2 grid gap-2 md:grid-cols-2">
            {assumed.map((termId) => (
              <GlossaryTerm key={termId} termId={termId} />
            ))}
          </div>
        </details>
      )}
    </section>
  );
}

export function GuitarGlossarySearch() {
  const [query, setQuery] = useState("");
  const results = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) return GUITAR_GLOSSARY_ENTRIES.slice(0, 6);
    return GUITAR_GLOSSARY_ENTRIES.filter((entry) =>
      [
        entry.term,
        entry.plainEnglish,
        entry.guitarExample,
        entry.alternativeExplanation,
        GUITAR_GLOSSARY_SEARCH_ALIASES[entry.id] ?? "",
      ]
        .join(" ")
        .toLowerCase()
        .includes(normalized),
    ).slice(0, 8);
  }, [query]);

  return (
    <section className="rounded-2xl border-2 border-border bg-surface p-4">
      <div className="flex items-center gap-2">
        <Headphones className="h-4 w-4 text-accent" aria-hidden="true" />
        <h3 className="font-black">Guitar words, explained plainly</h3>
      </div>
      <label className="relative mt-3 block">
        <span className="sr-only">Search guitar glossary</span>
        <Search className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-muted" />
        <input
          className="h-10 w-full rounded-xl border-2 border-border bg-surface-muted pl-9 pr-3 text-sm text-foreground outline-none focus:border-accent"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Try pulse, home note, rest, or motif"
        />
      </label>
      <div className="mt-3 grid gap-2 md:grid-cols-2">
        {results.map((entry) => (
          <GlossaryTerm key={entry.id} termId={entry.id} />
        ))}
      </div>
      {results.length === 0 && (
        <p className="mt-3 text-xs text-muted">
          No exact match yet. Try a shorter word or open Practice Troubleshooter.
        </p>
      )}
    </section>
  );
}
