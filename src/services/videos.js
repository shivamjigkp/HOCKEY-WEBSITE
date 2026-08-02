import { supabase } from '@/config/supabaseClient';

/**
 * Highlight video data service. Components import from here only — never
 * call `supabase.from('videos')` directly.
 *
 * Backed by Supabase as of Phase 11 (see supabase/schema_phase11.sql).
 * `mapRow` converts DB snake_case columns to the camelCase shape Videos.jsx
 * already consumes (date, youtubeId, thumbnail, matchId).
 */

function mapRow(row) {
  if (!row) return null;
  return {
    id: row.id,
    title: row.title,
    competition: row.competition,
    date: row.video_date,
    youtubeId: row.youtube_id,
    thumbnail: row.thumbnail_url,
    matchId: row.match_id,
  };
}

export async function getVideos() {
  const { data, error } = await supabase
    .from('videos')
    .select('*')
    .order('video_date', { ascending: false });

  if (error) throw error;
  return data.map(mapRow);
}

export async function getVideoById(videoId) {
  const { data, error } = await supabase
    .from('videos')
    .select('*')
    .eq('id', videoId)
    .maybeSingle();

  if (error) throw error;
  return mapRow(data);
}

// ---------------------------------------------------------------------------
// Admin CRUD (Admin Dashboard only — gated by requireAdmin ProtectedRoute
// and by the "Admins can manage videos" RLS policy)
// ---------------------------------------------------------------------------

export async function createVideo({ title, competition, date, youtubeId, thumbnail, matchId }) {
  const { data, error } = await supabase
    .from('videos')
    .insert({
      title,
      competition: competition || null,
      video_date: date || new Date().toISOString().slice(0, 10),
      youtube_id: youtubeId,
      thumbnail_url: thumbnail || null,
      match_id: matchId || null,
    })
    .select()
    .single();

  if (error) throw error;
  return mapRow(data);
}

export async function updateVideo(id, payload) {
  const { data, error } = await supabase
    .from('videos')
    .update({
      title: payload.title,
      competition: payload.competition || null,
      video_date: payload.date || new Date().toISOString().slice(0, 10),
      youtube_id: payload.youtubeId,
      thumbnail_url: payload.thumbnail || null,
      match_id: payload.matchId || null,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return mapRow(data);
}

export async function deleteVideo(id) {
  const { error } = await supabase.from('videos').delete().eq('id', id);
  if (error) throw error;
}
