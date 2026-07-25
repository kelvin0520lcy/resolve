import { FirebaseError } from "firebase/app";
import { describe, expect, it } from "vitest";
import {
  GOAL_CATEGORIES,
  getCategoryMeta,
} from "@/lib/constants/categories";
import { getFirebaseAuthErrorMessage } from "@/lib/firebase/auth-errors";

describe("category metadata", () => {
  it("returns every known category unchanged", () => {
    for (const category of GOAL_CATEGORIES) {
      expect(getCategoryMeta(category.id)).toBe(category);
    }
  });

  it("creates a readable custom fallback", () => {
    expect(getCategoryMeta("band merch")).toEqual({
      id: "custom",
      label: "band merch",
      color: "#94a3b8",
      scene: "neutral",
    });
  });
});

describe("Firebase authentication messages", () => {
  it.each([
    ["auth/invalid-credential", "sign-in", "Invalid email or password."],
    [
      "auth/email-already-in-use",
      "sign-up",
      "An account already exists for this email.",
    ],
    ["auth/invalid-email", "sign-in", "Enter a valid email address."],
    [
      "auth/weak-password",
      "sign-up",
      "Use a stronger password with at least eight characters.",
    ],
    ["auth/user-disabled", "sign-in", "This account has been disabled."],
    [
      "auth/too-many-requests",
      "sign-in",
      "Too many attempts. Wait a moment and try again.",
    ],
    [
      "auth/network-request-failed",
      "sign-in",
      "Could not reach Firebase. Check your connection and try again.",
    ],
    [
      "auth/unauthorized-domain",
      "google",
      "This domain is not authorized in Firebase Authentication.",
    ],
    [
      "auth/popup-blocked",
      "google",
      "The Google sign-in popup was blocked by the browser.",
    ],
    [
      "auth/popup-closed-by-user",
      "google",
      "The Google sign-in popup was closed before completing.",
    ],
    [
      "auth/account-exists-with-different-credential",
      "google",
      "This email already uses a different sign-in method.",
    ],
  ] as const)("maps %s", (code, action, message) => {
    expect(
      getFirebaseAuthErrorMessage(new FirebaseError(code, "test"), action),
    ).toBe(message);
  });

  it("explains disabled providers for each authentication action", () => {
    const error = new FirebaseError("auth/operation-not-allowed", "test");
    expect(getFirebaseAuthErrorMessage(error, "google")).toContain(
      "Google sign-in",
    );
    expect(getFirebaseAuthErrorMessage(error, "sign-up")).toContain(
      "Email/password",
    );
    expect(getFirebaseAuthErrorMessage(error, "password-reset")).toContain(
      "not enabled",
    );
  });

  it("uses a private reset message and safe unknown fallbacks", () => {
    const missing = new FirebaseError("auth/user-not-found", "test");
    expect(getFirebaseAuthErrorMessage(missing, "password-reset")).toContain(
      "No account",
    );
    expect(getFirebaseAuthErrorMessage(missing, "sign-in")).toBe(
      "Invalid email or password.",
    );
    expect(
      getFirebaseAuthErrorMessage(
        new FirebaseError("auth/unknown", "test"),
        "sign-in",
      ),
    ).toContain("Firebase rejected");
    expect(getFirebaseAuthErrorMessage(new Error("offline"), "sign-in")).toBe(
      "Firebase could not complete the request. Please try again.",
    );
  });
});
