import { supabase } from '@/config/supabaseClient';

/**
 * Gallery data service. Components must go through this file — never call
 * `supabase.from(...)` or `supabase.storage` directly.
 *
 * Unlike players/matches/officials, this is backed by a real Supabase project
 * (see supabase/schema.sql) since Gallery is the first module built after
 * Storage + write access became necessary.
 */

const BUCKET = 'gallery-images';

function publicUrlFor(storagePath) {
  const { data } = supabase.storage.from(BUCKET).getPublicUrl(storagePath);
  return data.publicUrl;
}

// ---------------------------------------------------------------------------
// Albums
// ---------------------------------------------------------------------------

export async function getAlbums() {
  const { data, error } = await supabase
    .from('albums')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
}

export async function getAlbumBySlug(slug) {
  const { data, error } = await supabase
    .from('albums')
    .select('*')
    .eq('slug', slug)
    .maybeSingle();

  if (error) throw error;
  return data;
}

export async function createAlbum({ title, slug, description }) {
  const { data, error } = await supabase
    .from('albums')
    .insert({ title, slug, description })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function deleteAlbum(albumId) {
  const { error } = await supabase.from('albums').delete().eq('id', albumId);
  if (error) throw error;
}

// ---------------------------------------------------------------------------
// Images
// ---------------------------------------------------------------------------

export async function getImagesByAlbum(albumId) {
  const { data, error } = await supabase
    .from('gallery_images')
    .select('*')
    .eq('album_id', albumId)
    .order('sort_order', { ascending: true });

  if (error) throw error;
  return data.map((image) => ({ ...image, url: publicUrlFor(image.storage_path) }));
}

/**
 * Uploads a single already-processed (compressed) image file to Storage,
 * then inserts its row. Kept as one call per file — callers uploading many
 * files (drag & drop, ZIP import, Drive import) loop this and report
 * per-file progress rather than batching, so one bad file doesn't fail the
 * whole batch.
 */
export async function uploadImage({ albumId, file, caption = '' }) {
  const storagePath = `${albumId}/${crypto.randomUUID()}-${file.name}`;

  const { error: uploadError } = await supabase.storage
    .from(BUCKET)
    .upload(storagePath, file, { cacheControl: '3600', upsert: false });

  if (uploadError) throw uploadError;

  const { data, error: insertError } = await supabase
    .from('gallery_images')
    .insert({ album_id: albumId, storage_path: storagePath, caption })
    .select()
    .single();

  if (insertError) {
    // Roll back the orphaned storage object if the DB insert failed.
    await supabase.storage.from(BUCKET).remove([storagePath]);
    throw insertError;
  }

  return { ...data, url: publicUrlFor(storagePath) };
}

export async function deleteImage(image) {
  const { error: dbError } = await supabase
    .from('gallery_images')
    .delete()
    .eq('id', image.id);
  if (dbError) throw dbError;

  await supabase.storage.from(BUCKET).remove([image.storage_path]);
}
