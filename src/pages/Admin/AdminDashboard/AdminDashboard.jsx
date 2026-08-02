import { Link } from 'react-router-dom';
import { ROUTES } from '@/constants/routes';
import './AdminDashboard.css';

const SHORTCUTS = [
  {
    label: 'News & Announcements',
    description: 'Publish, edit, or remove news posts and announcements.',
    to: ROUTES.ADMIN_NEWS,
  },
  {
    label: 'Events',
    description: 'Manage upcoming and past team events.',
    to: ROUTES.ADMIN_EVENTS,
  },
  {
    label: 'Players',
    description: 'Manage the roster — add, edit, or remove players.',
    to: ROUTES.ADMIN_PLAYERS,
  },
  {
    label: 'Officials',
    description: 'Manage coaching and support staff — add, edit, or remove officials.',
    to: ROUTES.ADMIN_OFFICIALS,
  },
  {
    label: 'Alumni',
    description: 'Manage the alumni directory — add, edit, or remove alumni.',
    to: ROUTES.ADMIN_ALUMNI,
  },
  {
    label: 'Matches',
    description: 'Schedule fixtures and control live scores on matchday.',
    to: ROUTES.ADMIN_MATCHES,
  },
  {
    label: 'Gallery',
    description: 'Create albums and upload or delete photos.',
    to: ROUTES.GALLERY_MANAGE,
  },
  {
    label: 'Hero Slideshow',
    description: 'Manage the large photo slideshow shown on the homepage.',
    to: ROUTES.ADMIN_HERO_SLIDES,
  },
  {
    label: 'Squad Photos',
    description: 'Add/remove group photo containers (year & section) and manage their slideshow.',
    to: ROUTES.ADMIN_SQUAD_PHOTOS,
  },
  {
    label: 'Achievements',
    description: 'Manage tournament records and University/Team/Player/Coach achievements.',
    to: ROUTES.ADMIN_ACHIEVEMENTS,
  },
  {
    label: 'Sponsors',
    description: 'Add, edit, or remove sponsor logos shown in the footer.',
    to: ROUTES.ADMIN_SPONSORS,
  },
  {
    label: 'FAQ',
    description: 'Manage the questions and answers shown on the FAQ page.',
    to: ROUTES.ADMIN_FAQ,
  },
  {
    label: 'Contact Messages',
    description: 'Review and manage submissions from the public Contact form.',
    to: ROUTES.ADMIN_MESSAGES,
  },
  {
    label: 'Highlight Videos',
    description: 'Add, edit, or remove match highlight videos.',
    to: ROUTES.ADMIN_VIDEOS,
  },
];

export default function AdminDashboard() {
  return (
    <div className="admin-dashboard">
      <p className="eyebrow">Dashboard</p>
      <h1 className="admin-dashboard__title">Welcome back</h1>
      <p className="admin-dashboard__subtitle">
        Manage the site&apos;s content from here.
      </p>

      <div className="admin-dashboard__grid">
        {SHORTCUTS.map((s) => (
          <Link key={s.to} to={s.to} className="admin-dashboard__card">
            <h3>{s.label}</h3>
            <p>{s.description}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
