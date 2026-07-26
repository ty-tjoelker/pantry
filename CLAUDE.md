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
- **Phase 1 done.** Deployed skeleton live at https://pantry-two-pink.vercel.app/, installed
  to iOS home screen. Repo: https://github.com/ty-tjoelker/pantry. PWA icons generated with
  Next's built-in `next/og` (no image library dependency).
- **Phase 2 done.** Grocery list (home) and pantry screens live, backed by Supabase. Bottom
  nav wires up List/Pantry/Recipes/Plan; Recipes and Plan are placeholders for Phase 3/4.
  - Supabase project: `pantry` (trveujgkttaijanbqbyc). Schema + RLS policies in `schema.sql`.
  - Supabase enables Row Level Security by default on new tables now — `items`, `pantry`, and
    `grocery_list` all need an explicit "allow anon" policy (already in `schema.sql`) or writes
    silently fail. Worth remembering if a new table gets added later.
  - Next.js 16 renamed the `middleware.ts` convention to `proxy.ts` (export `proxy`, not
    `middleware`). The passcode gate lives there.
  - Env vars in Vercel: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`,
    `PANTRY_PASSCODE` (value is in `.env.local` and in the Vercel dashboard, not written here
    since this file is committed to the repo).
  - Shared passcode (not per-user auth) means adding a second person (e.g. Ty's wife) is just
    entering the same passcode on her phone — same shared data, no schema change needed.
- **Phase 3 done.** Recipe library live: searchable/tag-filterable list, detail screen with
  per-ingredient pantry status and "Cooked it"/"Add missing to grocery list" actions, add/edit
  form with ingredient autocomplete, and a hand-rolled paste-a-recipe parser (no external API).
  - `recipes` and `recipe_ingredients` tables added to `schema.sql`, same anon-RLS pattern.
  - Verified live: added a real recipe end-to-end (autocomplete ingredients, save, view detail,
    add missing to grocery list, delete), confirmed the grocery list and recipe both reflected
    correctly, then cleaned up the test data through the app's own UI.
  - The `items` catalog picked up 5 generic entries (spaghetti, olive oil, garlic, crushed
    tomatoes, red pepper flakes) from parser testing — Ty said to keep them.
- **Phase 4 done.** Week view (Sunday–Saturday) at `/plan`: tap a slot to assign a recipe
  (searchable) or type a free-text note like "leftovers". "Build my list" combines every
  ingredient across the week's planned recipes, subtracts the pantry, adds missing staples,
  and shows a checkbox review screen before writing anything — nothing is added to the
  grocery list without that confirmation. Added items get `source = 'meal_plan'`.
  - `meal_plan` table added to `schema.sql` (unique per date+meal, same anon-RLS pattern).
    `recipe_id` is `on delete set null`, so deleting a recipe clears it from any planned
    slots instead of failing.
  - Unit combining/conversion is hand-rolled in `lib/units.ts` (`lib/meal-plan-grocery.ts`
    for the combine logic) — covers common volume (tsp/tbsp/cup/ml/l) and weight
    (g/kg/oz/lb) units only. Anything else lists separately rather than guessing.
  - No per-slot serving-count override yet — planning the same recipe twice in a week just
    doubles its ingredients. Worth adding if it turns out to matter in practice.
  - Verified live: created a real recipe, planned it into the week, confirmed "Build my
    list" showed the right combined quantities, added them to the grocery list, then
    cleaned up all test data (recipe, meal plan slot, grocery entries) through the app's
    own UI.
  - Next session starts Phase 5 (polish: dark mode, loading states, offline read, a11y).
- **Phase 5 done.** Polish pass across the whole app.
  - Dark mode was already mostly wired up from earlier phases (Tailwind `dark:` variant
    follows system setting, no toggle needed). This phase fixed the remaining gaps: several
    muted-gray labels used the same `text-zinc-400` in both themes, which is under WCAG AA
    contrast on a light background — now `text-zinc-500 dark:text-zinc-400` everywhere.
  - Added `loading.tsx` skeletons for List/Pantry/Recipes/Recipe detail/Recipe edit/Plan,
    using a small shared `components/skeleton.tsx`. A global CSS rule (`app/globals.css`)
    gives buttons/links/inputs a gentle 150ms color transition instead of touching every
    component individually; respects `prefers-reduced-motion`.
  - Optimistic updates were already in place for the frequent-tap paths (check off, add
    item, pantry +/-, meal slot pick) from earlier phases. Multi-field saves (recipe form,
    "Cooked it", "Add missing ingredients") intentionally still show a brief "Saving..."
    state rather than being forced optimistic — safer for writes that touch several rows.
  - Offline read: a hand-rolled service worker (`public/sw.js`, ~30 lines, no library) does
    runtime caching — network-first, falls back to the last cached response when a fetch
    fails. No precache list, so it doesn't need to track Next's hashed build filenames.
    Registered only in production (`components/register-service-worker.tsx` no-ops in dev
    to avoid stale-cache confusion while running `npm run dev`). An `OfflineBanner` shows
    when `navigator.onLine` goes false. Verified by killing the local prod server outright
    and reloading — the grocery/pantry pages still rendered with real cached data.
  - Haptics: `navigator.vibrate(10)` on grocery check-off (`lib/haptics.ts`, feature-detected).
    Safari has never implemented the Vibration API, so this is a no-op on Ty's iPhone —
    added anyway since it's free and correct if the app is ever used on Android.
  - Accessibility: added `aria-pressed`/`aria-expanded` to toggle-style buttons (check-off
    rows, tag filters, the grocery list's collapsed "Got it" section), `aria-label` on
    icon-only buttons (pantry +/-, week prev/next). Confirmed every `outline-none` input is
    paired with a visible `focus:` state. Known gap, not fixed this phase: swipe-to-delete
    is touch-gesture-only with no keyboard/screen-reader path.
  - Added a `pantry-prod` entry to `.claude/launch.json` (runs `npm run build && npm run
    start`) — needed to actually test the service worker and loading skeletons, since both
    are dev-mode no-ops.
  - Verified live: `npm run build` and `npm run lint` clean; exercised dark mode, loading
    skeletons, the offline fallback (server killed mid-session, cached page still loaded),
    focus states, and check-off (including the aria-pressed toggle) in the browser, then
    removed all test data through the app's own UI.
