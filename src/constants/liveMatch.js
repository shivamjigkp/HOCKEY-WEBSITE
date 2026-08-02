/**
 * Live match config.
 *
 * Per MASTER_PROMPT (LIVE MATCH PAGE): "Admin should only paste a YouTube
 * Live URL" and the site handles the rest. Until the Admin Dashboard
 * (Phase 7) exists, this is that single input — set `youtubeUrl` to a
 * live YouTube URL to go live; set it back to null when the stream ends.
 */
export const LIVE_MATCH = {
  youtubeUrl: null,
  competition: null,
  homeTeam: null,
  awayTeam: null,
  venue: null,
};

/**
 * Extracts a YouTube video ID from common URL formats so it can be
 * dropped straight into an embed src.
 */
export function getYouTubeEmbedId(url) {
  if (!url) return null;
  const match = url.match(
    /(?:youtube\.com\/(?:watch\?v=|live\/)|youtu\.be\/)([\w-]{11})/
  );
  return match ? match[1] : null;
}
