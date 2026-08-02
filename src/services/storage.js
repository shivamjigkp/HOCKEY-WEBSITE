import { supabase } from '@/config/supabaseClient';
import { compressImage } from '@/utils/imageCompression';

/**
 * Generic photo-upload service backing any admin form that needs a
 * single image field (Players, Officials, News cover image, and future
 * additions) — mirrors the album-scoped uploader in services/gallery.js
 * but isn't tied to an album, just a folder prefix inside the shared
 * `site-images` bucket (see the storage section in schema_phase8.sql).
 *
 * Components must go through this file — never call `supabase.storage`
 * directly for these uploads.
 */

const BUCKET = 'site-images';

/**
 * @param {File} file
 * @param {string} folder e.g. 'players', 'officials', 'news'
 * @returns {Promise<string>} the uploaded image's public URL
 */
export async function uploadSiteImage(file, folder) {
  const compressed = await compressImage(file);
  const storagePath = `${folder}/${crypto.randomUUID()}-${compressed.name}`;

  const { error } = await supabase.storage
    .from(BUCKET)
    .upload(storagePath, compressed, { cacheControl: '3600', upsert: false });

  if (error) throw error;

  const { data } = supabase.storage.from(BUCKET).getPublicUrl(storagePath);
  return data.publicUrl;
}

/**
 * Best-effort delete given a public URL previously returned by
 * uploadSiteImage. Safe to call even if the URL isn't from this bucket
 * (e.g. an externally-hosted photoUrl a form still supports) — it just
 * won't match anything and silently no-ops.
 */
export async function deleteSiteImage(publicUrl) {
  if (!publicUrl || !publicUrl.includes(`/${BUCKET}/`)) return;
  const storagePath = publicUrl.split(`/${BUCKET}/`)[1];
  if (!storagePath) return;
  await supabase.storage.from(BUCKET).remove([storagePath]);
}
