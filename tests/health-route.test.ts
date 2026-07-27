import { afterEach, describe, expect, it, vi } from "vitest";

const healthMocks = vi.hoisted(() => ({
  getFirebaseAdmin: vi.fn(),
  logServerEvent: vi.fn(),
}));

vi.mock("@/lib/firebase/admin", () => ({
  getFirebaseAdmin: healthMocks.getFirebaseAdmin,
}));

vi.mock("@/lib/monitoring/server-log", () => ({
  logServerEvent: healthMocks.logServerEvent,
}));

import { GET } from "@/app/api/health/route";

const REQUIRED_ENV = {
  NEXT_PUBLIC_FIREBASE_API_KEY: "api-key",
  NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN: "resolve.firebaseapp.com",
  NEXT_PUBLIC_FIREBASE_PROJECT_ID: "resolve",
  NEXT_PUBLIC_FIREBASE_APP_ID: "app-id",
  NEXT_PUBLIC_FIREBASE_APP_CHECK_SITE_KEY: "site-key",
  FIREBASE_SERVICE_ACCOUNT_JSON: "{}",
} as const;

afterEach(() => {
  vi.unstubAllEnvs();
  healthMocks.getFirebaseAdmin.mockReset();
  healthMocks.logServerEvent.mockReset();
});

describe("health endpoint", () => {
  it("reports healthy only when production configuration and Admin initialize", async () => {
    for (const [key, value] of Object.entries(REQUIRED_ENV)) {
      vi.stubEnv(key, value);
    }
    healthMocks.getFirebaseAdmin.mockReturnValue({ auth: {}, db: {} });

    const response = await GET();
    const payload = await response.json();

    expect(response.status).toBe(200);
    expect(response.headers.get("cache-control")).toBe("no-store");
    expect(payload).toMatchObject({
      status: "ok",
      checks: { configuration: true, firebaseAdmin: true },
    });
  });

  it("does not expose missing configuration details in an unhealthy response", async () => {
    for (const key of Object.keys(REQUIRED_ENV)) {
      vi.stubEnv(key, "");
    }

    const response = await GET();
    const payload = await response.json();

    expect(response.status).toBe(503);
    expect(payload).toMatchObject({
      status: "unhealthy",
      checks: { configuration: false, firebaseAdmin: false },
    });
    expect(JSON.stringify(payload)).not.toContain("NEXT_PUBLIC_FIREBASE");
    expect(healthMocks.getFirebaseAdmin).not.toHaveBeenCalled();
    expect(healthMocks.logServerEvent).toHaveBeenCalledWith(
      "warn",
      "health_configuration_incomplete",
      expect.objectContaining({ hasAdminCredential: false }),
    );
  });

  it("fails closed when Firebase Admin cannot initialize", async () => {
    for (const [key, value] of Object.entries(REQUIRED_ENV)) {
      vi.stubEnv(key, value);
    }
    healthMocks.getFirebaseAdmin.mockImplementation(() => {
      throw new Error("invalid credential");
    });

    const response = await GET();

    expect(response.status).toBe(503);
    expect(healthMocks.logServerEvent).toHaveBeenCalledWith(
      "error",
      "health_firebase_admin_initialization_failed",
      { phase: "initialization" },
      expect.any(Error),
    );
  });
});
