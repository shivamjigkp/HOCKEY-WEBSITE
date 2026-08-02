-- ============================================================================
-- COACHES → OFFICIALS — Phase 17
-- Apply AFTER schema_phase8.sql (creates the table this renames).
--
-- Two changes, both requested together:
--   1. Rename the `coaches` table (and its RLS policies) to `officials`,
--      matching the site-wide rename from "Coaches" to "Officials".
--   2. Simplify the table to just name/role/photo_url — drops bio,
--      achievements, and experience_years, since the Officials card now
--      only ever shows photo + role + name (see src/pages/Officials).
--
-- IMPORTANT — this is destructive: if any coach rows already have bio,
-- achievements, or experience_years filled in, that text is permanently
-- deleted by the DROP COLUMN statements below. There is no UI left to
-- manage those fields going forward, so this isn't a partial/reversible
-- step — back up the `coaches` table first if you want to keep that text
-- for reference (e.g. `select * from public.coaches;` and save the output)
-- before running this file.
-- ============================================================================

alter table if exists public.coaches rename to officials;

alter policy "Coaches are publicly readable" on public.officials
  rename to "Officials are publicly readable";

alter policy "Admins can manage coaches" on public.officials
  rename to "Admins can manage officials";

alter table public.officials drop column if exists bio;
alter table public.officials drop column if exists achievements;
alter table public.officials drop column if exists experience_years;
