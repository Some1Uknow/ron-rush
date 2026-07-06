import React, { useState } from 'react';
import { useGameStore } from '@/store/gameStore';
import { MahjongTile } from '../ui/MahjongTile';
import { CheckCircle2, XCircle, MinusCircle, History, ChevronDown, ChevronUp } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

export function HistoryView() {
  const { handHistory, dynamicValues } = useGameStore();
  const [isExpanded, setIsExpanded] = useState(false);

  if (handHistory.length === 0) return null;

  return (
    <div className="history-panel">
      <button 
        onClick={() => setIsExpanded(!isExpanded)}
        className="history-toggle group"
      >
        <div className="flex items-center gap-3">
          <div className="history-icon">
            <History size={20} />
          </div>
          <h3 className="font-bold text-amber-950 group-hover:translate-x-1 transition-transform">River Log</h3>
          <span className="history-count">
            {handHistory.length} Hands
          </span>
        </div>
        {isExpanded ? <ChevronUp className="text-amber-400" /> : <ChevronDown className="text-amber-400" />}
      </button>

      <AnimatePresence>
        {isExpanded && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
          >
            <div className="p-3 pt-0 max-h-[250px] overflow-y-auto custom-scrollbar">
              <div className="flex flex-col gap-3 pb-4">
                {handHistory.map((entry, index) => {
                  const isLatest = index === 0;
                  return (
                    <motion.div 
                      key={entry.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={cn(
                        "history-entry",
                        isLatest 
                          ? "history-entry-latest" 
                          : "grayscale-[0.3] opacity-80"
                      )}
                    >
                      <div className="flex flex-col items-start gap-1">
                        <div className="flex items-center gap-2">
                          <span className="text-lg font-black text-amber-900">{entry.hand.totalValue}</span>
                          {isLatest && (
                            <span className="text-[10px] font-black bg-amber-200 text-amber-800 px-1.5 py-0.5 rounded uppercase tracking-tighter">latest</span>
                          )}
                        </div>
                      <div className="flex items-center gap-2">
                        {entry.result === 'win' && <CheckCircle2 size={16} className="text-emerald-500" />}
                        {entry.result === 'loss' && <XCircle size={16} className="text-rose-500" />}
                        {(entry.result === 'tie' || entry.result === null) && <MinusCircle size={16} className="text-amber-500" />}
                        <span className={cn(
                          "text-xs font-black uppercase tracking-wider",
                          entry.result === 'win' ? "text-emerald-600" : entry.result === 'loss' ? "text-rose-600" : "text-amber-600"
                        )}>
                          {entry.result ?? 'No Result'} (Bet: {entry.betType ?? 'None'})
                        </span>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-1.5 bg-amber-100/20 p-2 rounded-xl border border-amber-200/30">
                      {entry.hand.tiles.map((tile, i) => (
                        <MahjongTile 
                          key={`${entry.id}-tile-${i}`} 
                          tile={tile} 
                          currentValue={dynamicValues[tile.name] ?? tile.baseValue}
                          size="mini"
                        />
                      ))}
                    </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
