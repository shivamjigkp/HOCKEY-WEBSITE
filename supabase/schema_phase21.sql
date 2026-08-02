-- ============================================================================
-- PLAYER SOCIAL LINKS — Phase 21
-- Apply AFTER schema_phase8.sql (public.players must already exist).
--
-- Adds optional LinkedIn/GitHub profile links to players, shown on the
-- player detail page when present. Both nullable — a player card with
-- neither link filled in just shows no link row.
-- ============================================================================

alter table public.players add column if not exists linkedin_url text;
alter table public.players add column if not exists github_url text;
