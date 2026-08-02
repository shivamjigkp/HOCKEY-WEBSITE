import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import Loader from '@/components/Loader/Loader';
import { ROUTES } from '@/constants/routes';
import { formatDate, formatTime } from '@/utils/formatDate';
import { getMatchById, getRelatedMatches } from '@/services/matches';
import './MatchDetails.css';

export default function MatchDetails() {
  const { matchId } = useParams();
  const navigate = useNavigate();
  const [match, setMatch] = useState(null);
  const [related, setRelated] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    setIsLoading(true);

    getMatchById(matchId).then((data) => {
      if (!isMounted) return;
      setMatch(data);
      setIsLoading(false);
    });

    getRelatedMatches(matchId).then((data) => {
      if (isMounted) setRelated(data);
    });

    return () => {
      isMounted = false;
    };
  }, [matchId]);

  if (isLoading) {
    return (
      <div className="match-details container">
        <Loader label="Loading match" />
      </div>
    );
  }

  if (!match) {
    return (
      <div className="match-details match-details--empty container">
        <h1>Match not found</h1>
        <p>We couldn&apos;t find a match with that ID.</p>
        <Link className="btn btn-outline" to={ROUTES.MATCHES}>
          Back to Matches
        </Link>
      </div>
    );
  }

  return (
    <div className="match-details">
      <div className="container">
        <button type="button" className="match-details__back" onClick={() => navigate(ROUTES.MATCHES)}>
          ← Back to Matches
        </button>

        <p className="eyebrow">{match.competition}</p>

        <div className="match-details__scoreboard">
          <span className="match-details__team">{match.homeTeam}</span>
          {match.status === 'completed' ? (
            <span className="match-details__score">
              {match.homeScore ?? 'TBC'} – {match.awayScore ?? 'TBC'}
            </span>
          ) : (
            <span className="match-details__vs">vs</span>
          )}
          <span className="match-details__team">{match.awayTeam}</span>
        </div>

        <p className="match-details__meta">
          {formatDate(match.date)} · {formatTime(match.date)} · {match.venue}
        </p>

        <div className="match-details__grid">
          <section className="match-details__section">
            <h2>Officials</h2>
            <p>Referee: {match.officials?.referee ?? 'To be confirmed'}</p>
            <p>Umpires: {match.officials?.umpires ?? 'To be confirmed'}</p>
          </section>

          <section className="match-details__section">
            <h2>Timeline</h2>
            {match.timeline?.length ? (
              <ul>
                {match.timeline.map((event, i) => (
                  <li key={i}>{event}</li>
                ))}
              </ul>
            ) : (
              <p className="match-details__empty">No timeline events added yet.</p>
            )}
          </section>

          <section className="match-details__section">
            <h2>Statistics</h2>
            {match.stats ? (
              <p>{match.stats}</p>
            ) : (
              <p className="match-details__empty">Match statistics not added yet.</p>
            )}
          </section>

          <section className="match-details__section">
            <h2>Gallery &amp; Highlights</h2>
            <p className="match-details__empty">No media added yet.</p>
          </section>
        </div>

        {related.length > 0 && (
          <section className="match-details__related">
            <h2>Related Matches</h2>
            <div className="match-details__related-grid">
              {related.map((m) => (
                <Link
                  key={m.id}
                  to={ROUTES.MATCH_DETAILS.replace(':matchId', m.id)}
                  className="match-details__related-card"
                >
                  <span>{m.competition}</span>
                  <span>{formatDate(m.date)}</span>
                </Link>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
