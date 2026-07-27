"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  signInWithPopup,
  GoogleAuthProvider,
  sendPasswordResetEmail,
  updateProfile,
  type User as FirebaseUser,
} from "firebase/auth";
import {
  getFirebaseAuth,
  isFirebaseConfigured,
} from "@/lib/firebase/config";
import type { User } from "@/types";
import { deleteLocalAccountData } from "@/features/workspace/lib/recovery";

type AuthContextValue = {
  user: User | null;
  firebaseUser: FirebaseUser | null;
  loading: boolean;
  isConfigured: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, displayName: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  deleteAccount: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export const AUTH_BOOT_TIMEOUT_MS = 3000;

function profileFromFirebase(firebaseUser: FirebaseUser): User {
  const now = new Date().toISOString();
  return {
    id: firebaseUser.uid,
    displayName: firebaseUser.displayName ?? "Student",
    email: firebaseUser.email ?? "",
    photoURL: firebaseUser.photoURL ?? undefined,
    createdAt: now,
    updatedAt: now,
  };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const isConfigured = isFirebaseConfigured();
  const [user, setUser] = useState<User | null>(null);
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [loading, setLoading] = useState(isConfigured);

  useEffect(() => {
    if (!isConfigured) {
      return;
    }

    let cancelled = false;
    let unsubscribe = () => {};
    let timeoutId: number | undefined;

    const applySession = (fbUser: FirebaseUser | null) => {
      if (cancelled) return;
      setFirebaseUser(fbUser);
      if (fbUser) {
        setUser(profileFromFirebase(fbUser));
        setLoading(false);
      } else {
        setUser(null);
        setLoading(false);
      }
    };

    try {
      const auth = getFirebaseAuth();
      timeoutId = window.setTimeout(() => {
        // Some mobile browsers never settle Firebase persistence on a LAN/IP
        // origin. Use the best cached state and keep the observer alive so a
        // late session can still replace this fallback.
        applySession(auth.currentUser);
      }, AUTH_BOOT_TIMEOUT_MS);

      unsubscribe = onAuthStateChanged(
        auth,
        (fbUser) => {
          if (timeoutId !== undefined) window.clearTimeout(timeoutId);
          applySession(fbUser);
        },
        () => {
          if (timeoutId !== undefined) window.clearTimeout(timeoutId);
          applySession(auth.currentUser);
        },
      );
    } catch {
      timeoutId = window.setTimeout(() => applySession(null), 0);
    }

    return () => {
      cancelled = true;
      if (timeoutId !== undefined) window.clearTimeout(timeoutId);
      unsubscribe();
    };
  }, [isConfigured]);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      firebaseUser,
      loading,
      isConfigured,
      async signIn(email, password) {
        const credential = await signInWithEmailAndPassword(
          getFirebaseAuth(),
          email,
          password,
        );
        setFirebaseUser(credential.user);
        setUser(profileFromFirebase(credential.user));
      },
      async signUp(email, password, displayName) {
        const cred = await createUserWithEmailAndPassword(
          getFirebaseAuth(),
          email,
          password,
        );
        await updateProfile(cred.user, { displayName });
        const profile = profileFromFirebase(cred.user);
        profile.displayName = displayName;
        setFirebaseUser(cred.user);
        setUser(profile);
      },
      async signInWithGoogle() {
        const provider = new GoogleAuthProvider();
        const credential = await signInWithPopup(
          getFirebaseAuth(),
          provider,
        );
        setFirebaseUser(credential.user);
        setUser(profileFromFirebase(credential.user));
      },
      async signOut() {
        await firebaseSignOut(getFirebaseAuth());
      },
      async resetPassword(email) {
        await sendPasswordResetEmail(getFirebaseAuth(), email);
      },
      async deleteAccount() {
        const activeUser = getFirebaseAuth().currentUser;
        if (!activeUser) throw new Error("Sign in again before deleting the account.");
        const lastSignIn = activeUser.metadata.lastSignInTime
          ? Date.parse(activeUser.metadata.lastSignInTime)
          : 0;
        if (!lastSignIn || Date.now() - lastSignIn > 5 * 60_000) {
          throw new Error(
            "For security, sign out and sign in again before deleting the account.",
          );
        }
        const token = await activeUser.getIdToken(true);
        const response = await fetch("/api/account/delete", {
          method: "POST",
          headers: {
            authorization: `Bearer ${token}`,
          },
        });
        const result = (await response.json().catch(() => ({}))) as {
          error?: string;
        };
        if (!response.ok) {
          throw new Error(
            result.error || "The account could not be deleted safely.",
          );
        }
        // The server has already removed the Firebase user, so sign-out can
        // reject while clearing the now-stale browser session. Local cleanup
        // must still continue after that expected failure.
        await firebaseSignOut(getFirebaseAuth()).catch(() => undefined);
        await deleteLocalAccountData(activeUser.uid);
        setFirebaseUser(null);
        setUser(null);
      },
    }),
    [user, firebaseUser, loading, isConfigured],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
