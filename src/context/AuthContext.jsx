import { createContext, useEffect, useMemo, useState } from 'react';
import { getMyProfile, getSession, onAuthStateChange, signIn, signOut, signUp } from '@/services/auth';

export const AuthContext = createContext(undefined);

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null);
  const [profile, setProfile] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    async function loadSessionAndProfile() {
      const s = await getSession();
      if (!isMounted) return;
      setSession(s);
      if (s?.user) {
        const p = await getMyProfile(s.user.id).catch(() => null);
        if (isMounted) setProfile(p);
      }
      if (isMounted) setIsLoading(false);
    }

    loadSessionAndProfile();

    const unsubscribe = onAuthStateChange(async (s) => {
      if (!isMounted) return;
      setSession(s);
      if (s?.user) {
        const p = await getMyProfile(s.user.id).catch(() => null);
        if (isMounted) setProfile(p);
      } else {
        setProfile(null);
      }
    });

    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, []);

  const value = useMemo(
    () => ({
      session,
      user: session?.user ?? null,
      isAuthenticated: Boolean(session),
      role: profile?.role ?? null,
      isAdmin: profile?.role === 'admin' || profile?.role === 'superadmin',
      isSuperAdmin: profile?.role === 'superadmin',
      isLoading,
      signIn,
      signUp,
      signOut,
    }),
    [session, profile, isLoading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
