"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/auth-context";

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { firebaseUser, loading, isConfigured } = useAuth();
  const router = useRouter();
  const hasSession = !isConfigured || Boolean(firebaseUser);

  useEffect(() => {
    if (!loading && isConfigured && !hasSession) {
      router.replace("/login");
    }
  }, [hasSession, loading, isConfigured, router]);

  if (loading) {
    return (
      <div
        className="flex min-h-screen items-center justify-center bg-background p-6"
        role="status"
        aria-live="polite"
      >
        <div className="manga-panel flex w-full max-w-sm flex-col items-center gap-3 rounded-[28px] p-8 text-center">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-accent/30 border-t-accent" />
          <p className="font-display text-2xl">Checking your backstage pass</p>
          <p className="text-sm leading-6 text-muted">
            Restoring the local workspace and confirming your account session…
          </p>
        </div>
      </div>
    );
  }

  if (isConfigured && !hasSession) return null;

  return <>{children}</>;
}
