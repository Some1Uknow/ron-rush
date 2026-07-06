import React from 'react';
import { useGameStore } from '@/store/gameStore';
import { MahjongTile } from '../ui/MahjongTile';
import { BettingControls } from './BettingControls';
import { DeckStats } from './DeckStats';
import { HistoryView } from './HistoryView';
import { motion, AnimatePresence } from 'framer-motion';
import { RollingNumber } from '../ui/RollingNumber';
import { Tile } from '@/lib/gameEngine';

const rackTiles = Array.from({ length: 11 });

function Rack({ side }: { side: 'top' | 'left' | 'right' }) {
  const wrapperClass = {
    top: 'absolute left-1/2 top-[5.5%] -translate-x-1/2 scale-[0.85]',
    left: 'absolute left-[3.5%] top-1/2 -translate-y-1/2 scale-[0.85]',
    right: 'absolute right-[3.5%] top-1/2 -translate-y-1/2 scale-[0.85]',
  }[side];

  const orientation = side === 'top' ? 'top' : side;

  return (
    <div className={wrapperClass} aria-hidden="true">
      <div className="flex gap-1.5">
        {rackTiles.map((_, index) => (
          <MahjongTile
            key={`${side}-rack-${index}`}
            tile={{ id: `${side}-${index}`, suite: 'wind', name: 'East Wind', baseValue: 5, isNumber: false }}
            size="rack"
            orientation={orientation}
            faceDown
            muted
          />
        ))}
      </div>
    </div>
  );
}

function WallStub({ side, count }: { side: 'top' | 'bottom' | 'left' | 'right'; count: number }) {
  return (
    <div className={`wall-stub wall-stub-${side}`} aria-hidden="true">
      <span>{count}</span>
    </div>
  );
}

function River({ tiles }: { tiles: Tile[] }) {
  const riverTiles = tiles.slice(-18);

  return (
    <div className="river-grid" aria-label="Discard river">
      {riverTiles.length === 0 ? (
        <div className="river-empty">river</div>
      ) : (
        riverTiles.map((tile, index) => (
          <MahjongTile
            key={`river-${tile.id}-${index}`}
            tile={tile}
            size="river"
            muted
          />
        ))
      )}
    </div>
  );
}

export function GameBoard() {
  const { currentHand, status, dynamicValues, discardPile, drawPile, handHistory } = useGameStore();

  if (status !== 'playing' || !currentHand) return null;
  const latestResult = handHistory[0]?.result;

  return (
    <div className="game-layout">
      <section className="table-shell" aria-label="Mahjong table">
        <div className="wood-trim">
          <div className="felt-table">
            <Rack side="top" />
            <Rack side="left" />
            <Rack side="right" />
            <WallStub side="top" count={Math.max(drawPile.length - 18, 0)} />
            <WallStub side="bottom" count={drawPile.length} />
            <WallStub side="left" count={discardPile.length} />
            <WallStub side="right" count={handHistory.length} />

            <div className="table-center-mark" aria-hidden="true">東</div>
            <div className="table-score">
              <span>current hand</span>
              <RollingNumber value={currentHand.totalValue} className="table-score-number" />
              {latestResult && <strong className={`result-chip result-${latestResult}`}>{latestResult}</strong>}
            </div>

            <River tiles={discardPile} />

            <div className="riichi-stick" aria-hidden="true">
              <span />
            </div>

            <div className="player-hand" aria-label="Player hand">
              <AnimatePresence mode="popLayout" initial={false}>
                {currentHand.tiles.map((tile, i) => (
                  <motion.div
                    key={`${tile.id}-${i}`}
                    initial={{ opacity: 0, x: -70, y: -26, rotate: -8, scale: 0.92 }}
                    animate={{ opacity: 1, x: 0, y: 0, rotate: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 26, rotate: 6, scale: 0.95 }}
                    transition={{
                      type: 'spring',
                      stiffness: 320,
                      damping: 28,
                      delay: i * 0.035,
                    }}
                  >
                    <MahjongTile
                      tile={tile}
                      currentValue={dynamicValues[tile.name] ?? tile.baseValue}
                      size="live"
                      fanIndex={i - (currentHand.tiles.length - 1) / 2}
                    />
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </section>

      <aside className="bet-rail" aria-label="Betting controls">
        <div className="rail-card rail-score">
          <span>hand value</span>
          <RollingNumber value={currentHand.totalValue} className="rail-score-number" />
        </div>
        <DeckStats />
        <div className="rail-card">
          <BettingControls />
        </div>
        <HistoryView />
      </aside>
    </div>
  );
}
