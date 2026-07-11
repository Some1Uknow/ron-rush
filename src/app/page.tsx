'use client';

import { motion } from 'framer-motion';
import { Eye, Play, Target, WalletCards } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Leaderboard } from '@/components/Leaderboard';
import { MahjongTile } from '@/components/ui/MahjongTile';
import { useGameStore } from '@/store/gameStore';

const previewTiles = [
  { id: 'preview-1', suite: 'number' as const, name: '1 Dots', baseValue: 1, isNumber: true },
  { id: 'preview-7', suite: 'number' as const, name: '7 Dots', baseValue: 7, isNumber: true },
  { id: 'preview-east', suite: 'wind' as const, name: 'East Wind', baseValue: 5, isNumber: false },
  { id: 'preview-red', suite: 'dragon' as const, name: 'Red Dragon', baseValue: 5, isNumber: false },
  { id: 'preview-9', suite: 'number' as const, name: '9 Dots', baseValue: 9, isNumber: true },
];

export default function Home() {
  const startGame = useGameStore((state) => state.startGame);
  const router = useRouter();

  const handleNewGame = () => {
    startGame();
    router.push('/game');
  };

  return (
    <main className="parlor-home">
      <div className="home-illustration" aria-hidden="true" />
      <div className="home-veil" aria-hidden="true" />

      <nav className="home-nav-v2">
        <span className="home-brand-mark">東</span>
        <span>Ron Rush</span>
        <small>virtual chips only</small>
      </nav>

      <div className="home-grid-v2">
        <section className="home-hero-v2">
          <motion.p initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="home-eyebrow">
            The Dragon Parlor is open
          </motion.p>
          <motion.h1 initial={{ opacity: 0, y: 22 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
            Read the wall.<br /><em>Risk the house.</em>
          </motion.h1>
          <motion.p initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="home-description-v2">
            A five-minute Mahjong-tile prediction run. Turn 1,000 chips into 2,500 before the wall runs dry.
          </motion.p>

          <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="home-actions-v2">
            <button type="button" onClick={handleNewGame} className="home-start-v2">
              <Play size={20} fill="currentColor" aria-hidden="true" />
              Start a run
            </button>
            <span>4–6 min · no wallet needed</span>
          </motion.div>

          <div className="how-it-works-v2" aria-label="How Ron Rush works">
            <article><WalletCards size={18} aria-hidden="true" /><strong>Set a stake</strong><span>Choose 10%, 25%, 50%, or everything.</span></article>
            <article><Eye size={18} aria-hidden="true" /><strong>Read the odds</strong><span>Peek the wall and call higher or lower.</span></article>
            <article><Target size={18} aria-hidden="true" /><strong>Beat the house</strong><span>Reach 2,500 before the final hand.</span></article>
          </div>
        </section>

        <motion.section
          initial={{ opacity: 0, scale: 0.95, rotate: -1 }}
          animate={{ opacity: 1, scale: 1, rotate: 0 }}
          transition={{ duration: 0.6, delay: 0.08 }}
          className="home-table-v2"
          aria-label="A preview of the Dragon Parlor table"
        >
          <div className="home-table-dealer">The house is watching</div>
          <div className="home-table-score"><span>the line</span><strong>27</strong><small>raise or fall?</small></div>
          <div className="home-preview-tiles-v2">
            {previewTiles.map((tile, index) => (
              <MahjongTile key={tile.id} tile={tile} size="live" fanIndex={index - 2} />
            ))}
          </div>
          <div className="home-preview-bets-v2"><span>Higher · 62%</span><span>Lower · 34%</span></div>
        </motion.section>

        <aside className="home-records-v2"><Leaderboard /></aside>
      </div>
    </main>
  );
}
