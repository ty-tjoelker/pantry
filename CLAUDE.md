# CLAUDE.md

Project instructions for Claude Code. Read this at the start of every session.

## What this is

**Pantry** — a personal web app for grocery lists, pantry inventory, recipes, and weekly meal
planning. Single user. Phone-first, installed to the iOS home screen as a PWA.

Full requirements and the phased build plan are in `01-PROJECT-SPEC.md`.

## Who you're working with

Ty is new to development. Some dabbling, comfortable following terminal instructions, not
able to debug independently yet. So:

- Explain terminal commands before running them, briefly.
- When something needs doing in a browser (Vercel, Supabase, GitHub), give exact click-by-click
  steps, not "configure your env vars."
- Introduce new concepts in one or two plain sentences when they first come up.
- Don't assume knowledge of git, deployment, or SQL.
- Never leave the repo in a broken state at the end of a session.

## Stack

- Next.js (App Router) + TypeScript
- Tailwind CSS
- Supabase (Postgres) via `@supabase/supabase-js`
- Deployed on Vercel, Hobby tier
- PWA: manifest + icons + iOS standalone meta tags

## Hard rules

- **Free tiers only.** Never add a paid service or a dependency requiring a credit card.
- **Minimal dependencies.** Prefer 30 lines of our own code over a library. Ask before adding
  any package that isn't obviously necessary.
- **No secrets in the repo.** Env vars only. `.env.local` stays gitignored. Every time a new
  env var is introduced, remind Ty to add it in the Vercel dashboard too.
- **No destructive DB operations** without asking first — no dropping tables, no truncating,
  no unreviewed migrations against live data.
- **Don't silently modify user data.** Anything automated that writes to the grocery list or
  pantry (like the meal-plan list builder) must show a reviewable preview first.

## Design rules

- Thumb-first: bottom navigation, large tap targets, one-handed operation.
- Minimum taps for the common path. Adding an item is: type, enter, done.
- Optimistic UI. Interactions feel instant; the network call happens behind them.
- Restrained visual design: clean type, generous whitespace, one accent color, dark mode.
- No modals for routine actions. No hover-only interactions.

## Code conventions

- TypeScript strict mode. No `any`.
- Server Components by default; `'use client'` only when interactivity requires it.
- Data access lives in `lib/db/` — components never call Supabase directly.
- Shared types in `types/`, mirroring the DB schema.
- Tailwind utility classes inline. No separate CSS files beyond globals.
- Filenames: kebab-case. Components: PascalCase. Functions and variables: camelCase.
- Small files. If one passes ~200 lines, split it.

## Commands

```bash
npm run dev        # local dev server
npm run build      # production build — run this before declaring a phase done
npm run lint       # lint
```

## Workflow

- **Plan first.** For anything beyond a one-line change, propose the approach and wait for
  agreement before writing code.
- **One phase per session.** Don't drift into the next phase's work.
- **Commit at every working state** with descriptive messages.
- **Verify before claiming done:** `npm run build` must pass, and the feature must be
  exercised in the running app — not just assumed to work. Show the evidence (command output,
  or what you observed), don't just assert success.
- **Deploy at the end of each phase**, then confirm the live URL works.
- Push back on requests that seem like a bad idea rather than silently complying.

## Keep this file current

When we make an architectural decision, change a convention, or finish a phase, update this
file. It's the memory that carries between sessions.

## Decisions log

- Web app + PWA rather than native iOS — one codebase, no App Store, no developer fee.
- Next.js + Tailwind + Supabase — heavily documented, generous free tiers.
- Single passcode gate instead of real auth in v1. Upgrade path is Supabase Auth magic links.
- Shared `items` catalog underpins pantry, recipes, and lists so inventory can be cross-checked
  against recipe requirements.
