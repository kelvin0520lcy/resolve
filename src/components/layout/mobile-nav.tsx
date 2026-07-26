"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { CalendarDays, Home, ListTodo, Menu, Plus, Search, X } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { MAIN_NAV } from "@/lib/constants/navigation";
import { getPageTheme } from "@/lib/page-themes";

export function MobileNav() {
  const pathname = usePathname();
  const theme = getPageTheme(pathname);
  const [moreOpen, setMoreOpen] = useState(false);
  const primary = [
    { href: "/dashboard", label: "Home", icon: Home },
    { href: "/today", label: "Today", icon: ListTodo },
    { href: "/weekly", label: "Week", icon: CalendarDays },
  ];

  return (
    <>
      {moreOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/65 backdrop-blur-sm lg:hidden"
          onPointerDown={() => setMoreOpen(false)}
        >
          <div
            className={`theme-${theme.key} absolute inset-x-3 bottom-24 max-h-[65vh] overflow-y-auto rounded-[24px] border-2 border-border bg-[#18121f] p-3 shadow-2xl`}
            onPointerDown={(event) => event.stopPropagation()}
          >
            <div className="flex items-center justify-between px-2 pb-2">
              <p className="font-display text-xl text-white">More rooms</p>
              <button
                type="button"
                onClick={() => setMoreOpen(false)}
                className="flex h-9 w-9 items-center justify-center rounded-xl text-muted"
                aria-label="Close more navigation"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <button
              type="button"
              onClick={() => {
                setMoreOpen(false);
                window.dispatchEvent(
                  new CustomEvent("resolve:command", {
                    detail: { mode: "search" },
                  }),
                );
              }}
              className="mb-2 flex min-h-11 w-full items-center gap-3 rounded-xl border border-accent/30 bg-accent/10 px-3 text-sm font-black text-accent"
            >
              <Search className="h-4 w-4" />
              Search everything
            </button>
            <div className="grid grid-cols-2 gap-2">
              {MAIN_NAV.filter(
                (item) => !primary.some((primaryItem) => primaryItem.href === item.href),
              ).map(({ href, label, description, icon: Icon }) => (
                <Link
                  key={href}
                  href={href}
                  onClick={() => setMoreOpen(false)}
                  className="min-w-0 rounded-xl border border-border bg-surface p-3"
                >
                  <Icon className="h-4 w-4 text-accent" />
                  <span className="mt-2 block text-xs font-black">{label}</span>
                  <span className="mt-1 block text-[10px] leading-4 text-muted">
                    {description}
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}
      <nav
        className={`theme-${theme.key} fixed inset-x-3 bottom-3 z-50 mx-auto max-w-lg rounded-[22px] border-2 border-[#18121f] bg-[#18121f]/95 shadow-[0_8px_30px_rgba(0,0,0,0.55)] backdrop-blur-xl lg:hidden`}
      >
        <div className="flex items-center justify-around px-2 py-2">
        {primary.slice(0, 2).map(({ href, label, icon: Icon }) => {
          const active = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex min-w-12 flex-col items-center gap-0.5 rounded-xl border px-2 py-1.5 text-[9px] font-black uppercase tracking-wide transition",
                active
                  ? "border-warning bg-warning text-[#18121f]"
                  : "border-transparent text-muted",
              )}
            >
              <Icon className="h-5 w-5" />
              {label}
            </Link>
          );
        })}
        <button
          type="button"
          onClick={() =>
            window.dispatchEvent(
              new CustomEvent("resolve:command", {
                detail: { mode: "capture" },
              }),
            )
          }
          className="flex flex-col items-center gap-0.5 rounded-xl px-2 py-1 text-[9px] font-black uppercase tracking-wide text-accent"
        >
          <div className="sticker flex h-9 w-9 -rotate-3 items-center justify-center rounded-xl bg-accent text-white">
            <Plus className="h-4 w-4" />
          </div>
          Add
        </button>
        <Link
          href="/weekly"
          className={cn(
            "flex min-w-12 flex-col items-center gap-0.5 rounded-xl border px-2 py-1.5 text-[9px] font-black uppercase tracking-wide transition",
            pathname === "/weekly"
              ? "border-warning bg-warning text-[#18121f]"
              : "border-transparent text-muted",
          )}
        >
          <CalendarDays className="h-5 w-5" />
          Week
        </Link>
        <button
          type="button"
          onClick={() => setMoreOpen((current) => !current)}
          className={cn(
            "flex min-w-12 flex-col items-center gap-0.5 rounded-xl border px-2 py-1.5 text-[9px] font-black uppercase tracking-wide",
            moreOpen
              ? "border-warning bg-warning text-[#18121f]"
              : "border-transparent text-muted",
          )}
        >
          <Menu className="h-5 w-5" />
          More
        </button>
        </div>
      </nav>
    </>
  );
}
