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

Signed-in workspaces synchronize in real time through a private
`workspaces/{userId}` Firestore document. A browser copy remains available as
an offline fallback, and Settings shows whether changes are connecting, saving,
synced, or offline.

## Quality checks

```bash
npm run lint
npm test
npm run build
```

## Firebase setup

1. Create a Firebase project at [console.firebase.google.com](https://console.firebase.google.com)
2. Enable **Authentication** (Email/Password + Google)
3. Create a **Firestore** database
4. Copy web app config into `.env.local`
5. Deploy security rules: `firebase deploy --only firestore:rules`
