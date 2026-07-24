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

Without Firebase configured, the landing page and dashboard demo work with placeholder data. Auth pages show a setup reminder until credentials are added.

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
├── contexts/            # Auth provider
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
- Guitar practice sessions with clean-BPM and practice-mix tracking
- Academic module and assessment views
- Career problem logs and application pipeline
- Daily reflections, semester timeline, charts, and rule-based insights
- Original companion artwork with contextual dialogue
- Responsive desktop and mobile navigation

Workspace data currently auto-saves to browser storage, namespaced by the
signed-in Firebase user. The app also works in a seeded demo mode when Firebase
is not configured. The settings page makes this storage status explicit.

## Next production steps

1. Replace browser persistence with Firestore subscriptions and offline cache.
2. Add module, application, and habit creation/edit forms.
3. Add calendar drag-and-drop and recurring task rules.
4. Add achievement unlocks and notification preferences.
5. Add automated component and end-to-end test coverage.
6. Deploy the app and Firestore rules.

## Firebase setup

1. Create a Firebase project at [console.firebase.google.com](https://console.firebase.google.com)
2. Enable **Authentication** (Email/Password + Google)
3. Create a **Firestore** database
4. Copy web app config into `.env.local`
5. Deploy security rules: `firebase deploy --only firestore:rules`
