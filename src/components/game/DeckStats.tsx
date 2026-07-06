import React from 'react';
import { useGameStore } from '@/store/gameStore';
import { Layers, Recycle, Trophy } from 'lucide-react';
import { motion } from 'framer-motion';

export function DeckStats() {
  const { drawPile, discardPile, reshuffleCount, score } = useGameStore();

  return (
    <div className="rail-stats">
      <StatCard 
        icon={<Layers className="text-amber-600" size={18} />}
        label="Wall"
        value={drawPile.length}
      />
      <StatCard 
        icon={<Recycle className="text-amber-600" size={18} />}
        label="River"
        value={discardPile.length}
      />
      <StatCard 
        icon={<Recycle className="text-rose-600" size={18} />}
        label="Reshuffles"
        value={reshuffleCount}
        subValue="/ 3"
        isAlert={reshuffleCount >= 2}
      />
      <StatCard 
        icon={<Trophy className="text-emerald-600" size={18} />}
        label="Score"
        value={score}
        isHighlight
      />
    </div>
  );
}

function StatCard({ 
  icon, 
  label, 
  value, 
  subValue, 
  isAlert = false, 
  isHighlight = false 
}: { 
  icon: React.ReactNode; 
  label: string; 
  value: string | number; 
  subValue?: string;
  isAlert?: boolean;
  isHighlight?: boolean;
}) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`stat-tile ${
        isHighlight ? 'border-emerald-200 ring-2 ring-emerald-100/50' : 
        isAlert ? 'border-rose-200 ring-2 ring-rose-100/50' : 
        'border-amber-100'
      }`}
    >
      <div className="flex items-center gap-2">
        {icon}
        <span className="stat-label">{label}</span>
      </div>
      <div className="flex items-baseline gap-1">
        <span className={`stat-value ${isHighlight ? 'text-emerald-700' : isAlert ? 'text-rose-700' : 'text-amber-950'}`}>
          {value}
        </span>
        {subValue && <span className="stat-subvalue">{subValue}</span>}
      </div>
    </motion.div>
  );
}
