import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface LeaderboardEntry {
  id: string;
  name: string;
  score: number;
  date: string;
}

interface LeaderboardState {
  entries: LeaderboardEntry[];
  addScore: (name: string, score: number) => void;
  isHighScore: (score: number) => boolean;
}

export const useLeaderboardStore = create<LeaderboardState>()(
  persist(
    (set, get) => ({
      entries: [
        { id: '1', name: 'Master Wang', score: 2500, date: new Date().toISOString() },
        { id: '2', name: 'Dragon Lady', score: 1800, date: new Date().toISOString() },
        { id: '3', name: 'Wind Rider', score: 1200, date: new Date().toISOString() },
        { id: '4', name: 'Lucky Seven', score: 800, date: new Date().toISOString() },
        { id: '5', name: 'Novice', score: 300, date: new Date().toISOString() },
      ],
      
      addScore: (name, score) => {
        const { entries } = get();
        const newEntry: LeaderboardEntry = {
          id: Date.now().toString(),
          name,
          score,
          date: new Date().toISOString(),
        };

        const newEntries = [...entries, newEntry]
          .sort((a, b) => b.score - a.score)
          .slice(0, 5); // Keep top 5

        set({ entries: newEntries });
      },

      isHighScore: (score) => {
        const { entries } = get();
        if (entries.length < 5) return true;
        return score > entries[entries.length - 1].score;
      },
    }),
    {
      name: 'mahjong-leaderboard-storage',
    }
  )
);
