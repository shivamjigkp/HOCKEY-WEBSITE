/**
 * Compresses an image File in the browser before upload, using the native
 * Canvas API — no library needed for this (per Technology Rules: only add
 * a dependency when it provides a clear benefit over what the platform
 * already gives us).
 *
 * Resizes to fit within maxDimension and re-encodes as JPEG at the given
 * quality. Non-image files are returned unchanged.
 */
const MAX_DIMENSION = 1920;
const JPEG_QUALITY = 0.82;

export async function compressImage(file, { maxDimension = MAX_DIMENSION, quality = JPEG_QUALITY } = {}) {
  if (!file.type.startsWith('image/')) return file;

  // imageOrientation: 'from-image' makes the browser apply the photo's
  // embedded EXIF rotation before drawing it. Without this, photos taken
  // on phones (portrait shots especially) come out sideways or upside
  // down after upload, because EXIF orientation is otherwise ignored.
  const bitmap = await createImageBitmap(file, { imageOrientation: 'from-image' });
  const scale = Math.min(1, maxDimension / Math.max(bitmap.width, bitmap.height));
  const width = Math.round(bitmap.width * scale);
  const height = Math.round(bitmap.height * scale);

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  ctx.drawImage(bitmap, 0, 0, width, height);
  bitmap.close?.();

  const blob = await new Promise((resolve) =>
    canvas.toBlob(resolve, 'image/jpeg', quality)
  );

  if (!blob) return file;

  const newName = file.name.replace(/\.[^.]+$/, '') + '.jpg';
  return new File([blob], newName, { type: 'image/jpeg' });
}
