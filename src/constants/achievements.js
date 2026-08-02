/**
 * Achievements data.
 *
 * IMPORTANT: `winner`, `year`, and `note` fields marked "To be confirmed"
 * are intentional placeholders — they are NOT filled with guessed or
 * plausible-sounding data. Replace only the specific field(s) once the
 * real record is confirmed (ask the team/admin), do not remove the
 * "To be confirmed" pattern for any entry that isn't verified yet.
 */

export const INTERNAL_TOURNAMENTS = [
  {
    id: 'mhl',
    name: 'MHL (Malaviya Hockey League)',
    description: 'Internal batch-vs-batch league hosted within MMMUT.',
    records: [
      { year: 'To be confirmed', winner: 'To be confirmed', note: '' },
    ],
  },
  {
    id: 'hit-stick',
    name: 'Hit Stick',
    description: 'Internal knockout-style hockey event.',
    records: [
      { year: 'To be confirmed', winner: 'To be confirmed', note: '' },
    ],
  },
  {
    id: 'inter-year',
    name: 'Inter-Year Tournament',
    description: 'Annual year-vs-year tournament (name may vary by edition).',
    records: [
      { year: 'To be confirmed', winner: 'To be confirmed', note: '' },
    ],
  },
];

export const EXTERNAL_EVENTS = [
  {
    id: 'udgosh-iitk',
    name: 'Udgosh, IIT Kanpur',
    result: 'Participated',
    year: 'To be confirmed',
    note: 'Inter-college sports fest at IIT Kanpur.',
  },
];

export const UNIVERSITY_ACHIEVEMENTS = [];
export const TEAM_ACHIEVEMENTS = [];
export const PLAYER_ACHIEVEMENTS = [];
export const COACH_ACHIEVEMENTS = [];
