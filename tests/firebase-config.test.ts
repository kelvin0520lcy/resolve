import { afterEach, describe, expect, it, vi } from "vitest";

const firebaseMocks = vi.hoisted(() => ({
  initializeApp: vi.fn(() => ({ name: "test-app" })),
  initializeAppCheck: vi.fn(() => ({ name: "app-check" })),
  getAppCheckToken: vi.fn(async () => ({ token: "app-check-token" })),
  getAuth: vi.fn(() => ({ name: "auth" })),
  getFirestore: vi.fn(() => ({ name: "firestore" })),
}));

vi.mock("firebase/app", () => ({
  initializeApp: firebaseMocks.initializeApp,
  getApps: vi.fn(() => []),
}));

vi.mock("firebase/app-check", () => ({
  initializeAppCheck: firebaseMocks.initializeAppCheck,
  getToken: firebaseMocks.getAppCheckToken,
  ReCaptchaEnterpriseProvider: class ReCaptchaEnterpriseProvider {
    constructor(public siteKey: string) {}
  },
}));

vi.mock("firebase/auth", () => ({
  getAuth: firebaseMocks.getAuth,
}));

vi.mock("firebase/firestore", () => ({
  getFirestore: firebaseMocks.getFirestore,
}));

const KEYS = [
  "NEXT_PUBLIC_FIREBASE_API_KEY",
  "NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN",
  "NEXT_PUBLIC_FIREBASE_PROJECT_ID",
  "NEXT_PUBLIC_FIREBASE_APP_ID",
  "NEXT_PUBLIC_FIREBASE_APP_CHECK_SITE_KEY",
] as const;

const original = Object.fromEntries(KEYS.map((key) => [key, process.env[key]]));

afterEach(() => {
  for (const key of KEYS) {
    const value = original[key];
    if (value === undefined) delete process.env[key];
    else process.env[key] = value;
  }
  firebaseMocks.initializeApp.mockClear();
  firebaseMocks.initializeAppCheck.mockClear();
  firebaseMocks.getAppCheckToken.mockClear();
  firebaseMocks.getAuth.mockClear();
  firebaseMocks.getFirestore.mockClear();
  delete (
    globalThis as typeof globalThis & {
      FIREBASE_APPCHECK_DEBUG_TOKEN?: boolean | string;
    }
  ).FIREBASE_APPCHECK_DEBUG_TOKEN;
  vi.resetModules();
});

describe("Firebase configuration guards", () => {
  it("reports missing configuration and protects all service getters", async () => {
    for (const key of KEYS) delete process.env[key];
    vi.resetModules();
    const config = await import("@/lib/firebase/config");
    expect(config.isFirebaseConfigured()).toBe(false);
    expect(() => config.getFirebaseAuth()).toThrow("Firebase is not configured");
    expect(() => config.getFirebaseDb()).toThrow("Firebase is not configured");
  });

  it("requires every essential public value", async () => {
    for (const key of KEYS) process.env[key] = "test";
    delete process.env.NEXT_PUBLIC_FIREBASE_APP_ID;
    vi.resetModules();
    const config = await import("@/lib/firebase/config");
    expect(config.isFirebaseConfigured()).toBe(false);
  });

  it("initializes App Check before Firebase services when a site key exists", async () => {
    for (const key of KEYS) process.env[key] = "test";
    vi.resetModules();
    const config = await import("@/lib/firebase/config");

    config.getFirebaseAuth();

    expect(config.isFirebaseAppCheckConfigured()).toBe(true);
    expect(firebaseMocks.initializeAppCheck).toHaveBeenCalledTimes(1);
    expect(firebaseMocks.initializeAppCheck.mock.invocationCallOrder[0]).toBeLessThan(
      firebaseMocks.getAuth.mock.invocationCallOrder[0],
    );
    expect(
      (
        globalThis as typeof globalThis & {
          FIREBASE_APPCHECK_DEBUG_TOKEN?: boolean | string;
        }
      ).FIREBASE_APPCHECK_DEBUG_TOKEN,
    ).toBe(true);
    await expect(config.getFirebaseAppCheckToken()).resolves.toBe(
      "app-check-token",
    );
  });

  it("keeps local previews usable when App Check is not configured", async () => {
    for (const key of KEYS) process.env[key] = "test";
    delete process.env.NEXT_PUBLIC_FIREBASE_APP_CHECK_SITE_KEY;
    vi.resetModules();
    const config = await import("@/lib/firebase/config");

    config.getFirebaseDb();

    expect(config.isFirebaseConfigured()).toBe(true);
    expect(config.isFirebaseAppCheckConfigured()).toBe(false);
    expect(firebaseMocks.initializeAppCheck).not.toHaveBeenCalled();
  });
});
