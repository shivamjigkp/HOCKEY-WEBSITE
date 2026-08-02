import { supabase } from '@/config/supabaseClient';

/**
 * Roster highlights data service (see supabase/schema_phase16.sql).
 * Components must go through this file — never call `supabase.from(...)`
 * or `supabase.storage` directly.
 *
 * Powers the homepage "THE ROSTER" section only — an admin-curated list
 * (Captain, Vice-Captain, Technical Head, etc.), separate from the real
 * Players table (services/players.js), which still powers the full
 * /players page.
 */

const BUCKET = 'roster-highlights';

function publicUrlFor(storagePath) {
  const { data } = supabase.storage.from(BUCKET).getPublicUrl(storagePath);
  return data.publicUrl;
}

/**
 * Public homepage read: active entries only, in display order. Never
 * throws — on any error (bucket/table not migrated yet, offline) it
 * resolves to an empty array, so the homepage section can render nothing
 * instead of breaking.
 */
export async function getActiveRosterHighlights() {
  try {
    const { data, error } = await supabase
      .from('roster_highlights')
      .select('*')
      .eq('is_active', true)
      .order('sort_order', { ascending: true });

    if (error) throw error;
    return data.map((item) => ({ ...item, url: publicUrlFor(item.storage_path) }));
  } catch {
    return [];
  }
}

/** Admin read: every entry (active or not), in display order. */
export async function getAllRosterHighlights() {
  const { data, error } = await supabase
    .from('roster_highlights')
    .select('*')
    .order('sort_order', { ascending: true });

  if (error) throw error;
  return data.map((item) => ({ ...item, url: publicUrlFor(item.storage_path) }));
}

export async function uploadRosterHighlight({ file, name, branch = '', role, sortOrder = 0 }) {
  const storagePath = `${crypto.randomUUID()}-${file.name}`;

  const { error: uploadError } = await supabase.storage
    .from(BUCKET)
    .upload(storagePath, file, { cacheControl: '3600', upsert: false });

  if (uploadError) throw uploadError;

  const { data, error: insertError } = await supabase
    .from('roster_highlights')
    .insert({ storage_path: storagePath, name, branch, role, sort_order: sortOrder })
    .select()
    .single();

  if (insertError) {
    // Roll back the orphaned storage object if the DB insert failed.
    await supabase.storage.from(BUCKET).remove([storagePath]);
    throw insertError;
  }

  return { ...data, url: publicUrlFor(storagePath) };
}

export async function updateRosterHighlight(id, patch) {
  const { data, error } = await supabase
    .from('roster_highlights')
    .update(patch)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return { ...data, url: publicUrlFor(data.storage_path) };
}

/** Persists a full reordering in one round trip (move up/down). */
export async function reorderRosterHighlights(orderedIds) {
  const updates = orderedIds.map((id, index) =>
    supabase.from('roster_highlights').update({ sort_order: index }).eq('id', id)
  );
  const results = await Promise.all(updates);
  const failed = results.find((r) => r.error);
  if (failed) throw failed.error;
}

export async function deleteRosterHighlight(item) {
  const { error: dbError } = await supabase
    .from('roster_highlights')
    .delete()
    .eq('id', item.id);
  if (dbError) throw dbError;

  await supabase.storage.from(BUCKET).remove([item.storage_path]);
}
