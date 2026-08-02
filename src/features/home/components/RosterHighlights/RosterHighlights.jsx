import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ROUTES } from '@/constants/routes';
import SectionDivider from '@/components/SectionDivider/SectionDivider';
import Loader from '@/components/Loader/Loader';
import { getActiveRosterHighlights } from '@/services/rosterHighlights';
import './RosterHighlights.css';

/**
 * Homepage "THE ROSTER" section. Entirely admin-controlled — see
 * Admin > Roster Highlights (src/pages/Admin/RosterHighlightsManage) and
 * services/rosterHighlights.js. Renders nothing while empty (no entries
 * added yet, or the migration hasn't been applied), so it never shows a
 * broken/empty section on a fresh install.
 */
export default function RosterHighlights() {
  const [highlights, setHighlights] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    getActiveRosterHighlights().then((data) => {
      if (isMounted) {
        setHighlights(data);
        setIsLoading(false);
      }
    });

    return () => {
      isMounted = false;
    };
  }, []);

  if (!isLoading && highlights.length === 0) return null;

  return (
    <section className="roster-highlights">
      <div className="container">
        <SectionDivider label="The Roster" />

        {isLoading ? (
          <Loader label="Loading roster" />
        ) : (
          <div className="roster-highlights__grid">
            {highlights.map((person) => (
              <div key={person.id} className="roster-highlights__card">
                <img
                  className="roster-highlights__photo"
                  src={person.url}
                  alt={person.name}
                  loading="lazy"
                />
                <p className="roster-highlights__name">{person.name}</p>
                {person.branch && <p className="roster-highlights__branch">{person.branch}</p>}
                <p className="roster-highlights__role">{person.role}</p>
              </div>
            ))}
          </div>
        )}

        <div className="roster-highlights__cta">
          <Link className="btn btn-outline" to={ROUTES.PLAYERS}>
            View Full Roster
          </Link>
        </div>
      </div>
    </section>
  );
}
