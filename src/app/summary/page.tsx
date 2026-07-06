'use client';

import React, { useState, useEffect } from 'react';
import { useGameStore } from '@/store/gameStore';
import { useLeaderboardStore } from '@/store/leaderboardStore';
import { useRouter } from 'next/navigation';
import { Trophy, RefreshCw, Home, ExternalLink } from 'lucide-react';

export default function SummaryPage() {
  const { score, gameOverReason, resetGame, status } = useGameStore();
  const { isHighScore, addScore } = useLeaderboardStore();
  const router = useRouter();

  const [name, setName] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [isHigh, setIsHigh] = useState(false);

  useEffect(() => {
    if (status !== 'game_over') {
      router.push('/');
    } else {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setIsHigh(isHighScore(score));
    }
  }, [status, score, isHighScore, router]);

  if (status !== 'game_over') return null;

  const handleSubmitScore = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      addScore(name.trim(), score);
      setSubmitted(true);
    }
  };

  const handlePlayAgain = () => {
    resetGame();
    router.push('/');
  };

  // Determine message based on reason
  let reasonMessage = '';
  if (gameOverReason === 'loss_value_bounds') {
    reasonMessage = 'A tile value reached its limit (0 or 10)!';
  } else if (gameOverReason === 'loss_empty_deck') {
    reasonMessage = 'The deck ran out of reshuffles!';
  } else {
    reasonMessage = 'Game Over!';
  }

  return (
    <div className="min-h-screen bg-zinc-50 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md bg-white p-8 rounded-[3rem] shadow-2xl border border-gray-100 relative overflow-hidden">
        
        {/* Decorative Top */}
        <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-rose-500/10 to-transparent pointer-events-none"></div>

        <div className="text-center mb-8 relative z-10">
          <h1 className="text-4xl font-black text-gray-900 uppercase tracking-tighter drop-shadow-sm mb-2">Game Over</h1>
          <p className="text-rose-600 font-bold">{reasonMessage}</p>
        </div>

        <div className="bg-emerald-50 rounded-3xl p-6 text-center shadow-inner mb-8">
          <p className="text-sm text-emerald-800 font-semibold uppercase tracking-widest mb-1">Final Score</p>
          <p className="text-6xl font-black text-emerald-600 drop-shadow-md">{score}</p>
        </div>

        {isHigh && !submitted ? (
          <form onSubmit={handleSubmitScore} className="mb-8 animate-in fade-in slide-in-from-bottom-4">
            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 text-center">
              <Trophy className="w-8 h-8 text-amber-500 mx-auto mb-2" />
              <h3 className="font-bold text-amber-900 mb-4">New High Score!</h3>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter your name"
                className="w-full px-4 py-3 rounded-xl border-2 border-amber-200 focus:border-amber-500 focus:ring-0 text-center font-bold text-gray-700 bg-white shadow-inner mb-3"
                maxLength={15}
                required
              />
              <button
                type="submit"
                className="w-full bg-amber-500 hover:bg-amber-600 text-white font-bold py-3 rounded-xl shadow-md transition-colors"
              >
                Submit Score
              </button>
            </div>
          </form>
        ) : submitted ? (
          <div className="bg-emerald-50 text-emerald-700 border border-emerald-200 p-4 rounded-2xl text-center font-bold mb-8 flex items-center justify-center gap-2">
            Score Saved! <ExternalLink className="w-4 h-4 cursor-pointer hover:text-emerald-900" onClick={() => router.push('/')} />
          </div>
        ) : null}

        <div className="flex gap-4">
          <button
            onClick={handlePlayAgain}
            className="flex-1 flex items-center justify-center gap-2 bg-gray-900 text-white px-6 py-4 rounded-2xl font-bold hover:bg-gray-800 transition-colors shadow-lg active:scale-95"
          >
            <RefreshCw className="w-5 h-5" />
            Play Again
          </button>
          
          <button
            onClick={() => router.push('/')}
            className="flex-1 flex items-center justify-center gap-2 bg-gray-100 text-gray-700 px-6 py-4 rounded-2xl font-bold hover:bg-gray-200 transition-colors shadow-sm active:scale-95 border border-gray-200"
          >
            <Home className="w-5 h-5" />
            Home
          </button>
        </div>

      </div>
    </div>
  );
}
