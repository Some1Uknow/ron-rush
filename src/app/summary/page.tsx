'use client';

import { useEffect, useState } from 'react';
import { ArrowLeft, Crown, Play, RotateCcw, Trophy } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useGameStore } from '@/store/gameStore';
import { LeaderboardOutcome, useLeaderboardStore } from '@/store/leaderboardStore';

export default function SummaryPage() {
  const status = useGameStore((state) => state.status);
  const gameOverReason = useGameStore((state) => state.gameOverReason);
  const bankroll = useGameStore((state) => state.bankroll);
  const round = useGameStore((state) => state.round);
  const maxRounds = useGameStore((state) => state.maxRounds);
  const startGame = useGameStore((state) => state.startGame);
  const resetGame = useGameStore((state) => state.resetGame);
  const isLeaderboardRun = useLeaderboardStore((state) => state.isLeaderboardRun);
  const addRun = useLeaderboardStore((state) => state.addRun);
  const router = useRouter();
  const [name, setName] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const outcome: LeaderboardOutcome = gameOverReason === 'win_target' ? 'victory' : 'defeat';

  useEffect(() => {
    if (status !== 'game_over') {
      router.replace('/');
      return;
    }
  }, [router, status]);

  if (status !== 'game_over') return null;

  const isHighRun = isLeaderboardRun(bankroll, round, outcome);

  const isVictory = outcome === 'victory';
  const headline = isVictory ? 'You broke the house.' : 'The wall took you.';
  const detail = isVictory
    ? `You reached the target with ${bankroll.toLocaleString()} chips in ${round} hands.`
    : gameOverReason === 'loss_bankroll'
      ? 'Your stack is empty. The house keeps the table.'
      : `The final hand fell before you reached 2,500 chips.`;

  const submitScore = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!name.trim() || submitted) return;
    addRun({ name: name.trim(), endingBankroll: bankroll, rounds: round, outcome });
    setSubmitted(true);
  };

  const playAgain = () => {
    startGame();
    router.push('/game');
  };

  const leaveTable = () => {
    resetGame();
    router.push('/');
  };

  return (
    <main className={`run-summary ${isVictory ? 'summary-victory' : 'summary-defeat'}`}>
      <div className="summary-illustration" aria-hidden="true" />
      <div className="summary-shade" aria-hidden="true" />
      <section className="summary-card-v2">
        <div className="summary-emblem">{isVictory ? <Crown size={31} aria-hidden="true" /> : <Trophy size={31} aria-hidden="true" />}</div>
        <p className="summary-kicker">{isVictory ? 'Dragon Parlor victory' : 'Run complete'}</p>
        <h1>{headline}</h1>
        <p className="summary-detail">{detail}</p>

        <div className="summary-stats">
          <span><small>ending stack</small><strong>{bankroll.toLocaleString()}</strong></span>
          <span><small>hands played</small><strong>{round}/{maxRounds}</strong></span>
          <span><small>target</small><strong>2,500</strong></span>
        </div>

        {isHighRun && !submitted ? (
          <form onSubmit={submitScore} className="summary-name-form">
            <label htmlFor="run-name">Put your name on the ledger</label>
            <div>
              <input id="run-name" value={name} onChange={(event) => setName(event.target.value)} maxLength={15} placeholder="Table name" required />
              <button type="submit">Record it</button>
            </div>
          </form>
        ) : submitted ? (
          <p className="summary-saved"><Crown size={16} aria-hidden="true" /> The parlor remembers.</p>
        ) : null}

        <div className="summary-actions-v2">
          <button type="button" onClick={playAgain} className="summary-primary"><Play size={17} fill="currentColor" aria-hidden="true" /> Run it back</button>
          <button type="button" onClick={leaveTable} className="summary-secondary"><ArrowLeft size={17} aria-hidden="true" /> Leave table</button>
        </div>
        <button type="button" onClick={playAgain} className="summary-quiet"><RotateCcw size={14} aria-hidden="true" /> Fresh wall, fresh luck</button>
      </section>
    </main>
  );
}
