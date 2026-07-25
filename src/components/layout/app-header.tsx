"use client";

import { AnimatePresence, motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { useAuth } from "@/contexts/auth-context";
import { Button } from "@/components/ui/button";
import { LogOut, MessageCircle, Settings, Sparkles } from "lucide-react";
import type { PageTheme } from "@/lib/page-themes";

export function AppHeader({
  title,
  theme,
}: {
  title: string;
  theme: PageTheme;
}) {
  const { user, signOut, isConfigured } = useAuth();
  const [signingOut, setSigningOut] = useState(false);
  const [signOutError, setSignOutError] = useState("");
  const [reactionOpen, setReactionOpen] = useState(false);

  async function handleSignOut() {
    if (signingOut) return;
    setSigningOut(true);
    setSignOutError("");
    try {
      await signOut();
    } catch {
      setSignOutError("Could not log out. Please try again.");
      setSigningOut(false);
    }
  }

  return (
    <header className="app-header sticky top-0 z-40 flex items-center justify-between border-b-2 border-border bg-background/85 px-4 py-2.5 backdrop-blur-xl lg:px-8">
      <div className="flex items-center gap-3">
        <div className="theme-mark sticker hidden h-10 w-10 -rotate-3 items-center justify-center rounded-xl bg-accent text-white sm:flex">
          <Sparkles className="h-5 w-5" />
        </div>
        <div>
          <div className="flex items-center gap-2 text-[9px] font-black uppercase tracking-[0.22em] text-accent">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-accent" />
            {theme.role}
            <span className="equalizer text-accent" aria-hidden="true">
              <span />
              <span />
              <span />
            </span>
          </div>
          <h2 className="font-display text-2xl tracking-wider">{title}</h2>
          {user && (
            <p className="text-[10px] text-muted">
              Starring {user.displayName}
            </p>
          )}
        </div>
      </div>
      <div className="flex items-center gap-2 sm:gap-3">
        <div className="relative">
          <button
            type="button"
            onClick={() => setReactionOpen((open) => !open)}
            className="character-reactor group flex items-center gap-2 rounded-2xl border-2 border-border bg-surface-elevated p-1.5 pr-2 text-left shadow-[3px_3px_0_rgba(0,0,0,0.4)] transition hover:-translate-y-0.5 hover:border-accent"
            aria-expanded={reactionOpen}
            aria-label={`Hear ${theme.name}'s reaction`}
          >
            <motion.span
              key={theme.key}
              initial={{ scale: 0.7, rotate: -10 }}
              animate={{ scale: 1, rotate: 0 }}
              className="relative h-10 w-10 shrink-0 overflow-hidden rounded-xl border-2 border-foreground/15 bg-surface"
            >
              <Image
                src={theme.image}
                alt=""
                fill
                sizes="40px"
                className="object-cover object-top transition duration-300 group-hover:scale-110"
              />
            </motion.span>
            <span className="hidden max-w-32 sm:block">
              <span className="block text-[8px] font-black uppercase tracking-[0.16em] text-accent">
                Tap for reaction
              </span>
              <span className="block truncate text-[10px] font-bold text-foreground">
                {theme.status}
              </span>
            </span>
            <MessageCircle className="h-3.5 w-3.5 text-muted" />
          </button>

          <AnimatePresence>
            {reactionOpen && (
              <motion.div
                initial={{ opacity: 0, y: -8, scale: 0.94 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -6, scale: 0.96 }}
                className="reaction-bubble manga-panel absolute right-0 top-[calc(100%+12px)] w-[min(18rem,calc(100vw-2rem))] rounded-2xl p-4"
                role="status"
              >
                <p className="text-[9px] font-black uppercase tracking-[0.2em] text-accent">
                  {theme.name} reaction cut
                </p>
                <p className="mt-2 text-sm font-bold leading-5">
                  “{theme.reaction}”
                </p>
                {theme.key === "bocchi" && (
                  <span className="bocchi-soul" aria-hidden="true">
                    👻
                  </span>
                )}
                {theme.key === "kita" && (
                  <span className="kita-burst" aria-hidden="true">
                    ✦ ✧ ✦
                  </span>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        <Link
          href="/settings"
          className="flex h-10 w-10 items-center justify-center rounded-xl border-2 border-border bg-surface-elevated text-muted transition hover:border-accent hover:text-accent lg:hidden"
          aria-label="Open settings"
        >
          <Settings className="h-4 w-4" />
        </Link>
        {signOutError && (
          <p
            className="hidden text-xs font-semibold text-danger sm:block"
            role="alert"
          >
            {signOutError}
          </p>
        )}
        {isConfigured && user && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleSignOut}
            disabled={signingOut}
          >
            <LogOut className="h-4 w-4" />
            <span className="hidden sm:inline">
              {signingOut ? "Logging out…" : "Log out"}
            </span>
          </Button>
        )}
      </div>
    </header>
  );
}
