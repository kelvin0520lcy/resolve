"use client";

import { useEffect, useState } from "react";
import { MailCheck, RefreshCw } from "lucide-react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/auth-context";
import { AuthPageLoading, AuthShell } from "@/components/auth/auth-shell";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const RESEND_COOLDOWN_SECONDS = 30;

export default function VerifyEmailPage() {
  const {
    firebaseUser,
    loading,
    resendVerificationEmail,
    refreshEmailVerification,
    signOut,
  } = useAuth();
  const router = useRouter();
  const [message, setMessage] = useState(
    "Open the verification link we sent, then return here.",
  );
  const [error, setError] = useState("");
  const [checking, setChecking] = useState(false);
  const [resending, setResending] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);

  useEffect(() => {
    if (loading) return;
    if (!firebaseUser) {
      router.replace("/login");
      return;
    }
    if (firebaseUser.emailVerified) {
      router.replace("/dashboard");
    }
  }, [firebaseUser, loading, router]);

  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = window.setInterval(() => {
      setResendCooldown((seconds) => Math.max(0, seconds - 1));
    }, 1_000);
    return () => window.clearInterval(timer);
  }, [resendCooldown]);

  if (loading) return <AuthPageLoading />;
  if (!firebaseUser || firebaseUser.emailVerified) return <AuthPageLoading />;

  return (
    <AuthShell>
      <Card className="w-full border-accent/30 bg-surface-elevated/95 backdrop-blur-xl">
        <CardHeader className="text-center">
          <MailCheck
            aria-hidden="true"
            className="mx-auto mb-2 h-10 w-10 text-accent"
          />
          <p className="text-[10px] font-black uppercase tracking-[0.25em] text-accent">
            One last sound check
          </p>
          <CardTitle>Verify your email</CardTitle>
          <CardDescription>
            Cloud sync stays locked until this address is confirmed.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-xl border border-border bg-surface-muted px-4 py-3 text-center">
            <p className="break-all text-sm font-bold text-foreground">
              {firebaseUser.email}
            </p>
            <p className="mt-1 text-xs leading-5 text-muted">
              Check spam or junk if the message is not in your inbox.
            </p>
          </div>

          <p className="text-center text-sm leading-6 text-muted" role="status">
            {message}
          </p>
          {error && (
            <p className="text-center text-sm text-danger" role="alert">
              {error}
            </p>
          )}

          <Button
            type="button"
            className="w-full"
            disabled={checking || resending}
            onClick={async () => {
              setChecking(true);
              setError("");
              try {
                const verified = await refreshEmailVerification();
                if (verified) {
                  setMessage("Verified. Opening your workspace…");
                  router.replace("/dashboard");
                } else {
                  setMessage(
                    "Not verified yet. Open the email link, then try again.",
                  );
                }
              } catch {
                setError(
                  "We could not refresh your account. Check your connection and try again.",
                );
              } finally {
                setChecking(false);
              }
            }}
          >
            <RefreshCw
              aria-hidden="true"
              className={checking ? "h-4 w-4 animate-spin" : "h-4 w-4"}
            />
            {checking ? "Checking…" : "I verified — check again"}
          </Button>

          <Button
            type="button"
            variant="secondary"
            className="w-full"
            disabled={checking || resending || resendCooldown > 0}
            onClick={async () => {
              setResending(true);
              setError("");
              try {
                await resendVerificationEmail();
                setResendCooldown(RESEND_COOLDOWN_SECONDS);
                setMessage("A fresh verification email is on its way.");
              } catch {
                setError(
                  "The email could not be resent yet. Wait a moment and try again.",
                );
              } finally {
                setResending(false);
              }
            }}
          >
            {resending
              ? "Sending…"
              : resendCooldown > 0
                ? `Resend in ${resendCooldown}s`
                : "Resend verification email"}
          </Button>

          <Button
            type="button"
            variant="ghost"
            className="w-full"
            onClick={async () => {
              await signOut();
              router.replace("/login");
            }}
          >
            Sign out
          </Button>
        </CardContent>
      </Card>
    </AuthShell>
  );
}
