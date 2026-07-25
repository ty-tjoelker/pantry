# Pantry — Project Spec

A personal web app for groceries, pantry inventory, recipes, and weekly meal planning.
Single user (Ty). Phone-first. Free to run.

Build it in the phases below, **one phase per Claude Code session**. Do not start a phase
before the previous one is deployed and working.

---

## Product principles

These are the tie-breakers when a design decision isn't obvious.

1. **Thumb-first.** Every common action reachable one-handed on a phone. Big tap targets,
   bottom navigation, no hover-dependent anything.
2. **Fewest taps wins.** Adding milk to the grocery list should be: open app, type, done.
   No modals, no category pickers, no required fields.
3. **Never lose data.** Everything persists server-side immediately. No "unsaved changes."
4. **Fast and quiet.** Optimistic UI — the checkbox ticks instantly, the save happens behind
   it. No spinners for small actions.
5. **Looks good.** Clean typography, generous whitespace, one accent color, dark mode.
   Restrained, not decorated.

---

## Stack

- **Next.js** (App Router) + **TypeScript**
- **Tailwind CSS** for styling
- **Supabase** (Postgres) for data, accessed through the `@supabase/supabase-js` client
- **Vercel** for hosting
- **PWA**: web manifest + icons so it installs to the iOS home screen and opens fullscreen

Constraints:
- Stay on free tiers. No paid services.
- No auth system in v1 — a single passcode in an env var, checked by middleware, session
  stored in an httpOnly cookie. (Later: swap to Supabase Auth magic links if sharing.)
- Keep dependencies minimal. Every added library is a thing that can break.

---

## Data model

```
items                     -- the master catalog of things that exist
  id, name, default_unit, category, is_staple, created_at

pantry                    -- what I currently have
  id, item_id -> items, quantity, unit, location ('pantry'|'fridge'|'freezer'),
  expires_on (nullable), updated_at

grocery_list              -- the active shopping list
  id, item_id -> items, quantity, unit, note,
  source ('manual'|'meal_plan'|'staple'), checked (bool),
  added_at, checked_at

recipes
  id, title, description, servings, prep_minutes, cook_minutes,
  instructions (text, markdown), source_url (nullable), tags (text[]),
  times_cooked (int, default 0), last_cooked_on (nullable), created_at

recipe_ingredients
  id, recipe_id -> recipes, item_id -> items, quantity, unit,
  note (e.g. 'finely diced'), sort_order

meal_plan
  id, date, meal ('breakfast'|'lunch'|'dinner'),
  recipe_id -> recipes (nullable), note (nullable, for 'leftovers'/'eating out')
```

Notes for whoever implements this:
- `items` as a shared catalog is the point of the whole design — it's what lets the app know
  a recipe needs onions, the pantry has onions, so onions don't go on the list.
- Match item names case-insensitively and trim whitespace on insert, so "Onions" and
  "onions " don't become two rows.
- Add indexes on the foreign keys and on `meal_plan.date`.
- Write the schema as a `.sql` file in the repo so it's reproducible, and run it in the
  Supabase SQL editor.

---

## Phase 1 — Deployed skeleton

**Goal: a live URL on my phone. No features.**

1. Scaffold a Next.js app (TypeScript, Tailwind, App Router) in the current folder.
2. Create a single page: app name, and text confirming it's running.
3. Add the PWA manifest, a simple generated app icon, and the iOS meta tags for fullscreen
   standalone mode.
4. `git init`, first commit, create a GitHub repo, push.
5. Walk me through importing the repo into Vercel and deploying. Tell me exactly what to
   click.
6. Give me the live URL and instructions for Add to Home Screen on iOS.

**Done when:** I can tap an icon on my home screen and see the app fullscreen.

---

## Phase 2 — Grocery list + pantry

The core loop. If only this phase ever gets built, the app is still worth having.

1. Create the Supabase project schema (`items`, `pantry`, `grocery_list`). Give me the SQL
   and tell me where to paste it.
