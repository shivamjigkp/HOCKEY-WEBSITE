import { useRef, useState } from 'react';
import { compressImage } from '@/utils/imageCompression';
import { extractImagesFromZip } from '@/utils/zipImport';
import {
  downloadDriveFile,
  isGoogleDriveConfigured,
  pickImagesFromDrive,
} from '@/utils/googleDrive';
import { uploadImage } from '@/services/gallery';
import './Uploader.css';

let queueItemId = 0;

export default function Uploader({ albumId, onUploaded }) {
  const [isDragging, setIsDragging] = useState(false);
  const [queue, setQueue] = useState([]);
  const fileInputRef = useRef(null);

  function updateItem(id, patch) {
    setQueue((prev) => prev.map((item) => (item.id === id ? { ...item, ...patch } : item)));
  }

  async function processFile(file) {
    const id = ++queueItemId;
    setQueue((prev) => [...prev, { id, name: file.name, status: 'compressing' }]);

    try {
      const compressed = await compressImage(file);
      updateItem(id, { status: 'uploading' });
      const uploaded = await uploadImage({ albumId, file: compressed });
      updateItem(id, { status: 'done' });
      onUploaded(uploaded);
    } catch (err) {
      updateItem(id, { status: 'error', error: err.message || 'Upload failed' });
    }
  }

  async function handleFiles(fileList) {
    const files = Array.from(fileList);

    for (const file of files) {
      if (file.type === 'application/zip' || file.name.toLowerCase().endsWith('.zip')) {
        const id = ++queueItemId;
        setQueue((prev) => [...prev, { id, name: file.name, status: 'compressing' }]);
        try {
          const extracted = await extractImagesFromZip(file);
          updateItem(id, { status: 'done' });
          setQueue((prev) => prev.filter((item) => item.id !== id));
          for (const image of extracted) {
            await processFile(image);
          }
        } catch (err) {
          updateItem(id, { status: 'error', error: err.message || 'Could not read ZIP' });
        }
      } else if (file.type.startsWith('image/')) {
        await processFile(file);
      }
    }
  }

  async function handleDriveImport() {
    try {
      const { accessToken, files } = await pickImagesFromDrive();
      for (const driveFile of files) {
        const file = await downloadDriveFile(accessToken, driveFile);
        await processFile(file);
      }
    } catch (err) {
      // A cancelled picker also lands here in some flows; surface only
      // genuine errors, not user-cancel.
      if (err?.type !== 'popup_closed') {
        console.error('Google Drive import failed:', err);
      }
    }
  }

  return (
    <div className="uploader">
      <div
        className={isDragging ? 'uploader__dropzone uploader__dropzone--active' : 'uploader__dropzone'}
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
        <p>Drag & drop photos or a .zip here, or click to browse</p>
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/*,.zip"
          hidden
          onChange={(e) => handleFiles(e.target.files)}
        />
      </div>

      {isGoogleDriveConfigured() && (
        <button type="button" className="btn btn-outline uploader__drive-btn" onClick={handleDriveImport}>
          Import from Google Drive
        </button>
      )}

      {queue.length > 0 && (
        <ul className="uploader__queue">
          {queue.map((item) => (
            <li key={item.id} className={`uploader__queue-item uploader__queue-item--${item.status}`}>
              <span>{item.name}</span>
              <span>{item.status === 'error' ? item.error : item.status}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
