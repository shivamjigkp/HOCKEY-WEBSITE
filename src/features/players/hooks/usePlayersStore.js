import { useEffect, useState } from 'react';
import { useLocalStorageState } from '@/hooks/useLocalStorageState';
import { getPlayers } from '@/services/players';

const STORAGE_KEY = 'mmmut_players_roster';

/**
 * Roster state with add/remove, seeded once from services/players.js.
 * After the first load, localStorage is the source of truth so the
 * roster count can go up or down from the UI.
 *
 * ⚠️ Client-side only — resets if localStorage is cleared, and isn't
 * shared across devices/browsers. Phase 7 (Supabase) replaces this
 * with a real players table; this hook's return shape ({ players,
 * addPlayer, removePlayer, isLoading }) is designed to stay the same
 * so Players.jsx won't need to change when that happens.
 */
export function usePlayersStore() {
  const [players, setPlayers] = useLocalStorageState(STORAGE_KEY, null);
  const [isLoading, setIsLoading] = useState(players === null);

  useEffect(() => {
    if (players !== null) {
      setIsLoading(false);
      return;
    }
    let isMounted = true;
    getPlayers().then((seed) => {
      if (isMounted) {
        setPlayers(seed);
        setIsLoading(false);
      }
    });
    return () => {
      isMounted = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function addPlayer(player) {
    const newPlayer = {
      id: `local-${Date.now()}`,
      name: player.name,
      jerseyNumber: player.jerseyNumber,
      position: player.position,
      year: player.year,
      photoUrl: player.photoUrl ?? null,
      department: player.department ?? 'To be confirmed',
      bio: player.bio ?? '',
      achievements: [],
      stats: {},
    };
    setPlayers((prev) => [...(prev ?? []), newPlayer]);
  }

  function removePlayer(playerId) {
    setPlayers((prev) => (prev ?? []).filter((p) => p.id !== playerId));
  }

  return { players: players ?? [], addPlayer, removePlayer, isLoading };
}
