/**
 * Reads a File (e.g. from an <input type="file">) into a base64 data URL.
 * Used for local-only photo storage until Supabase Storage (Phase 7)
 * replaces this with real uploads.
 */
export function fileToDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(new Error('Could not read file'));
    reader.readAsDataURL(file);
  });
}
