"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { Command, Plus, Search, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useResolve } from "@/contexts/resolve-context";
import { parseQuickCapture } from "@/features/workspace/lib/quick-capture";
import { fieldClassName } from "@/components/ui/resolve";
import { useDialogFocus } from "@/hooks/use-dialog-focus";

type SearchRecord = {
  id: string;
  title: string;
  context: string;
  href: string;
};

export function CommandPalette() {
  const workspace = useResolve();
  const { addTask, preferences } = workspace;
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<"search" | "capture">("search");
  const [query, setQuery] = useState("");
  const [lessonRecords, setLessonRecords] = useState<SearchRecord[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const dialogRef = useDialogFocus<HTMLDivElement>(open, close);

  useEffect(() => {
    const keydown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setOpen((current) => !current);
      }
      if (event.key === "Escape") setOpen(false);
    };
    const openPalette = (event: Event) => {
      const detail = (event as CustomEvent<{ mode?: "search" | "capture" }>).detail;
      setMode(detail?.mode ?? "search");
      setOpen(true);
    };
    window.addEventListener("keydown", keydown);
    window.addEventListener("resolve:command", openPalette);
    return () => {
      window.removeEventListener("keydown", keydown);
      window.removeEventListener("resolve:command", openPalette);
    };
  }, []);

  useEffect(() => {
    if (!open) return;
    const frame = window.requestAnimationFrame(() => inputRef.current?.focus());
    if (mode === "search" && !lessonRecords.length) {
      void import("@/features/guitar-learning/data/curriculum").then(
        ({ GUITAR_LESSONS }) =>
          setLessonRecords(
            GUITAR_LESSONS.map((lesson) => ({
              id: `lesson:${lesson.id}`,
              title: lesson.title,
              context: "Guitar lesson",
              href: `/guitar?mode=learn&lesson=${encodeURIComponent(lesson.id)}`,
            })),
          ),
      );
    }
    return () => window.cancelAnimationFrame(frame);
  }, [lessonRecords.length, mode, open]);

  const records = useMemo<SearchRecord[]>(
    () => [
      ...workspace.tasks.map((task) => ({
        id: `task:${task.id}`,
        title: task.title,
        context: "Task",
        href: `/today?task=${encodeURIComponent(task.id)}`,
      })),
      ...workspace.goals.map((goal) => ({
        id: `goal:${goal.id}`,
        title: goal.title,
        context: "Goal",
        href: `/goals?goal=${encodeURIComponent(goal.id)}`,
      })),
      ...workspace.modules.flatMap((module) => [
        {
          id: `module:${module.id}`,
          title: `${module.code} ${module.name}`,
          context: "Module",
          href: `/academics?module=${encodeURIComponent(module.id)}`,
        },
        ...module.assessments.map((assessment) => ({
          id: `assessment:${assessment.id}`,
          title: assessment.title,
          context: `${module.code} assessment`,
          href: `/academics?assessment=${encodeURIComponent(assessment.id)}`,
        })),
      ]),
      ...workspace.events.map((event) => ({
        id: `event:${event.id}`,
        title: event.title,
        context: "Fixed event",
        href: `/weekly?event=${encodeURIComponent(event.id)}`,
      })),
      ...(workspace.habits ?? []).map((habit) => ({
        id: `habit:${habit.id}`,
        title: habit.title,
        context: "Habit",
        href: `/habits?habit=${encodeURIComponent(habit.id)}`,
      })),
      ...(workspace.reflections ?? []).map((reflection) => ({
        id: `reflection:${reflection.id}`,
        title:
          reflection.wins?.trim() ||
          `${reflection.type} reflection · ${reflection.periodStart}`,
        context: "Reflection",
        href: `/reflections?reflection=${encodeURIComponent(reflection.id)}`,
      })),
      ...(workspace.applications ?? []).map((application) => ({
        id: `application:${application.id}`,
        title: `${application.company} · ${application.role}`,
        context: "Application",
        href: `/career?application=${encodeURIComponent(application.id)}`,
      })),
      ...(workspace.algorithmLogs ?? []).map((log) => ({
        id: `algorithm:${log.id}`,
        title: log.problemName,
        context: `${log.platform} practice`,
        href: `/career?algorithm=${encodeURIComponent(log.id)}`,
      })),
      ...(workspace.guitarSessions ?? []).map((session) => ({
        id: `guitar-session:${session.id}`,
        title: session.song || session.exercise || `${session.category} practice`,
        context: "Guitar practice",
        href: `/guitar?session=${encodeURIComponent(session.id)}`,
      })),
      ...lessonRecords,
    ],
    [
      lessonRecords,
      workspace.events,
      workspace.goals,
      workspace.habits,
      workspace.reflections,
      workspace.applications,
      workspace.algorithmLogs,
      workspace.guitarSessions,
      workspace.modules,
      workspace.tasks,
    ],
  );
  const searchResults = query.trim()
    ? records
        .filter((record) =>
          `${record.title} ${record.context}`
            .toLocaleLowerCase()
            .includes(query.trim().toLocaleLowerCase()),
        )
        .slice(0, 12)
    : records.slice(0, 8);
  const capture = parseQuickCapture(query, preferences.timeZone);

  function close() {
    setOpen(false);
    setQuery("");
  }

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[75] flex items-start justify-center bg-black/70 p-3 pt-[8vh] backdrop-blur-sm"
      onPointerDown={(event) => {
        if (event.target === event.currentTarget) close();
      }}
      role="dialog"
      aria-modal="true"
      aria-label="Search and quick capture"
    >
      <div
        ref={dialogRef}
        className="manga-panel w-full max-w-2xl overflow-hidden rounded-[26px]"
      >
        <div className="flex items-center gap-2 border-b border-border p-3">
          <Command className="h-5 w-5 text-accent" />
          <input
            ref={inputRef}
            className="min-w-0 flex-1 bg-transparent px-2 py-2 text-base font-bold outline-none"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            aria-label={mode === "search" ? "Search workspace" : "Describe a task"}
          />
          <Button size="icon" variant="ghost" onClick={close} aria-label="Close">
            <X className="h-4 w-4" />
          </Button>
        </div>
        <div className="flex gap-2 border-b border-border px-3 py-2">
          <Button
            size="sm"
            variant={mode === "search" ? "default" : "ghost"}
            onClick={() => setMode("search")}
          >
            <Search className="h-3.5 w-3.5" />
            Search
          </Button>
          <Button
            size="sm"
            variant={mode === "capture" ? "default" : "ghost"}
            onClick={() => setMode("capture")}
          >
            <Plus className="h-3.5 w-3.5" />
            Quick capture
          </Button>
        </div>
        <div className="max-h-[65vh] overflow-y-auto p-3">
          {mode === "search" ? (
            <div className="space-y-1">
              {searchResults.map((record) => (
                <Link
                  key={record.id}
                  href={record.href}
                  onClick={() => {
                    window.dispatchEvent(
                      new CustomEvent("resolve:open-record", {
                        detail: { href: record.href },
                      }),
                    );
                    close();
                  }}
                  className="flex items-center justify-between gap-4 rounded-xl px-3 py-3 transition hover:bg-accent/10"
                >
                  <span className="min-w-0 break-words text-sm font-bold">
                    {record.title}
                  </span>
                  <span className="shrink-0 text-[10px] font-black uppercase tracking-wider text-muted">
                    {record.context}
                  </span>
                </Link>
              ))}
              {!searchResults.length && (
                <p className="py-8 text-center text-sm text-muted">
                  No matching tasks, goals, modules, events, or lessons.
                </p>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              <p className="text-xs leading-5 text-muted">
                Try: “Review calculus tomorrow 45m high priority #academics”.
                Resolve previews every rule before creating anything.
              </p>
              <label className="text-xs font-black uppercase tracking-wider text-muted">
                Task title
                <input
                  className={`${fieldClassName} mt-2`}
                  value={capture.title}
                  readOnly
                />
              </label>
              <div className="rounded-2xl border border-border bg-surface p-4">
                <p className="text-[10px] font-black uppercase tracking-wider text-accent">
                  Understood
                </p>
                <p className="mt-2 text-sm leading-6">
                  {capture.understood.length
                    ? capture.understood.join(" · ")
                    : "Backlog task · medium priority · personal"}
                </p>
              </div>
              <Button
                disabled={!capture.valid}
                onClick={() => {
                  addTask(capture.task);
                  close();
                }}
              >
                Create this task
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
