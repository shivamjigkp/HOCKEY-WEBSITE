/**
 * Centralized environment configuration.
 * Never read import.meta.env directly outside this file —
 * always import from here so env access stays auditable in one place.
 */

const required = (key, value) => {
  if (!value) {
    // eslint-disable-next-line no-console
    console.warn(`[env] Missing required environment variable: ${key}`);
  }
  return value;
};

export const env = {
  supabaseUrl: required('VITE_SUPABASE_URL', import.meta.env.VITE_SUPABASE_URL),
  supabaseAnonKey: required('VITE_SUPABASE_ANON_KEY', import.meta.env.VITE_SUPABASE_ANON_KEY),
  googleClientId: import.meta.env.VITE_GOOGLE_CLIENT_ID || '',
  googleApiKey: import.meta.env.VITE_GOOGLE_API_KEY || '',
  appName: import.meta.env.VITE_APP_NAME || 'MMMUT Hockey',
  appEnv: import.meta.env.VITE_APP_ENV || 'development',
  isProd: import.meta.env.PROD,
  isDev: import.meta.env.DEV,
};
