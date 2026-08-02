import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ROUTES } from '@/constants/routes';
import { formatDate, formatTime } from '@/utils/formatDate';
import SectionDivider from '@/components/SectionDivider/SectionDivider';
import { getNextMatch } from '@/services/matches';
import './UpcomingMatch.css';

export default function UpcomingMatch() {
  const [match, setMatch] = useState(null);

  useEffect(() => {
    let isMounted = true;
    getNextMatch().then((data) => {
      if (isMounted) setMatch(data);
    });
    return () => {
      isMounted = false;
    };
  }, []);

  if (!match) return null;

  return (
    <section className="upcoming-match">
      <div className="container">
        <SectionDivider label="Next Match" />

        <div className="upcoming-match__card">
          <p className="upcoming-match__competition">{match.competition}</p>

          <div className="upcoming-match__teams">
            <span className="upcoming-match__team">{match.homeTeam}</span>
            <span className="upcoming-match__vs">vs</span>
            <span className="upcoming-match__team">{match.awayTeam}</span>
          </div>

          <div className="upcoming-match__meta">
            <span>{formatDate(match.date)}</span>
            <span className="upcoming-match__dot" aria-hidden="true" />
            <span>{formatTime(match.date)}</span>
            <span className="upcoming-match__dot" aria-hidden="true" />
            <span>{match.venue}</span>
          </div>

          <Link className="btn btn-primary" to={ROUTES.MATCHES}>
            Full Schedule
          </Link>
        </div>
      </div>
    </section>
  );
}
