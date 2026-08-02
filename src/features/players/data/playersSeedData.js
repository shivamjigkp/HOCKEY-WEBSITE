/**
 * ⚠️ PLACEHOLDER ROSTER DATA — NOT REAL MMMUT PLAYERS.
 *
 * This file exists so the Players module (Phase 3) can ship a complete,
 * working UI (roster grid, filters, detail pages) before real player
 * names, numbers, photos, and stats are provided.
 *
 * TODO (blocking before production launch): replace every entry below
 * with the real MMMUT Hockey roster. Once real data is supplied, this
 * file should either be deleted (if moving straight to Supabase) or have
 * its contents replaced 1:1 — `src/services/players.js` is the only file
 * that imports this, so nothing else needs to change.
 */

export const PLAYERS_SEED = [
  {
    id: 'p1',
    name: 'Jordan Reyes',
    position: 'forward',
    jerseyNumber: 17,
    year: 'Final Year',
    hometown: 'Placeholder City',
    heightCm: 180,
    photoUrl: null,
    bio: 'Placeholder bio — replace with real player background.',
    stats: { gamesPlayed: 18, goals: 14, assists: 9, points: 23 },
  },
  {
    id: 'p2',
    name: 'Mika Lindqvist',
    position: 'defender',
    jerseyNumber: 4,
    year: 'Third Year',
    hometown: 'Placeholder City',
    heightCm: 183,
    photoUrl: null,
    bio: 'Placeholder bio — replace with real player background.',
    stats: { gamesPlayed: 18, goals: 2, assists: 11, points: 13 },
  },
  {
    id: 'p3',
    name: 'Aiden Cho',
    position: 'goalkeeper',
    jerseyNumber: 30,
    year: 'Second Year',
    hometown: 'Placeholder City',
    heightCm: 185,
    photoUrl: null,
    bio: 'Placeholder bio — replace with real player background.',
    stats: { gamesPlayed: 16, saves: 312, goalsConceded: 19, cleanSheets: 3 },
  },
  {
    id: 'p4',
    name: 'Théo Marchand',
    position: 'forward',
    jerseyNumber: 9,
    year: 'Final Year',
    hometown: 'Placeholder City',
    heightCm: 178,
    photoUrl: null,
    bio: 'Placeholder bio — replace with real player background.',
    stats: { gamesPlayed: 18, goals: 11, assists: 15, points: 26 },
  },
  {
    id: 'p5',
    name: 'Ravi Malhotra',
    position: 'defender',
    jerseyNumber: 22,
    year: 'First Year',
    hometown: 'Placeholder City',
    heightCm: 179,
    photoUrl: null,
    bio: 'Placeholder bio — replace with real player background.',
    stats: { gamesPlayed: 15, goals: 1, assists: 6, points: 7 },
  },
  {
    id: 'p6',
    name: 'Owen Whitfield',
    position: 'midfielder',
    jerseyNumber: 11,
    year: 'Second Year',
    hometown: 'Placeholder City',
    heightCm: 176,
    photoUrl: null,
    bio: 'Placeholder bio — replace with real player background.',
    stats: { gamesPlayed: 17, goals: 8, assists: 7, points: 15 },
  },
  {
    id: 'p7',
    name: 'Sana Fujimoto',
    position: 'defender',
    jerseyNumber: 6,
    year: 'Third Year',
    hometown: 'Placeholder City',
    heightCm: 172,
    photoUrl: null,
    bio: 'Placeholder bio — replace with real player background.',
    stats: { gamesPlayed: 18, goals: 3, assists: 9, points: 12 },
  },
  {
    id: 'p8',
    name: 'Kabir Anand',
    position: 'goalkeeper',
    jerseyNumber: 1,
    year: 'Final Year',
    hometown: 'Placeholder City',
    heightCm: 188,
    photoUrl: null,
    bio: 'Placeholder bio — replace with real player background.',
    stats: { gamesPlayed: 4, saves: 71, goalsConceded: 10, cleanSheets: 0 },
  },
  {
    id: 'p9',
    name: 'Lucas Bergström',
    position: 'midfielder',
    jerseyNumber: 21,
    year: 'First Year',
    hometown: 'Placeholder City',
    heightCm: 181,
    photoUrl: null,
    bio: 'Placeholder bio — replace with real player background.',
    stats: { gamesPlayed: 14, goals: 5, assists: 4, points: 9 },
  },
];
