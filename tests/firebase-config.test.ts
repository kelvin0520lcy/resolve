import { afterEach, describe, expect, it, vi } from "vitest";

const KEYS = [
  "NEXT_PUBLIC_FIREBASE_API_KEY",
  "NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN",
  "NEXT_PUBLIC_FIREBASE_PROJECT_ID",
  "NEXT_PUBLIC_FIREBASE_APP_ID",
] as const;

const original = Object.fromEntries(KEYS.map((key) => [key, process.env[key]]));

afterEach(() => {
  for (const key of KEYS) {
    const value = original[key];
    if (value === undefined) delete process.env[key];
    else process.env[key] = value;
  }
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
    expect(() => config.getFirebaseStorage()).toThrow(
      "Firebase is not configured",
    );
  });

  it("requires every essential public value", async () => {
    for (const key of KEYS) process.env[key] = "test";
    delete process.env.NEXT_PUBLIC_FIREBASE_APP_ID;
    vi.resetModules();
    const config = await import("@/lib/firebase/config");
    expect(config.isFirebaseConfigured()).toBe(false);
  });
});
