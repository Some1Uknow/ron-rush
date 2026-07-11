import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type LeaderboardOutcome = 'victory' | 'defeat';

export interface LeaderboardEntry {
  id: string;
  name: string;
  endingBankroll: number;
  rounds: number;
  outcome: LeaderboardOutcome;
  date: string;
}

interface LeaderboardState {
  entries: LeaderboardEntry[];
  addRun: (entry: Omit<LeaderboardEntry, 'id' | 'date'>) => void;
  isLeaderboardRun: (endingBankroll: number, rounds: number, outcome: LeaderboardOutcome) => boolean;
}

function compareEntries(a: LeaderboardEntry, b: LeaderboardEntry): number {
  if (a.outcome !== b.outcome) return a.outcome === 'victory' ? -1 : 1;
  if (a.endingBankroll !== b.endingBankroll) return b.endingBankroll - a.endingBankroll;
  return a.rounds - b.rounds;
}

export const useLeaderboardStore = create<LeaderboardState>()(
  persist(
    (set, get) => ({
      entries: [],

      addRun: (entry) => {
        const nextEntry: LeaderboardEntry = {
          ...entry,
          id: `${Date.now()}-${entry.name}`,
          date: new Date().toISOString(),
        };

        set({
          entries: [...get().entries, nextEntry].toSorted(compareEntries).slice(0, 5),
        });
      },

      isLeaderboardRun: (endingBankroll, rounds, outcome) => {
        const { entries } = get();
        if (entries.length < 5) return true;

        const candidate: LeaderboardEntry = {
          id: 'candidate',
          name: 'Candidate',
          endingBankroll,
          rounds,
          outcome,
          date: new Date().toISOString(),
        };

        return compareEntries(candidate, entries[entries.length - 1]) < 0;
      },
    }),
    {
      name: 'ron-rush-v2-leaderboard',
      version: 2,
    }
  )
);
