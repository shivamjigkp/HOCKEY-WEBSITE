import { getPlayers } from '@/services/players';
import { getMatches } from '@/services/matches';

/**
 * Statistics data service.
 *
 * Deliberately has no seed data and no database table of its own — every
 * number here is computed on the fly from src/services/players.js (roster
 * stats) and src/services/matches.js (completed fixtures), which are
 * already the source of truth. That means Statistics never drifts out of
 * sync with the roster/results, and there's nothing to fabricate: once
 * real player stats and match scores are entered elsewhere in the Admin
 * Dashboard, this page updates automatically.
 *
 * The team's own name, as used consistently in matches.homeTeam /
 * matches.awayTeam across the Admin Dashboard's default values.
 */
const TEAM_NAME = 'MMMUT Hockey';

function topByStat(players, statKey, count = 5) {
  return [...players]
    .filter((p) => typeof p.stats?.[statKey] === 'number')
    .sort((a, b) => b.stats[statKey] - a.stats[statKey])
    .slice(0, count)
    .map((p) => ({ id: p.id, name: p.name, position: p.position, value: p.stats[statKey] }));
}

function computeTeamRecord(matches) {
  const record = {
    played: 0,
    won: 0,
    drawn: 0,
    lost: 0,
    goalsFor: 0,
    goalsAgainst: 0,
  };

  for (const match of matches) {
    if (match.status !== 'completed') continue;
    if (match.homeScore == null || match.awayScore == null) continue;

    const isHome = match.homeTeam === TEAM_NAME;
    const isAway = match.awayTeam === TEAM_NAME;
    if (!isHome && !isAway) continue; // not a fixture involving the team itself

    const goalsFor = isHome ? match.homeScore : match.awayScore;
    const goalsAgainst = isHome ? match.awayScore : match.homeScore;

    record.played += 1;
    record.goalsFor += goalsFor;
    record.goalsAgainst += goalsAgainst;

    if (goalsFor > goalsAgainst) record.won += 1;
    else if (goalsFor < goalsAgainst) record.lost += 1;
    else record.drawn += 1;
  }

  return record;
}

/**
 * @returns {Promise<Object>} { record, topScorers, topAssists, topGoalkeepers }
 */
export async function getTeamStatistics() {
  const [players, matches] = await Promise.all([getPlayers(), getMatches()]);

  return {
    record: computeTeamRecord(matches),
    topScorers: topByStat(players, 'goals'),
    topAssists: topByStat(players, 'assists'),
    topGoalkeepers: topByStat(players, 'saves'),
  };
}
