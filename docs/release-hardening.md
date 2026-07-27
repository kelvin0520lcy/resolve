# Resolve release hardening

## Schema and Firestore rules

Schema changes use a two-deployment rollout:

1. Deploy rules that accept both the current and next schema versions.
2. Deploy the application migration and monitor `/api/version`, sync failures,
   and recovery-mode entries.
3. Allow existing sessions time to update.
4. Tighten rules in a later deployment only after the old version is no longer
   active.

Never deploy an application that writes a schema version the active rules do
not accept. Recovery-snapshot limits must move with the compatibility window.

## Production verification

Run `npm run test:e2e:production` against a local production server. After a
Render deployment, set `PLAYWRIGHT_BASE_URL` and run
`npm run test:e2e:deployed`. Confirm `/api/version` reports the expected commit,
schema version, environment, build timestamp, and deployment ID.

## Security headers

The current Permissions Policy intentionally disables microphone access.
Guitar tuning, recording, pitch detection, or rhythm input require a reviewed
policy change before implementation.

A strict Content Security Policy is intentionally not enforced yet. Before
enabling it, exercise Firebase email and Google authentication, Firestore,
Next.js scripts, image optimisation, and every production route in report-only
mode. The eventual policy should include `frame-ancestors 'none'`,
`object-src 'none'`, a restricted `base-uri`, and narrowly scoped `connect-src`,
`img-src`, and `script-src` directives. HSTS is configured at the hosting edge,
not through an unverified development-only policy.

Firebase Storage is not initialized by the application. If uploads are added
later, introduce dedicated Storage rules and emulator tests before enabling the
SDK or accepting user files.

## Performance profiling

Workspace mutations publish browser Performance entries named:

- `resolve:workspace:size-estimation`
- `resolve:workspace:local-write`
- `resolve:workspace:patch-build`
- `resolve:workspace:mutation-total`

Profile these with a representative near-ceiling workspace on a lower-end
mobile device before moving the active payload to IndexedDB or changing the
patch architecture.
