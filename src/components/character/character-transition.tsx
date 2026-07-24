"use client";

import { AnimatePresence, motion } from "framer-motion";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { CheckCircle2, Music2, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useResolve } from "@/contexts/resolve-context";
import { getCharacterTask } from "@/lib/character-tasks";
import {
  getPageTheme,
  PAGE_THEMES,
  type PageThemeKey,
} from "@/lib/page-themes";

export const CUT_IN_DURATION_MS = 2200;
const MEMBER_DETAILS: Record<
  Exclude<PageThemeKey, "ensemble">,
  { number: string; cue: string; sfx: string }
> = {
  nijika: { number: "01", cue: "Count-in", sfx: "1·2·3·4!" },
  bocchi: { number: "02", cue: "Practice room", sfx: "BZZT…" },
  ryo: { number: "03", cue: "Control room", sfx: "THRUM" },
  kita: { number: "04", cue: "Spotlight", sfx: "KIRA!" },
};

export function CharacterTransition() {
  const pathname = usePathname();
  const { tasks } = useResolve();
  const currentTheme = getPageTheme(pathname);
  const previousTheme = useRef<PageThemeKey>(currentTheme.key);
  const [activeCharacter, setActiveCharacter] = useState<
    Exclude<PageThemeKey, "ensemble"> | null
  >(null);

  useEffect(() => {
    const previous = previousTheme.current;
    previousTheme.current = currentTheme.key;

    if (
      previous === currentTheme.key ||
      currentTheme.key === "ensemble"
    ) {
      return;
    }

    const character = currentTheme.key;
    const showTimer = window.setTimeout(
      () => setActiveCharacter(character),
      0,
    );
    const hideTimer = window.setTimeout(
      () => setActiveCharacter(null),
      CUT_IN_DURATION_MS,
    );

    return () => {
      window.clearTimeout(showTimer);
      window.clearTimeout(hideTimer);
    };
  }, [currentTheme.key]);

  const theme = activeCharacter
    ? PAGE_THEMES[activeCharacter]
    : null;
  const taskContext =
    activeCharacter && theme
      ? getCharacterTask(activeCharacter, tasks)
      : null;
  const details = activeCharacter ? MEMBER_DETAILS[activeCharacter] : null;

  return (
    <AnimatePresence>
      {theme && taskContext && details && (
        <motion.aside
          key={theme.key}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className={`theme-${theme.key} fixed inset-0 z-[90] flex items-end justify-center overflow-hidden bg-[#080711]/88 p-3 backdrop-blur-md sm:items-center sm:p-6`}
          role="status"
          aria-live="polite"
          aria-label={`${theme.name} character transition`}
          onClick={() => setActiveCharacter(null)}
        >
          <motion.div
            initial={{ x: "-110%" }}
            animate={{ x: "110%" }}
            transition={{ duration: 0.35, ease: "easeOut" }}
            className="pointer-events-none absolute inset-y-0 w-1/2 -skew-x-12 bg-accent/25 blur-2xl"
          />
          <motion.div
            initial={{ y: 90, scale: 0.88, rotate: -2 }}
            animate={{ y: 0, scale: 1, rotate: 0 }}
            exit={{ y: 45, scale: 0.94, rotate: 1 }}
            transition={{ type: "spring", stiffness: 310, damping: 26 }}
            className="comic-card relative grid max-h-[calc(100dvh-1.5rem)] w-full max-w-4xl overflow-y-auto rounded-[28px] border-2 border-white/20 bg-[#100c19] shadow-[0_28px_100px_rgba(0,0,0,0.72)] sm:grid-cols-[1.04fr_0.96fr] sm:overflow-hidden"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="pointer-events-none absolute inset-0 z-10 rounded-[26px] ring-1 ring-inset ring-white/10" />
            <button
              type="button"
              onClick={() => setActiveCharacter(null)}
              className="absolute right-3 top-3 z-30 flex h-10 w-10 items-center justify-center rounded-full border-2 border-white/30 bg-[#080711]/80 text-white shadow-lg backdrop-blur transition hover:rotate-6 hover:border-accent hover:bg-accent"
              aria-label="Close character introduction"
            >
              <X className="h-4 w-4" />
            </button>

            <div className="stage-grid relative min-h-64 overflow-hidden bg-accent/10 sm:min-h-[430px]">
              <Image
                src={theme.cutInImage ?? theme.image}
                alt={theme.cutInImageAlt ?? theme.imageAlt}
                fill
                sizes="(min-width: 640px) 460px, 100vw"
                className="object-contain object-bottom p-3 drop-shadow-[0_18px_20px_rgba(0,0,0,0.45)] sm:p-6"
                priority
              />
              <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-[#100c19]/75 to-transparent" />
              <motion.span
                initial={{ scale: 2.2, rotate: -12, opacity: 0 }}
                animate={{ scale: 1, rotate: -7, opacity: 1 }}
                transition={{ delay: 0.18, type: "spring", stiffness: 260 }}
                className="font-display absolute bottom-5 left-5 z-10 text-4xl text-white [text-shadow:3px_3px_0_var(--accent),-2px_-2px_0_#18121f]"
                aria-hidden="true"
              >
                {details.sfx}
              </motion.span>
              <span className="absolute left-4 top-4 rounded-full border-2 border-[#18121f] bg-accent px-3 py-1 text-[10px] font-black uppercase tracking-[0.18em] text-[#18121f] shadow-[3px_3px_0_#18121f]">
                Member {details.number}
              </span>
            </div>

            <div className="relative flex min-h-0 flex-col justify-center overflow-hidden p-5 sm:p-8">
              <div className="pointer-events-none absolute -right-8 -top-8 font-display text-[9rem] leading-none text-white/[0.035]">
                {details.number}
              </div>
              <div className="relative">
                <p className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.24em] text-accent">
                  <Music2 className="h-3.5 w-3.5" />
                  {details.cue} · scene start
                </p>
                <h2 className="mt-3 font-display text-3xl leading-none tracking-wide sm:text-5xl">
                  {theme.status}
                </h2>
                <div className="manga-panel mt-5 -rotate-[0.5deg] rounded-2xl p-4 sm:p-5">
                  <p className="text-sm font-semibold leading-6 sm:text-base">
                    “{taskContext.dialogue}”
                  </p>
                </div>
                {taskContext.task && (
                  <div className="mt-4 flex items-center gap-2 text-xs font-bold text-muted">
                    <CheckCircle2 className="h-4 w-4 text-accent" />
                    {taskContext.related
                      ? "Matched to this member’s focus"
                      : "Reframed for this member"}
                  </div>
                )}
                <p className="mt-5 text-[9px] font-black uppercase tracking-[0.2em] text-muted/70">
                  Auto-closing · tap the backdrop or × to skip
                </p>
              </div>
            </div>

            <div className="absolute inset-x-0 bottom-0 z-20 h-1.5 bg-white/10">
              <motion.div
                initial={{ scaleX: 1 }}
                animate={{ scaleX: 0 }}
                transition={{
                  duration: CUT_IN_DURATION_MS / 1000,
                  ease: "linear",
                }}
                className="h-full origin-left bg-accent"
              />
            </div>
          </motion.div>
        </motion.aside>
      )}
    </AnimatePresence>
  );
}
