-- ============================================================================
-- SPONSORS + FAQ + CONTACT BACKEND — Phase 10
-- Apply AFTER schema.sql (Phase 5) and schema_phase7.sql (Phase 7 — this
-- file's RLS policies depend on public.is_admin()).
--
-- Closes the three gaps flagged during the Phase 8/9 backend sweep:
--   1. Sponsors was still reading src/features/sponsors/data/sponsorsSeedData.js
--   2. FAQ had no service layer at all — the page imported its seed file
--      directly, bypassing the service-layer rule every other page follows.
--   3. Contact only opened a mailto: link — nothing was ever stored, so
--      there was no way to review submissions after the fact.
--
-- Sponsors and FAQ follow the same public-read / admin-write pattern as
-- every other Phase 7/8/9 table. Contact messages are different: the INSERT
-- policy is open to everyone (anonymous visitors submit the form), but
-- SELECT/UPDATE/DELETE are admin-only — visitors can write a message but
-- can never read anyone else's.
-- ============================================================================

-- ---------------------------------------------------------------------------
-- Sponsors
-- ---------------------------------------------------------------------------

create table if not exists public.sponsors (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  logo_url text,
  website text,
  sort_order integer not null default 0,
  created_by uuid references auth.users (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.sponsors enable row level security;

create policy "Sponsors are publicly readable"
  on public.sponsors for select
  using (true);

create policy "Admins can manage sponsors"
  on public.sponsors for all
  using (public.is_admin(auth.uid()))
  with check (public.is_admin(auth.uid()));

-- ---------------------------------------------------------------------------
-- FAQ
-- ---------------------------------------------------------------------------

create table if not exists public.faqs (
  id uuid primary key default gen_random_uuid(),
  question text not null unique,
  answer text not null,
  sort_order integer not null default 0,
  created_by uuid references auth.users (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.faqs enable row level security;

create policy "FAQs are publicly readable"
  on public.faqs for select
  using (true);

create policy "Admins can manage FAQs"
  on public.faqs for all
  using (public.is_admin(auth.uid()))
  with check (public.is_admin(auth.uid()));

-- ---------------------------------------------------------------------------
-- Contact messages
-- ---------------------------------------------------------------------------

create table if not exists public.contact_messages (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  subject text,
  message text not null,
  is_read boolean not null default false,
  created_at timestamptz not null default now()
);

alter table public.contact_messages enable row level security;

-- Anyone (including anonymous visitors) can submit the contact form, but
-- can never read, update, or delete messages — including their own.
create policy "Anyone can submit a contact message"
  on public.contact_messages for insert
  with check (true);

create policy "Admins can read contact messages"
  on public.contact_messages for select
  using (public.is_admin(auth.uid()));

create policy "Admins can update contact messages"
  on public.contact_messages for update
  using (public.is_admin(auth.uid()))
  with check (public.is_admin(auth.uid()));

create policy "Admins can delete contact messages"
  on public.contact_messages for delete
  using (public.is_admin(auth.uid()));

-- ---------------------------------------------------------------------------
-- Seed rows — FAQ content is real, general-purpose copy (not a factual claim
-- about team history), so it seeds directly rather than needing a "To be
-- confirmed" treatment. Sponsors seeds empty on purpose: no sponsor is
-- confirmed yet, and SponsorsStrip already renders nothing for an empty list.
-- ---------------------------------------------------------------------------

insert into public.faqs (question, answer, sort_order)
values
  ('Who can try out for the MMMUT Hockey team?',
   'Any currently enrolled MMMUT student can try out, regardless of branch, year, or prior hockey experience. Trial dates are announced on the News page and the official Instagram page.',
   1),
  ('Do I need my own hockey stick to try out?',
   'No — a limited number of loaner sticks are available at trials on a first-come basis, though bringing your own is welcome if you have one.',
   2),
  ('Where does the team practice?',
   'Regular practice sessions are held at the MMMUT Hockey Ground. Occasionally, sessions shift to the secondary ground near the sports complex for turf maintenance — any such changes are posted under Announcements.',
   3),
  ('How can I follow match schedules and live scores?',
   'The Matches page lists upcoming and completed fixtures, and the Live page shows real-time score updates whenever a match is in progress.',
   4),
  ('Is the team looking for sponsors?',
   'Yes. If your organization is interested in sponsoring MMMUT Hockey, please reach out via the Contact page or email us directly.',
   5),
  ('How do I get event photos or team media?',
   'Photos from matches, trials, and events are posted on the Gallery page, organized by album.',
   6)
on conflict (question) do nothing;
