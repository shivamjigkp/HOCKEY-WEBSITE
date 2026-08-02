-- ============================================================================
-- ALUMNI GROUP PHOTOS (Slideshow) — Phase 23
-- Apply AFTER schema.sql (Phase 5) and schema_phase7.sql (Phase 7 — this
-- file's RLS policies depend on public.is_admin()).
--
-- Adds a large, admin-curated photo slideshow shown on the public Alumni
-- page, below the per-alumnus grid — for batch/reunion group photos that
-- don't belong to any one person. Deliberately a flat ordered list (no
-- containers), mirroring hero_slides (schema_phase14.sql) exactly rather
-- than squad_photos/squad_containers (schema_phase15.sql), since there's
-- only ever one slideshow here, not several grouped by year/section.
--
-- Same public-read / admin-write RLS pattern as every other Phase 8+ table.
-- ============================================================================

-- ---------------------------------------------------------------------------
-- Table
-- ---------------------------------------------------------------------------

create table if not exists public.alumni_group_photos (
  id uuid primary key default gen_random_uuid(),
  storage_path text not null,
  caption text,
  sort_order integer not null default 0,
  is_active boolean not null default true,
  created_by uuid references auth.users (id) on delete set null,
  created_at timestamptz not null default now()
);

create index if not exists alumni_group_photos_sort_order_idx
  on public.alumni_group_photos (sort_order);

alter table public.alumni_group_photos enable row level security;

create policy "Alumni group photos are publicly readable"
  on public.alumni_group_photos for select
  using (true);

create policy "Admins can manage alumni group photos"
  on public.alumni_group_photos for all
  using (public.is_admin(auth.uid()))
  with check (public.is_admin(auth.uid()));

-- ---------------------------------------------------------------------------
-- Storage bucket
--
-- Run once, or create via Dashboard > Storage > New bucket:
--   name: alumni-group-photos
--   public: true (read)
-- ---------------------------------------------------------------------------

insert into storage.buckets (id, name, public)
values ('alumni-group-photos', 'alumni-group-photos', true)
on conflict (id) do nothing;

create policy "Alumni group photo images are publicly readable"
  on storage.objects for select
  using (bucket_id = 'alumni-group-photos');

create policy "Admins can upload alumni group photo images"
  on storage.objects for insert
  with check (bucket_id = 'alumni-group-photos' and public.is_admin(auth.uid()));

create policy "Admins can delete alumni group photo images"
  on storage.objects for delete
  using (bucket_id = 'alumni-group-photos' and public.is_admin(auth.uid()));
