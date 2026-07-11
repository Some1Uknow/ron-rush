'use client';

import { Crown, Medal, Trophy } from 'lucide-react';
import { useLeaderboardStore } from '@/store/leaderboardStore';

export function Leaderboard() {
  const entries = useLeaderboardStore((state) => state.entries);

  return (
    <section className="leaderboard-card-v2" aria-label="Dragon Parlor records">
      <header>
        <Trophy size={22} aria-hidden="true" />
        <div>
          <span>dragon parlor</span>
          <h2>House records</h2>
        </div>
      </header>

      {entries.length === 0 ? (
        <div className="leaderboard-empty-v2">
          <Crown size={27} aria-hidden="true" />
          <p>The first legend has not sat down yet.</p>
        </div>
      ) : (
        <ol>
          {entries.map((entry, index) => (
            <li key={entry.id}>
              <span className="leaderboard-rank">
                {index === 0 ? <Crown size={17} aria-label="First place" /> : index < 3 ? <Medal size={16} aria-label={`Place ${index + 1}`} /> : index + 1}
              </span>
              <span className="leaderboard-player">
                <strong>{entry.name}</strong>
                <small>{entry.outcome === 'victory' ? 'beat the house' : 'lasted'} · {entry.rounds} hands</small>
              </span>
              <b>{entry.endingBankroll.toLocaleString()}</b>
            </li>
          ))}
        </ol>
      )}
    </section>
  );
}
