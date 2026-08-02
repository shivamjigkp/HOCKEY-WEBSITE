import { useRef, useState } from 'react';
import { uploadSiteImage } from '@/services/storage';
import './ImageUploadField.css';

/**
 * Drop-in replacement for a plain "Photo URL" text input. Handles the
 * file picker, drag-and-drop, upload, and preview itself; the parent
 * just reads/writes a URL string exactly like it did with the old text
 * field.
 *
 * @param {string} value - current photo URL (or '')
 * @param {(url: string) => void} onChange - called with the new URL after
 *   a successful upload, or '' when the photo is removed
 * @param {string} folder - storage folder prefix, e.g. 'players'
 */
export default function ImageUploadField({ value, onChange, folder, label = 'Photo' }) {
  const [isUploading, setIsUploading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState('');
  const inputRef = useRef(null);
  const dragCounter = useRef(0);

  async function handleFile(file) {
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setError('Please choose an image file.');
      return;
    }
    setIsUploading(true);
    setError('');
    try {
      const url = await uploadSiteImage(file, folder);
      onChange(url);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsUploading(false);
      if (inputRef.current) inputRef.current.value = '';
    }
  }

  function handleFileSelect(e) {
    handleFile(e.target.files?.[0]);
  }

  function handleDragEnter(e) {
    e.preventDefault();
    dragCounter.current += 1;
    setIsDragging(true);
  }

  function handleDragLeave(e) {
    e.preventDefault();
    dragCounter.current -= 1;
    if (dragCounter.current <= 0) {
      dragCounter.current = 0;
      setIsDragging(false);
    }
  }

  function handleDragOver(e) {
    // Required for onDrop to fire at all — browsers block drops by default.
    e.preventDefault();
  }

  function handleDrop(e) {
    e.preventDefault();
    dragCounter.current = 0;
    setIsDragging(false);
    if (isUploading) return;
    handleFile(e.dataTransfer.files?.[0]);
  }

  const dropZoneClassName = [
    'image-upload-field__dropzone',
    isDragging && 'image-upload-field__dropzone--active',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className="image-upload-field">
      <span className="image-upload-field__label">{label}</span>

      <div
        className={dropZoneClassName}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
      >
        {value ? (
          <div className="image-upload-field__preview">
            <img src={value} alt="" />
            <button
              type="button"
              className="image-upload-field__remove"
              onClick={() => onChange('')}
              aria-label="Remove photo"
            >
              ×
            </button>
          </div>
        ) : (
          <div className="image-upload-field__placeholder">
            {isDragging ? 'Drop to upload' : 'Drag a photo here, or'}
          </div>
        )}

        <label className="btn btn-outline image-upload-field__button">
          {isUploading ? 'Uploading…' : value ? 'Replace Photo' : 'Choose Photo'}
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            disabled={isUploading}
            hidden
          />
        </label>
      </div>

      {error && <p className="image-upload-field__error">{error}</p>}
    </div>
  );
}
