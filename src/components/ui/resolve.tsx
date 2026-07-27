"use client";

import Image from "next/image";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { getCategoryMeta } from "@/lib/constants/categories";
import { getPageIllustration } from "@/lib/page-themes";

export function PageIntro({
  eyebrow,
  title,
  description,
  action,
}: {
  eyebrow: string;
  title: string;
  description: string;
  action?: ReactNode;
}) {
  const pathname = usePathname();
  const illustration = getPageIllustration(pathname);

  return (
    <div className="page-intro manga-panel speed-lines flex flex-col gap-5 overflow-hidden rounded-[26px] p-5 sm:flex-row sm:items-end sm:justify-between sm:p-7">
      <div className="pointer-events-none absolute inset-y-0 right-0 w-[70%] overflow-hidden opacity-40 [mask-image:linear-gradient(to_right,transparent,black_38%)] sm:w-[58%] sm:opacity-90">
        <div className="absolute inset-0 bg-[linear-gradient(135deg,transparent_30%,var(--theme-glow))]" />
        <Image
          src={illustration.image}
          alt={illustration.imageAlt}
          fill
          loading="eager"
          sizes="(min-width: 640px) 58vw, 70vw"
          className="object-cover object-right"
        />
        <span className="absolute right-4 top-3 hidden rounded-full border-2 border-[#18121f] bg-warning px-3 py-1 text-[9px] font-black uppercase tracking-[0.16em] text-[#18121f] shadow-[3px_3px_0_#18121f] sm:block">
          {illustration.label}
        </span>
      </div>
      <div className="relative z-10 max-w-2xl">
        <p className="tape-label mb-3 inline-flex -rotate-1 px-3 py-1 text-[10px] font-black uppercase tracking-[0.2em]">
          エピソード記録 / Episode log · {eyebrow}
        </p>
        <h1 className="font-display relative text-3xl leading-none tracking-wide sm:text-4xl">
          {title}
        </h1>
        <p className="relative mt-3 max-w-xl text-sm font-medium leading-6 text-[#5d5267]">
          {description}
        </p>
      </div>
      {action && <div className="relative z-10 shrink-0">{action}</div>}
    </div>
  );
}

export function MetricCard({
  label,
  value,
  detail,
  icon,
}: {
  label: string;
  value: ReactNode;
  detail?: ReactNode;
  icon?: ReactNode;
}) {
  return (
    <Card className="group relative overflow-hidden transition duration-300 hover:-translate-y-1 hover:border-accent/50">
      <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-accent via-warning to-[#5ce1ef]" />
      <CardContent className="flex items-start justify-between gap-4 pt-6">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.16em] text-muted">
            {label}
          </p>
          <p className="font-display mt-1 text-3xl tracking-wide">{value}</p>
          {detail && <div className="mt-2 text-xs text-muted">{detail}</div>}
        </div>
        {icon && (
          <div className="sticker flex h-11 w-11 rotate-2 items-center justify-center rounded-xl bg-warning text-[#18121f] transition group-hover:-rotate-3 group-hover:scale-110">
            {icon}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export function CategoryBadge({ category }: { category: string }) {
  const meta = getCategoryMeta(category);
  return (
    <Badge
      className="capitalize"
      style={{
        color: meta.color,
        backgroundColor: `color-mix(in srgb, ${meta.color} 17%, var(--surface))`,
        borderColor: `color-mix(in srgb, ${meta.color} 45%, transparent)`,
      }}
    >
      {meta.label}
    </Badge>
  );
}

export function EmptyState({
  title,
  description,
  icon,
  action,
}: {
  title: string;
  description: string;
  icon?: ReactNode;
  action?: ReactNode;
}) {
  return (
    <div className="rounded-2xl border-2 border-dashed border-border bg-surface-muted/35 px-5 py-10 text-center">
      {icon && (
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-accent/10 text-accent">
          {icon}
        </div>
      )}
      <p className="font-display text-xl tracking-wide">{title}</p>
      <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-muted">
        {description}
      </p>
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}

export const fieldClassName =
  "h-11 w-full rounded-xl border-2 border-border bg-surface px-3 text-sm text-foreground shadow-[3px_3px_0_rgba(0,0,0,0.2)] outline-none transition placeholder:text-muted focus:-translate-y-0.5 focus:border-accent focus:ring-2 focus:ring-accent/15";

export const alignedFieldLabelClassName =
  "grid h-full content-start grid-rows-[minmax(2.5rem,auto)_auto] gap-2 text-sm font-bold";

export const textAreaClassName =
  "min-h-24 w-full resize-y rounded-xl border-2 border-border bg-surface px-3 py-2 text-sm text-foreground shadow-[3px_3px_0_rgba(0,0,0,0.2)] outline-none transition placeholder:text-muted focus:-translate-y-0.5 focus:border-accent focus:ring-2 focus:ring-accent/15";
