"use client";

import { AnimatePresence, motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useAuth } from "@/contexts/auth-context";
import { Button } from "@/components/ui/button";
import { Command, LogOut, MessageCircle, Settings } from "lucide-react";
import type { PageTheme } from "@/lib/page-themes";
import { useOptionalResolve } from "@/contexts/resolve-context";

export function AppHeader({
  title,
  theme,
}: {
  title: string;
  theme: PageTheme;
}) {
  const { user, signOut, isConfigured } = useAuth();
  const workspace = useOptionalResolve();
  const syncStatus = workspace?.syncStatus ?? "synced";
  const syncWorkspaceNow =
    workspace?.syncWorkspaceNow ?? (async () => undefined);
  const exportWorkspace = workspace?.exportWorkspace ?? (() => undefined);
  const [signingOut, setSigningOut] = useState(false);
  const [signOutError, setSignOutError] = useState("");
  const [reactionOpen, setReactionOpen] = useState(false);
  const [confirmSignOut, setConfirmSignOut] = useState(false);
  const reactionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!reactionOpen) return;

    function closeOnOutsidePress(event: PointerEvent) {
      if (
        reactionRef.current &&
        !reactionRef.current.contains(event.target as Node)
      ) {
        setReactionOpen(false);
      }
    }

    function closeOnEscape(event: KeyboardEvent) {
      if (event.key === "Escape") setReactionOpen(false);
    }

    document.addEventListener("pointerdown", closeOnOutsidePress);
    document.addEventListener("keydown", closeOnEscape);
    return () => {
      document.removeEventListener("pointerdown", closeOnOutsidePress);
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, [reactionOpen]);

  async function performSignOut(syncFirst = false) {
    if (signingOut) return;
    setSigningOut(true);
    setSignOutError("");
    try {
      if (syncFirst) await syncWorkspaceNow();
      await signOut();
    } catch {
      setSignOutError("Could not log out. Please try again.");
      setSigningOut(false);
    }
  }

  function handleSignOut() {
    if (["saving", "offline", "conflict"].includes(syncStatus)) {
      setConfirmSignOut(true);
      return;
    }
    void performSignOut();
  }

  return (
    <header className="app-header sticky top-0 z-40 flex items-center justify-between border-b-2 border-border bg-background/85 px-4 py-2.5 backdrop-blur-xl lg:px-8">
      <div className="flex items-center gap-3">
        <div className="theme-mark sticker relative hidden h-10 w-10 -rotate-3 overflow-hidden rounded-xl border-2 border-[#18121f] bg-[#fff6df] sm:block">
          <Image
            src="/brand/resolve-mark.png"
            alt=""
            fill
            sizes="40px"
            className="object-cover"
          />
        </div>
        <div>
          <div className="flex items-center gap-2 text-[9px] font-black uppercase tracking-[0.22em] text-accent">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-accent" />
            <span>
              <span lang="ja">{theme.roleJa}</span>
              <span className="ml-1.5 hidden text-foreground/65 xl:inline">
                / {theme.role}
              </span>
            </span>
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
        <button
          type="button"
          onClick={() =>
            window.dispatchEvent(
              new CustomEvent("resolve:command", {
                detail: { mode: "search" },
              }),
            )
          }
          className="hidden h-10 items-center gap-2 rounded-xl border-2 border-border bg-surface-elevated px-3 text-xs font-black text-foreground shadow-[2px_2px_0_rgba(0,0,0,0.32)] transition hover:-translate-y-0.5 hover:border-accent hover:text-accent md:flex"
        >
          <Command className="h-4 w-4 text-accent" />
          Search
          <kbd className="rounded-md border border-border px-1.5 py-0.5 text-[9px]">
            ⌘K
          </kbd>
        </button>
        <div ref={reactionRef} className="relative">
          <button
            type="button"
            onClick={() => setReactionOpen((open) => !open)}
            className="character-reactor group flex items-center gap-2 rounded-2xl border-2 border-border bg-surface-elevated p-1.5 pr-2 text-left shadow-[3px_3px_0_rgba(0,0,0,0.4)] transition hover:-translate-y-0.5 hover:border-accent"
            aria-expanded={reactionOpen}
            aria-label={`Hear ${theme.nameEn}'s reaction`}
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
                ひとこと / Reaction
              </span>
              <span
                className="block truncate text-[10px] font-bold text-foreground"
                lang="ja"
              >
                {theme.statusJa}
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
                  <span lang="ja">{theme.name}</span>
                  <span className="ml-1.5 text-foreground/55">
                    / {theme.nameEn}
                  </span>
                </p>
                <p className="mt-2 text-sm font-bold leading-6" lang="ja">
                  「{theme.reactionJa}」
                </p>
                <p className="mt-2 border-t border-[#18121f]/15 pt-2 text-xs font-semibold leading-5 text-[#5f5267]">
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
        {confirmSignOut && (
          <div
            className="absolute right-3 top-[calc(100%+8px)] z-50 w-[min(24rem,calc(100vw-1.5rem))] rounded-2xl border-2 border-warning/60 bg-[#18121f] p-4 text-white shadow-2xl"
            role="dialog"
            aria-label="Pending workspace changes"
          >
            <p className="text-sm font-black">Changes are still pending</p>
            <p className="mt-1 text-xs leading-5 text-white/70">
              They are safe on this device. Resolve will not discard them when
              you log out.
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              {syncStatus !== "conflict" && (
                <Button
                  size="sm"
                  onClick={() => void performSignOut(true)}
                  disabled={signingOut}
                >
                  Sync, then log out
                </Button>
              )}
              <Button
                size="sm"
                variant="secondary"
                onClick={() => void performSignOut(false)}
                disabled={signingOut}
              >
                Keep locally and log out
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setConfirmSignOut(false)}
              >
                Cancel
              </Button>
              <button
                type="button"
                onClick={exportWorkspace}
                className="text-xs font-bold text-warning underline"
              >
                Export backup
              </button>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
