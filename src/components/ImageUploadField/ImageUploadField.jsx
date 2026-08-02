import { useRef, useState } from 'react';
import { uploadSiteImage } from '@/services/storage';
import './ImageUploadField.css';

/**
 * Drop-in replacement for a plain "Photo URL" text input. Handles the
 * file picker, upload, and preview itself; the parent just reads/writes
 * a URL string exactly like it did with the old text field.
 *
 * @param {string} value - current photo URL (or '')
 * @param {(url: string) => void} onChange - called with the new URL after
 *   a successful upload, or '' when the photo is removed
 * @param {string} folder - storage folder prefix, e.g. 'players'
 */
export default function ImageUploadField({ value, onChange, folder, label = 'Photo' }) {
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState('');
  const inputRef = useRef(null);

  async function handleFileSelect(e) {
    const file = e.target.files?.[0];
    if (!file) return;
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

  return (
    <div className="image-upload-field">
      <span className="image-upload-field__label">{label}</span>

      <div className="image-upload-field__body">
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
          <div className="image-upload-field__placeholder">No photo</div>
        )}

        <label className="btn btn-outline image-upload-field__button">
          {isUploading ? 'Uploading…' : value ? 'Replace Photo' : 'Upload Photo'}
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
