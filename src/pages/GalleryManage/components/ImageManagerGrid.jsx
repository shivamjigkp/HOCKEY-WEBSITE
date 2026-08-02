import { useState } from 'react';
import { deleteImage } from '@/services/gallery';
import './ImageManagerGrid.css';

export default function ImageManagerGrid({ images, onDeleted }) {
  const [deletingId, setDeletingId] = useState(null);

  async function handleDelete(image) {
    setDeletingId(image.id);
    try {
      await deleteImage(image);
      onDeleted(image.id);
    } finally {
      setDeletingId(null);
    }
  }

  if (images.length === 0) {
    return <p className="image-manager-grid__empty">No photos in this album yet.</p>;
  }

  return (
    <div className="image-manager-grid">
      {images.map((image) => (
        <div key={image.id} className="image-manager-grid__item">
          <img src={image.url} alt={image.caption || ''} loading="lazy" />
          <button
            type="button"
            className="image-manager-grid__delete"
            onClick={() => handleDelete(image)}
            disabled={deletingId === image.id}
            aria-label={`Delete ${image.caption || 'photo'}`}
          >
            {deletingId === image.id ? '…' : '✕'}
          </button>
        </div>
      ))}
    </div>
  );
}
