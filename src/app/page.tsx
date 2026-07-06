'use client';

import React from 'react';
import { Leaderboard } from '@/components/Leaderboard';
import { motion } from 'framer-motion';
import { PlayCircle } from 'lucide-react';
import { useGameStore } from '@/store/gameStore';
import { useRouter } from 'next/navigation';
import { MahjongTile } from '@/components/ui/MahjongTile';

const previewTiles = [
  { id: 'preview-1', suite: 'number' as const, name: '1 Dots', baseValue: 1, isNumber: true },
  { id: 'preview-7', suite: 'number' as const, name: '7 Dots', baseValue: 7, isNumber: true },
  { id: 'preview-east', suite: 'wind' as const, name: 'East Wind', baseValue: 5, isNumber: false },
  { id: 'preview-red', suite: 'dragon' as const, name: 'Red Dragon', baseValue: 5, isNumber: false },
  { id: 'preview-9', suite: 'number' as const, name: '9 Dots', baseValue: 9, isNumber: true },
];

export default function Home() {
  const { startGame } = useGameStore();
  const router = useRouter();

  const handleNewGame = () => {
    startGame();
    router.push('/game');
  };

  return (
    <main className="home-page">
      <div className="vintage-overlay absolute inset-0 z-0" />

      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="home-shell"
      >
        <section className="hero-copy">
          <p className="home-kicker">Mahjong tile rush</p>
          <h1>Ron Rush</h1>
          <p className="home-subtitle">
            Draw a hand, read the table, then call whether the next tile set lands higher or lower.
          </p>

          <div className="home-actions">
            <motion.button
              whileHover={{ y: -2 }}
              whileTap={{ y: 3 }}
              onClick={handleNewGame}
              className="home-start-button"
            >
              <PlayCircle size={32} className="group-hover:rotate-12 transition-transform" />
              Start Run
            </motion.button>
            <span>Fast rounds • Physical tiles • Table score</span>
          </div>
        </section>

        <section className="home-table-preview" aria-label="Ron Rush table preview">
          <div className="home-wood-trim">
            <div className="home-felt">
              <div className="home-preview-wall home-preview-wall-top" />
              <div className="home-preview-wall home-preview-wall-bottom" />
              <span className="home-center-glyph">和</span>
              <div className="home-preview-score">
                <span>current hand</span>
                <strong>27</strong>
              </div>
              <div className="home-preview-tiles">
                {previewTiles.map((tile, index) => (
                  <MahjongTile
                    key={tile.id}
                    tile={tile}
                    size="live"
                    fanIndex={index - 2}
                  />
                ))}
              </div>
              <div className="home-preview-bets">
                <button type="button">Higher</button>
                <button type="button">Lower</button>
              </div>
            </div>
          </div>
        </section>

        <aside className="home-leaderboard">
            <Leaderboard />
        </aside>

      </motion.div>
    </main>
  );
}
