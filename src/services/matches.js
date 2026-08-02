import { supabase } from '@/config/supabaseClient';

/**
 * Match data service. Components import from here only — never call
 * `supabase.from('matches')` directly.
 *
 * Backed by Supabase as of Phase 8 (see supabase/schema_phase8.sql).
 * `mapRow` converts DB snake_case columns to the camelCase shape every
 * page already consumes — note `match_date` maps back to `date` to match
 * the original seed-data field name.
 */

function mapRow(row) {
  if (!row) return null;
  return {
    id: row.id,
    competition: row.competition,
    homeTeam: row.home_team,
    awayTeam: row.away_team,
    venue: row.venue,
    date: row.match_date,
    status: row.status,
    homeScore: row.home_score,
    awayScore: row.away_score,
    period: row.period,
    matchClock: row.match_clock,
  };
}

export async function getMatches() {
  const { data, error } = await supabase.from('matches').select('*').order('match_date');
  if (error) throw error;
  return data.map(mapRow);
}

export async function getUpcomingMatches() {
  const { data, error } = await supabase
    .from('matches')
    .select('*')
    .eq('status', 'upcoming')
    .order('match_date', { ascending: true });

  if (error) throw error;
  return data.map(mapRow);
}

export async function getCompletedMatches() {
  const { data, error } = await supabase
    .from('matches')
    .select('*')
    .eq('status', 'completed')
    .order('match_date', { ascending: false });

  if (error) throw error;
  return data.map(mapRow);
}

export async function getNextMatch() {
  const upcoming = await getUpcomingMatches();
  return upcoming[0] ?? null;
}

/**
 * Returns the match currently in progress, or null if none. A match is
 * "live" purely via its `status` field — no date-window inference — so
 * the Admin Dashboard is how that gets flipped on matchday (see
 * updateMatchStatus / updateLiveScore below).
 */
export async function getLiveMatch() {
  const { data, error } = await supabase
    .from('matches')
    .select('*')
    .eq('status', 'live')
    .maybeSingle();

  if (error) throw error;
  return mapRow(data);
}

// ---------------------------------------------------------------------------
// Admin CRUD (Admin Dashboard only — gated by requireAdmin ProtectedRoute
// and by the "Admins can manage matches" RLS policy)
// ---------------------------------------------------------------------------

export async function createMatch({ competition, homeTeam, awayTeam, venue, date, status }) {
  const { data, error } = await supabase
    .from('matches')
    .insert({
      competition,
      home_team: homeTeam,
      away_team: awayTeam,
      venue,
      match_date: date,
      status: status || 'upcoming',
    })
    .select()
    .single();

  if (error) throw error;
  return mapRow(data);
}

export async function updateMatch(id, payload) {
  const { data, error } = await supabase
    .from('matches')
    .update({
      competition: payload.competition,
      home_team: payload.homeTeam,
      away_team: payload.awayTeam,
      venue: payload.venue,
      match_date: payload.date,
      status: payload.status,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return mapRow(data);
}

export async function deleteMatch(id) {
  const { error } = await supabase.from('matches').delete().eq('id', id);
  if (error) throw error;
}

/**
 * Matchday quick control: flip status to 'live'/'completed'/'upcoming'
 * and/or push a live score update in one call, without needing the full
 * edit form. Only one match should be 'live' at a time — the caller
 * (MatchesManage) is responsible for setting any previously-live match
 * back to 'completed' first if switching which match is live.
 */
export async function updateLiveScore(id, { status, homeScore, awayScore, period, matchClock }) {
  const { data, error } = await supabase
    .from('matches')
    .update({
      status,
      home_score: homeScore,
      away_score: awayScore,
      period,
      match_clock: matchClock,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return mapRow(data);
}
