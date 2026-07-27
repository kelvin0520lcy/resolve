import { FieldValue, Timestamp } from "firebase-admin/firestore";
import { getFirebaseAdmin } from "@/lib/firebase/admin";
import { hasValidAppCheckToken } from "@/lib/firebase/app-check-server";
import { logServerEvent } from "@/lib/monitoring/server-log";

export const runtime = "nodejs";
export const maxDuration = 60;

const RECENT_AUTH_SECONDS = 5 * 60;
export const DELETION_TOMBSTONE_RETENTION_MS = 2 * 60 * 60 * 1_000;

function bearerToken(request: Request) {
  const authorization = request.headers.get("authorization");
  if (!authorization?.startsWith("Bearer ")) return "";
  return authorization.slice("Bearer ".length).trim();
}

export async function POST(request: Request) {
  if (!(await hasValidAppCheckToken(request))) {
    return Response.json(
      { error: "App verification failed. Refresh the page and try again." },
      { status: 401 },
    );
  }

  const token = bearerToken(request);
  if (!token) {
    return Response.json({ error: "Authentication is required." }, { status: 401 });
  }

  let services: ReturnType<typeof getFirebaseAdmin>;
  try {
    services = getFirebaseAdmin();
  } catch (caught) {
    logServerEvent(
      "error",
      "account_deletion_failed",
      { phase: "service_initialization" },
      caught,
    );
    const message =
      caught instanceof Error
        ? caught.message
        : "The account deletion service failed.";
    return Response.json(
      {
        error: "The account deletion service is unavailable. Try again later.",
        detail:
          process.env.NODE_ENV === "development" ? message : undefined,
      },
      { status: 500 },
    );
  }
  const { auth, db } = services;
  let decoded;
  try {
    decoded = await auth.verifyIdToken(token, true);
  } catch {
    return Response.json(
      { error: "Your session is invalid or expired. Sign in again." },
      { status: 401 },
    );
  }

  let phase = "recent_authentication_check";
  try {
    const nowSeconds = Math.floor(Date.now() / 1_000);
    if (
      !decoded.auth_time ||
      nowSeconds - decoded.auth_time > RECENT_AUTH_SECONDS
    ) {
      return Response.json(
        {
          error:
            "For security, sign out and sign in again before deleting the account.",
          code: "recent-auth-required",
        },
        { status: 401 },
      );
    }

    const marker = db.collection("accountDeletions").doc(decoded.uid);
    phase = "deletion_lock";
    await marker.set(
      {
        userId: decoded.uid,
        status: "deleting",
        updatedAt: FieldValue.serverTimestamp(),
      },
      { merge: true },
    );

    phase = "workspace_deletion";
    await db.recursiveDelete(db.collection("workspaces").doc(decoded.uid));
    phase = "profile_deletion";
    await db.collection("users").doc(decoded.uid).delete();
    phase = "authentication_deletion";
    await auth.deleteUser(decoded.uid);
    // Keep the write-blocking marker after authentication is deleted. This
    // closes the window in which another open tab could recreate cloud data
    // using a client-side token that has not noticed the deletion yet.
    // Firestore TTL may be configured against expiresAt; without TTL, the
    // permanent tombstone is the safer failure mode.
    phase = "deletion_receipt";
    await marker
      .set(
        {
          userId: decoded.uid,
          status: "deleted",
          deletedAt: FieldValue.serverTimestamp(),
          updatedAt: FieldValue.serverTimestamp(),
          expiresAt: Timestamp.fromMillis(
            Date.now() + DELETION_TOMBSTONE_RETENTION_MS,
          ),
        },
        { merge: true },
      )
      .catch(() => undefined);

    return Response.json({ deleted: true });
  } catch (caught) {
    logServerEvent(
      "error",
      "account_deletion_failed",
      { phase },
      caught,
    );
    const message =
      caught instanceof Error
        ? caught.message
        : "The account deletion service failed.";
    return Response.json(
      {
        error:
          "Account deletion did not finish. Your account is locked against new cloud writes so the operation can be retried safely.",
        detail:
          process.env.NODE_ENV === "development" ? message : undefined,
      },
      { status: 500 },
    );
  }
}
