"use client";

import { useState } from "react";
import { Trash2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function ConfirmDeleteButton({
  itemLabel,
  onConfirm,
  className,
}: {
  itemLabel: string;
  onConfirm: () => void;
  className?: string;
}) {
  const [confirming, setConfirming] = useState(false);

  if (confirming) {
    return (
      <div
        className={cn("flex shrink-0 items-center gap-1.5", className)}
        role="group"
        aria-label={`Confirm removal of ${itemLabel}`}
      >
        <Button
          type="button"
          size="sm"
          variant="destructive"
          onClick={onConfirm}
          aria-label={`Confirm remove ${itemLabel}`}
        >
          Remove
        </Button>
        <Button
          type="button"
          size="icon"
          variant="ghost"
          className="h-8 w-8"
          onClick={() => setConfirming(false)}
          aria-label={`Cancel removing ${itemLabel}`}
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
    );
  }

  return (
    <Button
      type="button"
      size="icon"
      variant="ghost"
      className={cn(
        "h-9 w-9 shrink-0 text-muted hover:border-danger/40 hover:bg-danger/10 hover:text-danger",
        className,
      )}
      onClick={() => setConfirming(true)}
      aria-label={`Remove ${itemLabel}`}
    >
      <Trash2 className="h-4 w-4" />
    </Button>
  );
}
