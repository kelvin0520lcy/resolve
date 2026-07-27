import {
  OPERATIONAL_EVENT_NAMES,
  type OperationalEventName,
} from "@/lib/monitoring/event-types";
import { hasValidAppCheckToken } from "@/lib/firebase/app-check-server";
import { logServerEvent } from "@/lib/monitoring/server-log";

export const runtime = "nodejs";

const MAX_BODY_BYTES = 2_048;
const EVENT_NAMES = new Set<string>(OPERATIONAL_EVENT_NAMES);

function shortText(value: unknown, maxLength = 80) {
  return typeof value === "string" && value.length <= maxLength
    ? value
    : undefined;
}

export async function POST(request: Request) {
  const contentLength = Number(request.headers.get("content-length") ?? "0");
  if (contentLength > MAX_BODY_BYTES) {
    return Response.json({ error: "Event payload is too large." }, { status: 413 });
  }
  if (!(await hasValidAppCheckToken(request))) {
    return Response.json({ error: "App verification failed." }, { status: 401 });
  }

  let payload: Record<string, unknown>;
  try {
    const text = await request.text();
    if (new TextEncoder().encode(text).byteLength > MAX_BODY_BYTES) {
      return Response.json(
        { error: "Event payload is too large." },
        { status: 413 },
      );
    }
    payload = JSON.parse(text) as Record<string, unknown>;
  } catch {
    return Response.json({ error: "Invalid event payload." }, { status: 400 });
  }

  if (!EVENT_NAMES.has(String(payload.event))) {
    return Response.json({ error: "Unknown event." }, { status: 400 });
  }

  const route = shortText(payload.route);
  const safeRoute = route?.startsWith("/") ? route : undefined;
  const attempt =
    typeof payload.attempt === "number" &&
    Number.isInteger(payload.attempt) &&
    payload.attempt >= 0 &&
    payload.attempt <= 100
      ? payload.attempt
      : undefined;

  logServerEvent("error", payload.event as OperationalEventName, {
    route: safeRoute ?? null,
    phase: shortText(payload.phase) ?? null,
    attempt: attempt ?? null,
    clientErrorName: shortText(payload.errorName) ?? null,
    digest: shortText(payload.digest, 128) ?? null,
  });

  return new Response(null, { status: 202 });
}
