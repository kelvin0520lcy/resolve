import type { ReactNode } from "react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { getCategoryMeta } from "@/lib/constants/categories";

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
  return (
    <div className="page-intro manga-panel speed-lines flex flex-col gap-5 overflow-hidden rounded-[26px] p-5 sm:flex-row sm:items-end sm:justify-between sm:p-7">
      <div className="theme-cameo" aria-hidden="true" />
      <div className="relative z-10 max-w-2xl">
        <p className="tape-label mb-3 inline-flex -rotate-1 px-3 py-1 text-[10px] font-black uppercase tracking-[0.2em]">
          Episode log · {eyebrow}
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

export const fieldClassName =
  "h-11 w-full rounded-xl border-2 border-border bg-surface px-3 text-sm shadow-[3px_3px_0_rgba(0,0,0,0.2)] outline-none transition focus:-translate-y-0.5 focus:border-accent focus:ring-2 focus:ring-accent/15";

export const textAreaClassName =
  "min-h-24 w-full resize-y rounded-xl border-2 border-border bg-surface px-3 py-2 text-sm shadow-[3px_3px_0_rgba(0,0,0,0.2)] outline-none transition placeholder:text-muted focus:-translate-y-0.5 focus:border-accent focus:ring-2 focus:ring-accent/15";
