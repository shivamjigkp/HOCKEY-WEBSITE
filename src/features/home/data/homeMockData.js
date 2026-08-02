/**
 * TEMPORARY placeholder data for homepage teaser sections.
 *
 * This is NOT production data — it exists only so Phase 2 (Homepage) can
 * ship a complete, realistic layout before the Matches (Phase 4) and
 * News (Phase 6) modules and their Supabase-backed services exist.
 *
 * Player data has already moved to src/services/players.js (Phase 3) —
 * FeaturedPlayers reads from there now, not from this file.
 *
 * Replace each remaining export below with a call into the relevant
 * service (src/services/matches.js, src/services/news.js) as soon as
 * that phase lands. Nothing outside src/features/home should import
 * from this file.
 */

/**
 * Display metadata for the homepage stats strip. The actual numbers are
 * admin-editable and live in `site_settings` (see supabase/schema_phase13.sql
 * and src/services/settings.js) — this only maps each stat to its settings
 * field so StatsStrip knows how to label and format the live value.
 */
export const STATS_META = [
  { id: 'founded', label: 'Est.', settingKey: 'foundedYear', suffix: '', format: 'year' },
  { id: 'titles', label: 'National Titles', settingKey: 'nationalTitles', suffix: '' },
  { id: 'players', label: 'Active Players', settingKey: 'activePlayers', suffix: '' },
  { id: 'alumni-pro', label: 'Alumni Gone Pro', settingKey: 'alumniPro', suffix: '+' },
];

/**
 * competition/date/opponent below are still placeholder (no real fixture
 * confirmed yet) — but the competition name is real: Malaviya Hockey
 * League (MHL), the team's own inter-batch tournament, per @hockey_mmmut.
 */
export const UPCOMING_MATCH = {
  id: 'placeholder-match-1',
  competition: 'Malaviya Hockey League',
  homeTeam: 'MMMUT Hockey',
  awayTeam: 'TBD',
  venue: 'MMMUT Hockey Ground, Gorakhpur',
  date: '2026-08-15T16:00:00',
};

export const LATEST_NEWS = [
  {
    id: 'n1',
    title: 'Malaviya Hockey League returns for another season',
    excerpt: 'Batches face off across the tournament as the program\u2019s flagship event kicks off.',
    date: '2026-07-24',
  },
  {
    id: 'n2',
    title: 'Hit Stick brings out the program\u2019s best stickwork',
    excerpt: 'The annual skills showcase tests control, passing, and finishing under pressure.',
    date: '2026-07-18',
  },
  {
    id: 'n3',
    title: 'Inter-Year tournament wraps up with strong turnout',
    excerpt: 'Batches competed across the season, with standout performances throughout.',
    date: '2026-07-10',
  },
];
