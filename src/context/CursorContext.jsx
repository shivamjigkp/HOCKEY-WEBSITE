import { createContext, useEffect, useMemo, useState } from 'react';

export const CursorContext = createContext(undefined);

const STORAGE_KEY = 'hockey-cursor-fx';

/**
 * Cursor effects (MASTER_PROMPT "CURSOR EFFECTS" section) only make sense
 * on devices with a precise pointer, and should respect a user's motion
 * preference. `supportsCursorFx()` is the one-time capability check;
 * the on/off *preference* on top of that is what gets persisted.
 */
function supportsCursorFx() {
  if (typeof window === 'undefined') return false;
  const hasFinePointer = window.matchMedia?.('(pointer: fine)').matches;
  const prefersReducedMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
  return Boolean(hasFinePointer) && !prefersReducedMotion;
}

function getInitialPreference() {
  if (typeof window === 'undefined') return false;
  const stored = window.localStorage.getItem(STORAGE_KEY);
  if (stored === 'on' || stored === 'off') return stored === 'on';
  return true; // default on for capable devices; actual rendering still gated by supportsCursorFx()
}

export function CursorProvider({ children }) {
  const [isSupported] = useState(supportsCursorFx);
  const [isEnabled, setIsEnabled] = useState(getInitialPreference);

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, isEnabled ? 'on' : 'off');
  }, [isEnabled]);

  const value = useMemo(
    () => ({
      isActive: isSupported && isEnabled,
      isSupported,
      isEnabled,
      toggleCursorFx: () => setIsEnabled((prev) => !prev),
    }),
    [isSupported, isEnabled]
  );

  return <CursorContext.Provider value={value}>{children}</CursorContext.Provider>;
}
