import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { ROUTES } from '@/constants/routes';
import { useAuth } from '@/hooks/useAuth';
import ThemeToggle from '@/components/ThemeToggle/ThemeToggle';
import CursorToggle from '@/components/CursorToggle/CursorToggle';
import logo from '@/assets/images/mmmut-hockey-logo.png';
import './Navbar.css';

// Everything not listed here (Achievements, Statistics, News, Events,
// About, FAQ, Contact) still lives in the Footer's Quick Links / Useful
// Links columns — this is deliberately just the primary wayfinding set.
const PRIMARY_LINKS = [
  { label: 'Home', to: ROUTES.HOME },
  { label: 'Officials', to: ROUTES.OFFICIALS },
  {
    label: 'Matches',
    to: ROUTES.MATCHES,
    children: [
      { label: 'Live', to: ROUTES.LIVE },
      { label: 'Highlights', to: ROUTES.VIDEOS },
      { label: 'Results', to: ROUTES.RESULTS },
    ],
  },
  { label: 'Tournament History', to: ROUTES.TOURNAMENT_HISTORY },
  { label: 'Players', to: ROUTES.PLAYERS },
  { label: 'Alumni', to: ROUTES.ALUMNI },
  { label: 'Gallery', to: ROUTES.GALLERY },
];

export default function Navbar() {
  const { isAuthenticated, isAdmin, signOut } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const closeMenu = () => setIsMenuOpen(false);

  function handleSignOut() {
    closeMenu();
    signOut();
  }

  return (
    <header className="navbar">
      <div className="container navbar__inner">
        <NavLink to={ROUTES.HOME} className="navbar__brand" onClick={closeMenu}>
          <img className="navbar__brand-mark" src={logo} alt="" aria-hidden="true" />
          <span className="navbar__brand-text">
            MMMUT <strong>Hockey</strong>
          </span>
        </NavLink>

        <nav className="navbar__links hide-mobile" aria-label="Primary">
          {PRIMARY_LINKS.map((link) =>
            link.children ? (
              <div className="nav-dropdown" key={link.to}>
                <NavLink
                  to={link.to}
                  className={({ isActive }) =>
                    isActive ? 'navbar__link navbar__link--active' : 'navbar__link'
                  }
                >
                  {link.label}
                  <span className="nav-dropdown__caret" aria-hidden="true">
                    ▾
                  </span>
                </NavLink>
                <div className="nav-dropdown__panel" role="menu">
                  {link.children.map((child) => (
                    <NavLink
                      key={child.to}
                      to={child.to}
                      className="nav-dropdown__item"
                      role="menuitem"
                    >
                      {child.label}
                    </NavLink>
                  ))}
                </div>
              </div>
            ) : (
              <NavLink
                key={link.to}
                to={link.to}
                className={({ isActive }) =>
                  isActive ? 'navbar__link navbar__link--active' : 'navbar__link'
                }
              >
                {link.label}
              </NavLink>
            )
          )}
        </nav>

        <div className="navbar__actions">
          <ThemeToggle />
          <span className="hide-mobile">
            <CursorToggle />
          </span>
          {isAuthenticated ? (
            <>
              {isAdmin && (
                <NavLink to={ROUTES.ADMIN} className="btn btn-outline hide-mobile">
                  Admin
                </NavLink>
              )}
              <button type="button" className="btn btn-outline hide-mobile" onClick={handleSignOut}>
                Sign Out
              </button>
            </>
          ) : (
            <NavLink to={ROUTES.LOGIN} className="btn btn-outline hide-mobile">
              Login
            </NavLink>
          )}

          <button
            type="button"
            className="navbar__burger show-mobile"
            aria-label={isMenuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={isMenuOpen}
            onClick={() => setIsMenuOpen((prev) => !prev)}
          >
            <span />
            <span />
            <span />
          </button>
        </div>
      </div>

      {isMenuOpen && (
        <nav className="navbar__mobile-menu show-mobile" aria-label="Mobile">
          {PRIMARY_LINKS.map((link) => (
            <div key={link.to} className="navbar__mobile-group">
              <NavLink
                to={link.to}
                className={({ isActive }) =>
                  isActive
                    ? 'navbar__mobile-link navbar__mobile-link--active'
                    : 'navbar__mobile-link'
                }
                onClick={closeMenu}
              >
                {link.label}
              </NavLink>
              {link.children && (
                <div className="navbar__mobile-submenu">
                  {link.children.map((child) => (
                    <NavLink
                      key={child.to}
                      to={child.to}
                      className="navbar__mobile-sublink"
                      onClick={closeMenu}
                    >
                      {child.label}
                    </NavLink>
                  ))}
                </div>
              )}
            </div>
          ))}
          {isAuthenticated ? (
            <>
              {isAdmin && (
                <NavLink to={ROUTES.ADMIN} className="btn btn-outline" onClick={closeMenu}>
                  Admin
                </NavLink>
              )}
              <button type="button" className="btn btn-primary" onClick={handleSignOut}>
                Sign Out
              </button>
            </>
          ) : (
            <NavLink to={ROUTES.LOGIN} className="btn btn-primary" onClick={closeMenu}>
              Login
            </NavLink>
          )}
        </nav>
      )}
    </header>
  );
}
