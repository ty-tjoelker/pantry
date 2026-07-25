-- Pantry — Phase 2 schema
-- Run this once in the Supabase SQL editor (SQL Editor > New query > paste > Run).

create table items (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  default_unit text,
  category text,
  is_staple boolean not null default false,
  created_at timestamptz not null default now()
);

create table pantry (
  id uuid primary key default gen_random_uuid(),
  item_id uuid not null references items (id) on delete cascade,
  quantity numeric not null default 1,
  unit text,
  location text not null default 'pantry' check (location in ('pantry', 'fridge', 'freezer')),
  expires_on date,
  updated_at timestamptz not null default now()
);

create table grocery_list (
  id uuid primary key default gen_random_uuid(),
  item_id uuid not null references items (id) on delete cascade,
  quantity numeric not null default 1,
  unit text,
  note text,
  source text not null default 'manual' check (source in ('manual', 'meal_plan', 'staple')),
  checked boolean not null default false,
  added_at timestamptz not null default now(),
  checked_at timestamptz
);

create index pantry_item_id_idx on pantry (item_id);
create index grocery_list_item_id_idx on grocery_list (item_id);

-- Single-user app: the passcode gate (middleware) is the access boundary, not per-row
-- ownership, so the anon key gets full read/write on these tables via RLS policies.
alter table items enable row level security;
alter table pantry enable row level security;
alter table grocery_list enable row level security;

create policy "anon full access" on items for all to anon using (true) with check (true);
create policy "anon full access" on pantry for all to anon using (true) with check (true);
create policy "anon full access" on grocery_list for all to anon using (true) with check (true);
