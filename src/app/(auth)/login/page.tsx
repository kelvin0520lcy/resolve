"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/auth-context";
import { getFirebaseAuthErrorMessage } from "@/lib/firebase/auth-errors";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import {
  AuthPageLoading,
  AuthShell,
} from "@/components/auth/auth-shell";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function LoginPage() {
  const {
    firebaseUser,
    signIn,
    signInWithGoogle,
    isConfigured,
    loading,
  } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [googleSubmitting, setGoogleSubmitting] = useState(false);

  useEffect(() => {
    if (!loading && firebaseUser) {
      router.replace(
        firebaseUser.emailVerified ? "/dashboard" : "/verify-email",
      );
    }
  }, [firebaseUser, loading, router]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      await signIn(email.trim(), password);
    } catch (signInError) {
      setError(getFirebaseAuthErrorMessage(signInError, "sign-in"));
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) return <AuthPageLoading />;
  if (firebaseUser) return null;

  return (
    <AuthShell>
      <Card className="w-full border-accent/30 bg-surface-elevated/95 backdrop-blur-xl">
        <CardHeader className="text-center">
          <p className="text-[10px] font-black uppercase tracking-[0.25em] text-accent">
            Returning cast member
          </p>
          <CardTitle>Welcome back</CardTitle>
          <CardDescription>
            Sign in to continue your semester journey.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {!isConfigured && (
            <div className="rounded-xl border border-warning/30 bg-warning/10 px-4 py-3 text-sm text-warning">
              Firebase is not configured yet. Copy <code>.env.example</code> to{" "}
              <code>.env.local</code> and add your credentials.
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@university.edu"
                required
                disabled={!isConfigured}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={!isConfigured}
              />
            </div>
            {error && (
              <p className="text-sm text-danger" role="alert">
                {error}
              </p>
            )}
            <Button
              type="submit"
              className="w-full"
              disabled={submitting || googleSubmitting || !isConfigured}
            >
              {submitting ? "Signing in..." : "Sign in"}
            </Button>
          </form>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-surface-elevated px-2 text-muted">or</span>
            </div>
          </div>

          <Button
            variant="secondary"
            className="w-full"
            disabled={!isConfigured || googleSubmitting || submitting}
            onClick={async () => {
              setError("");
              setGoogleSubmitting(true);
              try {
                await signInWithGoogle();
              } catch (signInError) {
                setError(getFirebaseAuthErrorMessage(signInError, "google"));
              } finally {
                setGoogleSubmitting(false);
              }
            }}
          >
            {googleSubmitting ? "Opening Google..." : "Continue with Google"}
          </Button>

          <p className="text-center text-sm text-muted">
            No account?{" "}
            <Link href="/signup" className="font-semibold text-accent">
              Sign up
            </Link>
            {" · "}
            <Link href="/reset-password" className="font-semibold text-accent">
              Forgot password?
            </Link>
          </p>
        </CardContent>
      </Card>
    </AuthShell>
  );
}
