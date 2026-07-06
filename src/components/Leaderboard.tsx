import React from 'react';
import { useLeaderboardStore } from '@/store/leaderboardStore';
import { Trophy, Medal, Crown } from 'lucide-react';
import { motion } from 'framer-motion';

export function Leaderboard() {
  const { entries } = useLeaderboardStore();

  return (
    <div className="leaderboard-card">
      <div className="leaderboard-head">
        <div className="absolute top-0 left-0 w-full h-full vintage-overlay opacity-20 pointer-events-none" />
        <Trophy className="w-10 h-10 mx-auto mb-3 opacity-90 text-amber-200" />
        <h2 className="text-3xl font-black uppercase tracking-[0.2em] select-none">Hall of Fame</h2>
        <p className="text-amber-200/60 text-[10px] font-bold uppercase tracking-widest mt-1">Ron Rush table records</p>
      </div>

      <div className="leaderboard-body">
        {entries.length === 0 ? (
          <div className="leaderboard-empty">
            <div className="w-12 h-12 rounded-md bg-amber-100 flex items-center justify-center text-amber-600 opacity-50">
              <Trophy size={24} />
            </div>
            <p className="text-amber-900/40 text-xs font-bold uppercase tracking-widest">No legends yet</p>
          </div>
        ) : (
          <motion.ul 
            variants={{
              show: { transition: { staggerChildren: 0.1 } }
            }}
            initial="hidden"
            animate="show"
            className="space-y-2"
          >
            {entries.map((entry, index) => (
              <motion.li 
                key={entry.id} 
                variants={{
                  hidden: { opacity: 0, x: -20 },
                  show: { opacity: 1, x: 0 }
                }}
                className="leaderboard-row group"
              >
                <div className="flex-shrink-0 w-8 flex justify-center">
                  {index === 0 && <Crown className="text-amber-500 w-6 h-6 animate-bounce" />}
                  {index === 1 && <Medal className="text-gray-400 w-6 h-6" />}
                  {index === 2 && <Medal className="text-amber-700 w-6 h-6" />}
                  {index > 2 && <span className="text-lg font-black text-amber-900/20">0{index + 1}</span>}
                </div>
                
                <div className="flex-1 overflow-hidden text-left">
                  <div className="font-black text-amber-900 truncate uppercase tracking-tight">{entry.name}</div>
                  <div className="text-[10px] text-amber-900/30 font-bold uppercase tracking-widest">{new Date(entry.date).toLocaleDateString()}</div>
                </div>
                
                <div className="text-right">
                  <span className="leaderboard-score">
                    {entry.score}
                  </span>
                </div>
              </motion.li>
            ))}
          </motion.ul>
        )}
      </div>
    </div>
  );
}
