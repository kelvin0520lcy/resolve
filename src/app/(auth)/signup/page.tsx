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

export default function SignUpPage() {
  const { firebaseUser, signUp, isConfigured, loading } = useAuth();
  const router = useRouter();
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!loading && firebaseUser) {
      router.replace("/dashboard");
    }
  }, [firebaseUser, loading, router]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (displayName.trim().length < 2) {
      setError("Enter a display name with at least two characters.");
      return;
    }
    if (password.length < 8) {
      setError("Use at least eight characters for your password.");
      return;
    }
    setSubmitting(true);
    try {
      await signUp(email.trim(), password, displayName.trim());
    } catch (signUpError) {
      setError(getFirebaseAuthErrorMessage(signUpError, "sign-up"));
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
            Casting call · episode one
          </p>
          <CardTitle>Start your semester arc</CardTitle>
          <CardDescription>Create your account to begin planning.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Display name</Label>
              <Input
                id="name"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="Your name"
                minLength={2}
                required
                disabled={!isConfigured}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
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
                minLength={8}
                required
                disabled={!isConfigured}
              />
            </div>
            {error && (
              <p className="text-sm text-danger" role="alert">
                {error}
              </p>
            )}
            <p className="text-xs text-muted">
              Use at least eight characters for your password.
            </p>
            <Button
              type="submit"
              className="w-full"
              disabled={submitting || !isConfigured}
            >
              {submitting ? "Creating account..." : "Create account"}
            </Button>
          </form>
          <p className="mt-4 text-center text-sm text-muted">
            Already have an account?{" "}
            <Link href="/login" className="font-semibold text-accent">
              Sign in
            </Link>
          </p>
        </CardContent>
      </Card>
    </AuthShell>
  );
}
