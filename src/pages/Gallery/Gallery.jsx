import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Loader from '@/components/Loader/Loader';
import SectionDivider from '@/components/SectionDivider/SectionDivider';
import { ROUTES } from '@/constants/routes';
import { getAlbums } from '@/services/gallery';
import './Gallery.css';

function albumRoute(slug) {
  return ROUTES.GALLERY_ALBUM.replace(':albumSlug', slug);
}

function AlbumCard({ album }) {
  return (
    <Link to={albumRoute(album.slug)} className="album-card">
      <span className="album-card__cover-wrap">
        {album.cover_image_url ? (
          <img className="album-card__cover" src={album.cover_image_url} alt="" loading="lazy" />
        ) : (
          <span className="album-card__cover album-card__cover--placeholder" aria-hidden="true" />
        )}
      </span>
      <span className="album-card__title">{album.title}</span>
      {album.description && <span className="album-card__desc">{album.description}</span>}
    </Link>
  );
}

export default function Gallery() {
  const [albums, setAlbums] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;
    getAlbums()
      .then((data) => {
        if (isMounted) setAlbums(data);
      })
      .catch((err) => {
        if (isMounted) setError(err);
      })
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });
    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <div className="gallery-page">
      <div className="container">
        <p className="eyebrow">Media</p>
        <h1 className="gallery-page__title">Gallery</h1>
        <SectionDivider />

        {isLoading ? (
          <Loader label="Loading albums" />
        ) : error ? (
          <p className="gallery-page__empty">
            Could not load the gallery right now. Please try again shortly.
          </p>
        ) : albums.length === 0 ? (
          <p className="gallery-page__empty">No albums have been published yet.</p>
        ) : (
          <div className="gallery-page__grid">
            {albums.map((album) => (
              <AlbumCard key={album.id} album={album} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
