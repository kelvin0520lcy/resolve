import { act, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  AUTH_BOOT_TIMEOUT_MS,
  AuthProvider,
  useAuth,
} from "@/contexts/auth-context";

const authMocks = vi.hoisted(() => ({
  configured: true,
  currentUser: null as Record<string, unknown> | null,
  next: null as ((user: Record<string, unknown> | null) => void) | null,
  error: null as ((error: Error) => void) | null,
  unsubscribe: vi.fn(),
}));

vi.mock("firebase/auth", () => ({
  onAuthStateChanged: vi.fn(
    (
      _auth: unknown,
      next: (user: Record<string, unknown> | null) => void,
      error: (error: Error) => void,
    ) => {
      authMocks.next = next;
      authMocks.error = error;
      return authMocks.unsubscribe;
    },
  ),
  signInWithEmailAndPassword: vi.fn(),
  createUserWithEmailAndPassword: vi.fn(),
  signOut: vi.fn(),
  signInWithPopup: vi.fn(),
  GoogleAuthProvider: class GoogleAuthProvider {},
  sendPasswordResetEmail: vi.fn(),
  updateProfile: vi.fn(),
}));

vi.mock("@/lib/firebase/config", () => ({
  isFirebaseConfigured: () => authMocks.configured,
  getFirebaseAuth: () => ({ currentUser: authMocks.currentUser }),
}));

function AuthStatus() {
  const { loading, firebaseUser } = useAuth();
  return (
    <output>
      {loading ? "loading" : firebaseUser ? `user:${firebaseUser.uid}` : "guest"}
    </output>
  );
}

beforeEach(() => {
  vi.useFakeTimers();
  authMocks.configured = true;
  authMocks.currentUser = null;
  authMocks.next = null;
  authMocks.error = null;
  authMocks.unsubscribe.mockClear();
});

afterEach(() => {
  vi.useRealTimers();
});

describe("AuthProvider mobile bootstrap recovery", () => {
  it("does not wait forever when Firebase never settles", () => {
    render(
      <AuthProvider>
        <AuthStatus />
      </AuthProvider>,
    );
    expect(screen.getByText("loading")).toBeInTheDocument();

    act(() => {
      vi.advanceTimersByTime(AUTH_BOOT_TIMEOUT_MS);
    });

    expect(screen.getByText("guest")).toBeInTheDocument();
  });

  it("recovers immediately from an observer error", () => {
    render(
      <AuthProvider>
        <AuthStatus />
      </AuthProvider>,
    );

    act(() => {
      authMocks.error?.(new Error("persistence unavailable"));
    });

    expect(screen.getByText("guest")).toBeInTheDocument();
  });

  it("still accepts an authenticated session after the fallback", () => {
    render(
      <AuthProvider>
        <AuthStatus />
      </AuthProvider>,
    );

    act(() => {
      vi.advanceTimersByTime(AUTH_BOOT_TIMEOUT_MS);
    });
    expect(screen.getByText("guest")).toBeInTheDocument();

    act(() => {
      authMocks.next?.({
        uid: "mobile-user",
        displayName: "Mobile User",
        email: "mobile@example.com",
        photoURL: null,
      });
    });

    expect(screen.getByText("user:mobile-user")).toBeInTheDocument();
  });

  it("starts immediately in demo mode when Firebase is not configured", () => {
    authMocks.configured = false;
    render(
      <AuthProvider>
        <AuthStatus />
      </AuthProvider>,
    );
    expect(screen.getByText("guest")).toBeInTheDocument();
  });
});
