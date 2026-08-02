import { useCallback, useEffect, useRef, useState } from 'react';
import { getActiveAlumniGroupPhotos } from '@/services/alumniGroupPhotos';
import './AlumniGroupSlideshow.css';

const AUTOPLAY_MS = 5000;

/**
 * Large group-photo slideshow rendered on the public Alumni page, below
 * the per-alumnus grid — for batch/reunion photos that don't belong to
 * any one person. Content is entirely admin-controlled — see
 * Admin > Alumni Group Photos (src/pages/Admin/AlumniGroupPhotosManage)
 * and services/alumniGroupPhotos.js.
 *
 * Mirrors HeroSlideshow (src/features/home/components/HeroSlideshow)
 * interaction-for-interaction — same autoplay/pause-on-hover, Prev/Next
 * arrows, and dots — but sized a step smaller than the homepage Hero
 * Slideshow and a step *larger* than Squad Photos, since these are
 * whole-group photos that need real room to read clearly:
 *   Squad Photos (440px) < Alumni Group Photos (560px) < Hero Slideshow (640px)
 * Renders nothing while empty (no photos uploaded yet, or the migration
 * hasn't been applied), so it never shows a broken/empty section.
 */
export default function AlumniGroupSlideshow() {
  const [slides, setSlides] = useState([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const timerRef = useRef(null);

  useEffect(() => {
    getActiveAlumniGroupPhotos().then(setSlides);
  }, []);

  const goTo = useCallback(
    (index) => {
      if (slides.length === 0) return;
      setActiveIndex(((index % slides.length) + slides.length) % slides.length);
    },
    [slides.length]
  );

  const goNext = useCallback(() => goTo(activeIndex + 1), [activeIndex, goTo]);
  const goPrev = useCallback(() => goTo(activeIndex - 1), [activeIndex, goTo]);

  useEffect(() => {
    if (isPaused || slides.length <= 1) return undefined;

    timerRef.current = setInterval(goNext, AUTOPLAY_MS);
    return () => clearInterval(timerRef.current);
  }, [goNext, isPaused, slides.length]);

  if (slides.length === 0) return null;

  return (
    <section
      className="alumni-group-slideshow"
      aria-label="Alumni group photos"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <h2 className="alumni-group-slideshow__title">Group Photos</h2>
      <p className="alumni-group-slideshow__subtitle">Batch and reunion photos over the years.</p>

      <div className="alumni-group-slideshow__frame">
        {slides.map((slide, index) => (
          <figure
            key={slide.id}
            className={
              index === activeIndex
                ? 'alumni-group-slideshow__slide alumni-group-slideshow__slide--active'
                : 'alumni-group-slideshow__slide'
            }
            aria-hidden={index !== activeIndex}
          >
            <img
              className="alumni-group-slideshow__backdrop"
              src={slide.url}
              alt=""
              aria-hidden="true"
              loading={index === 0 ? 'eager' : 'lazy'}
            />
            <img
              className="alumni-group-slideshow__photo"
              src={slide.url}
              alt={slide.caption || ''}
              loading={index === 0 ? 'eager' : 'lazy'}
            />
            {slide.caption && (
              <figcaption className="alumni-group-slideshow__caption">{slide.caption}</figcaption>
            )}
          </figure>
        ))}

        {slides.length > 1 && (
          <>
            <button
              type="button"
              className="alumni-group-slideshow__arrow alumni-group-slideshow__arrow--prev"
              onClick={goPrev}
              aria-label="Previous photo"
            >
              ‹
            </button>
            <button
              type="button"
              className="alumni-group-slideshow__arrow alumni-group-slideshow__arrow--next"
              onClick={goNext}
              aria-label="Next photo"
            >
              ›
            </button>

            <div className="alumni-group-slideshow__dots" role="tablist" aria-label="Slides">
              {slides.map((slide, index) => (
                <button
                  key={slide.id}
                  type="button"
                  role="tab"
                  aria-selected={index === activeIndex}
                  aria-label={`Go to photo ${index + 1}`}
                  className={
                    index === activeIndex
                      ? 'alumni-group-slideshow__dot alumni-group-slideshow__dot--active'
                      : 'alumni-group-slideshow__dot'
                  }
                  onClick={() => goTo(index)}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </section>
  );
}
