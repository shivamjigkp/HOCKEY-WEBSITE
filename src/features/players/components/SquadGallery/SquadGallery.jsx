import { useEffect, useState } from 'react';
import { useLocalStorageState } from '@/hooks/useLocalStorageState';
import { fileToDataUrl } from '@/utils/fileToDataUrl';
import './SquadGallery.css';

const STORAGE_KEY = 'mmmut_squad_containers';

const DEFAULT_CONTAINERS = [
  { id: 'final-year', title: 'Final Year', slideshowEnabled: false, images: [] },
  { id: '3rd-year-boys', title: '3rd Year Boys', slideshowEnabled: false, images: [] },
  { id: '3rd-year-girls', title: '3rd Year Girls', slideshowEnabled: false, images: [] },
  { id: '2nd-year-boys', title: '2nd Year Boys', slideshowEnabled: false, images: [] },
  { id: '2nd-year-girls', title: '2nd Year Girls', slideshowEnabled: false, images: [] },
];

const SLIDE_INTERVAL_MS = 4000;

function ContainerDisplay({ container }) {
  const sortedImages = [...container.images].sort((a, b) => a.order - b.order);
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    setActiveIndex(0);
  }, [container.slideshowEnabled, sortedImages.length]);

  useEffect(() => {
    if (!container.slideshowEnabled || sortedImages.length < 2) return undefined;

    const timer = setInterval(() => {
      setActiveIndex((i) => (i + 1) % sortedImages.length);
    }, SLIDE_INTERVAL_MS);

    return () => clearInterval(timer);
  }, [container.slideshowEnabled, sortedImages.length]);

  if (sortedImages.length === 0) {
    return <div className="squad-container__placeholder">No photos added yet</div>;
  }

  // Slideshow off → permanently show whichever image has order 1 (the lowest order).
  const image = container.slideshowEnabled ? sortedImages[activeIndex] : sortedImages[0];

  return (
    <div className="squad-container__display">
      <img src={image.url} alt={container.title} />
      {container.slideshowEnabled && sortedImages.length > 1 && (
        <div className="squad-container__dots">
          {sortedImages.map((img, i) => (
            <span
              key={img.id}
              className={i === activeIndex ? 'squad-container__dot squad-container__dot--active' : 'squad-container__dot'}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function ContainerCard({ container, isAdminMode, onUpdate, onRemove }) {
  const handleAddImage = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = await fileToDataUrl(file);
    const nextOrder = container.images.length
      ? Math.max(...container.images.map((i) => i.order)) + 1
      : 1;
    onUpdate({
      ...container,
      images: [...container.images, { id: `img-${Date.now()}`, url, order: nextOrder }],
    });
    e.target.value = '';
  };

  const handleOrderChange = (imageId, order) => {
    onUpdate({
      ...container,
      images: container.images.map((img) =>
        img.id === imageId ? { ...img, order: Number(order) || 1 } : img
      ),
    });
  };

  const handleRemoveImage = (imageId) => {
    onUpdate({
      ...container,
      images: container.images.filter((img) => img.id !== imageId),
    });
  };

  const handleToggleSlideshow = (e) => {
    onUpdate({ ...container, slideshowEnabled: e.target.checked });
  };

  return (
    <div className="squad-container">
      <div className="squad-container__header">
        <h3>{container.title}</h3>
        {isAdminMode && (
          <button
            type="button"
            className="squad-container__remove"
            title="Remove this container"
            onClick={() => onRemove(container.id)}
          >
            × Remove
          </button>
        )}
      </div>

      <ContainerDisplay container={container} />

      {isAdminMode && (
        <div className="squad-container__admin">
          <label className="squad-container__toggle">
            <input
              type="checkbox"
              checked={container.slideshowEnabled}
              onChange={handleToggleSlideshow}
            />
            Slideshow {container.slideshowEnabled ? 'ON' : 'OFF'}
          </label>

          <label className="btn btn-outline squad-container__add-photo">
            + Add Photo
            <input type="file" accept="image/*" onChange={handleAddImage} hidden />
          </label>

          {container.images.length > 0 && (
            <ul className="squad-container__image-list">
              {[...container.images]
                .sort((a, b) => a.order - b.order)
                .map((img) => (
                  <li key={img.id}>
                    <img src={img.url} alt="" />
                    <label>
                      Order
                      <input
                        type="number"
                        min="1"
                        value={img.order}
                        onChange={(e) => handleOrderChange(img.id, e.target.value)}
                      />
                    </label>
                    <button type="button" onClick={() => handleRemoveImage(img.id)}>
                      Remove
                    </button>
                  </li>
                ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}

export default function SquadGallery({ isAdminMode }) {
  const [containers, setContainers] = useLocalStorageState(STORAGE_KEY, DEFAULT_CONTAINERS);
  const [newTitle, setNewTitle] = useState('');

  const updateContainer = (updated) => {
    setContainers((prev) => prev.map((c) => (c.id === updated.id ? updated : c)));
  };

  const removeContainer = (id) => {
    setContainers((prev) => prev.filter((c) => c.id !== id));
  };

  const addContainer = (e) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    setContainers((prev) => [
      ...prev,
      {
        id: `custom-${Date.now()}`,
        title: newTitle.trim(),
        slideshowEnabled: false,
        images: [],
      },
    ]);
    setNewTitle('');
  };

  return (
    <section className="squad-gallery">
      <h2 className="squad-gallery__title">Squad Photos</h2>
      <p className="squad-gallery__subtitle">Group photos by year and section.</p>

      <div className="squad-gallery__grid">
        {containers.map((container) => (
          <ContainerCard
            key={container.id}
            container={container}
            isAdminMode={isAdminMode}
            onUpdate={updateContainer}
            onRemove={removeContainer}
          />
        ))}
      </div>

      {isAdminMode && (
        <form className="squad-gallery__add-form" onSubmit={addContainer}>
          <input
            type="text"
            placeholder="New container name (e.g. 1st Year Boys)"
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
          />
          <button type="submit" className="btn btn-primary">
            + Add Container
          </button>
        </form>
      )}
    </section>
  );
}
