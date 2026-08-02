-- ============================================================================
-- SETTINGS — Phase 13 (extends schema_phase12.sql's site_settings table).
-- Apply AFTER schema_phase12.sql.
--
-- Adds the homepage "stats strip" numbers (Est. year, national titles,
-- active players, alumni gone pro) as admin-editable site_settings rows.
-- These previously lived as hardcoded values in
-- src/features/home/data/homeMockData.js's PROGRAM_STATS export — now the
-- component (StatsStrip.jsx) only keeps the display metadata (labels,
-- suffixes) and reads the numbers from here via src/services/settings.js.
--
-- No new table, no new RLS policy — reuses site_settings' existing
-- "publicly readable / admin-writable" policies from schema_phase12.sql.
-- ============================================================================

insert into public.site_settings (key, value)
values
  ('stat_founded_year', '1962'),
  ('stat_national_titles', '14'),
  ('stat_active_players', '32'),
  ('stat_alumni_pro', '47')
on conflict (key) do nothing;
