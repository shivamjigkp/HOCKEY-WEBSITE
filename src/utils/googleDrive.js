import { env } from '@/config/env';

/**
 * Google Drive import for the Gallery admin. No npm package is used here —
 * Google ships this as browser <script> globals (Google Identity Services
 * + the Picker API), and that's the integration path Google itself
 * documents, so wrapping it in a package would just be an extra layer
 * over the same script tags.
 *
 * Requires VITE_GOOGLE_CLIENT_ID and VITE_GOOGLE_API_KEY — see
 * supabase/GOOGLE_DRIVE_SETUP.md for how to obtain them. If they're not
 * configured, `isGoogleDriveConfigured()` returns false and the caller
 * should hide the Drive import option rather than let it fail at runtime.
 */

const GIS_SRC = 'https://accounts.google.com/gsi/client';
const GAPI_SRC = 'https://apis.google.com/js/api.js';
const DRIVE_SCOPE = 'https://www.googleapis.com/auth/drive.readonly';

let scriptsPromise = null;

export function isGoogleDriveConfigured() {
  return Boolean(env.googleClientId && env.googleApiKey);
}

function loadScript(src) {
  return new Promise((resolve, reject) => {
    if (document.querySelector(`script[src="${src}"]`)) {
      resolve();
      return;
    }
    const script = document.createElement('script');
    script.src = src;
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error(`Failed to load ${src}`));
    document.head.appendChild(script);
  });
}

function loadDriveScripts() {
  if (!scriptsPromise) {
    scriptsPromise = Promise.all([loadScript(GIS_SRC), loadScript(GAPI_SRC)]).then(
      () => new Promise((resolve) => window.gapi.load('picker', resolve))
    );
  }
  return scriptsPromise;
}

function requestAccessToken() {
  return new Promise((resolve, reject) => {
    const tokenClient = window.google.accounts.oauth2.initTokenClient({
      client_id: env.googleClientId,
      scope: DRIVE_SCOPE,
      callback: (response) => {
        if (response.error) reject(response);
        else resolve(response.access_token);
      },
    });
    tokenClient.requestAccessToken();
  });
}

/**
 * Opens the Google Picker restricted to image files and resolves with the
 * chosen files' Drive metadata ({ id, name, mimeType }[]), or an empty
 * array if the user cancels.
 */
export async function pickImagesFromDrive() {
  if (!isGoogleDriveConfigured()) {
    throw new Error('Google Drive import is not configured.');
  }

  await loadDriveScripts();
  const accessToken = await requestAccessToken();

  return new Promise((resolve) => {
    const view = new window.google.picker.DocsView(window.google.picker.ViewId.DOCS_IMAGES)
      .setIncludeFolders(true)
      .setSelectFolderEnabled(false);

    const picker = new window.google.picker.PickerBuilder()
      .addView(view)
      .setOAuthToken(accessToken)
      .setDeveloperKey(env.googleApiKey)
      .enableFeature(window.google.picker.Feature.MULTISELECT_ENABLED)
      .setCallback((data) => {
        if (data.action === window.google.picker.Action.PICKED) {
          resolve({ accessToken, files: data.docs });
        } else if (data.action === window.google.picker.Action.CANCEL) {
          resolve({ accessToken, files: [] });
        }
      })
      .build();

    picker.setVisible(true);
  });
}

/**
 * Downloads a single picked Drive file's bytes and returns it as a
 * browser File, ready for compressImage() and uploadImage().
 */
export async function downloadDriveFile(accessToken, driveFile) {
  const response = await fetch(
    `https://www.googleapis.com/drive/v3/files/${driveFile.id}?alt=media`,
    { headers: { Authorization: `Bearer ${accessToken}` } }
  );

  if (!response.ok) {
    throw new Error(`Failed to download "${driveFile.name}" from Drive.`);
  }

  const blob = await response.blob();
  return new File([blob], driveFile.name, { type: driveFile.mimeType });
}
