-- ============================================================================
-- RBAC + ADMIN DASHBOARD — Phase 7
-- Apply AFTER supabase/schema.sql (Phase 5). Paste into Project > SQL Editor
-- > New query, or `supabase db push`.
--
-- What this adds:
--   1. `profiles` table (one row per auth user) carrying a `role`.
--   2. `public.is_admin(uid)` helper, used in RLS policies everywhere.
--   3. A trigger that auto-creates a profile (role = 'viewer') on signup,
--      so no user is ever missing a row.
--   4. Tightens the Phase 5 Gallery policies from "any authenticated user
--      can write" to "only admins can write" — this is the change flagged
--      as TODO in schema.sql.
--   5. `news` and `events` tables (public read, admin write), seeded with
--      the same placeholder rows that shipped in the Phase 6 seed-data
--      files, so the Admin Dashboard has something to show immediately.
-- ============================================================================

-- ---------------------------------------------------------------------------
-- profiles + role
-- ---------------------------------------------------------------------------

create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  full_name text,
  role text not null default 'viewer' check (role in ('viewer', 'editor', 'admin')),
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

-- is_admin() must exist before any policy below references it — Postgres
-- resolves the function call in USING/CHECK clauses at CREATE POLICY time.
create or replace function public.is_admin(uid uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = uid and role = 'admin'
  );
$$;

create policy "Users can read their own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Admins can read all profiles"
  on public.profiles for select
  using (public.is_admin(auth.uid()));

create policy "Admins can update roles"
  on public.profiles for update
  using (public.is_admin(auth.uid()))
  with check (public.is_admin(auth.uid()));

-- Auto-create a profile row (default role: viewer) whenever a new auth
-- user signs up, so nobody is ever missing a row to promote to admin.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, role)
  values (new.id, new.raw_user_meta_data->>'full_name', 'viewer')
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---------------------------------------------------------------------------
-- Promote your first admin manually (run once, replace the email):
--
--   update public.profiles set role = 'admin'
--   where id = (select id from auth.users where email = 'you@example.com');
--
-- Every other account defaults to 'viewer' and cannot reach /admin.
-- ---------------------------------------------------------------------------

-- ---------------------------------------------------------------------------
-- Tighten Phase 5 Gallery policies: authenticated -> admin only
-- ---------------------------------------------------------------------------

drop policy if exists "Authenticated users can manage albums" on public.albums;
create policy "Admins can manage albums"
  on public.albums for all
  using (public.is_admin(auth.uid()))
  with check (public.is_admin(auth.uid()));

drop policy if exists "Authenticated users can manage gallery images" on public.gallery_images;
create policy "Admins can manage gallery images"
  on public.gallery_images for all
  using (public.is_admin(auth.uid()))
  with check (public.is_admin(auth.uid()));

drop policy if exists "Authenticated users can upload gallery images" on storage.objects;
create policy "Admins can upload gallery images"
  on storage.objects for insert
  with check (bucket_id = 'gallery-images' and public.is_admin(auth.uid()));

drop policy if exists "Authenticated users can delete gallery images" on storage.objects;
create policy "Admins can delete gallery images"
  on storage.objects for delete
  using (bucket_id = 'gallery-images' and public.is_admin(auth.uid()));

-- ---------------------------------------------------------------------------
-- News + Announcements
-- ---------------------------------------------------------------------------

