import { useEffect, useState } from 'react';

/**
 * useState that persists to localStorage. Safe for SSR-less Vite apps
 * (browser only). Value is JSON serialized.
 */
export function useLocalStorageState(key, defaultValue) {
  const [value, setValue] = useState(() => {
    try {
      const stored = window.localStorage.getItem(key);
      return stored ? JSON.parse(stored) : defaultValue;
    } catch {
      return defaultValue;
    }
  });

  useEffect(() => {
    try {
      window.localStorage.setItem(key, JSON.stringify(value));
    } catch {
      // Storage full or unavailable — fail silently, state still works in-memory.
    }
  }, [key, value]);

  return [value, setValue];
}
