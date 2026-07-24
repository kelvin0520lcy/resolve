import Link from "next/link";
import { ArrowRight, Guitar, Target, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-lavender-100 to-sky-50">
      <header className="mx-auto flex max-w-6xl items-center justify-between px-6 py-6">
        <div>
          <h1 className="text-2xl font-black text-accent">Resolve!</h1>
          <p className="text-xs text-muted">
            Your semester, one episode at a time.
          </p>
        </div>
        <div className="flex gap-3">
          <Link href="/login">
            <Button variant="ghost">Sign in</Button>
          </Link>
          <Link href="/signup">
            <Button>Get started</Button>
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-6 pb-20 pt-12">
        <section className="text-center">
          <p className="mb-4 inline-block rounded-full bg-accent/10 px-4 py-1 text-sm font-semibold text-accent">
            Anime-themed semester OS
          </p>
          <h2 className="mx-auto max-w-3xl text-4xl font-black tracking-tight text-foreground sm:text-5xl">
            Turn broad resolutions into a semester-long journey
          </h2>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-muted">
            Plan academics, career prep, guitar practice, habits, and personal
            goals — with an expressive companion who reacts to your real
            progress.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <Link href="/dashboard">
              <Button size="lg">
                Open dashboard
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link href="/signup">
              <Button size="lg" variant="outline">
                Create account
              </Button>
            </Link>
          </div>
        </section>

        <section className="mt-20 grid gap-6 sm:grid-cols-3">
          {[
            {
              icon: Target,
              title: "Goals & milestones",
              desc: "Break semester resolutions into measurable arcs with deadlines and progress.",
            },
            {
              icon: Calendar,
              title: "Weekly & daily planning",
              desc: "Connect long-term goals to weekly priorities and focused daily tasks.",
            },
            {
              icon: Guitar,
              title: "Specialised tracking",
              desc: "Dedicated modules for guitar practice, academics, career prep, and habits.",
            },
          ].map(({ icon: Icon, title, desc }) => (
            <div
              key={title}
              className="rounded-2xl border border-border bg-white/70 p-6 backdrop-blur-sm"
            >
              <Icon className="mb-3 h-8 w-8 text-accent" />
              <h3 className="font-bold">{title}</h3>
              <p className="mt-2 text-sm text-muted">{desc}</p>
            </div>
          ))}
        </section>
      </main>
    </div>
  );
}
