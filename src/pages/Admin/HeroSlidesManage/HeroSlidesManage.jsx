import { useEffect, useRef, useState } from 'react';
import Loader from '@/components/Loader/Loader';
import { compressImage } from '@/utils/imageCompression';
import {
  deleteHeroSlide,
  getAllHeroSlides,
  reorderHeroSlides,
  updateHeroSlide,
  uploadHeroSlide,
} from '@/services/heroSlides';
import '../adminManage.css';
import './HeroSlidesManage.css';

let queueItemId = 0;

export default function HeroSlidesManage() {
  const [slides, setSlides] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [queue, setQueue] = useState([]);
  const [isDragging, setIsDragging] = useState(false);
  const [busyId, setBusyId] = useState(null);
  const fileInputRef = useRef(null);

  function load() {
    setIsLoading(true);
    return getAllHeroSlides()
      .then(setSlides)
      .catch((err) => setError(err.message || 'Could not load slides.'))
      .finally(() => setIsLoading(false));
  }

  useEffect(() => {
    load();
  }, []);

  function updateQueueItem(id, patch) {
    setQueue((prev) => prev.map((item) => (item.id === id ? { ...item, ...patch } : item)));
  }

  async function processFile(file) {
    const id = ++queueItemId;
    setQueue((prev) => [...prev, { id, name: file.name, status: 'compressing' }]);

    try {
      const compressed = await compressImage(file);
      updateQueueItem(id, { status: 'uploading' });
      const uploaded = await uploadHeroSlide({ file: compressed, sortOrder: slides.length });
      setSlides((prev) => [...prev, uploaded]);
      setQueue((prev) => prev.filter((item) => item.id !== id));
    } catch (err) {
      updateQueueItem(id, { status: 'error', error: err.message || 'Upload failed' });
    }
  }

  async function handleFiles(fileList) {
    const files = Array.from(fileList).filter((file) => file.type.startsWith('image/'));
    for (const file of files) {
      await processFile(file);
    }
  }

  async function handleToggleActive(slide) {
    setBusyId(slide.id);
    try {
      const updated = await updateHeroSlide(slide.id, { is_active: !slide.is_active });
      setSlides((prev) => prev.map((s) => (s.id === slide.id ? updated : s)));
    } catch (err) {
      setError(err.message || 'Could not update slide.');
    } finally {
      setBusyId(null);
    }
  }

  async function handleCaptionSave(slide, caption) {
    if (caption === (slide.caption || '')) return;
    try {
      const updated = await updateHeroSlide(slide.id, { caption });
      setSlides((prev) => prev.map((s) => (s.id === slide.id ? updated : s)));
    } catch (err) {
      setError(err.message || 'Could not save caption.');
    }
  }

  async function handleDelete(slide) {
    setBusyId(slide.id);
    try {
      await deleteHeroSlide(slide);
      setSlides((prev) => prev.filter((s) => s.id !== slide.id));
    } catch (err) {
      setError(err.message || 'Could not delete slide.');
    } finally {
      setBusyId(null);
    }
  }

  async function handleMove(index, direction) {
    const targetIndex = index + direction;
    if (targetIndex < 0 || targetIndex >= slides.length) return;

    const reordered = [...slides];
    [reordered[index], reordered[targetIndex]] = [reordered[targetIndex], reordered[index]];
    setSlides(reordered);

    try {
      await reorderHeroSlides(reordered.map((s) => s.id));
    } catch (err) {
      setError(err.message || 'Could not save new order.');
      load();
    }
  }

  return (
    <div className="admin-manage">
      <p className="eyebrow">Admin</p>
      <h1 className="admin-manage__title">Hero Slideshow</h1>
      <p className="admin-manage__note">
        Controls the large photo slideshow shown on the homepage, right below the hero banner.
        Only slides marked Active appear on the site. Drag order with the arrows — first slide
        shows first.
      </p>

      {error && <p className="admin-manage__error">{error}</p>}

      <div
        className={
          isDragging
            ? 'hero-slides-manage__dropzone hero-slides-manage__dropzone--active'
            : 'hero-slides-manage__dropzone'
        }
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setIsDragging(false);
          handleFiles(e.dataTransfer.files);
        }}
        onClick={() => fileInputRef.current?.click()}
        role="button"
        tabIndex={0}
      >
        <p>Drag & drop photos here, or click to browse</p>
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/*"
          hidden
          onChange={(e) => handleFiles(e.target.files)}
        />
      </div>

      {queue.length > 0 && (
        <ul className="hero-slides-manage__queue">
          {queue.map((item) => (
            <li key={item.id} className={`hero-slides-manage__queue-item hero-slides-manage__queue-item--${item.status}`}>
              <span>{item.name}</span>
              <span>{item.status === 'error' ? item.error : item.status}</span>
            </li>
          ))}
        </ul>
      )}

      <h2 className="admin-manage__list-heading" style={{ marginTop: 'var(--space-6)' }}>
        Slides
      </h2>

      {isLoading ? (
        <Loader label="Loading slides" />
      ) : slides.length === 0 ? (
        <p className="admin-manage__empty">No slides yet — upload some photos above.</p>
      ) : (
        <div className="hero-slides-manage__list">
          {slides.map((slide, index) => (
            <div key={slide.id} className="hero-slides-manage__row">
              <img
                className="hero-slides-manage__thumb"
                src={slide.url}
                alt={slide.caption || ''}
                loading="lazy"
              />

              <div className="hero-slides-manage__meta">
                <input
                  type="text"
                  className="hero-slides-manage__caption-input"
                  placeholder="Caption (optional)"
                  defaultValue={slide.caption || ''}
                  onBlur={(e) => handleCaptionSave(slide, e.target.value)}
                  aria-label="Slide caption"
                />
                <label className="hero-slides-manage__active-toggle">
                  <input
                    type="checkbox"
                    checked={slide.is_active}
                    disabled={busyId === slide.id}
                    onChange={() => handleToggleActive(slide)}
                  />
                  Active
                </label>
              </div>

              <div className="hero-slides-manage__row-actions">
                <button
                  type="button"
                  className="btn btn-outline"
                  onClick={() => handleMove(index, -1)}
                  disabled={index === 0}
                  aria-label="Move up"
                >
                  ↑
                </button>
                <button
                  type="button"
                  className="btn btn-outline"
                  onClick={() => handleMove(index, 1)}
                  disabled={index === slides.length - 1}
                  aria-label="Move down"
                >
                  ↓
                </button>
                <button
                  type="button"
                  className="btn btn-outline"
                  onClick={() => handleDelete(slide)}
                  disabled={busyId === slide.id}
                >
                  {busyId === slide.id ? '…' : 'Delete'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
