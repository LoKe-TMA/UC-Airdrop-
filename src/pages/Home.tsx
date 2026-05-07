import React, { useState, useCallback } from 'react';
import { motion, useAnimation } from 'motion/react';

interface HomeProps {
  points: number;
  setPoints: (p: any) => void;
  energy: number;
  setEnergy: (e: any) => void;
  maxEnergy: number;
  canClaimDaily: boolean;
  setCanClaimDaily: (c: boolean) => void;
  dailyStreak: number;
  setDailyStreak: (s: number) => void;
  pointsPerTap: number;
}

export default function Home({ 
  points, 
  setPoints, 
  energy, 
  setEnergy, 
  maxEnergy,
  canClaimDaily,
  setCanClaimDaily,
  dailyStreak,
  setDailyStreak,
  pointsPerTap
}: HomeProps) {
  const [clicks, setClicks] = useState<{ id: number; x: number; y: number }[]>([]);
  const [claiming, setClaiming] = useState(false);
  const controls = useAnimation();

  const handleDailyClaim = async () => {
    if (claiming || !canClaimDaily) return;
    
    const tg = (window as any).Telegram?.WebApp;
    const userId = tg?.initDataUnsafe?.user?.id?.toString() || "0";
    setClaiming(true);

    try {
      const res = await fetch('/api/daily-claim', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ telegramId: userId })
      });
      const data = await res.json();
      
      if (data.success) {
        setPoints(data.points);
        setCanClaimDaily(false);
        setDailyStreak(data.streak);
        if (tg?.HapticFeedback) {
          tg.HapticFeedback.notificationOccurred('success');
        }
      }
    } catch (err) {
      console.error("Claim failed", err);
    } finally {
      setClaiming(false);
    }
  };

  const syncTaps = useCallback(async (count: number) => {
    const tg = (window as any).Telegram?.WebApp;
    const userId = tg?.initDataUnsafe?.user?.id?.toString() || "0";
    try {
      await fetch('/api/user/tap', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ telegramId: userId, count })
      });
    } catch (err) {
      console.error("Tap sync failed", err);
    }
  }, []);

  const handleTap = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    if (energy <= 0) return;

    // Haptic feedback
    const tg = (window as any).Telegram?.WebApp;
    if (tg?.HapticFeedback) {
      tg.HapticFeedback.impactOccurred('light');
    }

    const clientX = 'touches' in e ? (e as React.TouchEvent).touches[0].clientX : (e as React.MouseEvent).clientX;
    const clientY = 'touches' in e ? (e as React.TouchEvent).touches[0].clientY : (e as React.MouseEvent).clientY;

    const newPoints = pointsPerTap; // Use actual points per tap
    setPoints((p: number) => p + newPoints);
    setEnergy((e: number) => Math.max(0, e - newPoints));
    
    // Sync to backend
    syncTaps(newPoints);

    const id = Date.now();
    setClicks((prev) => [...prev, { id, x: clientX, y: clientY }]);
    setTimeout(() => {
      setClicks((prev) => prev.filter((c) => c.id !== id));
    }, 1000);

    // Bounce animation for box
    controls.start({
      scale: [1, 0.95, 1.05, 1],
      transition: { duration: 0.1 }
    });
  }, [energy, setPoints, setEnergy, controls, syncTaps]);

  return (
    <div className="flex flex-col items-center justify-center pt-12 relative select-none">
      
      {/* Income Stats Float */}
      <div className="flex gap-8 text-center mb-8">
        <div>
          <div className="text-[10px] text-zinc-500 uppercase font-bold tracking-widest mb-1">Profit per tap</div>
          <div className="text-yellow-500 font-bold text-lg">+{pointsPerTap} UC</div>
        </div>
        <div className="w-px h-8 bg-zinc-800"></div>
        <div>
          <div className="text-[10px] text-zinc-500 uppercase font-bold tracking-widest mb-1">Passive Income</div>
          <div className="text-yellow-500 font-bold text-lg">0 / hr</div>
        </div>
      </div>

      {/* Daily Reward Banner */}
      {canClaimDaily && (
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 w-full max-w-sm px-4"
        >
          <div className="bg-zinc-900 border-2 border-yellow-500/50 p-4 rounded-2xl flex items-center justify-between shadow-[0_0_20px_rgba(234,179,8,0.2)]">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-yellow-500 rounded-xl flex items-center justify-center shadow-lg">
                <span className="text-zinc-950 font-black text-xs uppercase italic">Day {dailyStreak + 1}</span>
              </div>
              <div>
                <div className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest">Daily Bonus</div>
                <div className="text-white font-black italic">{Math.min(500 * (dailyStreak + 1), 10000)} UC</div>
              </div>
            </div>
            <button 
              onClick={handleDailyClaim}
              disabled={claiming}
              className="bg-yellow-500 text-zinc-950 px-4 py-2 rounded-xl font-black text-xs uppercase italic shadow-md active:scale-95 transition-transform disabled:opacity-50"
            >
              {claiming ? "..." : "Claim"}
            </button>
          </div>
        </motion.div>
      )}

      {/* The Airdrop Crate (Clicker) */}
      <div className="relative cursor-pointer touch-none active:scale-95 transition-transform" onPointerDown={handleTap}>
        {/* Red Smoke Glow Effect */}
        <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-64 h-64 bg-red-600/20 blur-[80px] rounded-full"></div>
        
        <motion.div
           animate={controls}
           className="relative z-10 w-72 h-72 flex items-center justify-center p-4 bg-zinc-800 border-x-[12px] border-zinc-700 shadow-2xl rounded-sm"
        >
          {/* Top Lid (Red) */}
          <div className="absolute top-0 left-0 right-0 h-1/4 bg-red-600 border-b-4 border-black/20 flex items-center justify-center">
            <div className="w-full h-1 bg-white/20"></div>
          </div>
          
          {/* Straps */}
          <div className="absolute inset-y-0 left-1/4 w-4 bg-zinc-900 shadow-lg"></div>
          <div className="absolute inset-y-0 right-1/4 w-4 bg-zinc-900 shadow-lg"></div>
          
          {/* Center Icon */}
          <div className="absolute inset-0 flex items-center justify-center">
             <div className="w-24 h-24 border-4 border-yellow-500/50 rounded-full flex items-center justify-center rotate-45">
                <div className="w-16 h-16 bg-yellow-500/10 flex items-center justify-center -rotate-45">
                  <span className="text-yellow-500 text-4xl font-black">UC</span>
                </div>
             </div>
          </div>

          {/* Glowing Accents */}
          <div className="absolute top-2 right-2 w-3 h-3 bg-red-500 rounded-full animate-ping" />
        </motion.div>
      </div>

      {/* Clicker Label */}
      <div className="mt-12 text-yellow-500 font-black text-2xl uppercase italic tracking-[0.2em] animate-pulse">
        Tap To Loot
      </div>

      {/* Floating points animation */}
      {clicks.map((click) => (
        <motion.div
          key={click.id}
          initial={{ opacity: 1, y: click.y - 50, x: click.x - 20 }}
          animate={{ opacity: 0, y: click.y - 150 }}
          exit={{ opacity: 0 }}
          className="fixed pointer-events-none text-2xl font-black text-yellow-500 z-50 italic"
          style={{ textShadow: '2px 2px 0 #000' }}
        >
          +{pointsPerTap}
        </motion.div>
      ))}

      {/* Energy System Footer */}
      <div className="w-full max-w-sm mt-16 px-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="text-yellow-500 text-xl font-bold">⚡</span>
            <span className="font-black text-2xl italic tracking-tight">{energy} / {maxEnergy}</span>
          </div>
          <div className="text-zinc-500 text-[10px] font-bold uppercase tracking-widest">Regen: +1/s</div>
        </div>
        <div className="h-5 w-full bg-zinc-900 rounded-full border border-white/5 overflow-hidden p-1 shadow-inner relative">
          <motion.div 
             className="h-full bg-yellow-500 rounded-full shadow-[0_0_15px_rgba(234,179,8,0.5)]" 
             initial={false}
             animate={{ width: `${(energy / maxEnergy) * 100}%` }}
             transition={{ duration: 0.3 }}
          />
        </div>
      </div>
    </div>
  );
}

function Zap({ className }: any) {
  return (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>
  );
}
