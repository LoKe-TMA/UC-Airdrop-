import React, { useEffect, useState } from 'react';
import { Trophy, Crown, TrendingUp, Loader2 } from 'lucide-react';
import { motion } from 'motion/react';

interface Player {
  telegramId: string;
  firstName: string;
  username?: string;
  points: number;
}

export default function Leaderboard() {
  const [players, setPlayers] = useState<Player[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/leaderboard')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setPlayers(data);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
     return (
       <div className="flex flex-col items-center justify-center p-20 space-y-4">
         <Loader2 className="w-10 h-10 text-yellow-500 animate-spin" />
         <p className="text-zinc-500 text-[10px] uppercase font-bold tracking-[0.2em]">Syncing Global Rankings...</p>
       </div>
     );
  }

  const topPlayers = players.slice(0, 3);
  const others = players.slice(3, 20);

  return (
    <div className="space-y-6 pt-4 px-4 pb-48">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-black italic text-white tracking-tighter uppercase">Hall of <span className="text-yellow-500">Valor</span></h2>
        <p className="text-zinc-500 text-[10px] font-bold uppercase tracking-widest mt-1">Global ranking of the world's most elite operators</p>
      </div>

      {/* Podium */}
      {topPlayers.length >= 3 && (
        <div className="flex items-end justify-center gap-3 mb-10 pt-12 relative">
          {/* Rank 2 */}
          <div className="flex flex-col items-center gap-3">
             <div className="relative">
               <div className="w-16 h-16 rounded-2xl border-2 border-zinc-500 overflow-hidden bg-zinc-800 rotate-[-4deg] flex items-center justify-center text-zinc-500 font-black italic">
                  {topPlayers[1].firstName.charAt(0)}
               </div>
               <div className="absolute -bottom-2 -right-2 bg-zinc-500 text-zinc-950 text-[10px] font-black w-6 h-6 flex items-center justify-center rounded-lg shadow-lg">2</div>
             </div>
             <div className="h-24 w-20 bg-zinc-900 border-x border-t border-white/5 rounded-t-2xl flex flex-col items-center justify-center shadow-2xl">
                <span className="text-[10px] font-black text-zinc-500 italic uppercase">Silver</span>
                <span className="text-[10px] font-bold text-white truncate w-16 text-center">{topPlayers[1].firstName}</span>
                <span className="text-[10px] font-black text-yellow-500">{topPlayers[1].points.toLocaleString()}</span>
             </div>
          </div>

          {/* Rank 1 */}
          <div className="flex flex-col items-center gap-3 scale-110 relative z-10">
             <div className="relative">
               <Crown className="w-8 h-8 text-yellow-500 absolute -top-8 left-1/2 -translate-x-1/2 drop-shadow-[0_0_15px_rgba(234,179,8,0.5)] animate-bounce" />
               <div className="w-24 h-24 rounded-3xl border-4 border-yellow-500 overflow-hidden shadow-[0_0_30px_rgba(234,179,8,0.3)] bg-zinc-800 flex items-center justify-center text-yellow-500 font-black text-2xl italic">
                  {topPlayers[0].firstName.charAt(0)}
               </div>
               <div className="absolute -bottom-2 -right-2 bg-yellow-500 text-zinc-950 text-[12px] font-black w-8 h-8 flex items-center justify-center rounded-xl shadow-xl">1</div>
             </div>
             <div className="h-32 w-24 bg-gradient-to-t from-yellow-500/10 to-zinc-900 border-x-2 border-t-2 border-yellow-500/30 rounded-t-2xl shadow-2xl flex flex-col items-center justify-center px-2">
                <span className="text-[10px] font-black text-yellow-500 italic uppercase">Champion</span>
                <span className="text-xs font-black text-white truncate w-full text-center">{topPlayers[0].firstName}</span>
                <span className="text-sm font-black text-yellow-500">{topPlayers[0].points.toLocaleString()}</span>
             </div>
          </div>

          {/* Rank 3 */}
          <div className="flex flex-col items-center gap-3">
             <div className="relative">
               <div className="w-16 h-16 rounded-2xl border-2 border-orange-800 overflow-hidden bg-zinc-800 rotate-[4deg] flex items-center justify-center text-orange-800 font-black italic">
                  {topPlayers[2].firstName.charAt(0)}
               </div>
               <div className="absolute -bottom-2 -right-2 bg-orange-800 text-zinc-950 text-[10px] font-black w-6 h-6 flex items-center justify-center rounded-lg shadow-lg">3</div>
             </div>
             <div className="h-20 w-20 bg-zinc-900 border-x border-t border-white/5 rounded-t-2xl flex flex-col items-center justify-center shadow-2xl">
                <span className="text-[10px] font-black text-orange-800 italic uppercase">Bronze</span>
                <span className="text-[10px] font-bold text-white truncate w-16 text-center">{topPlayers[2].firstName}</span>
                <span className="text-[10px] font-black text-yellow-500">{topPlayers[2].points.toLocaleString()}</span>
             </div>
          </div>
        </div>
      )}

      {/* List */}
      <div className="space-y-3">
        <h3 className="text-[10px] text-zinc-500 font-black uppercase tracking-[0.3em] ml-2">Elite Vanguard</h3>
        {others.map((player, index) => (
          <motion.div 
            key={player.telegramId} 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className="bg-zinc-900 p-5 rounded-2xl border border-white/5 flex items-center justify-between shadow-lg group hover:border-yellow-500/20 transition-all"
          >
            <div className="flex items-center gap-4">
               <span className="text-xs font-black text-zinc-600 italic w-4">#{index + 4}</span>
               <div className="w-10 h-10 rounded-xl bg-zinc-800 border border-white/5 group-hover:bg-zinc-700 transition-colors flex items-center justify-center text-zinc-500 font-black italic text-xs">
                 {player.firstName.charAt(0)}
               </div>
               <span className="text-sm font-bold tracking-tight">{player.firstName}</span>
            </div>
            <div className="flex items-center gap-2 text-yellow-500 font-black italic text-xs bg-zinc-800 px-3 py-1.5 rounded-full border border-white/5 shadow-inner">
               <TrendingUp className="w-3 h-3" /> {player.points.toLocaleString()}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
