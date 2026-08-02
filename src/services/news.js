import { supabase } from '@/config/supabaseClient';

/**
 * News + Announcements data service. Components import from here only —
 * never call `supabase.from('news')` directly.
 *
 * Backed by Supabase as of Phase 7 (see supabase/schema_phase7.sql).
 * Public reads are open to everyone; create/update/delete requires the
 * admin role and will fail under RLS otherwise — surface `error.message`
 * from those calls in the UI rather than assuming failures are network
 * issues.
 */

export async function getNews() {
  const { data, error } = await supabase
    .from('news')
    .select('*')
    .order('published_at', { ascending: false });

  if (error) throw error;
  return data;
}

export async function getAnnouncements() {
  const { data, error } = await supabase
    .from('news')
    .select('*')
    .eq('type', 'announcement')
    .order('published_at', { ascending: false });

  if (error) throw error;
  return data;
}

export async function getNewsBySlug(slug) {
  const { data, error } = await supabase.from('news').select('*').eq('slug', slug).maybeSingle();

  if (error) throw error;
  return data;
}

export async function getLatestNews(count = 3) {
  const { data, error } = await supabase
    .from('news')
    .select('*')
    .order('published_at', { ascending: false })
    .limit(count);

  if (error) throw error;
  return data;
}

// ---------------------------------------------------------------------------
// Admin CRUD (Admin Dashboard only — gated by requireAdmin ProtectedRoute
// and by the "Admins can manage news" RLS policy)
// ---------------------------------------------------------------------------

export async function createNews({
  type,
  title,
  slug,
  excerpt,
  body,
  author,
  publishedAt,
  coverImage,
}) {
  const { data, error } = await supabase
    .from('news')
    .insert({
      type,
      title,
      slug,
      excerpt,
      body,
      author,
      published_at: publishedAt || new Date().toISOString(),
      cover_image_url: coverImage || null,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updateNews(
  id,
  { type, title, slug, excerpt, body, author, publishedAt, coverImage }
) {
  const { data, error } = await supabase
    .from('news')
    .update({
      type,
      title,
      slug,
      excerpt,
      body,
      author,
      published_at: publishedAt,
      cover_image_url: coverImage || null,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function deleteNews(id) {
  const { error } = await supabase.from('news').delete().eq('id', id);
  if (error) throw error;
}
