'use client';

import { useMemo } from 'react';
import { Eye, RefreshCw, Sparkles } from 'lucide-react';
import {
  calculateHandOdds,
  calculatePayoutMultiplier,
  getRiskLabel,
  Prediction,
  probabilityForPrediction,
} from '@/lib/gameEngine';
import { useGameStore, WagerPreset } from '@/store/gameStore';
import { cn } from '@/lib/utils';

const wagerOptions: Array<{ preset: WagerPreset; label: string }> = [
  { preset: 'ten', label: '10%' },
  { preset: 'quarter', label: '25%' },
  { preset: 'half', label: '50%' },
  { preset: 'all_in', label: 'all in' },
];

function formatChips(value: number): string {
  return `${value >= 0 ? '+' : '−'}${Math.abs(value).toLocaleString()}`;
}

export function BettingControls() {
  const currentHand = useGameStore((state) => state.currentHand);
  const drawPile = useGameStore((state) => state.drawPile);
  const dynamicValues = useGameStore((state) => state.dynamicValues);
  const peekedTile = useGameStore((state) => state.peekedTile);
  const selectedPrediction = useGameStore((state) => state.selectedPrediction);
  const selectedWagerPreset = useGameStore((state) => state.selectedWagerPreset);
  const wager = useGameStore((state) => state.wager);
  const powers = useGameStore((state) => state.powers);
  const phase = useGameStore((state) => state.phase);
  const selectPrediction = useGameStore((state) => state.selectPrediction);
  const setWagerPreset = useGameStore((state) => state.setWagerPreset);
  const usePeek = useGameStore((state) => state.usePeek);
  const useRecut = useGameStore((state) => state.useRecut);
  const lockBet = useGameStore((state) => state.lockBet);

  const odds = useMemo(() => {
    if (!currentHand) return null;
    return calculateHandOdds(drawPile, currentHand.totalValue, dynamicValues, peekedTile ? [peekedTile] : []);
  }, [currentHand, drawPile, dynamicValues, peekedTile]);

  if (!currentHand || !odds) return null;

  const isDecision = phase === 'decision';
  const canLock = isDecision && Boolean(selectedPrediction) && wager > 0;

  const renderPrediction = (prediction: Prediction, title: string, hint: string) => {
    const probability = probabilityForPrediction(odds, prediction);
    const multiplier = calculatePayoutMultiplier(odds, prediction);
    const risk = getRiskLabel(multiplier);
    const profit = Math.round((wager * multiplier) / 10) * 10;

    return (
      <button
        type="button"
        key={prediction}
        onClick={() => selectPrediction(prediction)}
        disabled={!isDecision || probability === 0}
        className={cn(
          'prediction-card',
          `prediction-${prediction}`,
          selectedPrediction === prediction && 'is-selected'
        )}
      >
        <span className="prediction-direction">{title}</span>
        <strong>{Math.round(probability * 100)}%</strong>
        <span className="prediction-hint">{hint}</span>
        <span className={cn('prediction-return', `risk-${risk}`)}>
          {risk} · {formatChips(profit)}
        </span>
      </button>
    );
  };

  return (
    <section className="betting-panel-v2" aria-label="Place a table wager">
      <div className="betting-copy">
        <p className="panel-kicker">read the wall</p>
        <h2>Call the next hand</h2>
        <p>Pick a side, set your stake, then lock it in.</p>
      </div>

      <div className="prediction-grid">
        {renderPrediction('higher', 'Higher', 'rise above')}
        {renderPrediction('lower', 'Lower', 'fall below')}
      </div>

      <div className="wager-section">
        <div className="wager-heading">
          <span>stake</span>
          <strong>{wager.toLocaleString()} chips</strong>
        </div>
        <div className="wager-options">
          {wagerOptions.map(({ preset, label }) => (
            <button
              type="button"
              key={preset}
              disabled={!isDecision}
              className={cn('wager-chip', selectedWagerPreset === preset && 'is-selected', preset === 'all_in' && 'is-all-in')}
              onClick={() => setWagerPreset(preset)}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <div className="power-row">
        <button
          type="button"
          className="power-button"
          onClick={usePeek}
          disabled={!isDecision || powers.peek === 0 || Boolean(peekedTile)}
        >
          <Eye size={16} aria-hidden="true" />
          <span>peek</span>
          <b>{powers.peek}</b>
        </button>
        <button
          type="button"
          className="power-button"
          onClick={useRecut}
          disabled={!isDecision || powers.recut === 0 || !peekedTile}
        >
          <RefreshCw size={15} aria-hidden="true" />
          <span>recut</span>
          <b>{powers.recut}</b>
        </button>
      </div>

      {peekedTile && (
        <div className="peek-callout" role="status">
          <Sparkles size={15} aria-hidden="true" />
          First tile seen: <strong>{peekedTile.name}</strong>
        </div>
      )}

      <button type="button" className="lock-bet-button" disabled={!canLock} onClick={lockBet}>
        {selectedWagerPreset === 'all_in' ? 'Lock all in' : 'Lock bet'}
      </button>
    </section>
  );
}
