/**
 * Canonical player position values — the traditional 11-position field
 * hockey lineup:
 *   Forward : Left In, Left Out, Right In, Right Out, Centre Forward
 *   Mid     : Right Half, Left Half, Centre Half
 *   Defense : Right Pullback, Left Pullback
 *   Goalkeeper
 *
 * Shared by seed/service data, the roster filter UI, and the Admin player
 * form — so position labels never drift between them. See
 * supabase/schema_phase19.sql and schema_phase20.sql for the matching DB
 * check constraint ("Pullback", not "Fullback" — schema_phase20.sql fixed
 * that naming after phase19 shipped with the wrong term).
 */
export const PLAYER_POSITIONS = {
  LEFT_IN: 'left_in',
  LEFT_OUT: 'left_out',
  RIGHT_IN: 'right_in',
  RIGHT_OUT: 'right_out',
  CENTRE_FORWARD: 'centre_forward',
  RIGHT_HALF: 'right_half',
  LEFT_HALF: 'left_half',
  CENTRE_HALF: 'centre_half',
  RIGHT_PULLBACK: 'right_pullback',
  LEFT_PULLBACK: 'left_pullback',
  GOALKEEPER: 'goalkeeper',
};

export const PLAYER_POSITION_LABELS = {
  [PLAYER_POSITIONS.LEFT_IN]: 'Left In',
  [PLAYER_POSITIONS.LEFT_OUT]: 'Left Out',
  [PLAYER_POSITIONS.RIGHT_IN]: 'Right In',
  [PLAYER_POSITIONS.RIGHT_OUT]: 'Right Out',
  [PLAYER_POSITIONS.CENTRE_FORWARD]: 'Centre Forward',
  [PLAYER_POSITIONS.RIGHT_HALF]: 'Right Half',
  [PLAYER_POSITIONS.LEFT_HALF]: 'Left Half',
  [PLAYER_POSITIONS.CENTRE_HALF]: 'Centre Half',
  [PLAYER_POSITIONS.RIGHT_PULLBACK]: 'Right Pullback',
  [PLAYER_POSITIONS.LEFT_PULLBACK]: 'Left Pullback',
  [PLAYER_POSITIONS.GOALKEEPER]: 'Goalkeeper',
};

/**
 * Grouped by line — used for the Admin player form's <optgroup> select
 * so all 11 positions are easy to scan without one giant flat list.
 */
export const PLAYER_POSITION_GROUPS = [
  {
    label: 'Forward',
    options: [
      PLAYER_POSITIONS.LEFT_OUT,
      PLAYER_POSITIONS.LEFT_IN,
      PLAYER_POSITIONS.CENTRE_FORWARD,
      PLAYER_POSITIONS.RIGHT_IN,
      PLAYER_POSITIONS.RIGHT_OUT,
    ],
  },
  {
    label: 'Mid',
    options: [PLAYER_POSITIONS.LEFT_HALF, PLAYER_POSITIONS.CENTRE_HALF, PLAYER_POSITIONS.RIGHT_HALF],
  },
  {
    label: 'Defense',
    options: [PLAYER_POSITIONS.LEFT_PULLBACK, PLAYER_POSITIONS.RIGHT_PULLBACK],
  },
  {
    label: 'Goalkeeper',
    options: [PLAYER_POSITIONS.GOALKEEPER],
  },
];

/**
 * Broader "line" filters for the public roster page — 11 individual filter
 * buttons would be too many to scan, so the public filter groups by line
 * instead, while each player's card/details still shows their exact
 * position (e.g. "Left In").
 */
export const PLAYER_LINE_FILTERS = [
  { value: 'all', label: 'All', positions: null },
  {
    value: 'forward',
    label: 'Forward',
    positions: [
      PLAYER_POSITIONS.LEFT_OUT,
      PLAYER_POSITIONS.LEFT_IN,
      PLAYER_POSITIONS.CENTRE_FORWARD,
      PLAYER_POSITIONS.RIGHT_IN,
      PLAYER_POSITIONS.RIGHT_OUT,
    ],
  },
  {
    value: 'half',
    label: 'Mid',
    positions: [PLAYER_POSITIONS.LEFT_HALF, PLAYER_POSITIONS.CENTRE_HALF, PLAYER_POSITIONS.RIGHT_HALF],
  },
  {
    value: 'pullback',
    label: 'Defense',
    positions: [PLAYER_POSITIONS.LEFT_PULLBACK, PLAYER_POSITIONS.RIGHT_PULLBACK],
  },
  {
    value: 'goalkeeper',
    label: 'Goalkeepers',
    positions: [PLAYER_POSITIONS.GOALKEEPER],
  },
];
