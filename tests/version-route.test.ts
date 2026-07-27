import { afterEach, describe, expect, it, vi } from "vitest";
import { GET } from "@/app/api/version/route";

afterEach(() => {
  vi.unstubAllEnvs();
});

describe("build diagnostics route", () => {
  it("distinguishes process start time when no build timestamp is supplied", async () => {
    vi.stubEnv("BUILD_TIMESTAMP", "");
    const response = await GET();
    const payload = (await response.json()) as Record<
      string,
      string | null
    >;

    expect(response.headers.get("cache-control")).toBe("no-store");
    expect(payload.version).toMatch(/^\d+\.\d+\.\d+/);
    expect(payload.commit).toBeTruthy();
    expect(payload.builtAt).toBeNull();
    expect(Number.isNaN(Date.parse(payload.startedAt!))).toBe(false);
    expect(payload.environment).toBeTruthy();
  });

  it("reports a configured build timestamp without changing its meaning", async () => {
    const timestamp = "2026-07-27T05:00:00.000Z";
    vi.stubEnv("BUILD_TIMESTAMP", timestamp);

    const payload = (await (await GET()).json()) as Record<
      string,
      string | null
    >;

    expect(payload.builtAt).toBe(timestamp);
    expect(Number.isNaN(Date.parse(payload.startedAt!))).toBe(false);
  });
});
