import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import Loader from '@/components/Loader/Loader';
import { ROUTES } from '@/constants/routes';
import { PLAYER_POSITION_LABELS } from '@/constants/playerPositions';
import { getPlayerById } from '@/services/players';
import './PlayerDetails.css';

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
              #{player.jerseyNumber} · {player.year}
              {player.branch && ` · ${player.branch}`}
              {player.hometown && ` · ${player.hometown}`}
            </p>
          </div>
        </div>

        {player.bio && <p className="player-details__bio">{player.bio}</p>}

        {(player.linkedinUrl || player.githubUrl) && (
          <div className="player-details__links">
            {player.linkedinUrl && (
              <a
                href={player.linkedinUrl}
                target="_blank"
                rel="noreferrer noopener"
                className="btn btn-outline"
              >
                LinkedIn
              </a>
            )}
            {player.githubUrl && (
              <a
                href={player.githubUrl}
                target="_blank"
                rel="noreferrer noopener"
                className="btn btn-outline"
              >
                GitHub
              </a>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
