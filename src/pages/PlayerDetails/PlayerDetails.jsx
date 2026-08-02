import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import Loader from '@/components/Loader/Loader';
import { ROUTES } from '@/constants/routes';
import { PLAYER_POSITION_LABELS } from '@/constants/playerPositions';
import { getPlayerById } from '@/services/players';
import './PlayerDetails.css';

const GOALKEEPER_STAT_LABELS = {
  gamesPlayed: 'Games Played',
  saves: 'Saves',
  goalsConceded: 'Goals Conceded',
  cleanSheets: 'Clean Sheets',
};

const OUTFIELD_STAT_LABELS = {
  gamesPlayed: 'Games Played',
  goals: 'Goals',
  assists: 'Assists',
  points: 'Points',
};

export default function PlayerDetails() {
  const { playerId } = useParams();
  const navigate = useNavigate();
  const [player, setPlayer] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    setIsLoading(true);

    getPlayerById(playerId).then((data) => {
      if (isMounted) {
        setPlayer(data);
        setIsLoading(false);
      }
    });

    return () => {
      isMounted = false;
    };
  }, [playerId]);

  if (isLoading) {
    return (
      <div className="player-details container">
        <Loader label="Loading player" />
      </div>
    );
  }

  if (!player) {
    return (
      <div className="player-details player-details--empty container">
        <h1>Player not found</h1>
        <p>We couldn&apos;t find a player with that ID.</p>
        <Link className="btn btn-outline" to={ROUTES.PLAYERS}>
          Back to Roster
        </Link>
      </div>
    );
  }

  const statLabels = player.position === 'goalkeeper' ? GOALKEEPER_STAT_LABELS : OUTFIELD_STAT_LABELS;

  return (
    <div className="player-details">
      <div className="container">
        <button type="button" className="player-details__back" onClick={() => navigate(ROUTES.PLAYERS)}>
          ← Back to Roster
        </button>

        <div className="player-details__header">
          <div className="player-details__photo" aria-hidden="true">
            {player.photoUrl ? (
              <img src={player.photoUrl} alt="" />
            ) : (
              <span className="player-details__number">{player.jerseyNumber}</span>
            )}
          </div>

          <div>
            <p className="eyebrow">{PLAYER_POSITION_LABELS[player.position] ?? player.position}</p>
            <h1 className="player-details__name">{player.name}</h1>
            <p className="player-details__meta">
              #{player.jerseyNumber} · {player.year} · {player.hometown}
            </p>
          </div>
        </div>

        <p className="player-details__bio">{player.bio}</p>

        <div className="player-details__stats">
          {Object.entries(statLabels).map(([key, label]) => (
            <div className="player-details__stat" key={key}>
              <span className="player-details__stat-value">{player.stats?.[key] ?? '—'}</span>
              <span className="player-details__stat-label">{label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
