import { getFirebaseAdmin } from "@/lib/firebase/admin";

export async function hasValidAppCheckToken(request: Request) {
  if (process.env.NODE_ENV !== "production") return true;
  if (!process.env.NEXT_PUBLIC_FIREBASE_APP_CHECK_SITE_KEY?.trim()) return false;

  const token = request.headers.get("x-firebase-appcheck")?.trim();
  if (!token) return false;

  try {
    await getFirebaseAdmin().appCheck.verifyToken(token);
    return true;
  } catch {
    return false;
  }
}
