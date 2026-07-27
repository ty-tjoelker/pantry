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
- **Phase 6 done.** Household dietary restrictions, recipe substitutes, a rules-based
  "what should we cook" suggestion engine, recipe-URL import, and a batch of UX fixes Ty
  ran into using the app day to day.
  - `items.dietary_tags text[]`, `recipe_ingredients.substitute_note text`, and a new
    `dietary_restrictions` table (tag + `exclude`/`limit` mode) added to `schema.sql`,
    seeded with the household's actual restrictions (gluten/dairy/peanut/shrimp/chicken/
    black+pinto beans excluded, cinnamon limited). Manage the list at `/settings`, linked
    from a small gear icon on the List screen — not a 5th bottom-nav tab, to keep the
    thumb-first nav uncluttered.
  - Category and dietary tags are auto-guessed by keyword match on item creation
    (`lib/item-heuristics.ts`, wired into `findOrCreateItem`) and overridable per item via
    a pencil icon on the pantry row that expands inline into toggle chips. Category has no
    manual override yet — lower stakes than allergy safety, revisit if it turns out to
    matter.
  - Key design call: **a recipe is excluded from suggestions only when a conflicting
    ingredient has no noted substitute.** `recipe-form.tsx` shows an inline "Substitute?"
    field the moment a conflicting ingredient is added (autocomplete-picked, so its
    dietary tags are already known); free-typed ingredients don't get resolved until the
    recipe is next edited, so the prompt appears then instead — an accepted v1 gap.
    Recipes stay fully visible in normal search/browsing either way (with a warning badge
    or the substitute note shown inline); exclusion only applies to suggestions.
  - Suggestion scoring (`lib/suggest-recipes.ts`, pure function, same shape as
    `lib/meal-plan-grocery.ts`): favors recipes not cooked recently, penalizes tag overlap
    with the last two weeks of planned meals (variety), rewards pantry match, and applies
    a small penalty (not exclusion) for `limit`-mode restrictions. Surfaces both above the
    search box when assigning a meal-plan slot and via a "Surprise me" button on Recipes.
  - Recipe URL import (`app/api/import-recipe/route.ts` + `lib/parse-recipe-url.ts`):
    server-side fetch avoids CORS, parses schema.org JSON-LD if the page embeds it, and
    reuses the existing `parseIngredientLine` parser rather than reimplementing ingredient
    parsing. No AI involved — sites without structured recipe data fall back to a message
    pointing at the paste option.
  - Fixed two real bugs Ty found: the add-item input's bare `onKeyDown` handler meant the
    iOS keyboard's checkmark did nothing (only the physical Enter key worked) — wrapped it
    in a real `<form>` so both trigger submission. This briefly created an invalid nested
    `<form>` where `AddItemInput` is used inside `RecipeForm`'s own form — caught via a
    hydration warning in the dev console, fixed by making `RecipeForm`'s outer element a
    `<div>` with an explicit save button instead of relying on submission. Also fixed
    pantry "+List" silently no-op'ing when the item was already on the list — it now bumps
    quantity (`addGroceryItemByItemId` takes an optional `incrementBy`).
  - Added a small toast/haptic feedback component (`components/toast.tsx`) for actions
    that had no prior confirmation (add item, +List, move to pantry, recipe import), a
    manual "add straight to pantry" flow, bigger bottom-nav tap targets, and clearer
    "Checked off" labeling (was "Got it") with a chevron instead of plain +/−.
  - No AI/LLM calls anywhere in this phase — deliberately deferred (see below).
  - Verified live end-to-end in the browser, including direct Supabase queries to confirm
    values that don't surface in the UI: a new item auto-categorized into the correct
    grocery-store section and got the right auto-guessed dietary tags; a manual tag toggle
    on a pantry item persisted; pantry "+List" bumped quantity on a second tap; a recipe
    built with a conflicting ingredient (chicken) showed the substitute prompt while
    editing, was excluded from both suggestion surfaces with no substitute noted, and
    started appearing (with the swap surfaced) once one was added; `npm run build` and
    `npm run lint` clean. All test data (grocery items, a test recipe, a pantry item)
    removed afterward — some via direct delete since swipe-to-delete has no non-gesture
    path (pre-existing a11y gap, noted in Phase 5, not addressed here).
  - **Follow-up fixes from real usage, same phase:**
    - Bottom nav was still hard to hit on notched iPhones after the earlier tap-target
      bump — root cause was `app/layout.tsx`'s viewport meta missing `viewport-fit: cover`,
      so `env(safe-area-inset-bottom)` was resolving to `0` everywhere; the padding was
      correct, it just had nothing to read. Fixed by adding `viewportFit: "cover"` to the
      `Viewport` export and making `(app)/layout.tsx`'s `<main>` bottom padding
      safe-area-aware too (`pb-[calc(4rem+env(safe-area-inset-bottom))]`), so content isn't
      hidden behind the now-taller nav.
    - Recipe ingredients only had Enter/keyboard-submit as a way to add — `AddItemInput`
      gained an optional `showAddButton` prop (a visible "+" next to the input, `type="submit"`
      so it reuses the same submit path) and it's enabled just for the recipe-ingredient
      usage; grocery/pantry keep their existing full-width look.
    - Pantry items had no way to be removed at all, ever. `PantryRow` now wraps in the same
      `SwipeToDelete` component grocery rows already use, plus `deleteFromPantry()` in
      `lib/db/pantry.ts`. Still gesture-only, same known a11y gap as the grocery list.
    - `viewport-fit: cover` also meant the page now draws under the status bar/notch at the
      *top*, which nothing was accounting for — content visibly jumped up. Fixed with
      `pt-[env(safe-area-inset-top)]` on `<body>` in `app/layout.tsx`.
    - Ty saw the bottom nav render "fat" on List/Recipes but correctly-sized on Pantry/Plan.
      Ruled out Safari chrome (he confirmed home-screen-icon/standalone usage) and a stale
      service-worker cache (bumping `CACHE_NAME` didn't fix it). **Actual root cause,
      found by measuring `main`'s real `getBoundingClientRect()` in the browser**: `<body>`
      used `min-h-full` instead of a bounded `h-full`, so on tall pages (Pantry's 40+ items,
      Plan's full week) the whole document grew and scrolled as one block, while short pages
      (List, Recipes) never hit that path — two genuinely different layout behaviors, not a
      visual illusion. Layered on that: Tailwind flex children default to `min-height: auto`,
      so nested `flex-1 overflow-y-auto` containers don't shrink to fit their parent unless
      every level in the chain also sets `min-h-0` — a classic flexbox gotcha. Fixed by
      making `<body>` `h-full overflow-hidden` and adding `min-h-0` down the full chain
      (`main` in `(app)/layout.tsx`, and each page's own wrapper/scroll `div`s). Verified via
      `getBoundingClientRect()` that all four tabs now measure identically bounded.
  - **Grocery-store categories, second pass:** the categorization from earlier in this phase
    turned out to have never run for most of Ty's real items — he'd been adding recipes via
    the URL-import/paste flow while his phone was still serving a stale cached JS bundle
    from before categorization shipped (client-side code, not just visuals, so the writes
    themselves ran old logic and saved `category: null`). Confirmed by querying the live
    `items` table directly: only the 3 items created during this session's own testing had
    a category.
    - Audited `lib/item-heuristics.ts` against Ty's real ~50-item catalog and found real
      bugs, not just coverage gaps: plain `.includes()` substring matching meant `"tea"`
      matched inside `"beefsteak"` (and even bare `"steak"`), `"egg"` matched inside
      `"eggplant"`, `"rice"` matched inside `"price"`. Fixed with a word-boundary regex
      (`\bkeyword(?:es|s)?\b` — the optional suffix keeps plurals like "tomatoes"/"onions"
      matching). Also reordered category checks so an explicit signal wins over a coincidental
      one (`"frozen ...fries"` → Frozen, not Produce, because Frozen is checked first) and
      expanded keyword coverage substantially (herbs, spices, condiments, more produce).
    - Ran a one-time backfill script (not a UI feature) against the live `items` table:
      recomputed `category`/`dietary_tags` only for rows where they were still null/empty,
      so nothing already set (manually or otherwise) got overwritten. Went from 3 categorized
      items to 52; only the 2 items that are literally test junk from this session stayed
      uncategorized. Did a dry run first and reviewed the exact diff before writing.
    - Pantry now sub-groups by category within each location (`pantry-list.tsx`), matching
      the grouping the grocery list already had — was previously one flat list per location,
      which is how the missing categories went unnoticed for so long.
  - **Phase 7 (deferred, not built):** AI-generated recipe suggestions and an AI fallback
    for recipe-URL pages without structured data. Needs Ty to set up a separate Anthropic
    developer account (console.anthropic.com, its own billing — distinct from Claude Pro)
    and add an `ANTHROPIC_API_KEY`. Real cost at this app's volume would be fractions of a
    cent per call, but the account setup is a real prerequisite, so this waits until Ty
    explicitly wants to do it.
