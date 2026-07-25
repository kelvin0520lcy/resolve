import { cn } from "@/lib/utils";
import type { HTMLAttributes } from "react";

const variants = {
  default: "border-border bg-surface-muted text-foreground",
  accent: "border-accent/40 bg-accent/15 text-accent",
  success: "border-success/40 bg-success/15 text-success",
  warning: "border-warning/40 bg-warning/15 text-warning",
  danger: "border-danger/40 bg-danger/15 text-danger",
} as const;

export function Badge({
  className,
  variant = "default",
  ...props
}: HTMLAttributes<HTMLSpanElement> & {
  variant?: keyof typeof variants;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-[11px] font-black uppercase tracking-wide",
        variants[variant],
        className,
      )}
      {...props}
    />
  );
}

export function ProgressBar({
  value,
  className,
  color = "var(--accent)",
  label,
}: {
  value: number;
  className?: string;
  color?: string;
  label?: string;
}) {
  const normalizedValue = Math.min(100, Math.max(0, value));
  return (
    <div
      role={label ? "progressbar" : undefined}
      aria-label={label}
      aria-valuemin={label ? 0 : undefined}
      aria-valuemax={label ? 100 : undefined}
      aria-valuenow={label ? Math.round(normalizedValue) : undefined}
      className={cn(
        "h-2.5 w-full overflow-hidden rounded-full border border-white/5 bg-surface-muted",
        className,
      )}
    >
      <div
        className="h-full rounded-full transition-all duration-700 ease-out"
        style={{
          width: `${normalizedValue}%`,
          backgroundColor: color,
        }}
      />
    </div>
  );
}
