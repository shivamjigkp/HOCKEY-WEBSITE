import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Loader from '@/components/Loader/Loader';
import SectionDivider from '@/components/SectionDivider/SectionDivider';
import { ROUTES } from '@/constants/routes';
import { formatDate } from '@/utils/formatDate';
import { getCompletedMatches } from '@/services/matches';
import './Results.css';

function getMargin(match) {
  if (match.homeScore == null || match.awayScore == null) return null;
  const diff = Math.abs(match.homeScore - match.awayScore);
  if (diff === 0) return 'Draw';
  const winner = match.homeScore > match.awayScore ? match.homeTeam : match.awayTeam;
  return `${winner} won by ${diff}`;
}

export default function Results() {
  const [results, setResults] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    getCompletedMatches().then((data) => {
      if (isMounted) {
        setResults(data);
        setIsLoading(false);
      }
    });
    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <div className="results-page">
      <div className="container">
        <p className="eyebrow">Match Center</p>
        <h1 className="results-page__title">Results</h1>
        <Link to={ROUTES.TOURNAMENT_HISTORY} className="results-page__history-link">
          View full Tournament History →
        </Link>
        <SectionDivider />

        {isLoading ? (
          <Loader label="Loading results" />
        ) : results.length === 0 ? (
          <p className="results-page__empty">No results recorded yet.</p>
        ) : (
          <div className="results-page__list">
            {results.map((match) => (
              <div key={match.id} className="result-row">
                <div className="result-row__meta">
                  <span className="result-row__competition">{match.competition}</span>
                  <span className="result-row__date">{formatDate(match.date)}</span>
                </div>

                <div className="result-row__score">
                  <span>{match.homeTeam}</span>
                  <span className="result-row__score-value">
                    {match.homeScore ?? 'TBC'} – {match.awayScore ?? 'TBC'}
                  </span>
                  <span>{match.awayTeam}</span>
                </div>

                <p className="result-row__margin">
                  {getMargin(match) ?? 'Score to be confirmed'}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
