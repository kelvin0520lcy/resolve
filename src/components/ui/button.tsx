import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";
import { forwardRef, type ButtonHTMLAttributes } from "react";

export const buttonVariants = cva(
  "inline-flex min-w-0 max-w-full items-center justify-center gap-2 whitespace-normal rounded-xl border-2 text-center text-sm font-black uppercase leading-tight tracking-wide transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default:
          "border-[#180f1d] bg-accent text-white shadow-[4px_4px_0_#180f1d] hover:-translate-y-0.5 hover:bg-accent-hover hover:shadow-[5px_6px_0_#180f1d] active:translate-y-0.5 active:shadow-[2px_2px_0_#180f1d]",
        secondary:
          "border-border bg-surface-elevated text-foreground shadow-[3px_3px_0_rgba(0,0,0,0.35)] hover:border-accent hover:bg-surface-muted",
        ghost: "border-transparent text-foreground hover:border-border hover:bg-surface-muted",
        outline:
          "border-accent bg-transparent text-accent shadow-[3px_3px_0_rgba(0,0,0,0.3)] hover:bg-accent/10",
        destructive:
          "border-[#180f1d] bg-danger text-white shadow-[4px_4px_0_#180f1d] hover:bg-danger/90",
      },
      size: {
        default: "min-h-10 px-4 py-2",
        sm: "min-h-8 rounded-lg px-3 py-1.5 text-xs",
        lg: "min-h-12 rounded-2xl px-6 py-2.5 text-base",
        icon: "h-10 w-10 shrink-0",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export interface ButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => (
    <button
      ref={ref}
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  ),
);
Button.displayName = "Button";
