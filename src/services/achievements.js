import { supabase } from '@/config/supabaseClient';

/**
 * Achievements data service. Components import from here only — never
 * call `supabase.from('achievement_*')` directly.
 *
 * Backed by Supabase as of Phase 9 (see supabase/schema_phase9.sql).
 *
 * Shape note: a tournament record's `winner` column is used for internal
 * tournaments, `result` for external events. `mapRecordRow` exposes both
 * plus a convenience `value` field (`winner ?? result`) so the page doesn't
 * need to know which kind of tournament it's rendering.
 */

function mapTournamentRow(row) {
  if (!row) return null;
  return {
    id: row.id,
    kind: row.kind,
    name: row.name,
    description: row.description,
    sortOrder: row.sort_order,
  };
}

function mapRecordRow(row) {
  if (!row) return null;
  return {
    id: row.id,
    tournamentId: row.tournament_id,
    year: row.year,
    winner: row.winner,
    result: row.result,
    value: row.winner ?? row.result ?? null,
    note: row.note,
    sortOrder: row.sort_order,
  };
}

function mapEntryRow(row) {
  if (!row) return null;
  return {
    id: row.id,
    category: row.category,
    title: row.title,
    year: row.year,
    sortOrder: row.sort_order,
  };
}

/**
 * Fetches everything the public Achievements page needs in one call,
 * grouped into the same shape src/constants/achievements.js used to
 * export (internalTournaments / externalEvents / the four entry lists),
 * so the page only had to swap its data source, not its render logic.
 */
export async function getAchievements() {
  const [tournamentsRes, recordsRes, entriesRes] = await Promise.all([
    supabase.from('achievement_tournaments').select('*').order('sort_order'),
    supabase.from('achievement_records').select('*').order('sort_order'),
    supabase.from('achievement_entries').select('*').order('sort_order'),
  ]);

  if (tournamentsRes.error) throw tournamentsRes.error;
  if (recordsRes.error) throw recordsRes.error;
  if (entriesRes.error) throw entriesRes.error;

  const tournaments = tournamentsRes.data.map(mapTournamentRow);
  const records = recordsRes.data.map(mapRecordRow);
  const entries = entriesRes.data.map(mapEntryRow);

  const withRecords = (kind) =>
    tournaments
      .filter((t) => t.kind === kind)
      .map((t) => ({
        ...t,
        records: records.filter((r) => r.tournamentId === t.id),
      }));

  const entriesFor = (category) => entries.filter((e) => e.category === category);

  return {
    internalTournaments: withRecords('internal'),
    externalEvents: withRecords('external'),
    universityAchievements: entriesFor('university'),
    teamAchievements: entriesFor('team'),
    playerAchievements: entriesFor('player'),
    coachAchievements: entriesFor('coach'),
  };
}

// ---------------------------------------------------------------------------
// Admin CRUD (Admin Dashboard only — gated by requireAdmin ProtectedRoute
// and by the "Admins can manage achievement *" RLS policies)
// ---------------------------------------------------------------------------

export async function createTournament({ kind, name, description, sortOrder = 0 }) {
  const { data, error } = await supabase
    .from('achievement_tournaments')
    .insert({ kind, name, description: description || null, sort_order: sortOrder })
    .select()
    .single();

  if (error) throw error;
  return mapTournamentRow(data);
}

export async function updateTournament(id, { name, description, sortOrder }) {
  const { data, error } = await supabase
    .from('achievement_tournaments')
    .update({
      name,
      description: description || null,
      sort_order: sortOrder,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return mapTournamentRow(data);
}

export async function deleteTournament(id) {
  // Records cascade-delete via the FK — see schema_phase9.sql.
  const { error } = await supabase.from('achievement_tournaments').delete().eq('id', id);
  if (error) throw error;
}

export async function createRecord(tournamentId, { year, winner, result, note, sortOrder = 0 }) {
  const { data, error } = await supabase
    .from('achievement_records')
    .insert({
      tournament_id: tournamentId,
      year: year || null,
      winner: winner || null,
      result: result || null,
      note: note || null,
      sort_order: sortOrder,
    })
    .select()
    .single();

  if (error) throw error;
  return mapRecordRow(data);
}

export async function updateRecord(id, { year, winner, result, note, sortOrder }) {
  const { data, error } = await supabase
    .from('achievement_records')
    .update({
      year: year || null,
      winner: winner || null,
      result: result || null,
      note: note || null,
      sort_order: sortOrder,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return mapRecordRow(data);
}

export async function deleteRecord(id) {
  const { error } = await supabase.from('achievement_records').delete().eq('id', id);
  if (error) throw error;
}

export async function createEntry({ category, title, year, sortOrder = 0 }) {
  const { data, error } = await supabase
    .from('achievement_entries')
    .insert({ category, title, year: year || null, sort_order: sortOrder })
    .select()
    .single();

  if (error) throw error;
  return mapEntryRow(data);
}

export async function updateEntry(id, { title, year, sortOrder }) {
  const { data, error } = await supabase
    .from('achievement_entries')
    .update({
      title,
      year: year || null,
      sort_order: sortOrder,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return mapEntryRow(data);
}

export async function deleteEntry(id) {
  const { error } = await supabase.from('achievement_entries').delete().eq('id', id);
  if (error) throw error;
}
