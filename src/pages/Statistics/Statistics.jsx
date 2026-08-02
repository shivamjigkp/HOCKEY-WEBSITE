import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Loader from '@/components/Loader/Loader';
import SectionDivider from '@/components/SectionDivider/SectionDivider';
import { PLAYER_POSITION_LABELS } from '@/constants/playerPositions';
import { ROUTES } from '@/constants/routes';
import { getTeamStatistics } from '@/services/statistics';
import './Statistics.css';

function LeaderboardCard({ title, statLabel, entries }) {
  return (
    <div className="stats-leaderboard">
      <h3 className="stats-leaderboard__title">{title}</h3>
      {entries.length === 0 ? (
        <p className="stats-leaderboard__empty">No data yet.</p>
      ) : (
        <ol className="stats-leaderboard__list">
          {entries.map((entry, index) => (
            <li key={entry.id} className="stats-leaderboard__row">
              <span className="stats-leaderboard__rank">{index + 1}</span>
              <Link
                to={ROUTES.PLAYER_DETAILS.replace(':playerId', entry.id)}
                className="stats-leaderboard__name"
              >
                {entry.name}
              </Link>
              <span className="stats-leaderboard__position">
                {PLAYER_POSITION_LABELS[entry.position] ?? entry.position}
              </span>
              <span className="stats-leaderboard__value">
                {entry.value} {statLabel}
              </span>
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}

export default function Statistics() {
  const [stats, setStats] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    getTeamStatistics().then((data) => {
      if (isMounted) {
        setStats(data);
        setIsLoading(false);
      }
    });

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <div className="statistics-page">
      <div className="container">
        <p className="eyebrow">The Numbers</p>
        <h1 className="statistics-page__title">Statistics</h1>
        <p className="statistics-page__note">
          Computed live from the roster and completed fixtures — nothing here is entered by hand.
        </p>
        <SectionDivider />

        {isLoading ? (
          <Loader label="Loading statistics" />
        ) : (
          <>
            <div className="statistics-page__record">
              <div className="stats-tile">
                <span className="stats-tile__value">{stats.record.played}</span>
                <span className="stats-tile__label">Played</span>
              </div>
              <div className="stats-tile">
                <span className="stats-tile__value">{stats.record.won}</span>
                <span className="stats-tile__label">Won</span>
              </div>
              <div className="stats-tile">
                <span className="stats-tile__value">{stats.record.drawn}</span>
                <span className="stats-tile__label">Drawn</span>
              </div>
              <div className="stats-tile">
                <span className="stats-tile__value">{stats.record.lost}</span>
                <span className="stats-tile__label">Lost</span>
              </div>
              <div className="stats-tile">
                <span className="stats-tile__value">{stats.record.goalsFor}</span>
                <span className="stats-tile__label">Goals For</span>
              </div>
              <div className="stats-tile">
                <span className="stats-tile__value">{stats.record.goalsAgainst}</span>
                <span className="stats-tile__label">Goals Against</span>
              </div>
            </div>

            <div className="statistics-page__leaderboards">
              <LeaderboardCard title="Top Scorers" statLabel="goals" entries={stats.topScorers} />
              <LeaderboardCard title="Top Assists" statLabel="assists" entries={stats.topAssists} />
              <LeaderboardCard
                title="Goalkeepers — Saves"
                statLabel="saves"
                entries={stats.topGoalkeepers}
              />
            </div>
          </>
        )}
      </div>
    </div>
  );
}
