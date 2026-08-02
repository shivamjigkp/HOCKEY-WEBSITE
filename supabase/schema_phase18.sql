-- ============================================================================
-- ALUMNI — Phase 18
-- Apply AFTER schema_phase7.sql (RLS policies depend on public.is_admin()).
--
-- New nav section (Home / Officials / Matches / Tournament History /
-- Players / Alumni / Gallery reorganization). Same simple shape as
-- Officials (Phase 17) — name, role, photo — since Alumni has the same
-- "just a directory card" requirement. "role" is reused loosely here for
-- batch/current role text (e.g. "B.Tech 2018 · Software Engineer, TCS")
-- since alumni don't have a fixed staff role.
-- ============================================================================

create table if not exists public.alumni (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  role text,
  photo_url text,
  created_by uuid references auth.users (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.alumni enable row level security;

create policy "Alumni are publicly readable"
  on public.alumni for select
  using (true);

create policy "Admins can manage alumni"
  on public.alumni for all
  using (public.is_admin(auth.uid()))
  with check (public.is_admin(auth.uid()));
