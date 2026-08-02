// ⚠️ SUPERSEDED as of Phase 10 — FAQ content now lives in Supabase
// (see supabase/schema_phase10.sql, src/services/faq.js). Nothing
// imports this file anymore; kept only for history.

export const FAQ_SEED = [
  {
    id: 'f1',
    question: 'Who can try out for the MMMUT Hockey team?',
    answer:
      'Any currently enrolled MMMUT student can try out, regardless of branch, year, or prior hockey experience. Trial dates are announced on the News page and the official Instagram page.',
  },
  {
    id: 'f2',
    question: 'Do I need my own hockey stick to try out?',
    answer:
      'No — a limited number of loaner sticks are available at trials on a first-come basis, though bringing your own is welcome if you have one.',
  },
  {
    id: 'f3',
    question: 'Where does the team practice?',
    answer:
      'Regular practice sessions are held at the MMMUT Hockey Ground. Occasionally, sessions shift to the secondary ground near the sports complex for turf maintenance — any such changes are posted under Announcements.',
  },
  {
    id: 'f4',
    question: 'How can I follow match schedules and live scores?',
    answer:
      'The Matches page lists upcoming and completed fixtures, and the Live page shows real-time score updates whenever a match is in progress.',
  },
  {
    id: 'f5',
    question: 'Is the team looking for sponsors?',
    answer:
      'Yes. If your organization is interested in sponsoring MMMUT Hockey, please reach out via the Contact page or email us directly.',
  },
  {
    id: 'f6',
    question: 'How do I get event photos or team media?',
    answer:
      'Photos from matches, trials, and events are posted on the Gallery page, organized by album.',
  },
];
