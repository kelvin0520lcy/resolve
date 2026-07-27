import {
  act,
  fireEvent,
  render,
  screen,
} from "@testing-library/react";
import { useState } from "react";
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
  deleteLocalAccountData: vi.fn(),
  getIdToken: vi.fn(),
  signOut: vi.fn(),
  fetch: vi.fn(),
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
  signOut: authMocks.signOut,
  signInWithPopup: vi.fn(),
  GoogleAuthProvider: class GoogleAuthProvider {},
  sendPasswordResetEmail: vi.fn(),
  updateProfile: vi.fn(),
}));

vi.mock("@/features/workspace/lib/recovery", () => ({
  deleteLocalAccountData: authMocks.deleteLocalAccountData,
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

function DeleteAccountHarness() {
  const { deleteAccount } = useAuth();
  const [status, setStatus] = useState("ready");
  return (
    <>
      <button
        type="button"
        onClick={() => {
          void deleteAccount().then(
            () => setStatus("deleted"),
            () => setStatus("failed"),
          );
        }}
      >
        Delete account
      </button>
      <output>{status}</output>
    </>
  );
}

beforeEach(() => {
  vi.useFakeTimers();
  authMocks.configured = true;
  authMocks.currentUser = null;
  authMocks.next = null;
  authMocks.error = null;
  authMocks.unsubscribe.mockClear();
  authMocks.deleteLocalAccountData.mockReset();
  authMocks.getIdToken.mockReset();
  authMocks.signOut.mockReset();
  authMocks.fetch.mockReset();
  authMocks.getIdToken.mockResolvedValue("fresh-token");
  authMocks.fetch.mockResolvedValue(
    new Response(JSON.stringify({ deleted: true }), {
      status: 200,
      headers: { "content-type": "application/json" },
    }),
  );
  authMocks.deleteLocalAccountData.mockResolvedValue(undefined);
  authMocks.signOut.mockResolvedValue(undefined);
  vi.stubGlobal("fetch", authMocks.fetch);
});

afterEach(() => {
  vi.unstubAllGlobals();
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

  it("clears local account data only after cloud and authentication deletion succeed", async () => {
    authMocks.currentUser = {
      uid: "delete-user",
      displayName: "Delete User",
      email: "delete@example.com",
      photoURL: null,
      metadata: { lastSignInTime: new Date().toISOString() },
      getIdToken: authMocks.getIdToken,
    };
    render(
      <AuthProvider>
        <DeleteAccountHarness />
      </AuthProvider>,
    );

    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: "Delete account" }));
      await Promise.resolve();
      await Promise.resolve();
      await Promise.resolve();
    });
    expect(screen.getByText("deleted")).toBeInTheDocument();

    expect(authMocks.getIdToken).toHaveBeenCalledWith(true);
    expect(authMocks.fetch).toHaveBeenCalledWith("/api/account/delete", {
      method: "POST",
      headers: { authorization: "Bearer fresh-token" },
    });
    expect(authMocks.signOut).toHaveBeenCalled();
    expect(authMocks.deleteLocalAccountData).toHaveBeenCalledWith("delete-user");
  });

  it("still clears local data when the deleted Firebase session rejects sign-out", async () => {
    authMocks.currentUser = {
      uid: "already-deleted-user",
      displayName: "Deleted User",
      email: "deleted@example.com",
      photoURL: null,
      metadata: { lastSignInTime: new Date().toISOString() },
      getIdToken: authMocks.getIdToken,
    };
    authMocks.signOut.mockRejectedValue(new Error("user-not-found"));
    render(
      <AuthProvider>
        <DeleteAccountHarness />
      </AuthProvider>,
    );

    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: "Delete account" }));
      await Promise.resolve();
      await Promise.resolve();
      await Promise.resolve();
    });

    expect(screen.getByText("deleted")).toBeInTheDocument();
    expect(authMocks.deleteLocalAccountData).toHaveBeenCalledWith(
      "already-deleted-user",
    );
  });

  it("preserves local records when trusted deletion does not finish", async () => {
    authMocks.currentUser = {
      uid: "restore-user",
      displayName: "Restore User",
      email: "restore@example.com",
      photoURL: null,
      metadata: { lastSignInTime: new Date().toISOString() },
      getIdToken: authMocks.getIdToken,
    };
    authMocks.fetch.mockResolvedValue(
      new Response(JSON.stringify({ error: "Deletion is still pending." }), {
        status: 500,
        headers: { "content-type": "application/json" },
      }),
    );
    render(
      <AuthProvider>
        <DeleteAccountHarness />
      </AuthProvider>,
    );

    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: "Delete account" }));
      await Promise.resolve();
      await Promise.resolve();
      await Promise.resolve();
    });
    expect(screen.getByText("failed")).toBeInTheDocument();

    expect(authMocks.deleteLocalAccountData).not.toHaveBeenCalled();
  });
});
