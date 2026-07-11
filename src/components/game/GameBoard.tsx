'use client';

import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowRight, Eye, Flame, LockKeyhole, Sparkles, Volume2, VolumeX } from 'lucide-react';
import { HONOR_NAMES, Tile } from '@/lib/gameEngine';
import { playParlorFeedback } from '@/lib/parlorFeedback';
import { useGameStore } from '@/store/gameStore';
import { BettingControls } from './BettingControls';
import { DeckStats } from './DeckStats';
import { HistoryView } from './HistoryView';
import { MahjongTile } from '../ui/MahjongTile';
import { cn } from '@/lib/utils';

function Dealer({ mood }: { mood: 'neutral' | 'watching' | 'win' | 'loss' }) {
  return (
    <div className={cn('dealer-stage', `dealer-${mood}`)} aria-hidden="true">
      <div className="dealer-lantern dealer-lantern-left" />
      <div className="dealer-lantern dealer-lantern-right" />
      <div className="dealer-art" />
      <div className="dealer-frame">
        <span>the house</span>
        <strong>{mood === 'win' ? 'impressed' : mood === 'loss' ? 'unmoved' : mood === 'watching' ? 'watching' : 'waiting'}</strong>
      </div>
    </div>
  );
}

function HonorLedger() {
  const dynamicValues = useGameStore((state) => state.dynamicValues);

  return (
    <div className="honor-ledger" aria-label="Honor tile values">
      <span className="honor-ledger-title"><Flame size={14} aria-hidden="true" /> honor heat</span>
      <div className="honor-values">
        {HONOR_NAMES.map((name) => {
          const value = dynamicValues[name] ?? 5;
          return (
            <span key={name} className={cn('honor-value', value <= 2 && 'is-cold', value >= 8 && 'is-hot')} title={name}>
              {name.split(' ')[0].slice(0, 1)}<b>{value}</b>
            </span>
          );
        })}
      </div>
    </div>
  );
}

function RevealedHand({ tiles, revealIndex, peekedTile }: { tiles: Tile[]; revealIndex: number; peekedTile: Tile | null }) {
  const dynamicValues = useGameStore((state) => state.dynamicValues);

  return (
    <div className="reveal-hand" aria-label="Next hand being revealed">
      {tiles.map((tile, index) => {
        const isVisible = index < revealIndex || tile.id === peekedTile?.id;
        return (
          <motion.div
            key={tile.id}
            initial={false}
            animate={{ y: isVisible ? 0 : -4, rotateY: isVisible ? 0 : 180, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 270, damping: 24 }}
            className="reveal-tile"
          >
            <MahjongTile tile={tile} currentValue={dynamicValues[tile.name] ?? tile.baseValue} size="live" faceDown={!isVisible} />
          </motion.div>
        );
      })}
    </div>
  );
}

function ResultOverlay() {
  const lastResult = useGameStore((state) => state.lastResult);
  const continueRound = useGameStore((state) => state.continueRound);

  if (!lastResult) return null;

  const label = lastResult.result === 'win' ? 'You read it' : lastResult.result === 'loss' ? 'The house takes it' : 'Push';
  const delta = lastResult.chipDelta === 0 ? 'Wager returned' : `${lastResult.chipDelta > 0 ? '+' : '−'}${Math.abs(lastResult.chipDelta).toLocaleString()} chips`;

  return (
    <motion.div
      className={cn('result-overlay-v2', `result-${lastResult.result}`)}
      initial={{ opacity: 0, scale: 0.9, y: 18 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ type: 'spring', stiffness: 280, damping: 22 }}
      role="status"
      aria-live="assertive"
    >
      <Sparkles size={24} aria-hidden="true" />
      <p>{label}</p>
      <strong>{delta}</strong>
      <span>Next hand: {lastResult.revealedTotal}</span>
      <button type="button" onClick={continueRound}>Study the next hand <ArrowRight size={16} aria-hidden="true" /></button>
    </motion.div>
  );
}

