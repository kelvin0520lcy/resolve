import type { Metadata } from "next";
import { AuthProvider } from "@/contexts/auth-context";
import "./globals.css";

export const metadata: Metadata = {
  title: "Resolve! — Your semester, one episode at a time",
  description:
    "Anime-themed semester planning, progress tracking, and self-improvement for university students.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full bg-background text-foreground">
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
