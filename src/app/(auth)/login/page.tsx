"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/auth-context";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function LoginPage() {
  const { signIn, signInWithGoogle, isConfigured, loading } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      await signIn(email, password);
      router.push("/dashboard");
    } catch {
      setError("Invalid email or password.");
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) return null;

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-pink-50 via-lavender-100 to-sky-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <p className="text-2xl font-black text-accent">Resolve!</p>
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
            {error && <p className="text-sm text-danger">{error}</p>}
            <Button
              type="submit"
              className="w-full"
              disabled={submitting || !isConfigured}
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
            disabled={!isConfigured}
            onClick={async () => {
              try {
                await signInWithGoogle();
                router.push("/dashboard");
              } catch {
                setError("Google sign-in failed.");
              }
            }}
          >
            Continue with Google
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
    </div>
  );
}
