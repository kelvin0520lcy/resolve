import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  CalendarDays,
  CheckCircle2,
  Guitar,
  ListChecks,
  Music2,
  Play,
  Sparkles,
  Target,
  Zap,
} from "lucide-react";
import { buttonVariants } from "@/components/ui/button";

const FEATURES = [
  {
    number: "01",
    icon: Target,
    title: "Main quest",
    subtitle: "Goals become story arcs",
    description:
      "Give every resolution a finish line, a reason, and visible progress across the semester.",
    color: "bg-accent",
    rotate: "-rotate-1",
  },
  {
    number: "02",
    icon: CalendarDays,
    title: "Episode board",
    subtitle: "Plan the week like a setlist",
    description:
      "Turn intimidating goals into a few concrete scenes you can actually finish today.",
    color: "bg-warning",
    rotate: "rotate-1",
  },
  {
    number: "03",
    icon: Guitar,
    title: "Practice room",
    subtitle: "Track the details that matter",
    description:
      "Log guitar tempo, habits, academics, career reps, and the small wins nobody else sees.",
    color: "bg-[#5ce1ef]",
    rotate: "-rotate-[0.5deg]",
  },
] as const;

export default function LandingPage() {
  return (
    <div className="min-h-screen overflow-hidden bg-[#09070e] text-white">
      <header className="absolute inset-x-0 top-0 z-30 mx-auto flex max-w-[1440px] items-center justify-between px-5 py-5 sm:px-8 lg:px-12">
        <Link href="/" className="group">
          <div className="flex items-center gap-3">
            <div className="sticker flex h-11 w-11 -rotate-6 items-center justify-center rounded-xl bg-accent">
              <Music2 className="h-5 w-5 text-white" />
            </div>
            <div>
              <p className="font-display text-3xl leading-none tracking-wider">
                RESOLVE<span className="text-accent">!</span>
              </p>
              <p className="text-[9px] font-black uppercase tracking-[0.25em] text-white/50">
                Semester live house
              </p>
            </div>
          </div>
        </Link>
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="hidden sm:block">
            <Link
              href="/login"
              className={buttonVariants({
                variant: "ghost",
                className: "text-white",
              })}
            >
              Sign in
            </Link>
          </div>
          <Link href="/signup" className={buttonVariants({ size: "sm" })}>
            Start the arc
          </Link>
        </div>
      </header>

      <main>
        <section className="speed-lines relative flex min-h-[760px] items-end overflow-hidden border-b-2 border-border lg:min-h-screen lg:items-center">
          <Image
            src="/illustrations/kessoku-ensemble-mobile-v3.png"
            alt="Kessoku Band performing together in a mobile live-house scene while Bocchi buffers"
            fill
            priority
            sizes="100vw"
            className="object-cover object-center sm:hidden"
          />
          <Image
            src="/illustrations/kessoku-ensemble-hero-v3.png"
            alt="Kessoku Band performing in a live house while Bocchi comically buffers"
            fill
            priority
            sizes="(min-width: 640px) 100vw, 1px"
            className="hidden object-cover object-[62%_center] sm:block"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#080610] via-[#080610]/88 to-[#080610]/5" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#080610] via-transparent to-[#080610]/35" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_15%_40%,rgba(255,79,154,0.16),transparent_28rem)]" />

          <div className="relative z-10 mx-auto w-full max-w-[1440px] px-5 pb-12 pt-32 sm:px-8 lg:px-12 lg:pb-16 lg:pt-36">
            <div className="max-w-2xl">
              <div className="mb-5 flex flex-wrap items-center gap-3">
                <span className="tape-label inline-flex items-center gap-2 px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.18em]">
                  <span className="equalizer text-[#18121f]" aria-hidden="true">
                    <span />
                    <span />
                    <span />
                  </span>
                  Now airing · your semester
                </span>
                <span className="rounded-full border border-white/15 bg-black/30 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-white/60 backdrop-blur">
                  S1 · EP01
                </span>
              </div>

              <h1 className="font-display text-[3.5rem] leading-[0.88] tracking-wide text-white sm:text-7xl lg:text-[6.4rem]">
                MAKE THE
                <span className="block text-accent">QUIET DAYS</span>
                COUNT.
              </h1>
              <p className="mt-6 max-w-xl text-base font-medium leading-7 text-white/68 sm:text-lg">
                A semester tracker for anxious overthinkers, ambitious side
                quests, late-night practice sessions, and the courage to show
                up again tomorrow.
              </p>

              <div className="mt-8 flex flex-wrap gap-3">
                <Link
                  href="/dashboard"
                  className={buttonVariants({
                    size: "lg",
                    className: "group",
                  })}
                >
                  <Play className="h-4 w-4 fill-current" />
                  Enter the live house
                  <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
                </Link>
                <Link
                  href="/signup"
                  className={buttonVariants({
                    size: "lg",
                    variant: "secondary",
                    className: "bg-black/50 backdrop-blur",
                  })}
                >
                  Create account
                </Link>
              </div>

              <div className="mt-10 grid max-w-xl grid-cols-3 gap-2 sm:gap-3">
                {[
                  ["12+", "episode views"],
                  ["7", "daily rhythms"],
                  ["4", "cast moods"],
                ].map(([value, label]) => (
                  <div
                    key={label}
                    className="rounded-xl border border-white/10 bg-black/30 p-3 backdrop-blur-md"
                  >
                    <p className="font-display text-2xl text-warning sm:text-3xl">
                      {value}
                    </p>
                    <p className="text-[9px] font-black uppercase tracking-wider text-white/50">
                      {label}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="absolute bottom-5 right-5 z-10 hidden max-w-[270px] rotate-1 lg:block">
            <div className="manga-panel rounded-2xl p-4">
              <p className="text-[9px] font-black uppercase tracking-widest text-accent">
                Bocchi.exe · frame 001
              </p>
              <p className="font-display mt-2 text-lg leading-tight">
                “Social battery missing. Guitar cable still connected.”
              </p>
            </div>
          </div>
        </section>

        <div className="overflow-hidden border-b-2 border-[#18121f] bg-warning py-2 text-[#18121f]">
          <div className="flex min-w-max animate-[marquee_18s_linear_infinite] items-center gap-7 text-xs font-black uppercase tracking-[0.22em]">
            {[1, 2].map((set) => (
              <div key={set} className="flex items-center gap-7">
                <span>Goals are story arcs</span>
                <Sparkles className="h-4 w-4" />
                <span>Habits are rehearsal</span>
                <Zap className="h-4 w-4" />
                <span>Progress deserves an encore</span>
                <Music2 className="h-4 w-4" />
              </div>
            ))}
          </div>
        </div>

        <section className="relative px-5 py-20 sm:px-8 lg:px-12 lg:py-28">
          <div className="absolute left-0 top-0 h-72 w-72 rounded-full bg-accent/10 blur-[90px]" />
          <div className="relative mx-auto max-w-7xl">
            <div className="grid gap-8 lg:grid-cols-[0.7fr_1.3fr] lg:items-end">
              <div>
                <p className="mb-3 text-[10px] font-black uppercase tracking-[0.25em] text-accent">
                  The season structure
                </p>
                <h2 className="font-display text-5xl leading-[0.92] tracking-wide sm:text-6xl">
                  NOT A TO-DO LIST.
                  <span className="block text-warning">A TRAINING ARC.</span>
                </h2>
              </div>
              <p className="max-w-xl text-base leading-7 text-muted lg:justify-self-end">
                Resolve! connects the whole semester to this week and today,
                then gives your effort enough personality to feel worth
                returning to.
              </p>
            </div>

            <div className="mt-12 grid gap-6 lg:grid-cols-3">
              {FEATURES.map(
                ({
                  number,
                  icon: Icon,
                  title,
                  subtitle,
                  description,
                  color,
                  rotate,
                }) => (
                  <article
                    key={number}
                    className={`manga-panel group rounded-[24px] p-6 transition duration-300 hover:-translate-y-2 hover:rotate-0 ${rotate}`}
                  >
                    <div className="flex items-start justify-between">
                      <div
                        className={`sticker flex h-12 w-12 items-center justify-center rounded-xl ${color}`}
                      >
                        <Icon className="h-6 w-6 text-[#18121f]" />
                      </div>
                      <span className="font-display text-5xl text-[#18121f]/12">
                        {number}
                      </span>
                    </div>
                    <p className="mt-7 text-[9px] font-black uppercase tracking-[0.22em] text-accent">
                      {title}
                    </p>
                    <h3 className="font-display mt-1 text-2xl tracking-wide">
                      {subtitle}
                    </h3>
                    <p className="mt-3 text-sm font-medium leading-6 text-[#66586d]">
                      {description}
                    </p>
                  </article>
                ),
              )}
            </div>
          </div>
        </section>

        <section className="px-5 pb-20 sm:px-8 lg:px-12 lg:pb-28">
          <div className="comic-card relative mx-auto grid max-w-7xl overflow-hidden rounded-[28px] border-2 border-border bg-surface-elevated lg:grid-cols-[0.9fr_1.1fr]">
            <div className="relative grid min-h-[520px] grid-cols-2 border-b-2 border-border bg-[#0d0a13] lg:min-h-[560px] lg:border-b-0 lg:border-r-2">
              {[
                [
                  "/illustrations/bocchi-lag-reaction-v3.png",
                  "Bocchi lagging with her soul escaping",
                  "Bocchi · practice",
                ],
                [
                  "/illustrations/nijika-planning-v3.png",
                  "Nijika organizing an overflowing band planner",
                  "Nijika · rhythm",
                ],
                [
                  "/illustrations/ryo-analytics-v3.png",
                  "Ryo studying analytics beside an empty wallet",
                  "Ryo · data",
                ],
                [
                  "/illustrations/kita-aura-v3.png",
                  "Kita shining with an overpowered cheerful aura",
                  "Kita · momentum",
                ],
              ].map(([src, alt, label]) => (
                <div
                  key={src}
                  className="group relative min-h-64 overflow-hidden border-border odd:border-r-2 [&:nth-child(-n+2)]:border-b-2"
                >
                  <Image
                    src={src}
                    alt={alt}
                    fill
                    sizes="(min-width: 1024px) 22vw, 50vw"
                    className="object-cover transition duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#15111e]/80 via-transparent to-transparent" />
                  <span className="absolute bottom-3 left-3 rounded-lg border border-white/15 bg-black/55 px-2 py-1 text-[8px] font-black uppercase tracking-widest text-white backdrop-blur">
                    {label}
                  </span>
                </div>
              ))}
              <span className="tape-label absolute bottom-5 left-5 px-3 py-1 text-[10px] font-black uppercase tracking-widest">
                Kessoku cast cam · live
              </span>
            </div>
            <div className="stage-grid flex flex-col justify-center p-7 sm:p-10 lg:p-14">
              <p className="text-[10px] font-black uppercase tracking-[0.25em] text-accent">
                Four character-directed modes
              </p>
              <h2 className="font-display mt-3 text-4xl leading-none tracking-wide sm:text-5xl">
                EVERY PAGE GETS ITS OWN BANDMATE.
              </h2>
              <p className="mt-4 max-w-lg text-sm leading-6 text-muted">
                Anxious practice with Bocchi, sunny planning with Nijika,
                deadpan analysis with Ryo, and high-voltage goals with Kita.
              </p>
              <div className="mt-7 grid gap-4 sm:grid-cols-2">
                {[
                  [ListChecks, "Nijika · today, week & habits"],
                  [Guitar, "Bocchi · guitar & reflection"],
                  [CheckCircle2, "Ryo · study, stats & controls"],
                  [Sparkles, "Kita · goals, career & timeline"],
                ].map(([Icon, text]) => {
                  const ItemIcon = Icon as typeof CheckCircle2;
                  return (
                    <div key={String(text)} className="flex items-center gap-3">
                      <div className="sticker flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-warning text-[#18121f]">
                        <ItemIcon className="h-4 w-4" />
                      </div>
                      <p className="text-sm font-bold">{String(text)}</p>
                    </div>
                  );
                })}
              </div>
              <Link
                href="/dashboard"
                className={buttonVariants({
                  className: "mt-9 self-start",
                })}
              >
                Start episode one
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t-2 border-border px-5 py-8 text-center text-[10px] font-black uppercase tracking-[0.18em] text-muted">
        Resolve! · made for the practice days nobody applauds
      </footer>
    </div>
  );
}
