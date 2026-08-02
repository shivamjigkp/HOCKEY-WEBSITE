import { supabase } from '@/config/supabaseClient';
import { SITE_CONFIG } from '@/constants/siteConfig';

/**
 * Site settings service (see supabase/schema_phase12.sql). Components
 * must go through this file — never query `site_settings` directly.
 *
 * `getSiteSettings()` always resolves with a complete, usable object —
 * on any error (table not migrated yet, RLS misconfigured, offline) it
 * falls back to the SITE_CONFIG defaults rather than throwing, so Footer
 * and Contact — which render on every page — can never blank-screen
 * because Settings wasn't configured. Same defensive pattern as
 * supabaseClient.js's placeholder fallback.
 */

export const SETTINGS_DEFAULTS = {
  contactEmail: SITE_CONFIG.contactEmail,
  instagram: SITE_CONFIG.social.instagram,
  facebook: SITE_CONFIG.social.facebook,
  youtube: SITE_CONFIG.social.youtube,
  // Homepage stats strip (StatsStrip) — see supabase/schema_phase13.sql.
  // These are the same numbers that used to be hardcoded in
  // src/features/home/data/homeMockData.js's PROGRAM_STATS.
  foundedYear: 1962,
  nationalTitles: 14,
  activePlayers: 32,
  alumniPro: 47,
  // Admin-customizable light-mode page background (Admin > Settings >
  // Appearance). Empty string = no override, fall back to the
  // --pitch-chalk-100 token in themes.css. Never applied in dark mode —
  // see the effect in src/context/ThemeContext.jsx.
  themeBgLight: '',
};

const KEY_MAP = {
  contact_email: 'contactEmail',
  social_instagram: 'instagram',
  social_facebook: 'facebook',
  social_youtube: 'youtube',
  stat_founded_year: 'foundedYear',
  stat_national_titles: 'nationalTitles',
  stat_active_players: 'activePlayers',
  stat_alumni_pro: 'alumniPro',
  theme_bg_light: 'themeBgLight',
};

// Stats fields are stored as text in `site_settings` (same column as the
// URL/email fields) but need to come back out as numbers for StatsStrip's
// count-up animation and any arithmetic.
const NUMERIC_FIELDS = new Set(['foundedYear', 'nationalTitles', 'activePlayers', 'alumniPro']);

export async function getSiteSettings() {
  try {
    const { data, error } = await supabase.from('site_settings').select('key, value');
    if (error) throw error;

    const settings = { ...SETTINGS_DEFAULTS };
    for (const row of data) {
      const field = KEY_MAP[row.key];
      if (!field || row.value == null) continue;
      settings[field] = NUMERIC_FIELDS.has(field) ? Number(row.value) : row.value;
    }
    return settings;
  } catch {
    return SETTINGS_DEFAULTS;
  }
}

export async function updateSiteSettings(patch) {
  const rows = Object.entries(patch)
    .filter(([field]) => Object.values(KEY_MAP).includes(field))
    .map(([field, value]) => {
      const key = Object.keys(KEY_MAP).find((k) => KEY_MAP[k] === field);
      return { key, value: String(value), updated_at: new Date().toISOString() };
    });

  if (rows.length === 0) return;

  const { error } = await supabase.from('site_settings').upsert(rows, { onConflict: 'key' });
  if (error) throw error;
}