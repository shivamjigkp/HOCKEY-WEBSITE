import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Loader from '@/components/Loader/Loader';
import SectionDivider from '@/components/SectionDivider/SectionDivider';
import { ROUTES } from '@/constants/routes';
import { formatDate, formatTime } from '@/utils/formatDate';
import { getLiveMatch, getNextMatch } from '@/services/matches';
import './Live.css';

// How often to re-check for a live match while this page is open.
// Short enough to feel "live", long enough not to hammer the backend once
// this swaps from seed data to Supabase (ideally Realtime, later).
const POLL_INTERVAL_MS = 15000;

function LiveScoreboard({ match }) {
  return (
    <div className="live-scoreboard">
      <div className="live-scoreboard__badge">
        <span className="live-scoreboard__pulse" aria-hidden="true" />
        Live
      </div>

      <p className="live-scoreboard__competition">{match.competition}</p>

      <div className="live-scoreboard__teams">
        <span className="live-scoreboard__team">{match.homeTeam}</span>
        <span className="live-scoreboard__score">
          {match.homeScore ?? 0}
          <span className="live-scoreboard__score-sep">–</span>
          {match.awayScore ?? 0}
        </span>
        <span className="live-scoreboard__team">{match.awayTeam}</span>
      </div>

      <div className="live-scoreboard__status">
        {match.period && <span>{match.period}</span>}
        {match.matchClock && (
          <span className="live-scoreboard__clock">{match.matchClock}</span>
        )}
      </div>

      <p className="live-scoreboard__venue">{match.venue}</p>
    </div>
  );
}

function NoLiveMatch({ nextMatch }) {
  return (
    <div className="live-empty">
      <p className="live-empty__title">No match is live right now.</p>
      <p className="live-empty__subtitle">
        Check back on matchday for live scores. Video streaming is coming soon.
      </p>

      {nextMatch && (
        <div className="live-empty__next">
          <p className="live-empty__next-label">Next up</p>
          <p className="live-empty__next-teams">
            {nextMatch.homeTeam} vs {nextMatch.awayTeam}
          </p>
          <p className="live-empty__next-meta">
            {formatDate(nextMatch.date)} · {formatTime(nextMatch.date)} ·{' '}
            {nextMatch.venue}
          </p>
        </div>
      )}

      <Link to={ROUTES.MATCHES} className="btn btn-outline">
        View all matches
      </Link>
    </div>
  );
}

export default function Live() {
  const [liveMatch, setLiveMatch] = useState(null);
  const [nextMatch, setNextMatch] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    async function refresh() {
      const [live, next] = await Promise.all([getLiveMatch(), getNextMatch()]);
      if (!isMounted) return;
      setLiveMatch(live);
      setNextMatch(next);
      setIsLoading(false);
    }

    refresh();
    const intervalId = setInterval(refresh, POLL_INTERVAL_MS);

    return () => {
      isMounted = false;
      clearInterval(intervalId);
    };
  }, []);

  return (
    <div className="live-page">
      <div className="container">
        <p className="eyebrow">Match Center</p>
        <h1 className="live-page__title">Live</h1>
        <SectionDivider />

        {isLoading ? (
          <Loader label="Checking for a live match" />
        ) : liveMatch ? (
          <LiveScoreboard match={liveMatch} />
        ) : (
          <NoLiveMatch nextMatch={nextMatch} />
        )}
      </div>
    </div>
  );
}
