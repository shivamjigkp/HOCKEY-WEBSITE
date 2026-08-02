-- ============================================================================
-- VIDEOS/HIGHLIGHTS BACKEND — Phase 11
-- Apply AFTER schema.sql (Phase 5), schema_phase7.sql (is_admin()), and
-- schema_phase8.sql (public.matches, for the optional match_id link).
--
-- Last remaining module still reading a local seed-data file directly
-- (src/features/videos/data/videosSeedData.js) instead of Supabase — closes
-- that gap the same way Phase 8/9/10 did for the rest of the site. There was
-- also no Admin page for this, so highlights could only be added by editing
-- code — this migration ships that page too.
--
-- Same public-read / admin-write RLS pattern as every other table.
-- ============================================================================

create table if not exists public.videos (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  competition text,
  video_date date not null default current_date,
  youtube_id text not null,
  thumbnail_url text,
  match_id uuid references public.matches (id) on delete set null,
  created_by uuid references auth.users (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.videos enable row level security;

create policy "Videos are publicly readable"
  on public.videos for select
  using (true);

create policy "Admins can manage videos"
  on public.videos for all
  using (public.is_admin(auth.uid()))
  with check (public.is_admin(auth.uid()));

-- No seed rows — the old videosSeedData.js shipped intentionally empty
-- (no real highlights uploaded yet), and a placeholder YouTube ID would
-- just be a dead link, not a harmless mock value.
