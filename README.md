# Resolve!

Anime-themed semester planning, progress tracking, and self-improvement web app.

> Your semester, one episode at a time.

## Stack

- **Next.js 16** (App Router, TypeScript)
- **Tailwind CSS 4** with custom Resolve! design tokens
- **Firebase** (Auth, Firestore, Storage)
- **Framer Motion**, **Recharts**, **React Hook Form**, **Zod**

## Getting started

```bash
npm install
cp .env.example .env.local
# Add Firebase credentials to .env.local
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

Without Firebase configured, the interface can be previewed with browser-only
storage. Production accounts require Firebase Authentication and Firestore.

## Project structure

```
src/
├── app/
│   ├── (auth)/          # Login, signup, password reset
│   ├── (dashboard)/     # Protected app routes
│   └── page.tsx         # Landing page
├── components/
│   ├── character/       # Anime companion
│   ├── layout/          # Sidebar, mobile nav, shell
│   └── ui/              # Reusable UI primitives
├── contexts/            # Stable provider entry points
├── features/
│   ├── guitar-learning/ # Curriculum, tools, audio, learning state
│   └── workspace/       # Account data provider, actions, analytics
├── lib/
│   ├── character/       # Dialogue rules
│   ├── constants/       # Categories, navigation
│   └── firebase/        # Firebase config
└── types/               # Data model types
```

## Current MVP

The main semester loop is implemented:

- Firebase email/password and Google authentication
- Account-gated dashboard routes
- Semester setup and automatic episode/week calculations
- Interactive goals, daily tasks, weekly scheduling, and priorities
- Seven-day habit check-ins with forgiving consistency metrics
- Interactive Guitar Studio with guided lessons, visual tools, guitar audio,
  learning paths, and practice evidence
- Academic module tracking
- Career practice logs and application pipeline
- Daily reflections, semester timeline, charts, and rule-based insights
- Original companion artwork with contextual dialogue
- Responsive desktop and mobile navigation

Signed-in workspaces synchronize through one private
`workspaces/{userId}` Firestore document. Changes save to the browser
immediately, rapid edits are grouped into one cloud write, and server checks are
cached briefly instead of keeping a billable live listener open. A dirty local
copy is retained after network or quota failures and retried later. Settings
shows the current state and offers an explicit sync check.

## Quality checks

```bash
npm run lint
npm test
npm run test:rules # requires Java 21 for the Firestore emulator
npm run build
npm run test:e2e:production
```

## Firebase setup

1. Create a Firebase project at [console.firebase.google.com](https://console.firebase.google.com)
2. Enable **Authentication** (Email/Password + Google)
3. Create a **Firestore** database
4. Copy web app config into `.env.local`
5. Create a Firebase service account and set its complete JSON as the
   server-only `FIREBASE_SERVICE_ACCOUNT_JSON` secret. This powers trusted,
   recursive account deletion; never expose it through a `NEXT_PUBLIC_` name.
6. Deploy security rules and the workspace index exemptions:
   `firebase deploy --only firestore:rules,firestore:indexes`

The index exemptions keep the large workspace map and server timestamp out of
Firestore indexes because the app reads the workspace by document ID and never
queries those fields.

## Render deployment

Use `npm ci && npm run build` as the build command and `npm run start` as the
start command. Add every variable from `.env.example` in Render’s Environment
panel. Keep `FIREBASE_SERVICE_ACCOUNT_JSON` secret and server-only. Render
provides `RENDER_GIT_COMMIT`, which Resolve exposes through `/api/version` and
shows in Settings for deployment diagnosis.
