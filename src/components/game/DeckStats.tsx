import { useGameStore } from '@/store/gameStore';
import { Layers3, Target, WalletCards } from 'lucide-react';

export function DeckStats() {
  const bankroll = useGameStore((state) => state.bankroll);
  const targetBankroll = useGameStore((state) => state.targetBankroll);
  const drawPile = useGameStore((state) => state.drawPile);
  const round = useGameStore((state) => state.round);
  const maxRounds = useGameStore((state) => state.maxRounds);

  const currentRound = Math.min(round + 1, maxRounds);

  return (
    <div className="run-stats" aria-label="Run status">
      <div className="run-stat run-stat-bankroll">
        <WalletCards size={17} aria-hidden="true" />
        <span>bankroll</span>
        <strong>{bankroll.toLocaleString()}</strong>
      </div>
      <div className="run-stat">
        <Target size={17} aria-hidden="true" />
        <span>target</span>
        <strong>{targetBankroll.toLocaleString()}</strong>
      </div>
      <div className="run-stat">
        <Layers3 size={17} aria-hidden="true" />
        <span>wall</span>
        <strong>{drawPile.length} · {currentRound}/{maxRounds || 0}</strong>
      </div>
    </div>
  );
}
