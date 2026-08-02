import { supabase } from '@/config/supabaseClient';

/**
 * Hero slideshow data service (see supabase/schema_phase14.sql).
 * Components must go through this file — never call `supabase.from(...)`
 * or `supabase.storage` directly.
 *
 * Deliberately separate from services/gallery.js — the homepage
 * slideshow is one admin-curated ordered list, not a browsable album.
 */

const BUCKET = 'hero-slides';

function publicUrlFor(storagePath) {
  const { data } = supabase.storage.from(BUCKET).getPublicUrl(storagePath);
  return data.publicUrl;
}

/**
 * Public homepage read: active slides only, in display order. Never
 * throws — on any error (bucket/table not migrated yet, offline) it
 * resolves to an empty array so HeroSlideshow can simply render nothing
 * instead of breaking the homepage.
 */
export async function getActiveHeroSlides() {
  try {
    const { data, error } = await supabase
      .from('hero_slides')
      .select('*')
      .eq('is_active', true)
      .order('sort_order', { ascending: true });

    if (error) throw error;
    return data.map((slide) => ({ ...slide, url: publicUrlFor(slide.storage_path) }));
  } catch {
    return [];
  }
}

/** Admin read: every slide (active or not), in display order. */
export async function getAllHeroSlides() {
  const { data, error } = await supabase
    .from('hero_slides')
    .select('*')
    .order('sort_order', { ascending: true });

  if (error) throw error;
  return data.map((slide) => ({ ...slide, url: publicUrlFor(slide.storage_path) }));
}

export async function uploadHeroSlide({ file, caption = '', sortOrder = 0 }) {
  const storagePath = `${crypto.randomUUID()}-${file.name}`;

  const { error: uploadError } = await supabase.storage
    .from(BUCKET)
    .upload(storagePath, file, { cacheControl: '3600', upsert: false });

  if (uploadError) throw uploadError;

  const { data, error: insertError } = await supabase
    .from('hero_slides')
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

export async function updateHeroSlide(id, patch) {
  const { data, error } = await supabase
    .from('hero_slides')
    .update(patch)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return { ...data, url: publicUrlFor(data.storage_path) };
}

/** Persists a full reordering in one round trip (drag-and-drop / move up-down). */
export async function reorderHeroSlides(orderedIds) {
  const updates = orderedIds.map((id, index) =>
    supabase.from('hero_slides').update({ sort_order: index }).eq('id', id)
  );
  const results = await Promise.all(updates);
  const failed = results.find((r) => r.error);
  if (failed) throw failed.error;
}

export async function deleteHeroSlide(slide) {
  const { error: dbError } = await supabase.from('hero_slides').delete().eq('id', slide.id);
  if (dbError) throw dbError;

  await supabase.storage.from(BUCKET).remove([slide.storage_path]);
}
