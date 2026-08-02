-- ============================================================================
-- SETTINGS — Phase 7 (closes the last open item: Authentication, Admin
-- Dashboard, and RBAC all shipped in schema_phase7.sql; this is Settings).
-- Apply AFTER schema_phase7.sql (needs public.is_admin()).
--
-- Two things:
--   1. `site_settings` — a small public-read/admin-write key-value table
--      for the handful of values that were hardcoded in
--      src/constants/siteConfig.js (contact email, social links), so an
--      admin can update them without a code change + redeploy.
--   2. Adds `email` to `profiles` and backfills it from auth.users, purely
--      so the new Admin > Settings "manage admin users" screen can show
--      *which* email a profile row belongs to — profiles.role already
--      existed (schema_phase7.sql), this just makes the list readable.
--
-- Deliberately NOT included here: a "team identity" setting (the /mmmut/i
-- pattern used in Tournament History / Statistics to compute W-L records).
-- That's static enough that hardcoding it in code is the right call —
-- moving it to the DB would add a fetch + loading state to every page that
-- uses it for a value that will effectively never change.
-- ============================================================================

-- ---------------------------------------------------------------------------
-- site_settings
-- ---------------------------------------------------------------------------

create table if not exists public.site_settings (
  key text primary key,
  value text,
  updated_at timestamptz not null default now()
);

alter table public.site_settings enable row level security;

create policy "Site settings are publicly readable"
  on public.site_settings for select
  using (true);

create policy "Admins can manage site settings"
  on public.site_settings for all
  using (public.is_admin(auth.uid()))
  with check (public.is_admin(auth.uid()));

-- Seed with the values that were previously hardcoded in siteConfig.js, so
-- nothing visibly changes on the site until an admin edits them.
insert into public.site_settings (key, value)
values
  ('contact_email', 'hockeymmmutofficial@gmail.com'),
  ('social_instagram', 'https://www.instagram.com/hockey_mmmut/'),
  ('social_facebook', 'https://www.facebook.com/Hockeymmm'),
  ('social_youtube', 'https://youtube.com/@hockeymmmut?si=RiIqzqQYviU4hePO')
on conflict (key) do nothing;

-- ---------------------------------------------------------------------------
-- profiles.email — so the admin user list is actually readable
-- ---------------------------------------------------------------------------

alter table public.profiles add column if not exists email text;

update public.profiles p
set email = u.email
from auth.users u
where p.id = u.id and p.email is null;

-- Keep new signups' profile.email populated going forward too.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, role, email)
  values (new.id, new.raw_user_meta_data->>'full_name', 'viewer', new.email)
  on conflict (id) do update set email = excluded.email;
  return new;
end;
$$;
