import { describe, expect, it } from "vitest";
import { GET } from "@/app/api/version/route";

describe("build diagnostics route", () => {
  it("returns no-store version information", async () => {
    const response = await GET();
    const payload = (await response.json()) as Record<string, string>;

    expect(response.headers.get("cache-control")).toBe("no-store");
    expect(payload.version).toMatch(/^\d+\.\d+\.\d+/);
    expect(payload.commit).toBeTruthy();
    expect(Number.isNaN(Date.parse(payload.builtAt))).toBe(false);
    expect(payload.environment).toBeTruthy();
  });
});
