type ServerLogLevel = "warn" | "error";

type ServerLogContext = Record<string, string | number | boolean | null>;

export function logServerEvent(
  level: ServerLogLevel,
  event: string,
  context: ServerLogContext = {},
  error?: unknown,
) {
  const entry = {
    service: "resolve",
    level,
    event,
    ...context,
    errorName: error instanceof Error ? error.name : error ? "UnknownError" : undefined,
    occurredAt: new Date().toISOString(),
  };

  if (level === "error") {
    console.error(JSON.stringify(entry));
  } else {
    console.warn(JSON.stringify(entry));
  }
}
