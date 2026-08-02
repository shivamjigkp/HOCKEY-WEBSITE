import { supabase } from '@/config/supabaseClient';

/**
 * Alumni data service. Components import from here only — never call
 * `supabase.from('alumni')` directly.
 *
 * Backed by Supabase — see supabase/schema_phase18.sql. Same simple
 * name/role/photo shape as Officials (services/officials.js); here "role"
 * is used loosely for batch/current role (e.g. "B.Tech 2018 · Software
 * Engineer, TCS") since alumni don't have a fixed role like staff do.
 */

function mapRow(row) {
  if (!row) return null;
  return {
    id: row.id,
    name: row.name,
    role: row.role,
    photoUrl: row.photo_url,
  };
}

export async function getAlumni() {
  const { data, error } = await supabase.from('alumni').select('*').order('created_at');
  if (error) throw error;
  return data.map(mapRow);
}

// ---------------------------------------------------------------------------
// Admin CRUD (Admin Dashboard only — gated by requireAdmin ProtectedRoute
// and by the "Admins can manage alumni" RLS policy)
// ---------------------------------------------------------------------------

export async function createAlumnus({ name, role, photoUrl }) {
  const { data, error } = await supabase
    .from('alumni')
    .insert({ name, role, photo_url: photoUrl || null })
    .select()
    .single();

  if (error) throw error;
  return mapRow(data);
}

export async function updateAlumnus(id, { name, role, photoUrl }) {
  const { data, error } = await supabase
    .from('alumni')
    .update({
      name,
      role,
      photo_url: photoUrl || null,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return mapRow(data);
}

export async function deleteAlumnus(id) {
  const { error } = await supabase.from('alumni').delete().eq('id', id);
  if (error) throw error;
}
