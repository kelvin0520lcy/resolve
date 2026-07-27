import { afterEach, describe, expect, it, vi } from "vitest";

const appCheckMocks = vi.hoisted(() => ({
  verifyToken: vi.fn(),
}));

vi.mock("@/lib/firebase/admin", () => ({
  getFirebaseAdmin: () => ({
    appCheck: { verifyToken: appCheckMocks.verifyToken },
  }),
}));

import { hasValidAppCheckToken } from "@/lib/firebase/app-check-server";

afterEach(() => {
  vi.unstubAllEnvs();
  appCheckMocks.verifyToken.mockReset();
});

describe("server App Check boundary", () => {
  it("allows local tests without production attestation", async () => {
    vi.stubEnv("NODE_ENV", "test");
    await expect(
      hasValidAppCheckToken(new Request("https://resolve.test")),
    ).resolves.toBe(true);
  });

  it("fails closed in production when App Check is not configured", async () => {
    vi.stubEnv("NODE_ENV", "production");
    vi.stubEnv("NEXT_PUBLIC_FIREBASE_APP_CHECK_SITE_KEY", "");
    await expect(
      hasValidAppCheckToken(new Request("https://resolve.test")),
    ).resolves.toBe(false);
  });

  it("requires and verifies the production App Check token", async () => {
    vi.stubEnv("NODE_ENV", "production");
    vi.stubEnv("NEXT_PUBLIC_FIREBASE_APP_CHECK_SITE_KEY", "site-key");
    appCheckMocks.verifyToken.mockResolvedValue({ appId: "app-id" });

    const verified = await hasValidAppCheckToken(
      new Request("https://resolve.test", {
        headers: { "x-firebase-appcheck": "token" },
      }),
    );

    expect(verified).toBe(true);
    expect(appCheckMocks.verifyToken).toHaveBeenCalledWith("token");
    await expect(
      hasValidAppCheckToken(new Request("https://resolve.test")),
    ).resolves.toBe(false);
  });
});
