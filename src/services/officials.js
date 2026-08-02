import { supabase } from '@/config/supabaseClient';

/**
 * Officials (coaching/support staff) data service. Components import from
 * here only — never call `supabase.from('officials')` directly.
 *
 * Backed by Supabase, table renamed from `coaches` to `officials` and
 * simplified to just name/role/photo — see supabase/schema_phase16.sql.
 * The old bio/achievements/experienceYears fields were dropped along with
 * the rename; this module no longer has any concept of them.
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

export async function getOfficials() {
  const { data, error } = await supabase.from('officials').select('*').order('created_at');
  if (error) throw error;
  return data.map(mapRow);
}

// ---------------------------------------------------------------------------
// Admin CRUD (Admin Dashboard only — gated by requireAdmin ProtectedRoute
// and by the "Admins can manage officials" RLS policy)
// ---------------------------------------------------------------------------

export async function createOfficial({ name, role, photoUrl }) {
  const { data, error } = await supabase
    .from('officials')
    .insert({ name, role, photo_url: photoUrl || null })
    .select()
    .single();

  if (error) throw error;
  return mapRow(data);
}

export async function updateOfficial(id, { name, role, photoUrl }) {
  const { data, error } = await supabase
    .from('officials')
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

export async function deleteOfficial(id) {
  const { error } = await supabase.from('officials').delete().eq('id', id);
  if (error) throw error;
}
