"use client";

import { getFirebaseAppCheckToken } from "@/lib/firebase/config";
import type { OperationalEventName } from "@/lib/monitoring/event-types";

type OperationalEventContext = {
  phase?: string;
  attempt?: number;
  errorName?: string;
  digest?: string;
};

export async function reportOperationalEvent(
  event: OperationalEventName,
  context: OperationalEventContext = {},
) {
  const appCheckToken = await getFirebaseAppCheckToken().catch(() => undefined);
  const headers: Record<string, string> = {
    "content-type": "application/json",
  };
  if (appCheckToken) headers["x-firebase-appcheck"] = appCheckToken;

  await fetch("/api/operational-events", {
    method: "POST",
    headers,
    body: JSON.stringify({
      event,
      route: window.location.pathname,
      phase: context.phase,
      attempt: context.attempt,
      errorName: context.errorName,
      digest: context.digest,
    }),
    keepalive: true,
  }).catch(() => undefined);
}
