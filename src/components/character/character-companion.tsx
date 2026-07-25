"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { Music2, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { getPageTheme } from "@/lib/page-themes";
import type { CharacterState } from "@/types";

const EXPRESSION_LABEL: Record<CharacterState["expression"], string> = {
  neutral: "Ready-ish",
  happy: "Tiny victory!",
  proud: "Actually proud",
  excited: "Maximum volume",
  nervous: "Internal screaming",
  tired: "Low battery",
  overwhelmed: "Too many tabs",
  concerned: "We need a plan",
  encouraging: "One more try",
  celebrating: "Encore!",
};

type CharacterCompanionProps = {
  state: CharacterState;
  compact?: boolean;
  className?: string;
};

export function CharacterCompanion({
  state,
  compact = false,
  className,
}: CharacterCompanionProps) {
  const theme = getPageTheme(usePathname());

  if (compact) {
    return (
      <motion.div
        initial={{ opacity: 0, rotate: -1.5 }}
        animate={{ opacity: 1, rotate: 0 }}
        className={cn(
          "comic-card relative overflow-hidden rounded-[22px] border-2 border-border bg-surface-elevated p-4",
          className,
        )}
      >
        <div className="flex items-start gap-4">
          <motion.div
            key={state.expression}
            initial={{ scale: 0.82, rotate: -6 }}
            animate={{ scale: 1, rotate: -2 }}
            transition={{ type: "spring", stiffness: 280, damping: 18 }}
            className="sticker relative h-20 w-20 shrink-0 overflow-hidden rounded-2xl bg-accent"
            aria-label={`Character expression: ${state.expression}`}
          >
            <Image
              src={theme.image}
              alt={theme.imageAlt}
              fill
              sizes="80px"
              className="object-cover"
            />
          </motion.div>
          <div className="min-w-0 flex-1">
            <div className="mb-2 flex flex-wrap items-center gap-2">
              <span className="tape-label px-2 py-0.5 text-[9px] font-black uppercase tracking-wider">
                {EXPRESSION_LABEL[state.expression]}
              </span>
              <span className="text-[9px] font-black uppercase tracking-widest text-accent">
                {theme.name} cut-in
              </span>
            </div>
            <motion.p
              key={state.dialogue}
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-sm font-medium leading-6"
            >
              “{state.dialogue}”
            </motion.p>
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.section
      initial={{ opacity: 0, scale: 0.985 }}
      animate={{ opacity: 1, scale: 1 }}
      className={cn(
        "comic-card speed-lines group relative min-h-[340px] overflow-hidden rounded-[26px] border-2 border-border bg-[#100c19]",
        className,
      )}
    >
      <Image
        src="/illustrations/kessoku-intermission-v4.png"
        alt="Kessoku Band rehearsing while Bocchi comically lags"
        fill
        sizes="(min-width: 1024px) 70vw, 100vw"
        className="object-cover object-center transition duration-1000 group-hover:scale-[1.025]"
        priority
      />
      <div className="absolute inset-0 bg-gradient-to-r from-[#080711] via-[#080711]/75 to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-t from-[#080711]/65 via-transparent to-transparent" />

      <div className="relative z-10 flex min-h-[340px] max-w-xl flex-col justify-between p-5 sm:p-7">
        <div className="flex items-center justify-between gap-3">
          <span className="tape-label inline-flex items-center gap-2 px-3 py-1 text-[10px] font-black uppercase tracking-[0.16em]">
            <Music2 className="h-3.5 w-3.5" />
            {state.scene.replace("-", " ")} session
          </span>
          <span className="float-note hidden rotate-6 rounded-full border-2 border-accent/60 bg-[#18121f]/75 p-2 text-accent backdrop-blur sm:block">
            <Sparkles className="h-5 w-5" />
          </span>
        </div>

        <div className="max-w-md">
          <p className="mb-2 text-[10px] font-black uppercase tracking-[0.25em] text-accent">
            Kessoku live commentary · {EXPRESSION_LABEL[state.expression]}
          </p>
          <motion.div
            key={state.dialogue}
            initial={{ opacity: 0, x: -14 }}
            animate={{ opacity: 1, x: 0 }}
            className="manga-panel rotate-[-0.6deg] rounded-2xl p-4 sm:p-5"
          >
            <p className="font-display text-xl leading-tight tracking-wide sm:text-2xl">
              “{state.dialogue}”
            </p>
            <div className="mt-3 flex items-center gap-2 text-[9px] font-black uppercase tracking-[0.18em] text-[#6d5d72]">
              <span className="h-px w-8 bg-[#18121f]/30" />
              Four personalities, one chaotic semester
            </div>
          </motion.div>
        </div>
      </div>
    </motion.section>
  );
}
