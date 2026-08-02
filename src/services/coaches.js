import { supabase } from '@/config/supabaseClient';

/**
 * Coaching staff data service. Components import from here only — never
 * call `supabase.from('coaches')` directly.
 *
 * Backed by Supabase as of Phase 8 (see supabase/schema_phase8.sql).
 * `mapRow` converts DB snake_case columns to the camelCase shape the
 * Coaches page already consumes (experienceYears, photoUrl).
 */

function mapRow(row) {
  if (!row) return null;
  return {
    id: row.id,
    name: row.name,
    role: row.role,
    experienceYears: row.experience_years,
    photoUrl: row.photo_url,
    bio: row.bio,
    achievements: row.achievements ?? [],
  };
}

export async function getCoaches() {
  const { data, error } = await supabase.from('coaches').select('*').order('created_at');
  if (error) throw error;
  return data.map(mapRow);
}

// ---------------------------------------------------------------------------
// Admin CRUD (Admin Dashboard only — gated by requireAdmin ProtectedRoute
// and by the "Admins can manage coaches" RLS policy)
// ---------------------------------------------------------------------------

export async function createCoach({ name, role, experienceYears, photoUrl, bio, achievements }) {
  const { data, error } = await supabase
    .from('coaches')
    .insert({
      name,
      role,
      experience_years: experienceYears || null,
      photo_url: photoUrl || null,
      bio,
      achievements: achievements ?? [],
    })
    .select()
    .single();

  if (error) throw error;
  return mapRow(data);
}

export async function updateCoach(id, payload) {
  const { data, error } = await supabase
    .from('coaches')
    .update({
      name: payload.name,
      role: payload.role,
      experience_years: payload.experienceYears || null,
      photo_url: payload.photoUrl || null,
      bio: payload.bio,
      achievements: payload.achievements ?? [],
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return mapRow(data);
}

export async function deleteCoach(id) {
  const { error } = await supabase.from('coaches').delete().eq('id', id);
  if (error) throw error;
}
