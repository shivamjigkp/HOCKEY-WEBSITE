import { useEffect } from 'react';
import './Lightbox.css';

export default function Lightbox({ images, activeIndex, onClose, onChangeIndex }) {
  const image = images[activeIndex];

  useEffect(() => {
    function handleKeyDown(e) {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowRight') onChangeIndex((i) => (i + 1) % images.length);
      if (e.key === 'ArrowLeft') onChangeIndex((i) => (i - 1 + images.length) % images.length);
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [images.length, onClose, onChangeIndex]);

  if (!image) return null;

  return (
    <div className="lightbox" role="dialog" aria-modal="true" onClick={onClose}>
      <button
        type="button"
        className="lightbox__close"
        onClick={onClose}
        aria-label="Close"
      >
        ✕
      </button>

      <button
        type="button"
        className="lightbox__nav lightbox__nav--prev"
        onClick={(e) => {
          e.stopPropagation();
          onChangeIndex((activeIndex - 1 + images.length) % images.length);
        }}
        aria-label="Previous photo"
      >
        ‹
      </button>

      <img
        className="lightbox__image"
        src={image.url}
        alt={image.caption || ''}
        onClick={(e) => e.stopPropagation()}
      />

      <button
        type="button"
        className="lightbox__nav lightbox__nav--next"
        onClick={(e) => {
          e.stopPropagation();
          onChangeIndex((activeIndex + 1) % images.length);
        }}
        aria-label="Next photo"
      >
        ›
      </button>

      {image.caption && (
        <p className="lightbox__caption" onClick={(e) => e.stopPropagation()}>
          {image.caption}
        </p>
      )}
    </div>
  );
}
