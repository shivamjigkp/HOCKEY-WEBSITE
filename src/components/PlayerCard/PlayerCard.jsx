import { Link } from 'react-router-dom';
import { ROUTES } from '@/constants/routes';
import { PLAYER_POSITION_LABELS } from '@/constants/playerPositions';
import './PlayerCard.css';

/**
 * @param {Object} props
 * @param {Object} props.player - player record from services/players.js
 * @param {'compact'|'default'} [props.variant] - 'compact' drops the CTA link
 *   text and hometown line, used for tight homepage grids.
 */
export default function PlayerCard({ player, variant = 'default' }) {
  const detailsPath = ROUTES.PLAYER_DETAILS.replace(':playerId', player.id);
  const positionLabel = PLAYER_POSITION_LABELS[player.position] ?? player.position;
  const keyStat =
    player.position === 'goalkeeper'
      ? { value: player.stats?.saves ?? '—', label: 'Saves' }
      : { value: player.stats?.points ?? '—', label: 'Points' };

  return (
    <Link to={detailsPath} className={`player-card player-card--${variant}`}>
      <div className="player-card__photo" aria-hidden="true">
        {player.photoUrl ? (
          <img src={player.photoUrl} alt="" className="player-card__photo-img" />
        ) : (
          <span className="player-card__number">{player.jerseyNumber}</span>
        )}
      </div>

      <h3 className="player-card__name">{player.name}</h3>
      <p className="player-card__position">{positionLabel}</p>

      {variant === 'default' && (
        <>
          <p className="player-card__meta">
            {player.year} · #{player.jerseyNumber}
          </p>
          <p className="player-card__stat">
            <span className="player-card__stat-value">{keyStat.value}</span>
            <span className="player-card__stat-label">{keyStat.label}</span>
          </p>
        </>
      )}
    </Link>
  );
}
