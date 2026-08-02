import { supabase } from '@/config/supabaseClient';

/**
 * Sponsors data service. Components import from here only — never call
 * `supabase.from('sponsors')` directly.
 *
 * Backed by Supabase as of Phase 10 (see supabase/schema_phase10.sql).
 * `mapRow` converts DB snake_case columns to the camelCase shape
 * SponsorsStrip already consumes (logo, website).
 */

function mapRow(row) {
  if (!row) return null;
  return {
    id: row.id,
    name: row.name,
    logo: row.logo_url,
    website: row.website,
    sortOrder: row.sort_order,
  };
}

export async function getSponsors() {
  const { data, error } = await supabase.from('sponsors').select('*').order('sort_order');
  if (error) throw error;
  return data.map(mapRow);
}

// ---------------------------------------------------------------------------
// Admin CRUD (Admin Dashboard only — gated by requireAdmin ProtectedRoute
// and by the "Admins can manage sponsors" RLS policy)
// ---------------------------------------------------------------------------

export async function createSponsor({ name, logo, website, sortOrder }) {
  const { data, error } = await supabase
    .from('sponsors')
    .insert({
      name,
      logo_url: logo || null,
      website: website || null,
      sort_order: sortOrder ?? 0,
    })
    .select()
    .single();

  if (error) throw error;
  return mapRow(data);
}

export async function updateSponsor(id, payload) {
  const { data, error } = await supabase
    .from('sponsors')
    .update({
      name: payload.name,
      logo_url: payload.logo || null,
      website: payload.website || null,
      sort_order: payload.sortOrder ?? 0,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return mapRow(data);
}

export async function deleteSponsor(id) {
  const { error } = await supabase.from('sponsors').delete().eq('id', id);
  if (error) throw error;
}
