import { useEffect, useState } from 'react';
import { SITE_CONFIG } from '@/constants/siteConfig';
import { getSiteSettings } from '@/services/settings';

const DEFAULTS = {
  contactEmail: SITE_CONFIG.contactEmail,
  instagram: SITE_CONFIG.social.instagram,
  facebook: SITE_CONFIG.social.facebook,
  youtube: SITE_CONFIG.social.youtube,
  themeBgLight: '',
};

/**
 * Returns site settings (contact email, social links), starting from the
 * hardcoded SITE_CONFIG defaults so Footer/Contact always have something
 * to render immediately, then swapping in the live values from Supabase
 * once they load. getSiteSettings() itself never throws — see
 * services/settings.js — so no error state is needed here.
 */
export function useSiteSettings() {
  const [settings, setSettings] = useState(DEFAULTS);

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
