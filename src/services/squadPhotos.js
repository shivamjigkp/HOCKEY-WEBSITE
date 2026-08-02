import { supabase } from '@/config/supabaseClient';

/**
 * Squad Photos data service (see supabase/schema_phase15.sql).
 * Components must go through this file — never call `supabase.from(...)`
 * or `supabase.storage` directly.
 *
 * A container's `slideshow_enabled` flag decides how the public page
 * renders it: true → cycle through all photos in sort_order; false →
 * show only the photo with the lowest sort_order (i.e. "order 1")
 * permanently. That branching logic lives in the public component
 * (SquadPhotoGallery), not here — this file only reads/writes data.
 */

const BUCKET = 'squad-photos';

function publicUrlFor(storagePath) {
  const { data } = supabase.storage.from(BUCKET).getPublicUrl(storagePath);
  return data.publicUrl;
}

// ---------------------------------------------------------------------------
// Containers
// ---------------------------------------------------------------------------

/**
 * Public + admin read: every container with its photos nested, both in
 * display order. Never throws — resolves to [] on any error (migration
 * not applied yet, offline) so the Players page section simply renders
 * nothing instead of breaking the whole page.
 */
export async function getContainersWithPhotos() {
  try {
    const { data: containers, error: containersError } = await supabase
      .from('squad_containers')
      .select('*')
      .order('sort_order', { ascending: true });
    if (containersError) throw containersError;

    const { data: photos, error: photosError } = await supabase
      .from('squad_photos')
      .select('*')
      .order('sort_order', { ascending: true });
    if (photosError) throw photosError;

    return containers.map((container) => ({
      ...container,
      photos: photos
        .filter((p) => p.container_id === container.id)
        .map((p) => ({ ...p, url: publicUrlFor(p.storage_path) })),
    }));
  } catch {
    return [];
  }
}

export async function createContainer(title) {
  const { data: existing } = await supabase
    .from('squad_containers')
    .select('sort_order')
    .order('sort_order', { ascending: false })
    .limit(1);
  const nextOrder = existing?.length ? existing[0].sort_order + 1 : 0;

  const { data, error } = await supabase
    .from('squad_containers')
    .insert({ title, sort_order: nextOrder })
    .select()
    .single();

  if (error) throw error;
  return { ...data, photos: [] };
}

export async function setContainerSlideshow(containerId, enabled) {
  const { data, error } = await supabase
    .from('squad_containers')
    .update({ slideshow_enabled: enabled })
    .eq('id', containerId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

/** Deletes a container and all its photos (storage + rows) with it. */
export async function deleteContainer(container) {
  const { data: photos, error: fetchError } = await supabase
    .from('squad_photos')
    .select('storage_path')
    .eq('container_id', container.id);
  if (fetchError) throw fetchError;

  const { error: deleteError } = await supabase
    .from('squad_containers')
    .delete()
    .eq('id', container.id);
  if (deleteError) throw deleteError;

  if (photos?.length) {
    await supabase.storage.from(BUCKET).remove(photos.map((p) => p.storage_path));
  }
}

// ---------------------------------------------------------------------------
// Photos
// ---------------------------------------------------------------------------

export async function uploadSquadPhoto({ containerId, file, sortOrder }) {
  const storagePath = `${containerId}/${crypto.randomUUID()}-${file.name}`;

  const { error: uploadError } = await supabase.storage
    .from(BUCKET)
    .upload(storagePath, file, { cacheControl: '3600', upsert: false });
  if (uploadError) throw uploadError;

  const { data, error: insertError } = await supabase
    .from('squad_photos')
    .insert({ container_id: containerId, storage_path: storagePath, sort_order: sortOrder })
    .select()
    .single();

  if (insertError) {
    await supabase.storage.from(BUCKET).remove([storagePath]);
    throw insertError;
  }

  return { ...data, url: publicUrlFor(storagePath) };
}

export async function updatePhotoOrder(photoId, sortOrder) {
  const { data, error } = await supabase
    .from('squad_photos')
    .update({ sort_order: sortOrder })
    .eq('id', photoId)
    .select()
    .single();

  if (error) throw error;
  return { ...data, url: publicUrlFor(data.storage_path) };
}

export async function deleteSquadPhoto(photo) {
  const { error: dbError } = await supabase.from('squad_photos').delete().eq('id', photo.id);
  if (dbError) throw dbError;

  await supabase.storage.from(BUCKET).remove([photo.storage_path]);
}
