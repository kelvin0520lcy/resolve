import { getFirebaseAdmin } from "@/lib/firebase/admin";
import { logServerEvent } from "@/lib/monitoring/server-log";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const REQUIRED_PUBLIC_CONFIGURATION = [
  "NEXT_PUBLIC_FIREBASE_API_KEY",
  "NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN",
  "NEXT_PUBLIC_FIREBASE_PROJECT_ID",
  "NEXT_PUBLIC_FIREBASE_APP_ID",
  "NEXT_PUBLIC_FIREBASE_APP_CHECK_SITE_KEY",
] as const;

const processStartedAt = new Date().toISOString();

function configurationState() {
  const missing = REQUIRED_PUBLIC_CONFIGURATION.filter(
    (key) => !process.env[key]?.trim(),
  );
  const hasAdminCredential = Boolean(
    process.env.FIREBASE_SERVICE_ACCOUNT_JSON?.trim() ||
      process.env.GOOGLE_APPLICATION_CREDENTIALS?.trim(),
  );
  return {
    ready: missing.length === 0 && hasAdminCredential,
    missing,
    hasAdminCredential,
  };
}

export async function GET() {
  const configuration = configurationState();
  let firebaseAdmin = false;

  if (configuration.ready) {
    try {
      getFirebaseAdmin();
      firebaseAdmin = true;
    } catch (error) {
      logServerEvent(
        "error",
        "health_firebase_admin_initialization_failed",
        { phase: "initialization" },
        error,
      );
    }
  } else {
    logServerEvent("warn", "health_configuration_incomplete", {
      missingPublicValues: configuration.missing.length,
      hasAdminCredential: configuration.hasAdminCredential,
    });
  }

  const healthy = configuration.ready && firebaseAdmin;
  return Response.json(
    {
      status: healthy ? "ok" : "unhealthy",
      checks: {
        configuration: configuration.ready,
        firebaseAdmin,
      },
      startedAt: processStartedAt,
    },
    {
      status: healthy ? 200 : 503,
      headers: {
        "cache-control": "no-store",
      },
    },
  );
}
