import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import Loader from '@/components/Loader/Loader';
import SectionDivider from '@/components/SectionDivider/SectionDivider';
import { ROUTES } from '@/constants/routes';
import { getAlbumBySlug, getImagesByAlbum } from '@/services/gallery';
import Lightbox from './Lightbox';
import './AlbumDetail.css';

export default function AlbumDetail() {
  const { albumSlug } = useParams();
  const [album, setAlbum] = useState(null);
  const [images, setImages] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeIndex, setActiveIndex] = useState(null);

  useEffect(() => {
    let isMounted = true;
    setIsLoading(true);

    getAlbumBySlug(albumSlug)
      .then(async (foundAlbum) => {
        if (!isMounted) return;
        setAlbum(foundAlbum);
        if (foundAlbum) {
          const albumImages = await getImagesByAlbum(foundAlbum.id);
          if (isMounted) setImages(albumImages);
        }
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
  }, [albumSlug]);

  if (isLoading) {
    return (
      <div className="album-detail-page">
        <div className="container">
          <Loader label="Loading album" />
        </div>
      </div>
    );
  }

  if (error || !album) {
    return (
      <div className="album-detail-page">
        <div className="container">
          <p className="album-detail-page__empty">
            {error ? "Couldn't load this album." : 'Album not found.'}
          </p>
          <Link to={ROUTES.GALLERY} className="btn btn-outline">
            Back to Gallery
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="album-detail-page">
      <div className="container">
        <p className="eyebrow">Gallery</p>
        <h1 className="album-detail-page__title">{album.title}</h1>
        {album.description && (
          <p className="album-detail-page__desc">{album.description}</p>
        )}
        <SectionDivider />

        {images.length === 0 ? (
          <p className="album-detail-page__empty">No photos in this album yet.</p>
        ) : (
          <div className="album-detail-page__grid">
            {images.map((image, index) => (
              <button
                key={image.id}
                type="button"
                className="album-photo"
                onClick={() => setActiveIndex(index)}
                aria-label={image.caption || `Photo ${index + 1}`}
              >
                <img src={image.url} alt={image.caption || ''} loading="lazy" />
              </button>
            ))}
          </div>
        )}
      </div>

      {activeIndex !== null && (
        <Lightbox
          images={images}
          activeIndex={activeIndex}
          onClose={() => setActiveIndex(null)}
          onChangeIndex={setActiveIndex}
        />
      )}
    </div>
  );
}
