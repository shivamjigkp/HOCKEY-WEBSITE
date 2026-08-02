-- ============================================================================
-- GALLERY MODULE — Phase 5
-- First tables backed by a real Supabase project (everything before this
-- phase used local seed data via the services/ layer).
--
-- Apply with the Supabase CLI or paste into the SQL editor:
--   supabase db push
-- or paste this file's contents into Project > SQL Editor > New query.
-- ============================================================================

-- ---------------------------------------------------------------------------
-- Tables
-- ---------------------------------------------------------------------------

create table if not exists public.albums (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text not null unique,
  description text,
  cover_image_url text,
  created_by uuid references auth.users (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.gallery_images (
  id uuid primary key default gen_random_uuid(),
  album_id uuid not null references public.albums (id) on delete cascade,
  storage_path text not null,
  caption text,
  sort_order integer not null default 0,
  created_by uuid references auth.users (id) on delete set null,
  created_at timestamptz not null default now()
);

create index if not exists gallery_images_album_id_idx
  on public.gallery_images (album_id);

-- ---------------------------------------------------------------------------
-- Row Level Security
--
-- INTERIM POLICY: write access below only checks `authenticated`, not a
-- specific admin role, because the admin role/RBAC system doesn't exist
-- until Phase 7. This is deliberately narrower than "public" (an anonymous
-- visitor cannot write) but wider than the final target ("only accounts
-- flagged as admin can write"). Tighten these two policies in Phase 7 by
-- adding `and public.is_admin(auth.uid())` (or equivalent) once that
-- function/table exists — do not leave this policy as the permanent state.
-- ---------------------------------------------------------------------------

alter table public.albums enable row level security;
alter table public.gallery_images enable row level security;

create policy "Albums are publicly readable"
  on public.albums for select
  using (true);

create policy "Authenticated users can manage albums"
  on public.albums for all
  using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');

create policy "Gallery images are publicly readable"
  on public.gallery_images for select
  using (true);

create policy "Authenticated users can manage gallery images"
  on public.gallery_images for all
  using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');

-- ---------------------------------------------------------------------------
-- Storage bucket
--
-- Run once, or create via Dashboard > Storage > New bucket:
--   name: gallery-images
--   public: true (read)
-- ---------------------------------------------------------------------------

insert into storage.buckets (id, name, public)
values ('gallery-images', 'gallery-images', true)
on conflict (id) do nothing;

create policy "Gallery images bucket is publicly readable"
  on storage.objects for select
  using (bucket_id = 'gallery-images');

create policy "Authenticated users can upload gallery images"
  on storage.objects for insert
  with check (bucket_id = 'gallery-images' and auth.role() = 'authenticated');

create policy "Authenticated users can delete gallery images"
  on storage.objects for delete
  using (bucket_id = 'gallery-images' and auth.role() = 'authenticated');
