import Image from "next/image";
import Link from "next/link";
import { Guitar, Sparkles } from "lucide-react";

export function AuthShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid min-h-screen bg-background lg:grid-cols-[1.05fr_0.95fr]">
      <aside className="speed-lines relative hidden min-h-screen overflow-hidden border-r-2 border-border lg:block">
        <Image
          src="/illustrations/kessoku-ensemble-hero-v3.png"
          alt="Kessoku Band performing while Bocchi comically buffers"
          fill
          priority
          sizes="52vw"
          className="object-cover object-[66%_center]"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#080610]/50 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#080610] via-transparent to-[#080610]/60" />
        <div className="absolute inset-x-0 top-0 z-10 flex items-center justify-between p-8">
          <Link href="/" className="font-display text-3xl tracking-wider text-white">
            RESOLVE<span className="text-accent">!</span>
          </Link>
          <span className="tape-label flex items-center gap-2 px-3 py-1 text-[9px] font-black uppercase tracking-widest">
            <Sparkles className="h-3 w-3" />
            Backstage access
          </span>
        </div>
        <div className="absolute bottom-10 left-8 z-10 max-w-md">
          <p className="mb-3 flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.25em] text-accent">
            <Guitar className="h-4 w-4" />
            Before the first chord
          </p>
          <h2 className="font-display text-5xl leading-[0.95] tracking-wide text-white">
            SHOWING UP NERVOUS
            <span className="block text-warning">STILL COUNTS.</span>
          </h2>
          <p className="mt-4 max-w-sm text-sm leading-6 text-white/60">
            Your goals, routines, and practice sessions are waiting on the
            other side of one small brave click.
          </p>
        </div>
      </aside>

      <main className="stage-grid relative flex min-h-screen items-center justify-center overflow-hidden p-4 sm:p-8">
        <div className="absolute -right-20 -top-20 h-72 w-72 rounded-full bg-accent/15 blur-[80px]" />
        <div className="absolute -bottom-20 left-0 h-72 w-72 rounded-full bg-[#5ce1ef]/10 blur-[90px]" />
        <div className="relative w-full max-w-md">
          <Link
            href="/"
            className="mb-6 flex items-center justify-center gap-2 font-display text-3xl tracking-wider lg:hidden"
          >
            RESOLVE<span className="text-accent">!</span>
          </Link>
          {children}
        </div>
      </main>
    </div>
  );
}

export function AuthPageLoading() {
  return (
    <div
      className="stage-grid flex min-h-screen items-center justify-center bg-background px-4"
      role="status"
      aria-label="Checking your session"
    >
      <div className="manga-panel rounded-[24px] px-8 py-7 text-center">
        <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-[#ff4f9a]/25 border-t-[#ff4f9a]" />
        <p className="mt-4 text-sm font-black text-[#18121f]">
          Checking your backstage pass…
        </p>
      </div>
    </div>
  );
}
