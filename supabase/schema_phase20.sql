-- ============================================================================
-- PLAYERS — "Fullback" → "Pullback" terminology fix — Phase 20
-- Apply AFTER schema_phase19.sql.
--
-- schema_phase19.sql introduced 'right_fullback' / 'left_fullback' as the
-- two defense position values. The club actually calls this position
-- "Pullback", not "Fullback" — this migration renames both the stored
-- values and the check constraint to match, same pattern phase19 used to
-- migrate off the old 4-value position set.
-- ============================================================================

update public.players set position = 'right_pullback' where position = 'right_fullback';
update public.players set position = 'left_pullback' where position = 'left_fullback';

alter table public.players drop constraint if exists players_position_check;

alter table public.players add constraint players_position_check
  check (
    position in (
      'left_in', 'left_out', 'right_in', 'right_out', 'centre_forward',
      'right_half', 'left_half', 'centre_half',
      'right_pullback', 'left_pullback',
      'goalkeeper'
    )
  );
