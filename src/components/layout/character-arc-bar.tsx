"use client";

import Image from "next/image";
import Link from "next/link";
import { Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { getNavArc } from "@/lib/constants/navigation";
import { PAGE_THEMES } from "@/lib/page-themes";

export function CharacterArcBar({ pathname }: { pathname: string }) {
  const currentArc = getNavArc(pathname);

  if (!currentArc) {
    return null;
  }

  const theme = PAGE_THEMES[currentArc.key];

  return (
    <section
      className="arc-strip comic-card mb-6 w-full max-w-full overflow-hidden rounded-2xl border-2 border-border bg-surface/92"
      aria-label={`${theme.nameEn} character arc`}
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
          <div className="min-w-0">
            <p className="text-[8px] font-black uppercase tracking-[0.18em] text-accent">
              {currentArc.chapter} · character route
            </p>
            <p className="truncate text-sm font-black" lang="ja">
              {currentArc.title}
            </p>
            <p className="truncate text-[9px] font-semibold text-muted">
              {currentArc.titleEn}
            </p>
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
