import { createClient } from '@supabase/supabase-js';
import { env } from './env';

/**
 * Single Supabase client instance for the whole app.
 *
 * IMPORTANT: Per project architecture rules, no component or page should
 * import this file directly. All database/auth/storage access must go
 * through the service layer in `src/services/`. This keeps Supabase as an
 * implementation detail that can be swapped later without touching UI code.
 */
export const supabase = createClient(env.supabaseUrl, env.supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});
