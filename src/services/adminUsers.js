import { supabase } from '@/config/supabaseClient';

/**
 * Admin user management. Separate from services/auth.js (which only
 * handles the *current* user's own session/profile) because this reads
 * and writes *other* users' profiles — an admin-only capability gated by
 * the "Admins can read all profiles" / "Admins can update roles" RLS
 * policies in schema_phase7.sql.
 */

const VALID_ROLES = ['viewer', 'editor', 'admin'];

export async function listProfiles() {
  const { data, error } = await supabase
    .from('profiles')
    .select('id, email, full_name, role, created_at')
    .order('created_at', { ascending: true });

  if (error) throw error;
  return data;
}

export async function updateUserRole(userId, role) {
  if (!VALID_ROLES.includes(role)) {
    throw new Error(`Invalid role "${role}".`);
  }

  const { data, error } = await supabase
    .from('profiles')
    .update({ role })
    .eq('id', userId)
    .select()
    .single();

  if (error) throw error;
  return data;
}
