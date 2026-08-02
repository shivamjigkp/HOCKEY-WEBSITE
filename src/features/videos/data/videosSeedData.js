/**
 * ⚠️ SUPERSEDED as of Phase 11 — videos now live in Supabase
 * (see supabase/schema_phase11.sql, src/services/videos.js).
 * Nothing imports this file anymore; kept only for history.
 *
 * No highlight videos have been uploaded yet — kept empty rather than
 * seeded with placeholder YouTube IDs, which would just be dead links.
 * `src/services/videos.js` is the only file that imports this.
 *
 * Shape each entry should follow once real highlights exist:
 * {
 *   id: string,
 *   title: string,
 *   competition: string,
 *   date: string,          // ISO date
 *   youtubeId: string,     // YouTube video ID (not full URL)
 *   thumbnail?: string,    // falls back to the YouTube thumbnail if omitted
 *   matchId?: string,      // optional link back to a MATCHES_SEED entry
 * }
 */

export const VIDEOS_SEED = [];
