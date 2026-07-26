"use client";

import { useState } from "react";
import { Trash2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ConfirmDeleteButton } from "@/components/ui/confirm-delete-button";

export function LinkedRecordDeleteButton({
  itemLabel,
  linkedTaskCount,
  onConfirm,
}: {
  itemLabel: string;
  linkedTaskCount: number;
  onConfirm: (policy: "preserve" | "delete") => void;
}) {
  const [confirming, setConfirming] = useState(false);

  if (!linkedTaskCount) {
    return (
      <ConfirmDeleteButton
        itemLabel={itemLabel}
        onConfirm={() => onConfirm("preserve")}
      />
    );
  }

  if (!confirming) {
    return (
      <Button
        type="button"
        size="icon"
        variant="ghost"
        className="h-9 w-9 shrink-0 text-muted hover:border-danger/40 hover:bg-danger/10 hover:text-danger"
        onClick={() => setConfirming(true)}
        aria-label={`Remove ${itemLabel}`}
      >
        <Trash2 className="h-4 w-4" />
      </Button>
    );
  }

  return (
    <div
      className="w-full rounded-xl border border-danger/35 bg-danger/5 p-3"
      role="group"
      aria-label={`Choose what happens to linked tasks for ${itemLabel}`}
    >
      <p className="text-[11px] font-bold leading-5">
        {linkedTaskCount} linked task{linkedTaskCount === 1 ? "" : "s"} will
        otherwise remain as ordinary tasks.
      </p>
      <div className="mt-2 flex flex-wrap gap-2">
        <Button
          type="button"
          size="sm"
          variant="secondary"
          onClick={() => onConfirm("preserve")}
        >
          Keep tasks
        </Button>
        <Button
          type="button"
          size="sm"
          variant="destructive"
          onClick={() => onConfirm("delete")}
        >
          Remove tasks too
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
    </div>
  );
}
