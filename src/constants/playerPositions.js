/**
 * Canonical player position values (field hockey positions).
 * Shared by seed/service data, the roster filter UI, and (Phase 7) the
 * Admin player form — so position labels never drift between them.
 */
export const PLAYER_POSITIONS = {
  FORWARD: 'forward',
  MIDFIELDER: 'midfielder',
  DEFENDER: 'defender',
  GOALKEEPER: 'goalkeeper',
};

export const PLAYER_POSITION_LABELS = {
  [PLAYER_POSITIONS.FORWARD]: 'Forward',
  [PLAYER_POSITIONS.MIDFIELDER]: 'Midfielder',
  [PLAYER_POSITIONS.DEFENDER]: 'Defender',
  [PLAYER_POSITIONS.GOALKEEPER]: 'Goalkeeper',
};

/** Ordered list for filter tabs, roster grouping, etc. */
export const PLAYER_POSITION_FILTERS = [
  { value: 'all', label: 'All' },
  { value: PLAYER_POSITIONS.FORWARD, label: 'Forwards' },
  { value: PLAYER_POSITIONS.MIDFIELDER, label: 'Midfielders' },
  { value: PLAYER_POSITIONS.DEFENDER, label: 'Defenders' },
  { value: PLAYER_POSITIONS.GOALKEEPER, label: 'Goalkeepers' },
];
