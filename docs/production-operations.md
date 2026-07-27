# Production operations runbook

This runbook separates controls implemented in the repository from controls
that must be configured in Firebase, Render, and GitHub. Do not mark a release
gate complete until the external console state has been observed.

## Required deployment configuration

1. Set every value from `.env.example` in Render. Keep
   `FIREBASE_SERVICE_ACCOUNT_JSON` server-only.
2. Set Render's health-check path to `/api/health`. A healthy instance returns
   HTTP 200 with `status: "ok"`; an incomplete or invalid Firebase
   configuration returns HTTP 503.
3. After deployment, confirm `/api/version` reports the intended commit and
   `/api/health` is healthy.
4. Run the deployed smoke workflow with the production URL and expected commit.

The health route validates configuration and Firebase Admin initialization. It
does not read Firestore, so health polling does not consume document reads.

## Firebase Authentication

1. Enable Email/Password and Google providers.
2. Add the production Render hostname to Authentication authorized domains.
3. Configure the verification-email sender name, subject, action URL, and
   production continue URL.
4. Test signup, verification, Google sign-in, password reset, sign-out, and
   recent-auth account deletion with a disposable production account.

Unverified email/password accounts are blocked by both the application and
Firestore rules. Existing unverified accounts keep their data and regain access
after completing verification.

## App Check rollout

1. Create a reCAPTCHA Enterprise site key for the production hostname.
2. Register the web app in Firebase App Check and set
   `NEXT_PUBLIC_FIREBASE_APP_CHECK_SITE_KEY` in Render.
3. Deploy without enforcement and inspect App Check metrics for Authentication
   and Firestore.
4. Register each local debug token shown in the browser console for approved
   development machines. Never commit or share an approved debug token.
5. Only after legitimate production requests are verified, enable enforcement
   one Firebase product at a time. Re-run signup, sign-in, sync, export,
   archive, and account-deletion checks after each change.

Do not enable enforcement before the deployed build includes the App Check
site key; that would lock out legitimate clients.

## Firestore rules and deletion protection

Deploy rules and indexes together:

```bash
firebase deploy --only firestore:rules,firestore:indexes
```

Then run `npm run test:rules`. Confirm that unverified users and users with an
`accountDeletions/{uid}` tombstone cannot read or write their workspace. Keep
clients denied from reading or mutating tombstones.

Configure Firestore TTL for the `accountDeletions.expiresAt` field only after
confirming deletion completes reliably. If TTL is not configured, a retained
tombstone is safer than allowing a stale session to recreate deleted data.

## Backup and restore

1. Enable Firestore point-in-time recovery or scheduled exports according to
   the Firebase project plan.
2. Store backups outside the active workspace collection and restrict operator
   access.
3. Record retention and deletion periods for Firestore exports and Render logs.
4. Quarterly, restore the latest backup into an isolated test project.
5. Verify document counts, workspace schema versions, and a sample export.
6. Record the restore duration and any manual steps. A backup is not considered
   proven until a restore drill succeeds.

Users should still export important workspaces from Settings before destructive
changes.

## Monitoring, quota, and incident response

1. Alert on Render health-check failures and repeated structured log events:
   `account_deletion_failed`,
   `client_runtime_error`,
   `workspace_migration_failed`,
   `workspace_sync_retry_exhausted`,
   `workspace_conflict_failed`,
   `workspace_import_failed`,
   `health_firebase_admin_initialization_failed`, and
   `health_configuration_incomplete`.
2. Configure Firebase budget and quota alerts for Firestore reads, writes,
   storage, and Authentication.
3. Review App Check rejected-request metrics during rollout.
4. Keep logs free of workspace content, reflections, credentials, and tokens.
   The `/api/operational-events` endpoint accepts only a small allowlist of
   metadata fields and requires App Check in production.
5. For a bad release, roll Render back to the last known-good commit and verify
   `/api/version`; do not roll back across an incompatible schema migration
   without following `docs/release-hardening.md`.
6. Handle vulnerability reports through private GitHub security advisories.

## GitHub security controls

The repository configures Dependabot, dependency review, and CodeQL. In GitHub
Settings, also enable:

- Dependabot alerts and security updates
- Secret scanning and push protection
- Private vulnerability reporting
- Branch protection requiring the Quality, CodeQL, and dependency-review checks

## Full-release gate

Keep the product labelled public beta and version `0.1.x` until all of these are
confirmed:

- the production commit and health endpoint are current and healthy;
- verification email delivery and every authentication route work;
- App Check enforcement is enabled without rejecting legitimate traffic;
- Firestore rules are deployed and emulator tests pass;
- automated backup retention is configured and a restore drill passes;
- monitoring, budget alerts, and a private security channel are active;
- a disposable production account completes signup, verification, sync,
  export, archive, and deletion.
