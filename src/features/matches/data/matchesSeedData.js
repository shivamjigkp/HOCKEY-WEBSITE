/**
 * ⚠️ PLACEHOLDER FIXTURE DATA — dates, opponents, and scores below are NOT
 * confirmed real fixtures. Tournament names (MHL, Hit Stick, Inter-Year)
 * are real recurring internal events per @hockey_mmmut, but specific
 * dates/scores/opponents here are illustrative only.
 *
 * TODO (blocking before production launch): replace with real fixtures.
 * `src/services/matches.js` is the only file that imports this.
 *
 * `status` accepts 'upcoming' | 'live' | 'completed'. A 'live' match may
 * also carry `homeScore`/`awayScore` (current running score), `period`
 * (e.g. "2nd Quarter"), and `matchClock` (e.g. "08:42") — the Live page
 * renders these when present. No match here is seeded as 'live' since
 * there isn't one right now; the Admin Dashboard (Phase 7) will be how
 * that gets flipped on matchday.
 */

export const MATCHES_SEED = [
  {
    id: 'm1',
    competition: 'Malaviya Hockey League',
    homeTeam: 'MMMUT Hockey',
    awayTeam: 'TBD',
    venue: 'MMMUT Hockey Ground, Gorakhpur',
    date: '2026-08-15T16:00:00',
    status: 'upcoming',
  },
  {
    id: 'm2',
    competition: 'Hit Stick',
    homeTeam: 'MMMUT Hockey',
    awayTeam: 'TBD',
    venue: 'MMMUT Hockey Ground, Gorakhpur',
    date: '2026-08-29T15:30:00',
    status: 'upcoming',
  },
  {
    id: 'm3',
    competition: 'Inter-Year Tournament',
    homeTeam: 'MMMUT Hockey',
    awayTeam: 'TBD',
    venue: 'MMMUT Hockey Ground, Gorakhpur',
    date: '2026-06-20T16:00:00',
    status: 'completed',
    homeScore: null,
    awayScore: null,
  },
  {
    id: 'm4',
    competition: 'Malaviya Hockey League',
    homeTeam: 'MMMUT Hockey',
    awayTeam: 'TBD',
    venue: 'MMMUT Hockey Ground, Gorakhpur',
    date: '2026-05-10T16:00:00',
    status: 'completed',
    homeScore: null,
    awayScore: null,
  },
];
