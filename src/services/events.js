import { supabase } from '@/config/supabaseClient';

/**
 * Events data service. Components import from here only — never call
 * `supabase.from('events')` directly.
 *
 * Backed by Supabase as of Phase 7 (see supabase/schema_phase7.sql).
 * Public reads are open to everyone; create/update/delete requires the
 * admin role and will fail under RLS otherwise.
 */

export async function getEvents() {
  const { data, error } = await supabase
    .from('events')
    .select('*')
    .order('event_date', { ascending: true });

  if (error) throw error;
  return data;
}

export async function getUpcomingEvents() {
  const { data, error } = await supabase
    .from('events')
    .select('*')
    .gte('event_date', new Date().toISOString())
    .order('event_date', { ascending: true });

  if (error) throw error;
  return data;
}

export async function getPastEvents() {
  const { data, error } = await supabase
    .from('events')
    .select('*')
    .lt('event_date', new Date().toISOString())
    .order('event_date', { ascending: false });

  if (error) throw error;
  return data;
}

// ---------------------------------------------------------------------------
// Admin CRUD (Admin Dashboard only — gated by requireAdmin ProtectedRoute
// and by the "Admins can manage events" RLS policy)
// ---------------------------------------------------------------------------

export async function createEvent({ title, description, venue, eventDate }) {
  const { data, error } = await supabase
    .from('events')
    .insert({ title, description, venue, event_date: eventDate })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updateEvent(id, { title, description, venue, eventDate }) {
  const { data, error } = await supabase
    .from('events')
    .update({
      title,
      description,
      venue,
      event_date: eventDate,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function deleteEvent(id) {
  const { error } = await supabase.from('events').delete().eq('id', id);
  if (error) throw error;
}
