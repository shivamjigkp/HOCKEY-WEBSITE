-- ============================================================================
-- SUPERADMIN ROLE + VISITOR COUNTER — Phase 22
-- Apply AFTER schema_phase7.sql (public.profiles, is_admin() must exist).
--
-- Part 1: Superadmin tier
--   - Adds 'superadmin' as a valid profiles.role value.
--   - is_admin(uid) becomes a superset check: true for 'admin' OR
--     'superadmin'. Every other table's RLS policy in this project checks
--     is_admin(), so superadmins automatically get full content-editing
--     access everywhere without touching a single other policy.
--   - is_superadmin(uid) is new and stricter — used only to gate the
--     ability to grant/revoke the admin role itself.
--   - The "update roles" policy on profiles now requires is_superadmin(),
--     not is_admin() — a regular admin can no longer promote or demote
--     anyone, only a superadmin can.
--   - Adds profiles.email (backfilled from auth.users, kept in sync by
--     the signup trigger) so the Admin > Users screen can show who's who
--     without needing service-role access to auth.users from the client.
--
-- Part 2: Visitor counter
--   - A single-row counter, incremented via a SECURITY DEFINER function
--     (not direct UPDATE) so anonymous visitors can bump the count
--     without being able to set it to an arbitrary value.
-- ============================================================================

-- ---------------------------------------------------------------------------
-- profiles.email
-- ---------------------------------------------------------------------------

alter table public.profiles add column if not exists email text;

update public.profiles p
set email = u.email
from auth.users u
where p.id = u.id and p.email is null;

-- ---------------------------------------------------------------------------
-- Role tiers: viewer < editor < admin < superadmin
-- ---------------------------------------------------------------------------

alter table public.profiles drop constraint if exists profiles_role_check;
alter table public.profiles add constraint profiles_role_check
  check (role in ('viewer', 'editor', 'admin', 'superadmin'));

create or replace function public.is_admin(uid uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = uid and role in ('admin', 'superadmin')
  );
$$;

create or replace function public.is_superadmin(uid uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = uid and role = 'superadmin'
  );
$$;

-- Only a superadmin can change ANYONE's role (including their own demotion
-- protection is intentionally not enforced here — be careful not to demote
-- your only superadmin account by mistake).
drop policy if exists "Admins can update roles" on public.profiles;
create policy "Superadmins can update roles"
  on public.profiles for update
  using (public.is_superadmin(auth.uid()))
  with check (public.is_superadmin(auth.uid()));

-- Update handle_new_user() to also store email going forward.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, email, role)
  values (new.id, new.raw_user_meta_data->>'full_name', new.email, 'viewer')
  on conflict (id) do nothing;
  return new;
end;
$$;

-- ---------------------------------------------------------------------------
-- Promote your account to superadmin manually (run once, replace the
-- email). Do this for exactly one trusted account — everyone else stays
-- 'viewer' until a superadmin promotes them to 'admin' from /admin/users.
--
--   update public.profiles set role = 'superadmin'
--   where id = (select id from auth.users where email = 'you@example.com');
-- ---------------------------------------------------------------------------

-- ---------------------------------------------------------------------------
-- Visitor counter
-- ---------------------------------------------------------------------------

create table if not exists public.site_visits (
  id smallint primary key default 1,
  count bigint not null default 0,
  constraint site_visits_singleton check (id = 1)
);

insert into public.site_visits (id, count) values (1, 0)
on conflict (id) do nothing;

alter table public.site_visits enable row level security;

create policy "Visit count is publicly readable"
  on public.site_visits for select
  using (true);

-- No INSERT/UPDATE/DELETE policy is defined for any role — the only way
-- to change the count is through increment_visit_count() below, which
-- runs as the function owner (security definer) rather than the caller,
-- so an anonymous visitor can bump the count without being able to set
-- it to an arbitrary value directly.

create or replace function public.increment_visit_count()
returns bigint
language plpgsql
security definer
set search_path = public
as $$
declare
  new_count bigint;
begin
  update public.site_visits set count = count + 1 where id = 1
  returning count into new_count;
  return new_count;
end;
$$;

grant execute on function public.increment_visit_count() to anon, authenticated;
