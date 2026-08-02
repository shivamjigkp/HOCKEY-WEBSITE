import { supabase } from '@/config/supabaseClient';
import { SITE_CONFIG } from '@/constants/siteConfig';

/**
 * Contact form service.
 *
 * As of Phase 10, submissions are stored in Supabase (see
 * supabase/schema_phase10.sql — public.contact_messages) so the team can
 * actually review them from the Admin Dashboard, instead of only opening
 * the visitor's email client and hoping they hit send.
 *
 * If the insert fails for any reason (offline, RLS misconfigured, etc.),
 * this falls back to the original mailto: behavior so the message is
 * never silently lost — the Contact page only calls this function, never
 * window.location or `supabase.from('contact_messages')` directly.
 */
export async function submitContactForm({ name, email, subject, message }) {
  const { error } = await supabase.from('contact_messages').insert({
    name,
    email,
    subject: subject || null,
    message,
  });

  if (!error) {
    return { ok: true, method: 'database' };
  }

  const body = `Name: ${name}\nEmail: ${email}\n\n${message}`;
  const mailto = `mailto:${SITE_CONFIG.contactEmail}?subject=${encodeURIComponent(
    subject || 'Website Contact Form'
  )}&body=${encodeURIComponent(body)}`;

  window.location.href = mailto;
  return { ok: true, method: 'mailto' };
}

// ---------------------------------------------------------------------------
// Admin (Admin Dashboard only — gated by requireAdmin ProtectedRoute and by
// the "Admins can read/update/delete contact messages" RLS policies)
// ---------------------------------------------------------------------------

export async function getContactMessages() {
  const { data, error } = await supabase
    .from('contact_messages')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
}

export async function markContactMessageRead(id, isRead = true) {
  const { error } = await supabase
    .from('contact_messages')
    .update({ is_read: isRead })
    .eq('id', id);

  if (error) throw error;
}

export async function deleteContactMessage(id) {
  const { error } = await supabase.from('contact_messages').delete().eq('id', id);
  if (error) throw error;
}
