import { NavLink, Outlet } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { ROUTES } from '@/constants/routes';
import './AdminLayout.css';

const ADMIN_LINKS = [
  { label: 'Overview', to: ROUTES.ADMIN, end: true },
  { label: 'News & Announcements', to: ROUTES.ADMIN_NEWS },
  { label: 'Events', to: ROUTES.ADMIN_EVENTS },
  { label: 'Players', to: ROUTES.ADMIN_PLAYERS },
  { label: 'Officials', to: ROUTES.ADMIN_OFFICIALS },
  { label: 'Alumni', to: ROUTES.ADMIN_ALUMNI },
  { label: 'Matches', to: ROUTES.ADMIN_MATCHES },
  { label: 'Gallery', to: ROUTES.GALLERY_MANAGE },
  { label: 'Achievements', to: ROUTES.ADMIN_ACHIEVEMENTS },
  { label: 'Highlight Videos', to: ROUTES.ADMIN_VIDEOS },
  { label: 'Hero Slideshow', to: ROUTES.ADMIN_HERO_SLIDES },
  { label: 'Squad Photos', to: ROUTES.ADMIN_SQUAD_PHOTOS },
  { label: 'Alumni Group Photos', to: ROUTES.ADMIN_ALUMNI_GROUP_PHOTOS },
  { label: 'Roster Highlights', to: ROUTES.ADMIN_ROSTER_HIGHLIGHTS },
  { label: 'Sponsors', to: ROUTES.ADMIN_SPONSORS },
  { label: 'FAQ', to: ROUTES.ADMIN_FAQ },
  { label: 'Contact Messages', to: ROUTES.ADMIN_MESSAGES },
  { label: 'Settings', to: ROUTES.ADMIN_SETTINGS },
];

// Only a superadmin can grant/revoke admin access, so this link is
// appended conditionally below rather than living in ADMIN_LINKS — a
// regular admin should never even see it's an option.
const USERS_LINK = { label: 'Users', to: ROUTES.ADMIN_USERS };

export default function AdminLayout() {
  const { user, isSuperAdmin, signOut } = useAuth();
  const links = isSuperAdmin ? [...ADMIN_LINKS, USERS_LINK] : ADMIN_LINKS;

  return (
    <div className="admin-layout">
      <div className="container admin-layout__inner">
        <aside className="admin-layout__sidebar">
          <p className="eyebrow">Admin</p>
          <p className="admin-layout__user">{user?.email}</p>

          <nav className="admin-layout__nav" aria-label="Admin">
            {links.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                end={link.end}
                className={({ isActive }) =>
                  isActive ? 'admin-layout__link admin-layout__link--active' : 'admin-layout__link'
                }
              >
                {link.label}
              </NavLink>
            ))}
          </nav>

          <button type="button" className="btn btn-outline admin-layout__signout" onClick={signOut}>
            Sign Out
          </button>
        </aside>

        <div className="admin-layout__content">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
