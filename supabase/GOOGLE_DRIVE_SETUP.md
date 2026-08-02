# Google Drive Import — Setup

The Gallery admin's "Import from Google Drive" button (`src/utils/googleDrive.js`)
needs two credentials from Google Cloud Console. Without them, the button
stays hidden (`isGoogleDriveConfigured()` returns `false`) — the rest of the
Gallery module works normally without this.

## 1. Create/select a Google Cloud project

https://console.cloud.google.com/ → select or create a project.

## 2. Enable the required APIs

APIs & Services → Library → enable:
- **Google Picker API**
- **Google Drive API**

## 3. Create an OAuth 2.0 Client ID

APIs & Services → Credentials → Create Credentials → OAuth client ID.
- Application type: **Web application**
- Authorized JavaScript origins: add your dev URL (`http://localhost:5173`)
  and your production Vercel URL.
- Copy the generated Client ID into `VITE_GOOGLE_CLIENT_ID`.

You'll also need to configure the OAuth consent screen (External, or
Internal if using Google Workspace) the first time — add the
`.../auth/drive.readonly` scope there.

## 4. Create an API key

APIs & Services → Credentials → Create Credentials → API key.
- Restrict it to the **Google Picker API** (Application restrictions →
  HTTP referrers, matching your domains; API restrictions → Picker API).
- Copy it into `VITE_GOOGLE_API_KEY`.

## 5. Add both to `.env`

```
VITE_GOOGLE_CLIENT_ID=xxxxxxxxxx.apps.googleusercontent.com
VITE_GOOGLE_API_KEY=xxxxxxxxxx
```

Restart the dev server after editing `.env`.

## Notes

- The app only requests `drive.readonly` — it can list/download files the
  signed-in Google account picks, nothing more.
- This flow runs entirely in the browser (Google Identity Services + the
  Picker API); no server-side Google credentials are needed.
- Until this is configured, the "Import from Google Drive" option is
  hidden rather than shown-and-broken.
