import { cn } from "@/lib/utils";
import { forwardRef, type InputHTMLAttributes } from "react";

export const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(
  ({ className, type, ...props }, ref) => (
    <input
      type={type}
      ref={ref}
      className={cn(
        "flex h-11 w-full rounded-xl border-2 border-border bg-surface px-3 py-2 text-sm shadow-[3px_3px_0_rgba(0,0,0,0.2)] transition placeholder:text-muted focus-visible:-translate-y-0.5 focus-visible:border-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/20 disabled:cursor-not-allowed disabled:opacity-50",
        className,
      )}
      {...props}
    />
  ),
);
Input.displayName = "Input";

export const Label = forwardRef<
  HTMLLabelElement,
  React.LabelHTMLAttributes<HTMLLabelElement>
>(({ className, ...props }, ref) => (
  <label
    ref={ref}
    className={cn("text-xs font-black uppercase tracking-wider text-foreground", className)}
    {...props}
  />
));
Label.displayName = "Label";
