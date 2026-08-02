import { useEffect, useRef, useState } from 'react';
import Loader from '@/components/Loader/Loader';
import { compressImage } from '@/utils/imageCompression';
import {
  getContainersWithPhotos,
  createContainer,
  deleteContainer,
  setContainerSlideshow,
  uploadSquadPhoto,
  updatePhotoOrder,
  deleteSquadPhoto,
} from '@/services/squadPhotos';
import '../adminManage.css';
import './SquadPhotosManage.css';

function ContainerPanel({ container, onChange }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef(null);

  async function handleUpload(fileList) {
    const files = Array.from(fileList).filter((f) => f.type.startsWith('image/'));
    setBusy(true);
    setError('');
    try {
      let nextOrder = container.photos.length
        ? Math.max(...container.photos.map((p) => p.sort_order)) + 1
        : 1;
      let updatedPhotos = [...container.photos];
      for (const file of files) {
        const compressed = await compressImage(file);
        const uploaded = await uploadSquadPhoto({
          containerId: container.id,
          file: compressed,
          sortOrder: nextOrder,
        });
        updatedPhotos = [...updatedPhotos, uploaded];
        nextOrder += 1;
      }
      onChange({ ...container, photos: updatedPhotos });
    } catch (err) {
      setError(err.message || 'Upload failed.');
    } finally {
      setBusy(false);
    }
  }

  async function handleOrderChange(photo, order) {
    const numericOrder = Number(order) || 1;
    try {
      const updated = await updatePhotoOrder(photo.id, numericOrder);
      onChange({
        ...container,
        photos: container.photos.map((p) => (p.id === photo.id ? { ...p, ...updated } : p)),
      });
    } catch (err) {
      setError(err.message || 'Could not update order.');
    }
  }

  async function handleDeletePhoto(photo) {
    setBusy(true);
    try {
      await deleteSquadPhoto(photo);
      onChange({ ...container, photos: container.photos.filter((p) => p.id !== photo.id) });
    } catch (err) {
      setError(err.message || 'Could not delete photo.');
    } finally {
      setBusy(false);
    }
  }

  async function handleToggleSlideshow() {
    setBusy(true);
    try {
      const updated = await setContainerSlideshow(container.id, !container.slideshow_enabled);
      onChange({ ...container, slideshow_enabled: updated.slideshow_enabled });
    } catch (err) {
      setError(err.message || 'Could not update slideshow setting.');
    } finally {
      setBusy(false);
    }
  }

  async function handleRemoveContainer() {
    if (!window.confirm(`Delete "${container.title}" and all its photos? This cannot be undone.`))
      return;
    setBusy(true);
    try {
      await deleteContainer(container);
      onChange(null);
    } catch (err) {
      setError(err.message || 'Could not delete container.');
      setBusy(false);
    }
  }

  const sortedPhotos = [...container.photos].sort((a, b) => a.sort_order - b.sort_order);

  return (
    <div className="squad-photos-manage__panel">
      <div className="squad-photos-manage__panel-header">
        <h3>{container.title}</h3>
        <button
          type="button"
          className="btn btn-outline"
          onClick={handleRemoveContainer}
          disabled={busy}
        >
          Remove Container
        </button>
      </div>

      {error && <p className="admin-manage__error">{error}</p>}

      <label className="squad-photos-manage__toggle">
        <input
          type="checkbox"
          checked={container.slideshow_enabled}
          disabled={busy}
          onChange={handleToggleSlideshow}
        />
        Slideshow {container.slideshow_enabled ? 'ON' : 'OFF'}
        <span className="squad-photos-manage__toggle-hint">
          {container.slideshow_enabled
            ? '— cycles through all photos below in order.'
            : `— shows only the photo with Order 1 (permanently, until turned back on).`}
        </span>
      </label>

      <div
        className="squad-photos-manage__dropzone"
        onClick={() => fileInputRef.current?.click()}
        role="button"
        tabIndex={0}
      >
        {busy ? 'Working…' : 'Click to upload photo(s)'}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          hidden
          onChange={(e) => handleUpload(e.target.files)}
        />
      </div>

      {sortedPhotos.length === 0 ? (
        <p className="admin-manage__empty">No photos yet.</p>
      ) : (
        <ul className="squad-photos-manage__photo-list">
          {sortedPhotos.map((photo) => (
            <li key={photo.id}>
              <img src={photo.url} alt="" />
              <label>
                Order
                <input
                  type="number"
                  min="1"
                  defaultValue={photo.sort_order}
                  onBlur={(e) => handleOrderChange(photo, e.target.value)}
                />
              </label>
              <button
                type="button"
                className="btn btn-outline"
                onClick={() => handleDeletePhoto(photo)}
                disabled={busy}
              >
                Delete
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default function SquadPhotosManage() {
  const [containers, setContainers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [newTitle, setNewTitle] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  function load() {
    setIsLoading(true);
    return getContainersWithPhotos()
      .then(setContainers)
      .finally(() => setIsLoading(false));
  }

  useEffect(() => {
    load();
  }, []);

  function handleContainerChange(id, updated) {
    setContainers((prev) =>
      updated === null ? prev.filter((c) => c.id !== id) : prev.map((c) => (c.id === id ? updated : c))
    );
  }

  async function handleAddContainer(e) {
    e.preventDefault();
    if (!newTitle.trim()) return;
    setIsCreating(true);
    setError('');
    try {
      const created = await createContainer(newTitle.trim());
      setContainers((prev) => [...prev, created]);
      setNewTitle('');
    } catch (err) {
      setError(err.message || 'Could not create container.');
    } finally {
      setIsCreating(false);
    }
  }

  return (
    <div className="admin-manage">
      <p className="eyebrow">Admin</p>
      <h1 className="admin-manage__title">Squad Photos</h1>
      <p className="admin-manage__note">
        Group photo containers shown on the public Players page, below the roster (Final Year,
        3rd Year Boys/Girls, 2nd Year Boys/Girls by default — add or remove containers freely).
        Each container's Slideshow toggle is OFF by default, showing only the photo you set as
        Order 1. Turn it ON to auto-cycle through every photo in that container.
      </p>

      {error && <p className="admin-manage__error">{error}</p>}

      <form className="squad-photos-manage__add-form" onSubmit={handleAddContainer}>
        <input
          type="text"
          placeholder="New container name (e.g. 1st Year Boys)"
          value={newTitle}
          onChange={(e) => setNewTitle(e.target.value)}
        />
        <button type="submit" className="btn btn-primary" disabled={isCreating}>
          {isCreating ? 'Adding…' : '+ Add Container'}
        </button>
      </form>

      {isLoading ? (
        <Loader label="Loading squad photos" />
      ) : containers.length === 0 ? (
        <p className="admin-manage__empty">No containers yet — add one above.</p>
      ) : (
        <div className="squad-photos-manage__grid">
          {containers.map((container) => (
            <ContainerPanel
              key={container.id}
              container={container}
              onChange={(updated) => handleContainerChange(container.id, updated)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