export function GameBoard() {
  const currentHand = useGameStore((state) => state.currentHand);
  const phase = useGameStore((state) => state.phase);
  const pendingRound = useGameStore((state) => state.pendingRound);
  const revealIndex = useGameStore((state) => state.revealIndex);
  const peekedTile = useGameStore((state) => state.peekedTile);
  const dynamicValues = useGameStore((state) => state.dynamicValues);
  const lastResult = useGameStore((state) => state.lastResult);
  const startReveal = useGameStore((state) => state.startReveal);
  const advanceReveal = useGameStore((state) => state.advanceReveal);
  const resolveRound = useGameStore((state) => state.resolveRound);
  const [soundEnabled, setSoundEnabled] = useState(() => {
    if (typeof window === 'undefined') return true;
    return window.localStorage.getItem('ron-rush-sound') !== 'off';
  });
  const previousPhase = useRef(phase);
  const previousRevealIndex = useRef(revealIndex);
  const previousResult = useRef(lastResult);

  useEffect(() => {
    if (phase !== 'locked') return undefined;
    const timer = window.setTimeout(startReveal, 560);
    return () => window.clearTimeout(timer);
  }, [phase, startReveal]);

  useEffect(() => {
    if (phase !== 'revealing' || !pendingRound) return undefined;
    const isFullyRevealed = revealIndex >= pendingRound.tiles.length;
    const timer = window.setTimeout(isFullyRevealed ? resolveRound : advanceReveal, isFullyRevealed ? 760 : 380);
    return () => window.clearTimeout(timer);
  }, [advanceReveal, pendingRound, phase, revealIndex, resolveRound]);

  useEffect(() => {
    const didLock = phase === 'locked' && previousPhase.current !== 'locked';
    if (didLock && soundEnabled) playParlorFeedback('lock');
    previousPhase.current = phase;
  }, [phase, soundEnabled]);

  useEffect(() => {
    const didRevealTile = phase === 'revealing' && revealIndex > previousRevealIndex.current;
    if (didRevealTile && soundEnabled) playParlorFeedback('tile');
    previousRevealIndex.current = revealIndex;
  }, [phase, revealIndex, soundEnabled]);

  useEffect(() => {
    if (lastResult && previousResult.current !== lastResult && soundEnabled) {
      playParlorFeedback(lastResult.result);
    }
    previousResult.current = lastResult;
  }, [lastResult, soundEnabled]);

  if (!currentHand) return null;

  const dealerMood = phase === 'locked' || phase === 'revealing'
    ? 'watching'
    : lastResult?.result === 'win'
      ? 'win'
      : lastResult?.result === 'loss'
        ? 'loss'
        : 'neutral';
  const isRevealState = Boolean(pendingRound);

  const toggleSound = () => {
    const next = !soundEnabled;
    setSoundEnabled(next);
    window.localStorage.setItem('ron-rush-sound', next ? 'on' : 'off');
  };

  return (
    <div className="dragon-parlor-layout">
      <section className="parlor-table-shell" aria-label="Dragon Parlor table">
        <div className={cn('parlor-table', phase === 'locked' && 'is-locked', phase === 'revealing' && 'is-revealing')}>
          <Dealer mood={dealerMood} />
          <button
            type="button"
            className="sound-toggle"
            aria-label={soundEnabled ? 'Mute table feedback' : 'Enable table feedback'}
            aria-pressed={soundEnabled}
            onClick={toggleSound}
          >
            {soundEnabled ? <Volume2 size={16} aria-hidden="true" /> : <VolumeX size={16} aria-hidden="true" />}
          </button>
          <div className="parlor-smoke parlor-smoke-left" aria-hidden="true" />
          <div className="parlor-smoke parlor-smoke-right" aria-hidden="true" />

          <div className="table-objective">
            <span>current hand</span>
            <strong>{currentHand.totalValue}</strong>
            <small>{phase === 'decision' ? 'Set the line, then risk the chips.' : phase === 'locked' ? 'Chips are in the pot.' : phase === 'revealing' ? 'The house reveals…' : 'The wall has changed.'}</small>
          </div>

          <div className="baseline-hand" aria-label="Current hand">
            {currentHand.tiles.map((tile, index) => (
              <motion.div
                key={tile.id}
                initial={{ opacity: 0, y: 26, rotate: (index - 2) * 3 }}
                animate={{ opacity: 1, y: 0, rotate: (index - 2) * 2 }}
                transition={{ type: 'spring', stiffness: 290, damping: 25, delay: index * 0.05 }}
              >
                <MahjongTile tile={tile} currentValue={dynamicValues[tile.name] ?? tile.baseValue} size="live" fanIndex={index - 2} />
              </motion.div>
            ))}
          </div>

          <AnimatePresence>
            {isRevealState && pendingRound && (
              <motion.div
                className="reveal-zone"
                initial={{ opacity: 0, y: -18 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
              >
                <p><Eye size={14} aria-hidden="true" /> next hand</p>
                <RevealedHand tiles={pendingRound.tiles} revealIndex={revealIndex} peekedTile={peekedTile} />
                {phase === 'locked' && <span className="lock-message"><LockKeyhole size={15} aria-hidden="true" /> bet locked</span>}
              </motion.div>
            )}
          </AnimatePresence>

          <HonorLedger />
          {phase === 'round_complete' && <ResultOverlay />}
        </div>
      </section>

      <aside className="parlor-rail" aria-label="Table controls and history">
        <DeckStats />
        {phase === 'decision' ? <BettingControls /> : (
          <section className="table-status-card">
            <span className="panel-kicker">the table is live</span>
            <strong>{phase === 'locked' ? 'The dealer is taking the pot.' : phase === 'revealing' ? 'Every tile counts.' : 'The wall is settling.'}</strong>
            <p>{phase === 'locked' ? 'No turning back now.' : phase === 'revealing' ? 'Watch the total, one tile at a time.' : 'Your next hand is ready to read.'}</p>
          </section>
        )}
        <HistoryView />
      </aside>
    </div>
  );
}