create table if not exists public.news (
  id uuid primary key default gen_random_uuid(),
  type text not null default 'news' check (type in ('news', 'announcement')),
  title text not null,
  slug text not null unique,
  excerpt text,
  body text not null,
  cover_image_url text,
  author text,
  published_at timestamptz not null default now(),
  created_by uuid references auth.users (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.news enable row level security;

create policy "News is publicly readable"
  on public.news for select
  using (true);

create policy "Admins can manage news"
  on public.news for all
  using (public.is_admin(auth.uid()))
  with check (public.is_admin(auth.uid()));

-- ---------------------------------------------------------------------------
-- Events
-- ---------------------------------------------------------------------------

create table if not exists public.events (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  venue text,
  event_date timestamptz not null,
  created_by uuid references auth.users (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.events enable row level security;

create policy "Events are publicly readable"
  on public.events for select
  using (true);

create policy "Admins can manage events"
  on public.events for all
  using (public.is_admin(auth.uid()))
  with check (public.is_admin(auth.uid()));

-- ---------------------------------------------------------------------------
-- Seed rows — same placeholder content as the Phase 6 seed-data files, so
-- the Admin Dashboard and public News/Events pages aren't empty on first
-- run. Safe to delete once real content is entered via the dashboard.
-- ---------------------------------------------------------------------------

insert into public.news (type, title, slug, excerpt, body, author, published_at)
values
  ('announcement', 'Trials for the 2026-27 Season Now Open', 'trials-2026-27-season-open',
   'Registration for this season''s team trials is now open to all MMMUT students. Selection dates and venue details inside.',
   'Registration for the 2026-27 hockey season trials is now open to all currently enrolled MMMUT students, regardless of prior experience level.

Trials will run across three sessions to accommodate class schedules. Bring your own stick if you have one; a limited number of loaner sticks will be available on a first-come basis.

Students should report to the MMMUT Hockey Ground with a valid ID and sports shoes suitable for turf. Selected players will be added to the practice roster and notified via the official Instagram page and email.',
   'Team Management', '2026-07-20T09:00:00+00'),
  ('news', 'MMMUT Hockey Opens Malaviya Hockey League Campaign', 'mhl-campaign-opener',
   'The squad kicks off its Malaviya Hockey League campaign this month with a home fixture at the MMMUT Hockey Ground.',
   'The team enters this year''s Malaviya Hockey League with a refreshed squad following the spring trials, and coaching staff have emphasized a faster transition game after off-season conditioning.

Home fixtures will be played at the MMMUT Hockey Ground, with the opening match scheduled for later this month. The team encourages students, faculty, and alumni to come support from the sidelines.

Fixture details, live score updates, and results will be posted on the Matches and Live pages as the tournament progresses.',
   'Team Management', '2026-07-10T14:30:00+00'),
  ('announcement', 'Ground Maintenance: Practice Sessions Shifted This Week', 'ground-maintenance-practice-shift',
   'Routine turf maintenance means practice sessions move to the secondary ground for the remainder of the week.',
   'Routine turf maintenance is scheduled at the MMMUT Hockey Ground this week. To avoid disruption, practice sessions will temporarily move to the secondary ground near the sports complex.

Timings remain unchanged. Players should check the group announcement channel for the exact secondary ground location before each session.

Normal ground access resumes the following Monday.',
   'Team Management', '2026-06-28T08:00:00+00'),
  ('news', 'Alumni Match Draws Strong Turnout', 'alumni-match-turnout',
   'Former players returned to the pitch for the annual alumni exhibition match, followed by a felicitation for past captains.',
   'The annual alumni exhibition match saw a strong turnout of former players returning to the MMMUT Hockey Ground, many meeting current squad members for the first time.

The evening included a short felicitation ceremony recognizing past team captains for their contribution to the program, followed by the exhibition match itself.

Photos from the event are available on the Gallery page.',
   'Team Management', '2026-05-15T18:00:00+00')
on conflict (slug) do nothing;

insert into public.events (title, description, venue, event_date)
values
  ('Pre-Season Fitness Camp',
   'A week-long conditioning camp open to all registered players ahead of the new season, covering strength, agility, and stick-work drills.',
   'MMMUT Sports Complex', '2026-08-10T06:30:00+00'),
  ('2026-27 Season Trials',
   'Open trials for all currently enrolled MMMUT students. No prior team experience required.',
   'MMMUT Hockey Ground', '2026-08-05T15:00:00+00'),
  ('Annual Alumni Exhibition Match',
   'Former players return to face the current squad in a friendly exhibition match, followed by a felicitation for past captains.',
   'MMMUT Hockey Ground', '2026-05-15T17:00:00+00'),
  ('Hit Stick Inter-Department Cup Kickoff',
   'Opening ceremony and first-round fixtures of the annual Hit Stick inter-department tournament.',
   'MMMUT Hockey Ground', '2026-09-01T16:00:00+00')
on conflict do nothing;
