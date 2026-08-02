import { useCallback, useEffect, useRef, useState } from 'react';
import { getActiveHeroSlides } from '@/services/heroSlides';
import './HeroSlideshow.css';

const AUTOPLAY_MS = 5000;

/**
 * Large photo slideshow rendered on the homepage, directly below
 * HeroSection. Content is entirely admin-controlled — see
 * Admin > Hero Slideshow (src/pages/Admin/HeroSlidesManage) and
 * services/heroSlides.js. Renders nothing while empty (no slides
 * uploaded yet, or the migration hasn't been applied), so it never
 * shows a broken/empty section on a fresh install.
 */
export default function HeroSlideshow() {
  const [slides, setSlides] = useState([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const timerRef = useRef(null);

  useEffect(() => {
    getActiveHeroSlides().then(setSlides);
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
      className="hero-slideshow"
      aria-label="Photo highlights"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <div className="hero-slideshow__frame">
        {slides.map((slide, index) => (
          <figure
            key={slide.id}
            className={
              index === activeIndex
                ? 'hero-slideshow__slide hero-slideshow__slide--active'
                : 'hero-slideshow__slide'
            }
            aria-hidden={index !== activeIndex}
          >
            <img src={slide.url} alt={slide.caption || ''} loading={index === 0 ? 'eager' : 'lazy'} />
            {slide.caption && <figcaption className="hero-slideshow__caption">{slide.caption}</figcaption>}
          </figure>
        ))}

        {slides.length > 1 && (
          <>
            <button
              type="button"
              className="hero-slideshow__arrow hero-slideshow__arrow--prev"
              onClick={goPrev}
              aria-label="Previous photo"
            >
              ‹
            </button>
            <button
              type="button"
              className="hero-slideshow__arrow hero-slideshow__arrow--next"
              onClick={goNext}
              aria-label="Next photo"
            >
              ›
            </button>

            <div className="hero-slideshow__dots" role="tablist" aria-label="Slides">
              {slides.map((slide, index) => (
                <button
                  key={slide.id}
                  type="button"
                  role="tab"
                  aria-selected={index === activeIndex}
                  aria-label={`Go to photo ${index + 1}`}
                  className={
                    index === activeIndex
                      ? 'hero-slideshow__dot hero-slideshow__dot--active'
                      : 'hero-slideshow__dot'
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
