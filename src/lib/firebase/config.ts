import { initializeApp, getApps, type FirebaseApp } from "firebase/app";
import {
  initializeAppCheck,
  getToken as getAppCheckToken,
  ReCaptchaEnterpriseProvider,
  type AppCheck,
} from "firebase/app-check";
import { getAuth, type Auth } from "firebase/auth";
import { getFirestore, type Firestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

export function isFirebaseConfigured(): boolean {
  return Boolean(
    firebaseConfig.apiKey &&
      firebaseConfig.authDomain &&
      firebaseConfig.projectId &&
      firebaseConfig.appId,
  );
}

let app: FirebaseApp | undefined;
let appCheck: AppCheck | undefined;
let auth: Auth | undefined;
let db: Firestore | undefined;

export function isFirebaseAppCheckConfigured(): boolean {
  return Boolean(
    process.env.NEXT_PUBLIC_FIREBASE_APP_CHECK_SITE_KEY?.trim(),
  );
}

function initializeFirebaseAppCheck(firebaseApp: FirebaseApp) {
  if (
    typeof window === "undefined" ||
    appCheck ||
    !isFirebaseAppCheckConfigured()
  ) {
    return;
  }

  const isLocalDevelopment = ["localhost", "127.0.0.1", "::1"].includes(
    window.location.hostname,
  );
  if (isLocalDevelopment) {
    // Firebase generates a local debug token in the browser console. Register
    // that token in the Firebase console; never commit an approved token.
    (
      globalThis as typeof globalThis & {
        FIREBASE_APPCHECK_DEBUG_TOKEN?: boolean | string;
      }
    ).FIREBASE_APPCHECK_DEBUG_TOKEN = true;
  }

  appCheck = initializeAppCheck(firebaseApp, {
    provider: new ReCaptchaEnterpriseProvider(
      process.env.NEXT_PUBLIC_FIREBASE_APP_CHECK_SITE_KEY!,
    ),
    isTokenAutoRefreshEnabled: true,
  });
}

function getFirebaseApp(): FirebaseApp {
  if (!isFirebaseConfigured()) {
    throw new Error(
      "Firebase is not configured. Add credentials to .env.local — see .env.example.",
    );
  }
  if (!app) {
    app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
  }
  initializeFirebaseAppCheck(app);
  return app;
}

export function getFirebaseAuth(): Auth {
  if (!auth) auth = getAuth(getFirebaseApp());
  return auth;
}

export function getFirebaseDb(): Firestore {
  if (!db) db = getFirestore(getFirebaseApp());
  return db;
}

export async function getFirebaseAppCheckToken(): Promise<string | undefined> {
  getFirebaseApp();
  if (!appCheck) return undefined;
  return (await getAppCheckToken(appCheck)).token;
}

export const COLLECTIONS = {
  users: "users",
  semesters: "semesters",
  goals: "goals",
  milestones: "milestones",
  tasks: "tasks",
  habits: "habits",
  habitLogs: "habitLogs",
  guitarSessions: "guitarSessions",
  reflections: "reflections",
  modules: "modules",
  algorithmLogs: "algorithmLogs",
  applications: "applications",
  achievements: "achievements",
} as const;
