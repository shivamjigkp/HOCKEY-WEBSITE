import { supabase } from '@/config/supabaseClient';

/**
 * Alumni group photo slideshow data service (see
 * supabase/schema_phase23.sql). Components must go through this file —
 * never call `supabase.from(...)` or `supabase.storage` directly.
 *
 * Mirrors services/heroSlides.js exactly — same flat ordered-list shape,
 * just a different table/bucket for the Alumni page's group-photo
 * slideshow (batch/reunion photos that don't belong to any one person).
 */

const BUCKET = 'alumni-group-photos';

function publicUrlFor(storagePath) {
  const { data } = supabase.storage.from(BUCKET).getPublicUrl(storagePath);
  return data.publicUrl;
}

/**
 * Public Alumni-page read: active photos only, in display order. Never
 * throws — on any error (bucket/table not migrated yet, offline) it
 * resolves to an empty array so AlumniGroupSlideshow can simply render
 * nothing instead of breaking the page.
 */
export async function getActiveAlumniGroupPhotos() {
  try {
    const { data, error } = await supabase
      .from('alumni_group_photos')
      .select('*')
      .eq('is_active', true)
      .order('sort_order', { ascending: true });

    if (error) throw error;
    return data.map((photo) => ({ ...photo, url: publicUrlFor(photo.storage_path) }));
  } catch {
    return [];
  }
}

/** Admin read: every photo (active or not), in display order. */
export async function getAllAlumniGroupPhotos() {
  const { data, error } = await supabase
    .from('alumni_group_photos')
    .select('*')
    .order('sort_order', { ascending: true });

  if (error) throw error;
  return data.map((photo) => ({ ...photo, url: publicUrlFor(photo.storage_path) }));
}

export async function uploadAlumniGroupPhoto({ file, caption = '', sortOrder = 0 }) {
  const storagePath = `${crypto.randomUUID()}-${file.name}`;

  const { error: uploadError } = await supabase.storage
    .from(BUCKET)
    .upload(storagePath, file, { cacheControl: '3600', upsert: false });

  if (uploadError) throw uploadError;

  const { data, error: insertError } = await supabase
    .from('alumni_group_photos')
    .insert({ storage_path: storagePath, caption, sort_order: sortOrder })
    .select()
    .single();

  if (insertError) {
    // Roll back the orphaned storage object if the DB insert failed.
    await supabase.storage.from(BUCKET).remove([storagePath]);
    throw insertError;
  }

  return { ...data, url: publicUrlFor(storagePath) };
}

export async function updateAlumniGroupPhoto(id, patch) {
  const { data, error } = await supabase
    .from('alumni_group_photos')
    .update(patch)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return { ...data, url: publicUrlFor(data.storage_path) };
}

/** Persists a full reordering in one round trip (move up/down buttons). */
export async function reorderAlumniGroupPhotos(orderedIds) {
  const updates = orderedIds.map((id, index) =>
    supabase.from('alumni_group_photos').update({ sort_order: index }).eq('id', id)
  );
  const results = await Promise.all(updates);
  const failed = results.find((r) => r.error);
  if (failed) throw failed.error;
}

export async function deleteAlumniGroupPhoto(photo) {
  const { error: dbError } = await supabase
    .from('alumni_group_photos')
    .delete()
    .eq('id', photo.id);
  if (dbError) throw dbError;

  await supabase.storage.from(BUCKET).remove([photo.storage_path]);
}
