"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Disc3, Radio, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  DASHBOARD_NAV,
  NAV_ARCS,
  SETTINGS_NAV,
  getNavArc,
} from "@/lib/constants/navigation";
import { getPageTheme, PAGE_THEMES } from "@/lib/page-themes";

export function Sidebar() {
  const pathname = usePathname();
  const theme = getPageTheme(pathname);
  const activeArc = getNavArc(pathname);

  return (
    <aside
      className={`theme-${theme.key} stage-grid sticky top-0 hidden h-screen w-[278px] shrink-0 flex-col overflow-hidden border-r-2 border-border bg-[#0f0c16] lg:flex`}
    >
      <div className="relative border-b-2 border-border px-5 py-5">
        <div className="absolute right-4 top-4 h-12 w-12 rotate-6 rounded-full border-4 border-accent/25">
          <div className="absolute inset-3 rounded-full bg-accent/30" />
        </div>
        <Link href="/dashboard" className="group relative block">
          <div className="mb-2 flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.25em] text-warning">
            <Radio className="h-3 w-3" />
            Semester live house
          </div>
          <h1 className="font-display text-4xl leading-none tracking-wider text-white transition group-hover:text-accent">
            RESOLVE<span className="text-accent">!</span>
          </h1>
          <p className="mt-2 max-w-[190px] text-[11px] leading-4 text-muted">
            Turn the quiet practice days into your loudest semester.
          </p>
        </Link>
      </div>

      <nav className="flex-1 space-y-3 overflow-y-auto px-3 py-4">
        <section
          className="rounded-2xl border border-border/60 bg-black/10 p-1.5"
          aria-label="Common pages"
        >
          <p className="px-2 pb-1 pt-0.5 text-[8px] font-black uppercase tracking-[0.18em] text-muted">
            Common · whole band
          </p>
          {[DASHBOARD_NAV, SETTINGS_NAV].map(
            ({ href, label, description, icon: Icon }) => {
              const active = pathname === href;
              return (
                <Link
                  key={href}
                  href={href}
                  title={description}
                  className={cn(
                    "group flex items-center gap-3 rounded-xl border px-3 py-2 text-sm font-bold transition-all",
                    active
                      ? "border-[#18121f] bg-warning text-[#18121f] shadow-[3px_3px_0_var(--accent)]"
                      : "border-transparent text-muted hover:bg-surface-muted hover:text-foreground",
                  )}
                >
                  <Icon className="h-4 w-4" />
                  <span className="flex-1">{label}</span>
                  {active && <Sparkles className="h-3.5 w-3.5" />}
                </Link>
              );
            },
          )}
        </section>

        {NAV_ARCS.map((arc) => {
          const arcTheme = PAGE_THEMES[arc.key];
          const arcActive = activeArc?.key === arc.key;
          return (
            <section
              key={arc.key}
              className={`theme-${arc.key} nav-arc rounded-2xl border p-1.5 ${
                arcActive
                  ? "border-accent/55 bg-accent/8"
                  : "border-border/60 bg-black/10"
              }`}
              aria-label={arc.title}
            >
              <Link
                href={arc.items[0].href}
                className="mb-1.5 flex items-center gap-2 rounded-xl px-1.5 py-1 transition hover:bg-surface-muted"
                aria-label={`Open ${arc.title}`}
              >
                <div className="relative h-9 w-9 shrink-0 overflow-hidden rounded-lg border border-accent/50 bg-surface">
                  <Image
                    src={arcTheme.image}
                    alt=""
                    fill
                    sizes="36px"
                    className="object-cover object-top"
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[9px] font-black uppercase tracking-[0.14em] text-accent">
                    {arc.chapter} · {arcTheme.name}
                  </p>
                  <p className="truncate text-[10px] font-bold text-foreground/85">
                    {arc.subtitle}
                  </p>
                </div>
              </Link>

              {arcActive && <div className="space-y-0.5">
                {arc.items.map(({ href, label, icon: Icon }, index) => {
                  const active =
                    pathname === href || pathname.startsWith(`${href}/`);
                  return (
                    <Link
                      key={href}
                      href={href}
                      className={cn(
                        "group flex items-center gap-2 rounded-lg border px-2 py-1.5 text-xs font-bold transition-all",
                        active
                          ? "border-[#18121f] bg-warning text-[#18121f] shadow-[3px_3px_0_var(--accent)]"
                          : "border-transparent text-muted hover:bg-surface-muted hover:text-foreground",
                      )}
                    >
                      <span className="w-4 font-mono text-[8px] font-black opacity-55">
                        {index + 1}
                      </span>
                      <Icon className="h-3.5 w-3.5 shrink-0 transition group-hover:rotate-6" />
                      <span className="flex-1">{label}</span>
                      {active && <Sparkles className="h-3 w-3" />}
                    </Link>
                  );
                })}
              </div>}
            </section>
          );
        })}
      </nav>

      <div className="m-3 rounded-2xl border-2 border-border bg-surface p-3">
        <div className="flex items-center gap-3">
          <div className="relative flex h-10 w-10 items-center justify-center rounded-full border-2 border-accent bg-[#18121f] text-accent">
            <Disc3 className="h-5 w-5 animate-spin [animation-duration:4s]" />
          </div>
          <div>
            <p className="text-[9px] font-black uppercase tracking-widest text-accent">
              {theme.name} mode
            </p>
            <p className="text-xs font-bold">{theme.status}</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
