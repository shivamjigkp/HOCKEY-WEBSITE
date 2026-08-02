-- ============================================================================
-- PLAYERS — Branch field + traditional position taxonomy — Phase 19
-- Apply AFTER schema_phase8.sql (public.players must already exist).
--
-- Two changes to public.players:
--
-- 1. New `branch` column (college branch/department, e.g. "CSE", "Mechanical").
--
-- 2. `position` moves from the generic 4-value set (forward/midfielder/
--    defender/goalkeeper) to the traditional 11-position field hockey
--    lineup used at the club level:
--      Forward line : Left In, Left Out, Right In, Right Out, Centre Forward
--      Half line    : Right Half, Left Half, Centre Half
--      Fullbacks    : Right Fullback, Left Fullback
--      Goalkeeper
--
--    Existing rows are migrated to a reasonable specific position under the
--    old broad one BEFORE the new check constraint is added — Postgres
--    validates all existing rows against a new CHECK constraint immediately,
--    so skipping this step would make the migration fail outright once any
--    player rows exist. This is a one-time best-guess mapping; correct each
--    migrated player's exact position from the Admin > Players form
--    afterwards if it wasn't actually Centre Forward / Centre Half / Right
--    Fullback.
-- ============================================================================

alter table public.players add column if not exists branch text;

update public.players set position = 'centre_forward' where position = 'forward';
update public.players set position = 'centre_half' where position = 'midfielder';
update public.players set position = 'right_fullback' where position = 'defender';
-- 'goalkeeper' is unchanged — already a valid value in both the old and new sets.

alter table public.players drop constraint if exists players_position_check;

alter table public.players add constraint players_position_check
  check (
    position in (
      'left_in', 'left_out', 'right_in', 'right_out', 'centre_forward',
      'right_half', 'left_half', 'centre_half',
      'right_fullback', 'left_fullback',
      'goalkeeper'
    )
  );

comment on column public.players.branch is
  'College branch/department, e.g. "Computer Science", "Mechanical Engineering".';
