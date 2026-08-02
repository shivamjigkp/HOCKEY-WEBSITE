import { supabase } from '@/config/supabaseClient';

/**
 * Player data service. Components import from here only — never call
 * `supabase.from('players')` directly.
 *
 * Backed by Supabase as of Phase 8 (see supabase/schema_phase8.sql).
 * `mapRow` converts DB snake_case columns to the camelCase shape every
 * page already consumes (jerseyNumber, heightCm, photoUrl, stats) so
 * this migration required zero changes outside services/ and the Admin
 * Dashboard. Public reads are open to everyone; create/update/delete
 * requires the admin role and will fail under RLS otherwise.
 */

function mapRow(row) {
  if (!row) return null;
  return {
    id: row.id,
    name: row.name,
    position: row.position,
    jerseyNumber: row.jersey_number,
    year: row.year,
    hometown: row.hometown,
    heightCm: row.height_cm,
    photoUrl: row.photo_url,
    bio: row.bio,
    stats: row.stats ?? {},
  };
}

export async function getPlayers() {
  const { data, error } = await supabase.from('players').select('*').order('jersey_number');
  if (error) throw error;
  return data.map(mapRow);
}

export async function getPlayerById(playerId) {
  const { data, error } = await supabase
    .from('players')
    .select('*')
    .eq('id', playerId)
    .maybeSingle();

  if (error) throw error;
  return mapRow(data);
}

// Not currently used by the homepage — RosterHighlights (services/rosterHighlights.js)
// took over the "THE ROSTER" section with an admin-curated list instead.
// Left here as a generic, reusable query in case a future screen wants an
// auto-picked sample of players (e.g. a "Players" page spotlight).
export async function getFeaturedPlayers(count = 4) {
  const { data, error } = await supabase
    .from('players')
    .select('*')
    .order('jersey_number')
    .limit(count);

  if (error) throw error;
  return data.map(mapRow);
}

// ---------------------------------------------------------------------------
// Admin CRUD (Admin Dashboard only — gated by requireAdmin ProtectedRoute
// and by the "Admins can manage players" RLS policy)
// ---------------------------------------------------------------------------

export async function createPlayer({
  name,
  position,
  jerseyNumber,
  year,
  hometown,
  heightCm,
  photoUrl,
  bio,
  stats,
}) {
  const { data, error } = await supabase
    .from('players')
    .insert({
      name,
      position,
      jersey_number: jerseyNumber,
      year,
      hometown,
      height_cm: heightCm || null,
      photo_url: photoUrl || null,
      bio,
      stats: stats ?? {},
    })
    .select()
    .single();

  if (error) throw error;
  return mapRow(data);
}

export async function updatePlayer(id, payload) {
  const { data, error } = await supabase
    .from('players')
    .update({
      name: payload.name,
      position: payload.position,
      jersey_number: payload.jerseyNumber,
      year: payload.year,
      hometown: payload.hometown,
      height_cm: payload.heightCm || null,
      photo_url: payload.photoUrl || null,
      bio: payload.bio,
      stats: payload.stats ?? {},
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return mapRow(data);
}

export async function deletePlayer(id) {
  const { error } = await supabase.from('players').delete().eq('id', id);
  if (error) throw error;
}
