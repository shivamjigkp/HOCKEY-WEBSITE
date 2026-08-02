-- ============================================================================
-- ACHIEVEMENTS BACKEND — Phase 9
-- Apply AFTER schema.sql (Phase 5) and schema_phase7.sql (Phase 7 — this
-- file's RLS policies depend on public.is_admin()).
--
-- Migrates Achievements from src/constants/achievements.js to real Supabase
-- tables, closing the gap flagged in schema_phase8.sql ("Achievements is
-- NOT included here... deferred to a later phase").
--
-- Two shapes, matching the two kinds of data the Achievements page shows:
--   1. achievement_tournaments + achievement_records — Internal Tournaments
--      (MHL, Hit Stick, Inter-Year) and External/Inter-College Events
--      (Udgosh), each of which can accumulate multiple year-by-year results
--      over time. `kind` distinguishes the two; a record's `winner` column
--      is used for internal tournaments, `result` for external events.
--   2. achievement_entries — the flat lists (University / Team / Player /
--      Coach Achievements), which are simple title + optional year items.
--
-- Same public-read / admin-write RLS pattern as every other Phase 7/8 table.
-- ============================================================================

-- ---------------------------------------------------------------------------
-- Tournaments
-- ---------------------------------------------------------------------------

create table if not exists public.achievement_tournaments (
  id uuid primary key default gen_random_uuid(),
  kind text not null check (kind in ('internal', 'external')),
  name text not null unique,
  description text,
  sort_order integer not null default 0,
  created_by uuid references auth.users (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.achievement_tournaments enable row level security;

create policy "Achievement tournaments are publicly readable"
  on public.achievement_tournaments for select
  using (true);

create policy "Admins can manage achievement tournaments"
  on public.achievement_tournaments for all
  using (public.is_admin(auth.uid()))
  with check (public.is_admin(auth.uid()));

-- ---------------------------------------------------------------------------
-- Records (one per year/edition of a tournament — deliberately supports
-- many rows per tournament since a league accumulates a new result every
-- season; a fresh tournament starts with a single "To be confirmed" row,
-- represented as NULL columns rather than a literal placeholder string).
-- ---------------------------------------------------------------------------

create table if not exists public.achievement_records (
  id uuid primary key default gen_random_uuid(),
  tournament_id uuid not null references public.achievement_tournaments (id) on delete cascade,
  year text,
  winner text,
  result text,
  note text,
  sort_order integer not null default 0,
  created_by uuid references auth.users (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.achievement_records enable row level security;

create policy "Achievement records are publicly readable"
  on public.achievement_records for select
  using (true);

create policy "Admins can manage achievement records"
  on public.achievement_records for all
  using (public.is_admin(auth.uid()))
  with check (public.is_admin(auth.uid()));

create index if not exists achievement_records_tournament_id_idx
  on public.achievement_records (tournament_id);

-- ---------------------------------------------------------------------------
-- Simple achievement entries — University / Team / Player / Coach
-- Achievements. All four categories were empty arrays in the seed data
-- (no confirmed items yet), so no rows are seeded here — only the table.
-- ---------------------------------------------------------------------------

create table if not exists public.achievement_entries (
  id uuid primary key default gen_random_uuid(),
  category text not null check (category in ('university', 'team', 'player', 'coach')),
  title text not null,
  year text,
  sort_order integer not null default 0,
  created_by uuid references auth.users (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (category, title)
);

alter table public.achievement_entries enable row level security;

create policy "Achievement entries are publicly readable"
  on public.achievement_entries for select
  using (true);

create policy "Admins can manage achievement entries"
  on public.achievement_entries for all
  using (public.is_admin(auth.uid()))
  with check (public.is_admin(auth.uid()));

-- ---------------------------------------------------------------------------
-- Seed rows — exact equivalent of src/constants/achievements.js. Every
-- "To be confirmed" placeholder from that file becomes a NULL column here,
-- not a literal string, per that file's own rule against guessed data.
-- Written with NOT EXISTS guards (rather than ON CONFLICT) so this file
-- can be re-run safely without creating duplicate records.
-- ---------------------------------------------------------------------------

insert into public.achievement_tournaments (kind, name, description, sort_order)
values
  ('internal', 'MHL (Malaviya Hockey League)', 'Internal batch-vs-batch league hosted within MMMUT.', 1),
  ('internal', 'Hit Stick', 'Internal knockout-style hockey event.', 2),
  ('internal', 'Inter-Year Tournament', 'Annual year-vs-year tournament (name may vary by edition).', 3),
  ('external', 'Udgosh, IIT Kanpur', 'Inter-college sports fest at IIT Kanpur.', 1)
on conflict (name) do nothing;

insert into public.achievement_records (tournament_id, year, winner, note)
select t.id, null, null, null
from public.achievement_tournaments t
where t.name = 'MHL (Malaviya Hockey League)'
  and not exists (select 1 from public.achievement_records r where r.tournament_id = t.id);

insert into public.achievement_records (tournament_id, year, winner, note)
select t.id, null, null, null
from public.achievement_tournaments t
where t.name = 'Hit Stick'
  and not exists (select 1 from public.achievement_records r where r.tournament_id = t.id);

insert into public.achievement_records (tournament_id, year, winner, note)
select t.id, null, null, null
from public.achievement_tournaments t
where t.name = 'Inter-Year Tournament'
  and not exists (select 1 from public.achievement_records r where r.tournament_id = t.id);

insert into public.achievement_records (tournament_id, year, result, note)
select t.id, null, 'Participated', null
from public.achievement_tournaments t
where t.name = 'Udgosh, IIT Kanpur'
  and not exists (select 1 from public.achievement_records r where r.tournament_id = t.id);
