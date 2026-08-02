import { useEffect, useRef, useState } from 'react';
import { getContainersWithPhotos } from '@/services/squadPhotos';
import './SquadPhotoGallery.css';

const AUTOPLAY_MS = 4000;

function ContainerSlideshow({ container }) {
  const sortedPhotos = [...container.photos].sort((a, b) => a.sort_order - b.sort_order);
  const [activeIndex, setActiveIndex] = useState(0);
  const timerRef = useRef(null);

  useEffect(() => {
    setActiveIndex(0);
  }, [container.slideshow_enabled, sortedPhotos.length]);

  useEffect(() => {
    if (!container.slideshow_enabled || sortedPhotos.length < 2) return undefined;

    timerRef.current = setInterval(() => {
      setActiveIndex((i) => (i + 1) % sortedPhotos.length);
    }, AUTOPLAY_MS);

    return () => clearInterval(timerRef.current);
  }, [container.slideshow_enabled, sortedPhotos.length]);

  if (sortedPhotos.length === 0) {
    return <div className="squad-photo-gallery__placeholder">No photos added yet</div>;
  }

  // Slideshow OFF → permanently show the photo with the lowest sort_order
  // ("Order 1"), per the Admin > Squad Photos toggle.
  const photo = container.slideshow_enabled ? sortedPhotos[activeIndex] : sortedPhotos[0];

  return (
    <div className="squad-photo-gallery__display">
      <img src={photo.url} alt="" aria-hidden="true" className="squad-photo-gallery__backdrop" />
      <img src={photo.url} alt={container.title} loading="lazy" className="squad-photo-gallery__photo" />
      {container.slideshow_enabled && sortedPhotos.length > 1 && (
        <div className="squad-photo-gallery__dots">
          {sortedPhotos.map((p, i) => (
            <span
              key={p.id}
              className={
                i === activeIndex
                  ? 'squad-photo-gallery__dot squad-photo-gallery__dot--active'
                  : 'squad-photo-gallery__dot'
              }
            />
          ))}
        </div>
      )}
    </div>
  );
}

/**
 * Group photo containers (Final Year, 3rd Year Boys/Girls, 2nd Year
 * Boys/Girls by default — admin-configurable, see Admin > Squad Photos).
 * Renders nothing if the migration hasn't been applied yet or no
 * containers exist, so it never shows a broken/empty section.
 */
export default function SquadPhotoGallery() {
  const [containers, setContainers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    getContainersWithPhotos().then((data) => {
      if (isMounted) {
        setContainers(data);
        setIsLoading(false);
      }
    });
    return () => {
      isMounted = false;
    };
  }, []);

  if (isLoading || containers.length === 0) return null;

  return (
    <section className="squad-photo-gallery">
      <h2 className="squad-photo-gallery__title">Squad Photos</h2>
      <p className="squad-photo-gallery__subtitle">Group photos by year and section.</p>

      <div className="squad-photo-gallery__grid">
        {containers.map((container) => (
          <div key={container.id} className="squad-photo-gallery__container">
            <h3>{container.title}</h3>
            <ContainerSlideshow container={container} />
          </div>
        ))}
      </div>
    </section>
  );
}
