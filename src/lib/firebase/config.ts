import { initializeApp, getApps, type FirebaseApp } from "firebase/app";
import { getAuth, type Auth } from "firebase/auth";
import { getFirestore, type Firestore } from "firebase/firestore";
import { getStorage, type FirebaseStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
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
let auth: Auth | undefined;
let db: Firestore | undefined;
let storage: FirebaseStorage | undefined;

function getFirebaseApp(): FirebaseApp {
  if (!isFirebaseConfigured()) {
    throw new Error(
      "Firebase is not configured. Add credentials to .env.local — see .env.example.",
    );
  }
  if (!app) {
    app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
  }
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

export function getFirebaseStorage(): FirebaseStorage {
  if (!storage) storage = getStorage(getFirebaseApp());
  return storage;
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
