import { useEffect, useRef, useState } from 'react';
import Loader from '@/components/Loader/Loader';
import { compressImage } from '@/utils/imageCompression';
import {
  deleteAlumniGroupPhoto,
  getAllAlumniGroupPhotos,
  reorderAlumniGroupPhotos,
  updateAlumniGroupPhoto,
  uploadAlumniGroupPhoto,
} from '@/services/alumniGroupPhotos';
import '../adminManage.css';
import './AlumniGroupPhotosManage.css';

let queueItemId = 0;

export default function AlumniGroupPhotosManage() {
  const [photos, setPhotos] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [queue, setQueue] = useState([]);
  const [isDragging, setIsDragging] = useState(false);
  const [busyId, setBusyId] = useState(null);
  const fileInputRef = useRef(null);

  function load() {
    setIsLoading(true);
    return getAllAlumniGroupPhotos()
      .then(setPhotos)
      .catch((err) => setError(err.message || 'Could not load photos.'))
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
      const uploaded = await uploadAlumniGroupPhoto({ file: compressed, sortOrder: photos.length });
      setPhotos((prev) => [...prev, uploaded]);
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

  async function handleToggleActive(photo) {
    setBusyId(photo.id);
    try {
      const updated = await updateAlumniGroupPhoto(photo.id, { is_active: !photo.is_active });
      setPhotos((prev) => prev.map((p) => (p.id === photo.id ? updated : p)));
    } catch (err) {
      setError(err.message || 'Could not update photo.');
    } finally {
      setBusyId(null);
    }
  }

  async function handleCaptionSave(photo, caption) {
    if (caption === (photo.caption || '')) return;
    try {
      const updated = await updateAlumniGroupPhoto(photo.id, { caption });
      setPhotos((prev) => prev.map((p) => (p.id === photo.id ? updated : p)));
    } catch (err) {
      setError(err.message || 'Could not save caption.');
    }
  }

  async function handleDelete(photo) {
    setBusyId(photo.id);
    try {
      await deleteAlumniGroupPhoto(photo);
      setPhotos((prev) => prev.filter((p) => p.id !== photo.id));
    } catch (err) {
      setError(err.message || 'Could not delete photo.');
    } finally {
      setBusyId(null);
    }
  }

  async function handleMove(index, direction) {
    const targetIndex = index + direction;
    if (targetIndex < 0 || targetIndex >= photos.length) return;

    const reordered = [...photos];
    [reordered[index], reordered[targetIndex]] = [reordered[targetIndex], reordered[index]];
    setPhotos(reordered);

    try {
      await reorderAlumniGroupPhotos(reordered.map((p) => p.id));
    } catch (err) {
      setError(err.message || 'Could not save new order.');
      load();
    }
  }

  return (
    <div className="admin-manage">
      <p className="eyebrow">Admin</p>
      <h1 className="admin-manage__title">Alumni Group Photos</h1>
      <p className="admin-manage__note">
        Controls the group-photo slideshow shown on the public Alumni page, below the alumni grid
        — for batch/reunion photos that don&apos;t belong to any one person. Only photos marked Active
        appear on the site. Reorder with the arrows — first photo shows first.
      </p>

      {error && <p className="admin-manage__error">{error}</p>}

      <div
        className={
          isDragging
            ? 'alumni-group-photos-manage__dropzone alumni-group-photos-manage__dropzone--active'
            : 'alumni-group-photos-manage__dropzone'
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
        <ul className="alumni-group-photos-manage__queue">
          {queue.map((item) => (
            <li
              key={item.id}
              className={`alumni-group-photos-manage__queue-item alumni-group-photos-manage__queue-item--${item.status}`}
            >
              <span>{item.name}</span>
              <span>{item.status === 'error' ? item.error : item.status}</span>
            </li>
          ))}
        </ul>
      )}

      <h2 className="admin-manage__list-heading" style={{ marginTop: 'var(--space-6)' }}>
        Photos
      </h2>

      {isLoading ? (
        <Loader label="Loading photos" />
      ) : photos.length === 0 ? (
        <p className="admin-manage__empty">No photos yet — upload some group photos above.</p>
      ) : (
        <div className="alumni-group-photos-manage__list">
          {photos.map((photo, index) => (
            <div key={photo.id} className="alumni-group-photos-manage__row">
              <img
                className="alumni-group-photos-manage__thumb"
                src={photo.url}
                alt={photo.caption || ''}
                loading="lazy"
              />

              <div className="alumni-group-photos-manage__meta">
                <input
                  type="text"
                  className="alumni-group-photos-manage__caption-input"
                  placeholder="Caption (optional)"
                  defaultValue={photo.caption || ''}
                  onBlur={(e) => handleCaptionSave(photo, e.target.value)}
                  aria-label="Photo caption"
                />
                <label className="alumni-group-photos-manage__active-toggle">
                  <input
                    type="checkbox"
                    checked={photo.is_active}
                    disabled={busyId === photo.id}
                    onChange={() => handleToggleActive(photo)}
                  />
                  Active
                </label>
              </div>

              <div className="alumni-group-photos-manage__row-actions">
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
                  disabled={index === photos.length - 1}
                  aria-label="Move down"
                >
                  ↓
                </button>
                <button
                  type="button"
                  className="btn btn-outline"
                  onClick={() => handleDelete(photo)}
                  disabled={busyId === photo.id}
                >
                  {busyId === photo.id ? '…' : 'Delete'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
