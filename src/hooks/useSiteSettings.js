import { useEffect, useState } from 'react';
import { getSiteSettings, SETTINGS_DEFAULTS } from '@/services/settings';

/**
 * Returns site settings (contact info, social links, homepage stats,
 * theme overrides), starting from SETTINGS_DEFAULTS so every consumer —
 * Footer, Contact, and StatsStrip alike — always has real numbers/values
 * to render immediately instead of `undefined`, then swapping in the
 * live values from Supabase once they load.
 *
 * Previously this hook kept its own local, out-of-sync copy of the
 * default values (missing the stat_* fields entirely), which is why
 * StatsStrip briefly rendered `NaN` on first paint — see useCountUp.js
 * for the other half of that fix. Importing SETTINGS_DEFAULTS from
 * services/settings.js instead of duplicating it prevents this class of
 * bug from recurring when new settings fields are added.
 *
 * getSiteSettings() itself never throws — see services/settings.js —
 * so no error state is needed here.
 */
export function useSiteSettings() {
  const [settings, setSettings] = useState(SETTINGS_DEFAULTS);

  useEffect(() => {
    let isMounted = true;
    getSiteSettings().then((data) => {
      if (isMounted) setSettings(data);
    });
    return () => {
      isMounted = false;
    };
  }, []);

  return settings;
}
