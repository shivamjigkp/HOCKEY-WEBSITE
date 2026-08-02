-- ============================================================================
-- ROSTER + FIXTURES BACKEND — Phase 8
-- Apply AFTER schema.sql (Phase 5) and schema_phase7.sql (Phase 7 — this
-- file's RLS policies depend on public.is_admin()).
--
-- Migrates Players, Coaches, and Matches from local seed-data files to
-- real Supabase tables, same pattern as News/Events in Phase 7:
-- public reads open to everyone, writes require the admin role.
--
-- Achievements is NOT included here — its nested tournament/records shape
-- needs its own schema design and is deferred to a later phase.
-- ============================================================================

-- ---------------------------------------------------------------------------
-- Players
-- ---------------------------------------------------------------------------

create table if not exists public.players (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  position text not null check (position in ('forward', 'midfielder', 'defender', 'goalkeeper')),
  jersey_number integer not null,
  year text,
  hometown text,
  height_cm integer,
  photo_url text,
  bio text,
  stats jsonb not null default '{}'::jsonb,
  created_by uuid references auth.users (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.players enable row level security;

create policy "Players are publicly readable"
  on public.players for select
  using (true);

create policy "Admins can manage players"
  on public.players for all
  using (public.is_admin(auth.uid()))
  with check (public.is_admin(auth.uid()));

-- ---------------------------------------------------------------------------
-- Coaches
-- ---------------------------------------------------------------------------

create table if not exists public.coaches (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  role text not null,
  experience_years integer,
  photo_url text,
  bio text,
  achievements text[] not null default '{}',
  created_by uuid references auth.users (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.coaches enable row level security;

create policy "Coaches are publicly readable"
  on public.coaches for select
  using (true);

create policy "Admins can manage coaches"
  on public.coaches for all
  using (public.is_admin(auth.uid()))
  with check (public.is_admin(auth.uid()));

-- ---------------------------------------------------------------------------
-- Matches
-- ---------------------------------------------------------------------------

create table if not exists public.matches (
  id uuid primary key default gen_random_uuid(),
  competition text not null,
  home_team text not null,
  away_team text not null,
  venue text,
  match_date timestamptz not null,
  status text not null default 'upcoming' check (status in ('upcoming', 'live', 'completed')),
  home_score integer,
  away_score integer,
  period text,
  match_clock text,
  created_by uuid references auth.users (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.matches enable row level security;

create policy "Matches are publicly readable"
  on public.matches for select
  using (true);

create policy "Admins can manage matches"
  on public.matches for all
  using (public.is_admin(auth.uid()))
  with check (public.is_admin(auth.uid()));

-- ---------------------------------------------------------------------------
-- Storage bucket for photo uploads (players, coaches, news cover images —
-- one shared bucket with folder prefixes per feature, mirroring the
-- gallery-images bucket from Phase 5). Public read, admin-only write.
-- ---------------------------------------------------------------------------

insert into storage.buckets (id, name, public)
values ('site-images', 'site-images', true)
on conflict (id) do nothing;

create policy "Site images bucket is publicly readable"
  on storage.objects for select
  using (bucket_id = 'site-images');

create policy "Admins can upload site images"
  on storage.objects for insert
  with check (bucket_id = 'site-images' and public.is_admin(auth.uid()));

create policy "Admins can delete site images"
  on storage.objects for delete
  using (bucket_id = 'site-images' and public.is_admin(auth.uid()));

-- ---------------------------------------------------------------------------
-- Seed rows — same placeholder content as the Phase 3/4 seed-data files,
-- so the Admin Dashboard and public Players/Coaches/Matches pages aren't
-- empty on first run. Safe to edit or delete via the dashboard once real
-- rosters and fixtures are available.
-- ---------------------------------------------------------------------------

insert into public.players (name, position, jersey_number, year, hometown, height_cm, bio, stats)
values
  ('Jordan Reyes', 'forward', 17, 'Final Year', 'Placeholder City', 180,
   'Placeholder bio — replace with real player background.',
   '{"gamesPlayed": 18, "goals": 14, "assists": 9, "points": 23}'),
  ('Mika Lindqvist', 'defender', 4, 'Third Year', 'Placeholder City', 183,
   'Placeholder bio — replace with real player background.',
   '{"gamesPlayed": 18, "goals": 2, "assists": 11, "points": 13}'),
  ('Aiden Cho', 'goalkeeper', 30, 'Second Year', 'Placeholder City', 185,
   'Placeholder bio — replace with real player background.',
   '{"gamesPlayed": 16, "saves": 312, "goalsConceded": 19, "cleanSheets": 3}'),
  ('Théo Marchand', 'forward', 9, 'Final Year', 'Placeholder City', 178,
   'Placeholder bio — replace with real player background.',
   '{"gamesPlayed": 18, "goals": 11, "assists": 15, "points": 26}'),
  ('Ravi Malhotra', 'defender', 22, 'First Year', 'Placeholder City', 179,
   'Placeholder bio — replace with real player background.',
   '{"gamesPlayed": 15, "goals": 1, "assists": 6, "points": 7}'),
  ('Owen Whitfield', 'midfielder', 11, 'Second Year', 'Placeholder City', 176,
   'Placeholder bio — replace with real player background.',
   '{"gamesPlayed": 17, "goals": 8, "assists": 7, "points": 15}'),
  ('Sana Fujimoto', 'defender', 6, 'Third Year', 'Placeholder City', 172,
   'Placeholder bio — replace with real player background.',
   '{"gamesPlayed": 18, "goals": 3, "assists": 9, "points": 12}'),
  ('Kabir Anand', 'goalkeeper', 1, 'Final Year', 'Placeholder City', 188,
   'Placeholder bio — replace with real player background.',
   '{"gamesPlayed": 4, "saves": 71, "goalsConceded": 10, "cleanSheets": 0}'),
  ('Lucas Bergström', 'midfielder', 21, 'First Year', 'Placeholder City', 181,
   'Placeholder bio — replace with real player background.',
   '{"gamesPlayed": 14, "goals": 5, "assists": 4, "points": 9}')
on conflict do nothing;

insert into public.coaches (name, role, bio, achievements)
values
  ('To be confirmed', 'Head Coach', 'Placeholder bio — replace with real coach background.', '{}'),
  ('To be confirmed', 'Assistant Coach', 'Placeholder bio — replace with real coach background.', '{}'),
  ('To be confirmed', 'Goalkeeping Coach', 'Placeholder bio — replace with real coach background.', '{}')
on conflict do nothing;

insert into public.matches (competition, home_team, away_team, venue, match_date, status)
values
  ('Malaviya Hockey League', 'MMMUT Hockey', 'TBD', 'MMMUT Hockey Ground, Gorakhpur', '2026-08-15T16:00:00+00', 'upcoming'),
  ('Hit Stick', 'MMMUT Hockey', 'TBD', 'MMMUT Hockey Ground, Gorakhpur', '2026-08-29T15:30:00+00', 'upcoming'),
  ('Inter-Year Tournament', 'MMMUT Hockey', 'TBD', 'MMMUT Hockey Ground, Gorakhpur', '2026-06-20T16:00:00+00', 'completed'),
  ('Malaviya Hockey League', 'MMMUT Hockey', 'TBD', 'MMMUT Hockey Ground, Gorakhpur', '2026-05-10T16:00:00+00', 'completed')
on conflict do nothing;
