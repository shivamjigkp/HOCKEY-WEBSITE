/**
 * Helpers for turning a stored YouTube video ID into the URLs components
 * need. Centralized here so if the project ever supports another video
 * provider, only this file changes.
 */

export function getYouTubeThumbnailUrl(youtubeId) {
  return `https://i.ytimg.com/vi/${youtubeId}/hqdefault.jpg`;
}

export function getYouTubeEmbedUrl(youtubeId) {
  return `https://www.youtube-nocookie.com/embed/${youtubeId}?autoplay=1&rel=0`;
}
