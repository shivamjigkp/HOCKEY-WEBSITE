-- ============================================================================
-- HERO SLIDESHOW — Phase 14
-- Apply AFTER schema.sql (Phase 5) and schema_phase7.sql (Phase 7 — this
-- file's RLS policies depend on public.is_admin()).
--
-- Adds a large photo slideshow rendered on the homepage, directly below
-- HeroSection. Deliberately its own table/bucket rather than reusing the
-- Gallery module (albums/gallery_images, schema.sql): the homepage
-- slideshow is a single ordered list curated by an admin, not a
-- browsable album, and keeping it separate means Admin > Hero Slideshow
-- (a small, focused screen — same spirit as Admin > Settings) never has
-- to worry about someone deleting a Gallery album out from under the
-- homepage.
--
-- Same public-read / admin-write RLS pattern as every other Phase 8+
-- table.
-- ============================================================================

-- ---------------------------------------------------------------------------
-- Table
-- ---------------------------------------------------------------------------

create table if not exists public.hero_slides (
  id uuid primary key default gen_random_uuid(),
  storage_path text not null,
  caption text,
  sort_order integer not null default 0,
  is_active boolean not null default true,
  created_by uuid references auth.users (id) on delete set null,
  created_at timestamptz not null default now()
);

create index if not exists hero_slides_sort_order_idx
  on public.hero_slides (sort_order);

alter table public.hero_slides enable row level security;

create policy "Hero slides are publicly readable"
  on public.hero_slides for select
  using (true);

create policy "Admins can manage hero slides"
  on public.hero_slides for all
  using (public.is_admin(auth.uid()))
  with check (public.is_admin(auth.uid()));

-- ---------------------------------------------------------------------------
-- Storage bucket
--
-- Run once, or create via Dashboard > Storage > New bucket:
--   name: hero-slides
--   public: true (read)
-- ---------------------------------------------------------------------------

insert into storage.buckets (id, name, public)
values ('hero-slides', 'hero-slides', true)
on conflict (id) do nothing;

create policy "Hero slide images are publicly readable"
  on storage.objects for select
  using (bucket_id = 'hero-slides');

create policy "Admins can upload hero slide images"
  on storage.objects for insert
  with check (bucket_id = 'hero-slides' and public.is_admin(auth.uid()));

create policy "Admins can delete hero slide images"
  on storage.objects for delete
  using (bucket_id = 'hero-slides' and public.is_admin(auth.uid()));
