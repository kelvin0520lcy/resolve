import type { ReactNode } from "react";
import Link from "next/link";
import { ArrowLeft, Music2, ShieldCheck } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";

type LegalPageProps = {
  eyebrow: string;
  title: string;
  summary: string;
  children: ReactNode;
};

export function LegalPage({
  eyebrow,
  title,
  summary,
  children,
}: LegalPageProps) {
  return (
    <div className="stage-grid min-h-screen bg-background text-foreground">
      <header className="border-b-2 border-border bg-surface-elevated/90 px-5 py-4 backdrop-blur sm:px-8">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-4">
          <Link href="/" className="flex items-center gap-3">
            <span className="sticker flex h-10 w-10 -rotate-6 items-center justify-center rounded-xl bg-accent">
              <Music2 className="h-5 w-5 text-white" />
            </span>
            <span className="font-display text-2xl tracking-wider">
              RESOLVE<span className="text-accent">!</span>
            </span>
          </Link>
          <Link
            href="/"
            className={buttonVariants({ variant: "ghost", size: "sm" })}
          >
            <ArrowLeft className="h-4 w-4" />
            Home
          </Link>
        </div>
      </header>

      <main className="px-5 py-10 sm:px-8 sm:py-14">
        <article className="manga-panel mx-auto max-w-4xl rounded-[28px] p-6 sm:p-10">
          <div className="border-b-2 border-border pb-7">
            <p className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.24em] text-accent">
              <ShieldCheck className="h-4 w-4" />
              {eyebrow}
            </p>
            <h1 className="font-display mt-3 text-4xl tracking-wide sm:text-6xl">
              {title}
            </h1>
            <p className="mt-4 max-w-2xl text-sm leading-6 text-muted">
              {summary}
            </p>
            <p className="mt-3 text-[10px] font-black uppercase tracking-wider text-muted">
              Effective 27 July 2026
            </p>
          </div>

          <div className="legal-copy mt-8 space-y-8 text-sm leading-7 text-[#4d4053]">
            {children}
          </div>
        </article>
      </main>

      <footer className="border-t-2 border-border px-5 py-8 text-center text-xs leading-6 text-muted">
        <p>
          Resolve! is an unofficial, non-commercial fan project and is not
          affiliated with, endorsed by, or sponsored by Bocchi the Rock! or its
          rights holders.
        </p>
        <div className="mt-2 flex justify-center gap-4 font-bold">
          <Link href="/privacy" className="hover:text-accent">
            Privacy
          </Link>
          <Link href="/terms" className="hover:text-accent">
            Terms
          </Link>
        </div>
      </footer>
    </div>
  );
}
