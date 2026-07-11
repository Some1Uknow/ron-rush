'use client';

import { useState } from 'react';
import { ChevronDown, ChevronUp, History, Minus, TrendingDown, TrendingUp } from 'lucide-react';
import { useGameStore } from '@/store/gameStore';
import { cn } from '@/lib/utils';

function formatDelta(value: number): string {
  if (value === 0) return 'push';
  return `${value > 0 ? '+' : '−'}${Math.abs(value).toLocaleString()}`;
}

export function HistoryView() {
  const handHistory = useGameStore((state) => state.handHistory);
  const [isExpanded, setIsExpanded] = useState(false);

  if (handHistory.length === 0) return null;

  return (
    <section className="history-panel-v2">
      <button type="button" onClick={() => setIsExpanded((value) => !value)} className="history-toggle-v2">
        <span className="history-heading">
          <History size={17} aria-hidden="true" />
          <span>table ledger</span>
          <b>{handHistory.length}</b>
        </span>
        {isExpanded ? <ChevronUp size={18} aria-hidden="true" /> : <ChevronDown size={18} aria-hidden="true" />}
      </button>

      {isExpanded && (
        <div className="history-list-v2">
          {handHistory.map((entry) => {
            const isWin = entry.result === 'win';
            const isLoss = entry.result === 'loss';
            const Icon = isWin ? TrendingUp : isLoss ? TrendingDown : Minus;

            return (
              <article key={entry.id} className={cn('ledger-entry', `ledger-${entry.result}`)}>
                <span className="ledger-icon"><Icon size={15} aria-hidden="true" /></span>
                <div>
                  <strong>{entry.baselineHand.totalValue} → {entry.revealedHand.totalValue}</strong>
                  <span>{entry.prediction} · {Math.round((entry.prediction === 'higher' ? entry.odds.higher : entry.odds.lower) * 100)}%</span>
                </div>
                <b>{formatDelta(entry.chipDelta)}</b>
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}
