"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import type { CharacterState } from "@/types";

const EXPRESSION_EMOJI: Record<CharacterState["expression"], string> = {
  neutral: "🎸",
  happy: "✨",
  proud: "🌟",
  excited: "🎉",
  nervous: "😰",
  tired: "😴",
  overwhelmed: "😵",
  concerned: "🤔",
  encouraging: "💪",
  celebrating: "🎊",
};

const SCENE_GRADIENT: Record<string, string> = {
  classroom: "from-sky-100 to-blue-50",
  "practice-room": "from-pink-100 to-rose-50",
  backstage: "from-violet-100 to-purple-50",
  bedroom: "from-amber-50 to-orange-50",
  outdoor: "from-green-100 to-emerald-50",
  neutral: "from-lavender-100 to-indigo-50",
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
  const gradient = SCENE_GRADIENT[state.scene] ?? SCENE_GRADIENT.neutral;

  return (
    <div className={cn("relative overflow-hidden rounded-2xl", className)}>
      <div
        className={cn(
          "bg-gradient-to-br p-5",
          gradient,
          compact ? "pb-4" : "pb-6",
        )}
      >
        <div className="flex items-start gap-4">
          <motion.div
            key={state.expression}
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
            className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-white/80 text-3xl shadow-md backdrop-blur-sm"
            aria-label={`Character expression: ${state.expression}`}
          >
            {EXPRESSION_EMOJI[state.expression]}
          </motion.div>

          <div className="min-w-0 flex-1">
            <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-accent">
              Resolve! Companion
            </p>
            <div className="relative rounded-2xl rounded-tl-sm bg-white/90 px-4 py-3 shadow-sm backdrop-blur-sm">
              <div className="absolute -left-2 top-4 h-0 w-0 border-y-8 border-r-8 border-y-transparent border-r-white/90" />
              <motion.p
                key={state.dialogue}
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-sm leading-relaxed text-foreground"
              >
                {state.dialogue}
              </motion.p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
