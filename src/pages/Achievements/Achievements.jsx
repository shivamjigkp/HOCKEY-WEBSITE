import { useEffect, useState } from 'react';
import SectionDivider from '@/components/SectionDivider/SectionDivider';
import Loader from '@/components/Loader/Loader';
import { getAchievements } from '@/services/achievements';
import './Achievements.css';

function Pending() {
  return <span className="achievements-badge achievements-badge--pending">To be confirmed</span>;
}

function EmptyCategory({ label }) {
  return <p className="achievements-page__empty">No {label.toLowerCase()} added yet.</p>;
}

function TournamentGrid({ tournaments }) {
  return (
    <div className="achievements-page__internal-grid">
      {tournaments.map((tournament) => (
        <div key={tournament.id} className="achievements-card">
          <h3 className="achievements-card__title">{tournament.name}</h3>
          {tournament.description && (
            <p className="achievements-card__desc">{tournament.description}</p>
          )}
          <ul className="achievements-card__records">
            {tournament.records.map((record) => (
              <li key={record.id} className="achievements-card__record">
                <span className="achievements-card__year">
                  {record.year ?? <Pending />}
                </span>
                <span className="achievements-card__winner">
                  {record.value ?? <Pending />}
                </span>
                {record.note && <span className="achievements-card__note">{record.note}</span>}
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}

function EntryList({ entries, label }) {
  if (entries.length === 0) return <EmptyCategory label={label} />;
  return (
    <ul className="achievements-page__list">
      {entries.map((entry) => (
        <li key={entry.id}>
          {entry.title}
          {entry.year && ` — ${entry.year}`}
        </li>
      ))}
    </ul>
  );
}

export default function Achievements() {
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    getAchievements()
      .then(setData)
      .catch((err) => setError(err.message))
      .finally(() => setIsLoading(false));
  }, []);

  return (
    <div className="achievements-page">
      <div className="container">
        <p className="eyebrow">Honours Board</p>
        <h1 className="achievements-page__title">Achievements</h1>
        <SectionDivider />

        {isLoading && <Loader label="Loading achievements" />}
        {error && <p className="achievements-page__empty">{error}</p>}

        {data && (
          <>
            <section className="achievements-page__section">
              <h2 className="achievements-page__heading">Internal Tournaments</h2>
              <TournamentGrid tournaments={data.internalTournaments} />
            </section>

            <section className="achievements-page__section">
              <h2 className="achievements-page__heading">Inter-College Events</h2>
              <TournamentGrid tournaments={data.externalEvents} />
            </section>

            <section className="achievements-page__section">
              <h2 className="achievements-page__heading">University Achievements</h2>
              <EntryList entries={data.universityAchievements} label="University achievements" />
            </section>

            <section className="achievements-page__section">
              <h2 className="achievements-page__heading">Team Achievements</h2>
              <EntryList entries={data.teamAchievements} label="Team achievements" />
            </section>

            <section className="achievements-page__section">
              <h2 className="achievements-page__heading">Player Achievements</h2>
              <EntryList entries={data.playerAchievements} label="Player achievements" />
            </section>

            <section className="achievements-page__section">
              <h2 className="achievements-page__heading">Coach Achievements</h2>
              <EntryList entries={data.coachAchievements} label="Coach achievements" />
            </section>
          </>
        )}
      </div>
    </div>
  );
}
