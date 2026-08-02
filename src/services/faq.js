import { supabase } from '@/config/supabaseClient';

/**
 * FAQ data service. Components import from here only — never call
 * `supabase.from('faqs')` directly.
 *
 * Backed by Supabase as of Phase 10 (see supabase/schema_phase10.sql).
 * Previously the FAQ page imported src/features/faq/data/faqSeedData.js
 * directly, bypassing the service-layer pattern every other page follows —
 * this file closes that gap.
 */

function mapRow(row) {
  if (!row) return null;
  return {
    id: row.id,
    question: row.question,
    answer: row.answer,
    sortOrder: row.sort_order,
  };
}

export async function getFaqs() {
  const { data, error } = await supabase.from('faqs').select('*').order('sort_order');
  if (error) throw error;
  return data.map(mapRow);
}

// ---------------------------------------------------------------------------
// Admin CRUD (Admin Dashboard only — gated by requireAdmin ProtectedRoute
// and by the "Admins can manage FAQs" RLS policy)
// ---------------------------------------------------------------------------

export async function createFaq({ question, answer, sortOrder }) {
  const { data, error } = await supabase
    .from('faqs')
    .insert({ question, answer, sort_order: sortOrder ?? 0 })
    .select()
    .single();

  if (error) throw error;
  return mapRow(data);
}

export async function updateFaq(id, payload) {
  const { data, error } = await supabase
    .from('faqs')
    .update({
      question: payload.question,
      answer: payload.answer,
      sort_order: payload.sortOrder ?? 0,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return mapRow(data);
}

export async function deleteFaq(id) {
  const { error } = await supabase.from('faqs').delete().eq('id', id);
  if (error) throw error;
}
