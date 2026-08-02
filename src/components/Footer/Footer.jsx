import { useEffect, useState } from 'react';
import { NavLink } from 'react-router-dom';
import { ROUTES } from '@/constants/routes';
import { useSiteSettings } from '@/hooks/useSiteSettings';
import SponsorsStrip from '@/components/SponsorsStrip/SponsorsStrip';
import { getVisitCount, incrementVisitCount } from '@/services/visits';
import logo from '@/assets/images/mmmut-hockey-logo.png';
import './Footer.css';

// Deliberately excludes anything already directly visible in the navbar
// (Home, Officials, Matches/Live/Highlights/Results, Tournament History,
// Players, Alumni, Gallery) — a footer link to something one click away
// in the header is just noise.
const QUICK_LINKS = [
  { label: 'Statistics', to: ROUTES.STATISTICS },
  { label: 'Achievements', to: ROUTES.ACHIEVEMENTS },
  { label: 'News', to: ROUTES.NEWS },
  { label: 'Events', to: ROUTES.EVENTS },
];

const USEFUL_LINKS = [
  { label: 'About', to: ROUTES.ABOUT },
  { label: 'FAQ', to: ROUTES.FAQ },
  { label: 'Contact', to: ROUTES.CONTACT },
];

export default function Footer() {
  const year = new Date().getFullYear();
  const settings = useSiteSettings();
  const [visitCount, setVisitCount] = useState(null);
  const socialLinks = [
    { label: 'Instagram', href: settings.instagram },
    { label: 'Facebook', href: settings.facebook },
    { label: 'YouTube', href: settings.youtube },
  ];

  useEffect(() => {
    let isMounted = true;
    const alreadyCountedThisSession = sessionStorage.getItem('mmmut_visit_counted');

    const promise = alreadyCountedThisSession
      ? getVisitCount()
      : incrementVisitCount().then((count) => {
          sessionStorage.setItem('mmmut_visit_counted', '1');
          return count;
        });

    promise
      .then((count) => {
        if (isMounted) setVisitCount(count);
      })
      .catch(() => {});

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <footer className="footer">
      <div className="container">
        <SponsorsStrip />
      </div>
      <div className="container footer__grid">
        <div className="footer__col footer__brand">
          <img className="footer__brand-mark" src={logo} alt="" aria-hidden="true" />
          <p>
            MMMUT <strong>Hockey</strong>
          </p>
          <p className="footer__tagline">
            Official hockey program of MMMUT, Gorakhpur — schedules, results, and stories from the field.
          </p>
          <a className="footer__email" href={`mailto:${settings.contactEmail}`}>
            {settings.contactEmail}
          </a>
          <div className="footer__social">
            {socialLinks.map((link) => (
              <a key={link.label} href={link.href} target="_blank" rel="noreferrer noopener">
                {link.label}
              </a>
            ))}
          </div>
        </div>

        <div className="footer__col">
          <h4 className="footer__heading">Quick Links</h4>
          <ul>
            {QUICK_LINKS.map((link) => (
              <li key={link.to}>
                <NavLink to={link.to}>{link.label}</NavLink>
              </li>
            ))}
          </ul>
        </div>

        <div className="footer__col">
          <h4 className="footer__heading">Useful Links</h4>
          <ul>
            {USEFUL_LINKS.map((link) => (
              <li key={link.to}>
                <NavLink to={link.to}>{link.label}</NavLink>
              </li>
            ))}
          </ul>
        </div>

        <div className="footer__col">
          <h4 className="footer__heading">Legal</h4>
          <ul>
            <li>
              <NavLink to="/privacy-policy">Privacy Policy</NavLink>
            </li>
            <li>
              <NavLink to="/terms">Terms &amp; Conditions</NavLink>
            </li>
          </ul>
        </div>
      </div>

      <div className="container footer__bottom">
        <p>&copy; {year} MMMUT Hockey, Gorakhpur. All rights reserved.</p>
        <p className="footer__credits">
          Designed by{' '}
          <a
            href="https://linkedin.com/in/shivam-gupta-05209a27b"
            target="_blank"
            rel="noreferrer noopener"
          >
            Shivam Gupta
          </a>
          , Hockey Technical Member Head
        </p>
        {visitCount != null && (
          <p className="footer__visits">{visitCount.toLocaleString()} visits</p>
        )}
      </div>
    </footer>
  );
}
