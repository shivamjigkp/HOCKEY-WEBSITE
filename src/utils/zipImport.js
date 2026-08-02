import JSZip from 'jszip';

const IMAGE_EXTENSIONS = /\.(jpe?g|png|webp|gif)$/i;

/**
 * Extracts image files from a ZIP archive as browser File objects, ready
 * to run through compressImage() and uploadImage(). Non-image entries
 * (folders, .DS_Store, thumbs.db, etc.) are skipped.
 */
export async function extractImagesFromZip(zipFile) {
  const zip = await JSZip.loadAsync(zipFile);
  const entries = Object.values(zip.files).filter(
    (entry) => !entry.dir && IMAGE_EXTENSIONS.test(entry.name)
  );

  const files = await Promise.all(
    entries.map(async (entry) => {
      const blob = await entry.async('blob');
      const name = entry.name.split('/').pop();
      return new File([blob], name, { type: blob.type || 'image/jpeg' });
    })
  );

  return files;
}
