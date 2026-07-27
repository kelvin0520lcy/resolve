import packageJson from "../../../../package.json";
import { CURRENT_WORKSPACE_SCHEMA_VERSION } from "@/features/workspace/lib/migrations";

export const dynamic = "force-dynamic";

const processStartedAt = new Date().toISOString();

export async function GET() {
  const buildTimestamp = process.env.BUILD_TIMESTAMP?.trim() || null;
  return Response.json(
    {
      version: packageJson.version,
      commit:
        process.env.RENDER_GIT_COMMIT ??
        process.env.SOURCE_COMMIT ??
        process.env.GIT_COMMIT_SHA ??
        "local",
      builtAt: buildTimestamp,
      startedAt: processStartedAt,
      environment: process.env.NODE_ENV ?? "development",
      schemaVersion: CURRENT_WORKSPACE_SCHEMA_VERSION,
      deploymentId:
        process.env.RENDER_SERVICE_ID ??
        process.env.RENDER_INSTANCE_ID ??
        "local",
    },
    {
      headers: {
        "cache-control": "no-store",
      },
    },
  );
}
