import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import PlayerCard from '@/components/PlayerCard/PlayerCard';
import Loader from '@/components/Loader/Loader';
import SectionDivider from '@/components/SectionDivider/SectionDivider';
import SquadPhotoGallery from '@/features/players/components/SquadPhotoGallery/SquadPhotoGallery';
import { PLAYER_LINE_FILTERS } from '@/constants/playerPositions';
import { getPlayers } from '@/services/players';
import './Players.css';

const PAGE_SIZE = 8;

const SORT_OPTIONS = [
  { value: 'name', label: 'Name' },
  { value: 'jersey', label: 'Jersey Number' },
  { value: 'points', label: 'Points' },
];

export default function Players() {
  const [players, setPlayers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);

  const activeFilter = searchParams.get('position') ?? 'all';
  const activeSort = searchParams.get('sort') ?? 'name';
  const activeDirection = searchParams.get('dir') ?? 'asc';

  useEffect(() => {
    let isMounted = true;

    getPlayers().then((data) => {
      if (isMounted) {
        setPlayers(data);
        setIsLoading(false);
      }
    });

    return () => {
      isMounted = false;
    };
  }, []);

  // Reset to page 1 whenever the result set would change shape.
  useEffect(() => {
    setPage(1);
  }, [activeFilter, activeSort, activeDirection, searchTerm]);

  const filteredPlayers = useMemo(() => {
    let result = players;

    const lineFilter = PLAYER_LINE_FILTERS.find((f) => f.value === activeFilter);
    if (lineFilter?.positions) {
      result = result.filter((player) => lineFilter.positions.includes(player.position));
    }

    if (searchTerm.trim()) {
      const query = searchTerm.trim().toLowerCase();
      result = result.filter((player) => player.name.toLowerCase().includes(query));
    }

    const sorted = [...result];
    if (activeSort === 'name') {
      sorted.sort((a, b) => a.name.localeCompare(b.name));
    } else if (activeSort === 'jersey') {
      sorted.sort((a, b) => a.jerseyNumber - b.jerseyNumber);
    } else if (activeSort === 'points') {
      sorted.sort((a, b) => (b.stats?.points ?? 0) - (a.stats?.points ?? 0));
    }

    if (activeDirection === 'desc') {
      sorted.reverse();
    }

    return sorted;
  }, [players, activeFilter, searchTerm, activeSort, activeDirection]);

  const totalPages = Math.max(1, Math.ceil(filteredPlayers.length / PAGE_SIZE));
  const visiblePlayers = filteredPlayers.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const handleFilterChange = (value) => {
    const next = new URLSearchParams(searchParams);
    if (value === 'all') {
      next.delete('position');
    } else {
      next.set('position', value);
    }
    setSearchParams(next);
  };

  const handleSortChange = (value) => {
    const next = new URLSearchParams(searchParams);
    if (value === 'name') {
      next.delete('sort');
    } else {
      next.set('sort', value);
    }
    setSearchParams(next);
  };

  const handleDirectionToggle = () => {
    const next = new URLSearchParams(searchParams);
    if (activeDirection === 'desc') {
      next.delete('dir');
    } else {
      next.set('dir', 'desc');
    }
    setSearchParams(next);
  };

  return (
    <div className="players-page">
      <div className="container">
        <p className="eyebrow">The Roster</p>
        <h1 className="players-page__title">Players</h1>
        <SectionDivider />

        <div className="players-page__controls">
          <input
            type="search"
            className="players-page__search"
            placeholder="Search players by name…"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            aria-label="Search players by name"
          />

          <select
            className="players-page__sort"
            value={activeSort}
            onChange={(e) => handleSortChange(e.target.value)}
            aria-label="Sort players"
          >
            {SORT_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>

          <button
            type="button"
            className="players-page__direction"
            onClick={handleDirectionToggle}
            aria-label={activeDirection === 'asc' ? 'Sort ascending' : 'Sort descending'}
            title={activeDirection === 'asc' ? 'Ascending' : 'Descending'}
          >
            {activeDirection === 'asc' ? '↑ Asc' : '↓ Desc'}
          </button>
        </div>

        <div className="players-page__filters" role="tablist" aria-label="Filter by position">
          {PLAYER_LINE_FILTERS.map((filter) => (
            <button
              key={filter.value}
              type="button"
              role="tab"
              aria-selected={activeFilter === filter.value}
              className={
                activeFilter === filter.value
                  ? 'players-page__filter players-page__filter--active'
                  : 'players-page__filter'
              }
              onClick={() => handleFilterChange(filter.value)}
            >
              {filter.label}
            </button>
          ))}
        </div>

        {isLoading ? (
          <Loader label="Loading roster" />
        ) : visiblePlayers.length === 0 ? (
          <p className="players-page__empty">No players found.</p>
        ) : (
          <>
            <div className="players-page__grid">
              {visiblePlayers.map((player) => (
                <PlayerCard key={player.id} player={player} />
              ))}
            </div>

            {totalPages > 1 && (
              <div className="players-page__pagination" aria-label="Pagination">
                <button
                  type="button"
                  className="players-page__page-btn"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                >
                  ← Prev
                </button>
                <span className="players-page__page-status">
                  Page {page} of {totalPages}
                </span>
                <button
                  type="button"
                  className="players-page__page-btn"
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                >
                  Next →
                </button>
              </div>
            )}
          </>
        )}

        <SquadPhotoGallery />
      </div>
    </div>
  );
}
