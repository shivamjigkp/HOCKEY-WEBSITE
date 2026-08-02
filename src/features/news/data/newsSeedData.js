/**
 * ⚠️ PLACEHOLDER CONTENT — headlines, dates, and body copy below are
 * illustrative only, not real published stories.
 *
 * TODO (blocking before production launch): replace with real posts.
 * `src/services/news.js` is the only file that should import this.
 *
 * `type` accepts 'news' | 'announcement'. Both share one feed/detail view;
 * announcements are just visually flagged and can be filtered separately.
 */

export const NEWS_SEED = [
  {
    id: 'n1',
    type: 'announcement',
    title: 'Trials for the 2026-27 Season Now Open',
    slug: 'trials-2026-27-season-open',
    excerpt:
      'Registration for this season\u2019s team trials is now open to all MMMUT students. Selection dates and venue details inside.',
    body: `Registration for the 2026-27 hockey season trials is now open to all currently enrolled MMMUT students, regardless of prior experience level.

Trials will run across three sessions to accommodate class schedules. Bring your own stick if you have one; a limited number of loaner sticks will be available on a first-come basis.

Students should report to the MMMUT Hockey Ground with a valid ID and sports shoes suitable for turf. Selected players will be added to the practice roster and notified via the official Instagram page and email.`,
    coverImage: '',
    author: 'Team Management',
    publishedAt: '2026-07-20T09:00:00',
  },
  {
    id: 'n2',
    type: 'news',
    title: 'MMMUT Hockey Opens Malaviya Hockey League Campaign',
    slug: 'mhl-campaign-opener',
    excerpt:
      'The squad kicks off its Malaviya Hockey League campaign this month with a home fixture at the MMMUT Hockey Ground.',
    body: `The team enters this year's Malaviya Hockey League with a refreshed squad following the spring trials, and coaching staff have emphasized a faster transition game after off-season conditioning.

Home fixtures will be played at the MMMUT Hockey Ground, with the opening match scheduled for later this month. The team encourages students, faculty, and alumni to come support from the sidelines.

Fixture details, live score updates, and results will be posted on the Matches and Live pages as the tournament progresses.`,
    coverImage: '',
    author: 'Team Management',
    publishedAt: '2026-07-10T14:30:00',
  },
  {
    id: 'n3',
    type: 'announcement',
    title: 'Ground Maintenance: Practice Sessions Shifted This Week',
    slug: 'ground-maintenance-practice-shift',
    excerpt:
      'Routine turf maintenance means practice sessions move to the secondary ground for the remainder of the week.',
    body: `Routine turf maintenance is scheduled at the MMMUT Hockey Ground this week. To avoid disruption, practice sessions will temporarily move to the secondary ground near the sports complex.

Timings remain unchanged. Players should check the group announcement channel for the exact secondary ground location before each session.

Normal ground access resumes the following Monday.`,
    coverImage: '',
    author: 'Team Management',
    publishedAt: '2026-06-28T08:00:00',
  },
  {
    id: 'n4',
    type: 'news',
    title: 'Alumni Match Draws Strong Turnout',
    slug: 'alumni-match-turnout',
    excerpt:
      'Former players returned to the pitch for the annual alumni exhibition match, followed by a felicitation for past captains.',
    body: `The annual alumni exhibition match saw a strong turnout of former players returning to the MMMUT Hockey Ground, many meeting current squad members for the first time.

The evening included a short felicitation ceremony recognizing past team captains for their contribution to the program, followed by the exhibition match itself.

Photos from the event are available on the Gallery page.`,
    coverImage: '',
    author: 'Team Management',
    publishedAt: '2026-05-15T18:00:00',
  },
];
