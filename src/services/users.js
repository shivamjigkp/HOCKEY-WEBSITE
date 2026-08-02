import { supabase } from '@/config/supabaseClient';

/**
 * User/role management service. Superadmin-only — gated in the UI by
 * ProtectedRoute's requireSuperAdmin, and enforced server-side by the
 * "Superadmins can update roles" RLS policy (schema_phase22.sql). A
 * regular admin calling setUserRole will get an RLS error, not a UI
 * bug — don't rely on hiding the button alone.
 */

export async function getAllUsers() {
  const { data, error } = await supabase
    .from('profiles')
    .select('id, email, full_name, role, created_at')
    .order('created_at');

  if (error) throw error;
  return data;
}

/**
 * @param {string} userId
 * @param {'viewer'|'editor'|'admin'|'superadmin'} role
 */
export async function setUserRole(userId, role) {
  const { data, error } = await supabase
    .from('profiles')
    .update({ role })
    .eq('id', userId)
    .select()
    .single();

  if (error) throw error;
  return data;
}
