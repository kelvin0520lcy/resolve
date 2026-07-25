import Link from "next/link";
import { MapPinOff } from "lucide-react";

export default function NotFound() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-4 py-12">
      <section
        className="manga-panel w-full max-w-xl rounded-[28px] p-7 text-center sm:p-10"
        aria-labelledby="not-found-title"
      >
        <div className="sticker mx-auto flex h-14 w-14 rotate-3 items-center justify-center rounded-2xl bg-warning text-[#18121f]">
          <MapPinOff className="h-7 w-7" />
        </div>
        <p className="mt-6 text-xs font-black uppercase tracking-[0.2em] text-[#a53a70]">
          Episode 404
        </p>
        <h1
          id="not-found-title"
          className="font-display mt-2 text-4xl tracking-wide text-[#18121f]"
        >
          This page left the setlist
        </h1>
        <p className="mx-auto mt-4 max-w-md text-sm font-medium leading-6 text-[#5d5267]">
          The link may be outdated, but your semester progress is still where
          you left it.
        </p>
        <Link
          href="/dashboard"
          className="sticker mt-7 inline-flex h-11 items-center rounded-xl bg-accent px-5 text-sm font-black text-white transition hover:-translate-y-0.5"
        >
          Back to the dashboard
        </Link>
      </section>
    </main>
  );
}
