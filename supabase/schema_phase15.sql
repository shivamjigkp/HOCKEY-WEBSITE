-- ============================================================================
-- SQUAD PHOTOS (Group Photos by Year/Section) — Phase 15
-- Apply AFTER schema.sql (Phase 5) and schema_phase7.sql (Phase 7 — this
-- file's RLS policies depend on public.is_admin()).
--
-- Adds an admin-configurable set of "containers" (e.g. Final Year, 3rd Year
-- Boys, 3rd Year Girls, 2nd Year Boys, 2nd Year Girls — seeded below, but
-- admins can add/remove containers freely from Admin > Squad Photos) shown
-- on the public Players page, below the roster grid.
--
-- Each container holds one or more photos. `squad_photos.sort_order`
-- doubles as both the slideshow sequence AND, when the container's
-- slideshow is OFF, which single photo is shown permanently — sort_order
-- 1 (the lowest) is that photo. This mirrors hero_slides' sort_order
-- pattern (schema_phase14.sql) but adds the container grouping and the
-- per-container on/off flag hero_slides doesn't need.
--
-- Same public-read / admin-write RLS pattern as every other Phase 8+ table.
-- ============================================================================

-- ---------------------------------------------------------------------------
-- Tables
-- ---------------------------------------------------------------------------

create table if not exists public.squad_containers (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slideshow_enabled boolean not null default false,
  sort_order integer not null default 0,
  created_by uuid references auth.users (id) on delete set null,
  created_at timestamptz not null default now()
);

create table if not exists public.squad_photos (
  id uuid primary key default gen_random_uuid(),
  container_id uuid not null references public.squad_containers (id) on delete cascade,
  storage_path text not null,
  sort_order integer not null default 1,
  created_by uuid references auth.users (id) on delete set null,
  created_at timestamptz not null default now()
);

create index if not exists squad_photos_container_id_idx
  on public.squad_photos (container_id);

-- ---------------------------------------------------------------------------
-- Row Level Security
-- ---------------------------------------------------------------------------

alter table public.squad_containers enable row level security;
alter table public.squad_photos enable row level security;

create policy "Squad containers are publicly readable"
  on public.squad_containers for select
  using (true);

create policy "Admins can manage squad containers"
  on public.squad_containers for all
  using (public.is_admin(auth.uid()))
  with check (public.is_admin(auth.uid()));

create policy "Squad photos are publicly readable"
  on public.squad_photos for select
  using (true);

create policy "Admins can manage squad photos"
  on public.squad_photos for all
  using (public.is_admin(auth.uid()))
  with check (public.is_admin(auth.uid()));

-- ---------------------------------------------------------------------------
-- Storage bucket
--
-- Run once, or create via Dashboard > Storage > New bucket:
--   name: squad-photos
--   public: true (read)
-- ---------------------------------------------------------------------------

insert into storage.buckets (id, name, public)
values ('squad-photos', 'squad-photos', true)
on conflict (id) do nothing;

create policy "Squad photo images are publicly readable"
  on storage.objects for select
  using (bucket_id = 'squad-photos');

create policy "Admins can upload squad photo images"
  on storage.objects for insert
  with check (bucket_id = 'squad-photos' and public.is_admin(auth.uid()));

create policy "Admins can delete squad photo images"
  on storage.objects for delete
  using (bucket_id = 'squad-photos' and public.is_admin(auth.uid()));

-- ---------------------------------------------------------------------------
-- Seed default containers (empty of photos — admin uploads those)
-- ---------------------------------------------------------------------------

insert into public.squad_containers (title, sort_order)
values
  ('Final Year', 0),
  ('3rd Year Boys', 1),
  ('3rd Year Girls', 2),
  ('2nd Year Boys', 3),
  ('2nd Year Girls', 4)
on conflict do nothing;
