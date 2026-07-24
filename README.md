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

## Development phases

1. **Foundation** (current) — layout, auth scaffold, design system, types
2. **Planning** — semester setup, goals, milestones, weekly/daily tasks
3. **Tracking** — habits, guitar, academics, career, reflections
4. **Analytics** — charts and rule-based insights
5. **Anime experience** — character assets, achievements, scenes
6. **Testing & deployment**

## Firebase setup

1. Create a Firebase project at [console.firebase.google.com](https://console.firebase.google.com)
2. Enable **Authentication** (Email/Password + Google)
3. Create a **Firestore** database
4. Copy web app config into `.env.local`
5. Deploy security rules: `firebase deploy --only firestore:rules`
