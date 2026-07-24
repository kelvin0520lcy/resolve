"use client";

import Image from "next/image";
import Link from "next/link";
import { ChevronRight, Radio, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { NAV_ARCS, getNavArc } from "@/lib/constants/navigation";
import { PAGE_THEMES } from "@/lib/page-themes";

export function CharacterArcBar({ pathname }: { pathname: string }) {
  const currentArc = getNavArc(pathname);

  if (!currentArc) {
    return (
      <section
        className="arc-switcher comic-card mb-6 w-full max-w-full rounded-2xl border-2 border-border bg-surface/92 p-3"
        aria-label="Character arcs"
      >
        <div className="mb-2 flex items-center gap-2 px-1">
          <Radio className="h-3.5 w-3.5 text-accent" />
          <p className="text-[9px] font-black uppercase tracking-[0.2em] text-muted">
            Choose the next character arc
          </p>
        </div>
        <div className="grid grid-cols-2 gap-2 xl:grid-cols-4">
          {NAV_ARCS.map((arc) => {
            const arcTheme = PAGE_THEMES[arc.key];
            return (
              <Link
                key={arc.key}
                href={arc.items[0].href}
                className={`theme-${arc.key} group flex min-w-0 items-center gap-2 rounded-xl border border-border bg-surface-elevated p-2 transition hover:-translate-y-0.5 hover:border-accent`}
              >
                <span className="relative h-10 w-10 shrink-0 overflow-hidden rounded-lg border-2 border-accent/45">
                  <Image
                    src={arcTheme.image}
                    alt=""
                    fill
                    sizes="40px"
                    className="object-cover object-top transition group-hover:scale-110"
                  />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-[8px] font-black uppercase tracking-wider text-accent">
                    {arc.chapter}
                  </span>
                  <span className="block truncate text-xs font-black">
                    {arcTheme.name}
                  </span>
                </span>
                <ChevronRight className="h-3.5 w-3.5 text-muted" />
              </Link>
            );
          })}
        </div>
      </section>
    );
  }

  const theme = PAGE_THEMES[currentArc.key];

  return (
    <section
      className="arc-strip comic-card mb-6 w-full max-w-full overflow-hidden rounded-2xl border-2 border-border bg-surface/92"
      aria-label={`${theme.name} character arc`}
    >
      <div className="flex min-w-0 flex-col items-stretch sm:min-w-max sm:flex-row xl:min-w-0">
        <div className="flex min-w-0 items-center gap-3 border-b-2 border-border bg-surface-elevated px-3 py-2.5 sm:min-w-56 sm:border-b-0 sm:border-r-2">
          <div className="relative h-11 w-11 shrink-0 overflow-hidden rounded-xl border-2 border-accent bg-surface">
            <Image
              src={theme.image}
              alt=""
              fill
              sizes="44px"
              className="object-cover object-top"
            />
          </div>
          <div>
            <p className="text-[8px] font-black uppercase tracking-[0.18em] text-accent">
              {currentArc.chapter} · character route
            </p>
            <p className="text-sm font-black">{currentArc.title}</p>
          </div>
        </div>

        <nav
          className="grid w-full grid-flow-col auto-cols-fr items-center gap-1 px-2 py-2 sm:flex sm:w-auto sm:py-0"
          aria-label="Pages in this arc"
        >
          {currentArc.items.map(({ href, label, icon: Icon }, index) => {
            const active =
              pathname === href || pathname.startsWith(`${href}/`);
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  "flex min-w-0 items-center justify-center gap-1.5 rounded-xl border px-2 py-2 text-[10px] font-black transition sm:gap-2 sm:px-3 sm:text-xs",
                  active
                    ? "border-accent bg-accent text-white shadow-[2px_2px_0_var(--ink)]"
                    : "border-transparent text-muted hover:border-border hover:text-foreground",
                )}
              >
                <span className="font-mono text-[8px] opacity-65">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <Icon className="h-3.5 w-3.5" />
                {label}
                {active && <Sparkles className="h-3 w-3" />}
              </Link>
            );
          })}
        </nav>
      </div>
    </section>
  );
}
