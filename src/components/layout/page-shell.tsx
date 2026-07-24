"use client";

import { motion } from "framer-motion";
import { usePathname } from "next/navigation";
import { AppHeader } from "@/components/layout/app-header";
import { CharacterArcBar } from "@/components/layout/character-arc-bar";
import { getPageTheme } from "@/lib/page-themes";

export function PageShell({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const theme = getPageTheme(pathname);

  return (
    <div
      className={`page-theme theme-${theme.key} flex min-h-full min-w-0 flex-1 flex-col`}
      data-character={theme.key}
    >
      <AppHeader title={title} theme={theme} />
      <motion.div
        key={`cut-${pathname}`}
        initial={{ opacity: 0.92, clipPath: "inset(0 0 0 0)" }}
        animate={{ opacity: 0, clipPath: "inset(0 0 100% 0)" }}
        transition={{ duration: 0.72, delay: 0.12, ease: [0.7, 0, 0.2, 1] }}
        className="anime-cut-in"
        aria-hidden="true"
      >
        <span>SCENE START</span>
        <strong>{theme.name.toUpperCase()} ROUTE</strong>
      </motion.div>
      <motion.main
        key={pathname}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.28, ease: "easeOut" }}
        className="page-stage relative min-w-0 flex-1 overflow-hidden px-4 py-6 lg:px-8 lg:py-7"
      >
        <div className="relative z-10 min-w-0">
          <CharacterArcBar pathname={pathname} />
          {children}
        </div>
      </motion.main>
    </div>
  );
}
