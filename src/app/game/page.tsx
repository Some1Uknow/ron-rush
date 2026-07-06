'use client';

import React from 'react';
import { useGameStore } from '@/store/gameStore';
import { GameBoard } from '@/components/game/GameBoard';
import { useRouter } from 'next/navigation';
import { LogOut } from 'lucide-react';

export default function GamePage() {
  const { status, quitGame } = useGameStore();
  const router = useRouter();

  React.useEffect(() => {
    if (status === 'idle') {
      router.push('/');
    } else if (status === 'game_over') {
      router.push('/summary');
    }
  }, [status, router]);

  if (status !== 'playing') {
    return <div className="flex items-center justify-center min-h-screen bg-emerald-50 text-emerald-900">Loading...</div>;
  }

  const handleQuit = () => {
    if (confirm('Are you sure you want to quit? Your current progress will be lost.')) {
      quitGame();
    }
  };

  return (
    <div className="game-page font-sans">
      {/* Top Nav */}
      <div className="game-nav">
        <h1 className="game-title">
          <span className="drop-shadow-sm">Ron</span>
          <span className="opacity-50">/</span> 
          <span className="drop-shadow-sm">Rush</span>
        </h1>
        
        <button 
          onClick={handleQuit}
          className="quit-button"
        >
          <LogOut className="w-4 h-4" />
          <span className="hidden sm:inline">Quit Game</span>
        </button>
      </div>

      <GameBoard />
    </div>
  );
}
