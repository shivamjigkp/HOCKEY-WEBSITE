import { createContext, useEffect, useMemo, useState } from 'react';
import { useSiteSettings } from '@/hooks/useSiteSettings';

export const ThemeContext = createContext(undefined);

const STORAGE_KEY = 'hockey-theme';

function getInitialTheme() {
  if (typeof window === 'undefined') return 'light';

  const stored = window.localStorage.getItem(STORAGE_KEY);
  if (stored === 'light' || stored === 'dark') return stored;

  const prefersDark = window.matchMedia?.('(prefers-color-scheme: dark)').matches;
  return prefersDark ? 'dark' : 'light';
}

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(getInitialTheme);
  // Admin > Settings > Appearance lets an admin pick a custom light-mode
  // background color, stored in site_settings (key: theme_bg_light) —
  // see src/services/settings.js. useSiteSettings() is safe to call here:
  // getSiteSettings() never throws, so this can't break theming if the
  // setting hasn't been configured or Supabase is briefly unreachable.
  const { themeBgLight } = useSiteSettings();

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    window.localStorage.setItem(STORAGE_KEY, theme);
  }, [theme]);

  useEffect(() => {
    // Only overrides the light-mode background; dark mode always uses the
    // fixed --pitch-charcoal tokens. Clearing the setting (empty string)
    // removes the inline override so the default token takes back over.
    if (theme === 'light' && themeBgLight) {
      document.documentElement.style.setProperty('--color-bg', themeBgLight);
    } else {
      document.documentElement.style.removeProperty('--color-bg');
    }
  }, [theme, themeBgLight]);

  const value = useMemo(
    () => ({
      theme,
      isDark: theme === 'dark',
      toggleTheme: () => setTheme((prev) => (prev === 'light' ? 'dark' : 'light')),
      setTheme,
    }),
    [theme]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}
