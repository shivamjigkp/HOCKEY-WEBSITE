import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ROUTES } from '@/constants/routes';
import SectionDivider from '@/components/SectionDivider/SectionDivider';
import PlayerCard from '@/components/PlayerCard/PlayerCard';
import Loader from '@/components/Loader/Loader';
import { getFeaturedPlayers } from '@/services/players';
import './FeaturedPlayers.css';

export default function FeaturedPlayers() {
  const [players, setPlayers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    getFeaturedPlayers(4).then((data) => {
      if (isMounted) {
        setPlayers(data);
        setIsLoading(false);
      }
    });

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <section className="featured-players">
      <div className="container">
        <SectionDivider label="The Roster" />

        {isLoading ? (
          <Loader label="Loading roster" />
        ) : (
          <div className="featured-players__grid">
            {players.map((player) => (
              <PlayerCard key={player.id} player={player} variant="compact" />
            ))}
          </div>
        )}

        <div className="featured-players__cta">
          <Link className="btn btn-outline" to={ROUTES.PLAYERS}>
            View Full Roster
          </Link>
        </div>
      </div>
    </section>
  );
}
