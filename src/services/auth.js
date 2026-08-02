import { supabase } from '@/config/supabaseClient';

/**
 * Auth service. Components must go through this file (or AuthContext,
 * which itself only calls this file) — never call `supabase.auth`
 * directly from a component.
 *
 * Role-based access control (see schema_phase7.sql) lives in the
 * `profiles` table, one row per auth user. `getMyProfile` reads the
 * caller's own row; AuthContext calls it after every session change and
 * exposes `role` / `isAdmin` to the rest of the app.
 */

export async function signIn(email, password) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw error;
  return data.session;
}

/**
 * Self-serve sign-up. New accounts get a 'viewer' role automatically via
 * the handle_new_user trigger (schema_phase7.sql / schema_phase12.sql) —
 * nothing here grants admin access, and viewers currently see nothing
 * more than an anonymous visitor already sees (see RLS policies, all
 * gated on is_admin() only). This exists so people have an account to
 * later attach features to (comments, RSVPs, etc.) without a schema
 * change, not because anything today requires being signed in to view.
 *
 * Whether `data.session` comes back populated depends on this Supabase
 * project's Auth settings: if "Confirm email" is off, the user is signed
 * in immediately; if it's on (Supabase's default), session is null until
 * they click the confirmation link, so the caller must handle both.
 */
export async function signUp(email, password, fullName) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { full_name: fullName } },
  });
  if (error) throw error;
  return { session: data.session, needsEmailConfirmation: !data.session };
}

export async function signOut() {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

export async function getSession() {
  const { data, error } = await supabase.auth.getSession();
  if (error) throw error;
  return data.session;
}

export function onAuthStateChange(callback) {
  const { data } = supabase.auth.onAuthStateChange((_event, session) => {
    callback(session);
  });
  return data.subscription.unsubscribe;
}

/**
 * Fetches the caller's own profile row (id, full_name, role). Returns
 * null if the profiles table doesn't have a row yet (shouldn't normally
 * happen — see the on_auth_user_created trigger in schema_phase7.sql —
 * but callers should treat a null role as "not admin", not throw).
 */
export async function getMyProfile(userId) {
  if (!userId) return null;
  const { data, error } = await supabase
    .from('profiles')
    .select('id, full_name, role')
    .eq('id', userId)
    .maybeSingle();

  if (error) throw error;
  return data;
}
