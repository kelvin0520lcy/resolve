"use client";

import {
  BookOpen,
  Compass,
  LayoutDashboard,
  Map,
} from "lucide-react";

export type GuitarStudioMode =
  | "overview"
  | "learn"
  | "explore"
  | "learning-map";

const MODES: Array<{
  id: GuitarStudioMode;
  label: string;
  shortDescription: string;
  icon: typeof Map;
}> = [
  {
    id: "overview",
    label: "Overview",
    shortDescription: "Practice evidence",
    icon: LayoutDashboard,
  },
  {
    id: "learn",
    label: "Learn",
    shortDescription: "Guided lessons",
    icon: BookOpen,
  },
  {
    id: "explore",
    label: "Explore",
    shortDescription: "Interactive tools",
    icon: Compass,
  },
  {
    id: "learning-map",
    label: "Learning Map",
    shortDescription: "Prerequisite paths",
    icon: Map,
  },
];

export function GuitarStudioNav({
  mode,
  onChange,
}: {
  mode: GuitarStudioMode;
  onChange: (mode: GuitarStudioMode) => void;
}) {
  return (
    <nav
      className="arc-strip rounded-[20px] border-2 border-border bg-surface-elevated p-2"
      aria-label="Guitar Studio sections"
    >
      <div
        role="tablist"
        aria-label="Guitar Studio modes"
        className="grid grid-cols-2 gap-2 sm:min-w-[38rem] sm:grid-cols-4"
      >
        {MODES.map((item) => {
          const Icon = item.icon;
          const active = mode === item.id;
          return (
            <button
              key={item.id}
              type="button"
              role="tab"
              aria-label={item.label}
              aria-selected={active}
              aria-controls={`guitar-${item.id}-panel`}
              onClick={() => onChange(item.id)}
              className={`flex min-h-14 items-center gap-3 rounded-xl border-2 px-3 py-2 text-left transition ${
                active
                  ? "border-accent bg-accent/15 text-accent shadow-[3px_3px_0_rgba(0,0,0,0.3)]"
                  : "border-transparent bg-surface hover:border-border"
              }`}
            >
              <Icon className="h-4 w-4 shrink-0" />
              <span>
                <span className="block text-xs font-black uppercase tracking-wide">
                  {item.label}
                </span>
                <span className="mt-0.5 block text-[10px] font-bold text-muted">
                  {item.shortDescription}
                </span>
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
