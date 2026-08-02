import { useEffect, useMemo, useState } from 'react';
import Loader from '@/components/Loader/Loader';
import SectionDivider from '@/components/SectionDivider/SectionDivider';
import { formatDate } from '@/utils/formatDate';
import { getCompletedMatches } from '@/services/matches';
import './TournamentHistory.css';

// Used to work out which side of a match is "us" so we can show a W-L-D
// record per tournament. Matched case-insensitively against either team
// name; if neither side matches, the tournament still renders — it just
// skips the record badge instead of guessing.
const HOME_UNIVERSITY_MATCH = /mmmut/i;

function isOurSide(teamName) {
  return HOME_UNIVERSITY_MATCH.test(teamName || '');
}

function groupByTournament(matches) {
  const groups = new Map();

  for (const match of matches) {
    const key = match.competition || 'Uncategorized';
    if (!groups.has(key)) {
      groups.set(key, []);
    }
    groups.get(key).push(match);
  }

  return Array.from(groups.entries()).map(([competition, tournamentMatches]) => {
    const sorted = [...tournamentMatches].sort(
      (a, b) => new Date(b.date) - new Date(a.date)
    );

    const record = { wins: 0, losses: 0, draws: 0, undetermined: 0 };
    for (const match of sorted) {
      if (match.homeScore == null || match.awayScore == null) {
        record.undetermined += 1;
        continue;
      }
      const weAreHome = isOurSide(match.homeTeam);
      const weAreAway = isOurSide(match.awayTeam);
      if (!weAreHome && !weAreAway) {
        record.undetermined += 1;
        continue;
      }
      const ourScore = weAreHome ? match.homeScore : match.awayScore;
      const theirScore = weAreHome ? match.awayScore : match.homeScore;
      if (ourScore > theirScore) record.wins += 1;
      else if (ourScore < theirScore) record.losses += 1;
      else record.draws += 1;
    }

    return {
      competition,
      matches: sorted,
      record,
      latestDate: sorted[0]?.date,
    };
  });
}

function TournamentCard({ tournament, isExpanded, onToggle }) {
  const { record } = tournament;
  const hasRecord = record.wins + record.losses + record.draws > 0;

  return (
    <div className="tournament-card">
      <button
        type="button"
        className="tournament-card__header"
        onClick={onToggle}
        aria-expanded={isExpanded}
      >
        <div>
          <h2 className="tournament-card__name">{tournament.competition}</h2>
          <p className="tournament-card__meta">
            {tournament.matches.length} match{tournament.matches.length === 1 ? '' : 'es'}
            {hasRecord && (
              <>
                {' '}
                · {record.wins}W {record.losses}L{record.draws ? ` ${record.draws}D` : ''}
              </>
            )}
          </p>
        </div>
        <span className="tournament-card__chevron" aria-hidden="true">
          {isExpanded ? '−' : '+'}
        </span>
      </button>

      {isExpanded && (
        <ul className="tournament-card__matches">
          {tournament.matches.map((match) => (
            <li key={match.id} className="tournament-card__match">
              <span className="tournament-card__match-date">{formatDate(match.date)}</span>
              <span className="tournament-card__match-teams">
                {match.homeTeam} <strong>{match.homeScore ?? '–'}</strong>
                {' vs '}
                <strong>{match.awayScore ?? '–'}</strong> {match.awayTeam}
              </span>
              <span className="tournament-card__match-venue">{match.venue}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default function TournamentHistory() {
  const [matches, setMatches] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [expandedKey, setExpandedKey] = useState(null);

  useEffect(() => {
    let isMounted = true;
    getCompletedMatches().then((data) => {
      if (isMounted) {
        setMatches(data);
        setIsLoading(false);
      }
    });
    return () => {
      isMounted = false;
    };
  }, []);

  const tournaments = useMemo(() => {
    return groupByTournament(matches).sort(
      (a, b) => new Date(b.latestDate) - new Date(a.latestDate)
    );
  }, [matches]);

  return (
    <div className="tournament-history-page">
      <div className="container">
        <p className="eyebrow">Match Center</p>
        <h1 className="tournament-history-page__title">Tournament History</h1>
        <SectionDivider />

        {isLoading ? (
          <Loader label="Loading tournament history" />
        ) : tournaments.length === 0 ? (
          <p className="tournament-history-page__empty">
            No completed tournaments recorded yet.
          </p>
        ) : (
          <div className="tournament-history-page__list">
            {tournaments.map((tournament) => (
              <TournamentCard
                key={tournament.competition}
                tournament={tournament}
                isExpanded={expandedKey === tournament.competition}
                onToggle={() =>
                  setExpandedKey((prev) =>
                    prev === tournament.competition ? null : tournament.competition
                  )
                }
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
