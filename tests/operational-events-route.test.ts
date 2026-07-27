import { beforeEach, describe, expect, it, vi } from "vitest";

const eventMocks = vi.hoisted(() => ({
  hasValidAppCheckToken: vi.fn(),
  logServerEvent: vi.fn(),
}));

vi.mock("@/lib/firebase/app-check-server", () => ({
  hasValidAppCheckToken: eventMocks.hasValidAppCheckToken,
}));

vi.mock("@/lib/monitoring/server-log", () => ({
  logServerEvent: eventMocks.logServerEvent,
}));

import { POST } from "@/app/api/operational-events/route";

beforeEach(() => {
  eventMocks.hasValidAppCheckToken.mockReset();
  eventMocks.logServerEvent.mockReset();
  eventMocks.hasValidAppCheckToken.mockResolvedValue(true);
});

describe("operational event endpoint", () => {
  it("records only allowlisted, privacy-safe fields", async () => {
    const response = await POST(
      new Request("https://resolve.example/api/operational-events", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          event: "workspace_sync_retry_exhausted",
          route: "/weekly",
          phase: "cloud_write",
          attempt: 4,
          errorName: "FirebaseError",
          message: "private task text must not be logged",
        }),
      }),
    );

    expect(response.status).toBe(202);
    expect(eventMocks.logServerEvent).toHaveBeenCalledWith(
      "error",
      "workspace_sync_retry_exhausted",
      {
        route: "/weekly",
        phase: "cloud_write",
        attempt: 4,
        clientErrorName: "FirebaseError",
        digest: null,
      },
    );
    expect(JSON.stringify(eventMocks.logServerEvent.mock.calls)).not.toContain(
      "private task text",
    );
  });

  it("rejects unknown events and invalid App Check tokens", async () => {
    const unknown = await POST(
      new Request("https://resolve.example/api/operational-events", {
        method: "POST",
        body: JSON.stringify({ event: "arbitrary_log" }),
      }),
    );
    expect(unknown.status).toBe(400);

    eventMocks.hasValidAppCheckToken.mockResolvedValue(false);
    const unverified = await POST(
      new Request("https://resolve.example/api/operational-events", {
        method: "POST",
        body: JSON.stringify({ event: "client_runtime_error" }),
      }),
    );
    expect(unverified.status).toBe(401);
    expect(eventMocks.logServerEvent).not.toHaveBeenCalled();
  });
});
