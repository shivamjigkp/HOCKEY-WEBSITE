import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import Loader from '@/components/Loader/Loader';
import SectionDivider from '@/components/SectionDivider/SectionDivider';
import { useCountdown } from '@/hooks/useCountdown';
import { formatDate, formatTime } from '@/utils/formatDate';
import { getMatches } from '@/services/matches';
import './Matches.css';

const PAGE_SIZE = 6;

function Countdown({ date }) {
  const timeLeft = useCountdown(date);

  if (!timeLeft) {
    return <span className="match-card__countdown match-card__countdown--live">Starting soon</span>;
  }

  return (
    <span className="match-card__countdown">
      {timeLeft.days}d {timeLeft.hours}h {timeLeft.minutes}m {timeLeft.seconds}s
    </span>
  );
}

function MatchCard({ match }) {
  return (
    <div className="match-card">
      <div className="match-card__top">
        <span className="match-card__competition">{match.competition}</span>
        <span
          className={
            match.status === 'upcoming'
              ? 'match-card__status match-card__status--upcoming'
              : 'match-card__status match-card__status--completed'
          }
        >
          {match.status === 'upcoming' ? 'Upcoming' : 'Completed'}
        </span>
      </div>

      <div className="match-card__teams">
        <span className="match-card__team">{match.homeTeam}</span>
        {match.status === 'completed' ? (
          <span className="match-card__score">
            {match.homeScore ?? 'TBC'} – {match.awayScore ?? 'TBC'}
          </span>
        ) : (
          <span className="match-card__vs">vs</span>
        )}
        <span className="match-card__team">{match.awayTeam}</span>
      </div>

      <div className="match-card__meta">
        <span>{formatDate(match.date)}</span>
        <span className="match-card__dot" aria-hidden="true" />
        <span>{formatTime(match.date)}</span>
        <span className="match-card__dot" aria-hidden="true" />
        <span>{match.venue}</span>
      </div>

      {match.status === 'upcoming' && <Countdown date={match.date} />}
    </div>
  );
}

export default function Matches() {
  const [matches, setMatches] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);

  const activeTab = searchParams.get('tab') ?? 'upcoming';

  useEffect(() => {
    let isMounted = true;
    getMatches().then((data) => {
      if (isMounted) {
        setMatches(data);
        setIsLoading(false);
      }
    });
    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    setPage(1);
  }, [activeTab, searchTerm]);

  const tournaments = useMemo(
    () => ['all', ...new Set(matches.map((m) => m.competition))],
    [matches]
  );
  const [tournamentFilter, setTournamentFilter] = useState('all');

  const filteredMatches = useMemo(() => {
    let result = matches.filter((m) => m.status === activeTab);

    if (tournamentFilter !== 'all') {
      result = result.filter((m) => m.competition === tournamentFilter);
    }

    if (searchTerm.trim()) {
      const query = searchTerm.trim().toLowerCase();
      result = result.filter(
        (m) =>
          m.competition.toLowerCase().includes(query) ||
          m.homeTeam.toLowerCase().includes(query) ||
          m.awayTeam.toLowerCase().includes(query)
      );
    }

    return result.sort((a, b) =>
      activeTab === 'upcoming'
        ? new Date(a.date) - new Date(b.date)
        : new Date(b.date) - new Date(a.date)
    );
  }, [matches, activeTab, tournamentFilter, searchTerm]);

  const totalPages = Math.max(1, Math.ceil(filteredMatches.length / PAGE_SIZE));
  const visibleMatches = filteredMatches.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const handleTabChange = (tab) => {
    const next = new URLSearchParams(searchParams);
    if (tab === 'upcoming') next.delete('tab');
    else next.set('tab', tab);
    setSearchParams(next);
  };

  return (
    <div className="matches-page">
      <div className="container">
        <p className="eyebrow">Match Center</p>
        <h1 className="matches-page__title">Matches</h1>
        <SectionDivider />

        <div className="matches-page__tabs" role="tablist">
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'upcoming'}
            className={
              activeTab === 'upcoming'
                ? 'matches-page__tab matches-page__tab--active'
                : 'matches-page__tab'
            }
            onClick={() => handleTabChange('upcoming')}
          >
            Upcoming
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'completed'}
            className={
              activeTab === 'completed'
                ? 'matches-page__tab matches-page__tab--active'
                : 'matches-page__tab'
            }
            onClick={() => handleTabChange('completed')}
          >
            Completed
          </button>
        </div>

        <div className="matches-page__controls">
          <input
            type="search"
            className="matches-page__search"
            placeholder="Search by tournament or team…"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            aria-label="Search matches"
          />
          <select
            className="matches-page__filter"
            value={tournamentFilter}
            onChange={(e) => setTournamentFilter(e.target.value)}
            aria-label="Filter by tournament"
          >
            {tournaments.map((t) => (
              <option key={t} value={t}>
                {t === 'all' ? 'All Tournaments' : t}
              </option>
            ))}
          </select>
        </div>

        {isLoading ? (
          <Loader label="Loading matches" />
        ) : visibleMatches.length === 0 ? (
          <p className="matches-page__empty">No matches found.</p>
        ) : (
          <>
            <div className="matches-page__grid">
              {visibleMatches.map((match) => (
                <MatchCard key={match.id} match={match} />
              ))}
            </div>

            {totalPages > 1 && (
              <div className="matches-page__pagination">
                <button
                  type="button"
                  className="matches-page__page-btn"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                >
                  ← Prev
                </button>
                <span className="matches-page__page-status">
                  Page {page} of {totalPages}
                </span>
                <button
                  type="button"
                  className="matches-page__page-btn"
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                >
                  Next →
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
