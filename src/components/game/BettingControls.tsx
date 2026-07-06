import React from 'react';
import { useGameStore } from '@/store/gameStore';
import { motion } from 'framer-motion';
import { ArrowUpCircle, ArrowDownCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

export function BettingControls() {
  const { placeBet, currentHand } = useGameStore();

  if (!currentHand) return null;

  return (
    <div className="betting-panel">
      <div>
        <p className="panel-kicker">place prediction</p>
        <p className="panel-title">Next hand value</p>
      </div>

      <div className="bet-button-grid">
        <motion.button
          whileHover={{ y: -2 }}
          whileTap={{ y: 3 }}
          onClick={() => placeBet('higher')}
          className={cn(
            "bet-button bet-button-higher"
          )}
        >
          <ArrowUpCircle size={24} />
          <span>Higher</span>
        </motion.button>

        <motion.button
          whileHover={{ y: -2 }}
          whileTap={{ y: 3 }}
          onClick={() => placeBet('lower')}
          className={cn(
            "bet-button bet-button-lower"
          )}
        >
          <ArrowDownCircle size={24} />
          <span>Lower</span>
        </motion.button>
      </div>
    </div>
  );
}
