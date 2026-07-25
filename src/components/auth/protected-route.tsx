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
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-3">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-accent/30 border-t-accent" />
          <p className="text-sm text-muted">Loading Resolve!...</p>
        </div>
      </div>
    );
  }

  if (isConfigured && !hasSession) return null;

  return <>{children}</>;
}
