"use client";

import { useAuth } from "@/contexts/auth-context";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";

export function AppHeader({ title }: { title: string }) {
  const { user, signOut, isConfigured } = useAuth();

  return (
    <header className="sticky top-0 z-40 flex items-center justify-between border-b border-border bg-background/80 px-4 py-4 backdrop-blur-md lg:px-8">
      <div>
        <h2 className="text-xl font-bold tracking-tight">{title}</h2>
        {user && (
          <p className="text-xs text-muted">
            Welcome back, {user.displayName}
          </p>
        )}
      </div>
      {isConfigured && user && (
        <Button variant="ghost" size="sm" onClick={() => signOut()}>
          <LogOut className="h-4 w-4" />
          <span className="hidden sm:inline">Log out</span>
        </Button>
      )}
    </header>
  );
}
