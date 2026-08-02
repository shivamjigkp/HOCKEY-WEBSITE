-- ============================================================================
-- ROSTER HIGHLIGHTS ("THE ROSTER" homepage section) — Phase 16
-- Apply AFTER schema.sql (Phase 5) and schema_phase7.sql (Phase 7 — this
-- file's RLS policies depend on public.is_admin()).
--
-- Replaces the homepage "THE ROSTER" section, which used to auto-pull the
-- 4 most recently added rows from the real Players table
-- (getFeaturedPlayers() in services/players.js). That's still how the
-- full Players page works — this table is deliberately separate and only
-- powers the homepage teaser, so an admin can hand-curate exactly who
-- shows there (e.g. Captain, Vice-Captain, Technical Head) with a title
-- that doesn't have to match anything in the Players table, without
-- having to touch player records at all.
--
-- Same public-read / admin-write RLS + storage pattern as hero_slides
-- (schema_phase14.sql) and squad_photos (schema_phase15.sql).
-- ============================================================================

create table if not exists public.roster_highlights (
  id uuid primary key default gen_random_uuid(),
  storage_path text not null,
  name text not null,
  branch text,
  role text not null,
  sort_order integer not null default 0,
  is_active boolean not null default true,
  created_by uuid references auth.users (id) on delete set null,
  created_at timestamptz not null default now()
);

create index if not exists roster_highlights_sort_order_idx
  on public.roster_highlights (sort_order);

alter table public.roster_highlights enable row level security;

create policy "Roster highlights are publicly readable"
  on public.roster_highlights for select
  using (true);

create policy "Admins can manage roster highlights"
  on public.roster_highlights for all
  using (public.is_admin(auth.uid()))
  with check (public.is_admin(auth.uid()));

-- ---------------------------------------------------------------------------
-- Storage bucket
--
-- Run once, or create via Dashboard > Storage > New bucket:
--   name: roster-highlights
--   public: true (read)
-- ---------------------------------------------------------------------------

insert into storage.buckets (id, name, public)
values ('roster-highlights', 'roster-highlights', true)
on conflict (id) do nothing;

create policy "Roster highlight images are publicly readable"
  on storage.objects for select
  using (bucket_id = 'roster-highlights');

create policy "Admins can upload roster highlight images"
  on storage.objects for insert
  with check (bucket_id = 'roster-highlights' and public.is_admin(auth.uid()));

create policy "Admins can delete roster highlight images"
  on storage.objects for delete
  using (bucket_id = 'roster-highlights' and public.is_admin(auth.uid()));