2. Add the Supabase client with env vars. Walk me through adding the same env vars in
   Vercel's dashboard — this is the #1 thing that breaks deploys.
3. Add the passcode gate (middleware + env var + cookie).
4. **Grocery list screen** (the home screen):
   - One text input at top. Type a name, press enter, it's on the list. Autocomplete from
     existing `items` as I type.
   - Tap a row to check it off — instant strikethrough, moves to a collapsed "Got it"
     section at the bottom.
   - Long-press or swipe to delete.
   - Group by category with light headers, so the list roughly matches store layout.
   - A "Clear checked" button that also offers to move checked items into the pantry.
5. **Pantry screen:**
   - Sectioned by location (Pantry / Fridge / Freezer).
   - Adjust quantity inline with +/− buttons.
   - "Add to grocery list" on any row.
   - Items expiring within 5 days get a subtle warning color.
6. **Bottom navigation:** List · Pantry · Recipes · Plan (last two are empty placeholders).

**Done when:** I can do a real grocery trip with it.

---

## Phase 3 — Recipe library

1. Add `recipes` and `recipe_ingredients` tables.
2. **Recipe list:** searchable, filter by tag, sorted by recently cooked. Card layout.
3. **Recipe detail:** ingredients with quantities, instructions, times/servings.
   - Show each ingredient's pantry status inline: have it / don't have it.
   - "Add missing ingredients to grocery list" button.
   - "Cooked it" button — increments `times_cooked`, sets `last_cooked_on`, and offers to
     decrement those ingredients from the pantry.
4. **Add/edit recipe:** a form that's actually pleasant to use on a phone. Ingredient rows
   that add themselves as I type. Autocomplete against `items`.
5. **Paste-a-recipe:** a textarea where I dump messy text copied from a website, and it gets
   parsed into structured ingredients and steps. Do this with straightforward parsing rules —
   no external API, no paid service. Always show me the parsed result for editing before
   saving; imperfect parsing is fine if I can fix it.

**Done when:** my regular meals are in there and I can add a new one in under two minutes.

---

## Phase 4 — Meal plan → automatic grocery list

The payoff feature.

1. Add the `meal_plan` table.
2. **Week view:** 7 days, tappable slots for breakfast/lunch/dinner. Assign a recipe from a
   searchable picker, or type a free-text note like "leftovers" or "out."
3. Navigate between weeks. Default to the current week.
4. **"Build my list" button:**
   - Collect every ingredient from every recipe planned this week
   - Scale by servings
   - Combine duplicates, converting units where it's safe to do so
   - Subtract what the pantry already has
   - Add any `is_staple` items that are missing
   - **Show me the result as a reviewable list with checkboxes before it commits anything.**
     Never silently write to my grocery list.
5. Items added this way get `source = 'meal_plan'` so I can see where they came from.

**Done when:** I plan a week in five minutes and get a correct shopping list out of it.

---

## Phase 5 — Make it feel good

1. Dark mode following the system setting.
2. Loading skeletons, empty states with helpful prompts, and gentle transitions.
3. Optimistic updates everywhere — nothing should feel like it's waiting on a server.
4. Basic offline read support: cache the grocery list so it opens in a store with bad signal.
5. Haptic feedback on check-off (`navigator.vibrate` where supported).
6. Pass a real accessibility check: contrast, focus states, labeled controls.

---

## Explicitly out of scope for v1

Write these down, don't build them: barcode scanning, nutrition data, price and spend
tracking, multiple users or sharing, recipe scraping from arbitrary URLs, store-specific
aisle ordering, shopping history analytics, native app.

---

## Working agreement for Claude Code

- One phase per session. `/clear` between phases.
- Plan before building. Show me the plan.
- Commit at every working state, with real commit messages.
- Deploy at the end of each phase — don't let unshipped work pile up.
- Explain new concepts in plain language as they come up. I'm learning this.
- If something in this spec is ambiguous or seems like a bad idea, say so instead of
  guessing.
