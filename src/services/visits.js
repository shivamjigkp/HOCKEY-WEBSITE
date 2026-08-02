import { supabase } from '@/config/supabaseClient';

/** Current count, without incrementing (used if a component just needs to display it). */
export async function getVisitCount() {
  const { data, error } = await supabase.from('site_visits').select('count').eq('id', 1).single();
  if (error) throw error;
  return data.count;
}

/**
 * Increments the count by 1 and returns the new total. Calls the
 * increment_visit_count() RPC (security definer) rather than updating
 * the table directly — anonymous visitors can't write to site_visits at
 * all under RLS, only call this function.
 */
export async function incrementVisitCount() {
  const { data, error } = await supabase.rpc('increment_visit_count');
  if (error) throw error;
  return data;
}
