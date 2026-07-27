"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertTriangle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { reportOperationalEvent } from "@/lib/monitoring/client-events";

export default function ErrorPage({
  error,
  unstable_retry,
}: {
  error: Error & { digest?: string };
  unstable_retry: () => void;
}) {
  useEffect(() => {
    void reportOperationalEvent("client_runtime_error", {
      errorName: error.name,
      digest: error.digest,
    });
  }, [error]);

  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-4 py-12">
      <section
        className="manga-panel w-full max-w-xl rounded-[28px] p-7 text-center sm:p-10"
        aria-labelledby="error-title"
      >
        <div className="sticker mx-auto flex h-14 w-14 -rotate-3 items-center justify-center rounded-2xl bg-warning text-[#18121f]">
          <AlertTriangle className="h-7 w-7" />
        </div>
        <p className="mt-6 text-xs font-black uppercase tracking-[0.2em] text-[#a53a70]">
          Unexpected encore
        </p>
        <h1
          id="error-title"
          className="mt-2 font-display text-4xl tracking-wide text-[#18121f]"
        >
          This scene missed its cue
        </h1>
        <p className="mx-auto mt-4 max-w-md text-sm font-medium leading-6 text-[#5d5267]">
          Your saved workspace is still intact. Try the scene again, or return
          to the dashboard and continue from there.
        </p>
        {error.digest && (
          <p className="mt-3 text-xs text-[#7a6e82]">
            Reference: {error.digest}
          </p>
        )}
        <div className="mt-7 flex flex-wrap justify-center gap-3">
          <Button type="button" onClick={() => unstable_retry()}>
            <RefreshCw className="h-4 w-4" />
            Try again
          </Button>
          <Link
            href="/dashboard"
            className="inline-flex h-11 items-center rounded-xl border-2 border-[#18121f] bg-white px-4 text-sm font-black text-[#18121f] shadow-[3px_3px_0_#18121f] transition hover:-translate-y-0.5"
          >
            Return to dashboard
          </Link>
        </div>
      </section>
    </main>
  );
}
