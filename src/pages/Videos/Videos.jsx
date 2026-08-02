import { useEffect, useState } from 'react';
import Loader from '@/components/Loader/Loader';
import SectionDivider from '@/components/SectionDivider/SectionDivider';
import { formatDate } from '@/utils/formatDate';
import { getYouTubeEmbedUrl, getYouTubeThumbnailUrl } from '@/utils/videoEmbed';
import { getVideos } from '@/services/videos';
import './Videos.css';

function VideoCard({ video, onSelect }) {
  return (
    <button
      type="button"
      className="video-card"
      onClick={() => onSelect(video)}
      aria-label={`Play ${video.title}`}
    >
      <span className="video-card__thumb-wrap">
        <img
          className="video-card__thumb"
          src={video.thumbnail ?? getYouTubeThumbnailUrl(video.youtubeId)}
          alt=""
          loading="lazy"
        />
        <span className="video-card__play" aria-hidden="true">
          ▶
        </span>
      </span>
      <span className="video-card__title">{video.title}</span>
      <span className="video-card__meta">
        {video.competition} · {formatDate(video.date)}
      </span>
    </button>
  );
}

function VideoPlayer({ video, onClose }) {
  return (
    <div className="video-player">
      <div className="video-player__frame-wrap">
        <iframe
          className="video-player__frame"
          src={getYouTubeEmbedUrl(video.youtubeId)}
          title={video.title}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      </div>
      <div className="video-player__info">
        <div>
          <h2 className="video-player__title">{video.title}</h2>
          <p className="video-player__meta">
            {video.competition} · {formatDate(video.date)}
          </p>
        </div>
        <button type="button" className="btn btn-outline" onClick={onClose}>
          Close
        </button>
      </div>
    </div>
  );
}

export default function Videos() {
  const [videos, setVideos] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeVideo, setActiveVideo] = useState(null);

  useEffect(() => {
    let isMounted = true;
    getVideos().then((data) => {
      if (isMounted) {
        setVideos(data);
        setIsLoading(false);
      }
    });
    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <div className="videos-page">
      <div className="container">
        <p className="eyebrow">Match Center</p>
        <h1 className="videos-page__title">Highlights</h1>
        <SectionDivider />

        {isLoading ? (
          <Loader label="Loading highlights" />
        ) : videos.length === 0 ? (
          <p className="videos-page__empty">
            No highlight videos yet — check back after the next match.
          </p>
        ) : (
          <>
            {activeVideo && (
              <VideoPlayer video={activeVideo} onClose={() => setActiveVideo(null)} />
            )}

            <div className="videos-page__grid">
              {videos.map((video) => (
                <VideoCard key={video.id} video={video} onSelect={setActiveVideo} />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
