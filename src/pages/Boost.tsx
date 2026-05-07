import React, { useState } from 'react';
import { Rocket, Zap, Clock, Bot, ZapOff } from 'lucide-react';
import { motion } from 'motion/react';

interface BoostProps {
  points: number;
  setPoints: (p: any) => void;
  maxEnergy: number;
  setMaxEnergy: (e: any) => void;
  upgrades: any;
  setUpgrades: (u: any) => void;
}

export default function Boost({ points, setPoints, maxEnergy, setMaxEnergy, upgrades: userUpgrades, setUpgrades }: BoostProps) {
  const [purchasing, setPurchasing] = useState<string | null>(null);

  const upgradeList = [
    { id: 'multitap', name: 'Multitap', price: (userUpgrades?.multitap || 1) * 1000, icon: <Rocket className="text-blue-400 w-6 h-6" />, desc: 'Increases points per tap', level: userUpgrades?.multitap || 1 },
    { id: 'energyLimit', name: 'Energy Limit', price: (userUpgrades?.energyLimit || 1) * 1000, icon: <Zap className="text-yellow-500 w-6 h-6" />, desc: 'Adds +500 max energy', level: userUpgrades?.energyLimit || 1 },
    { id: 'rechargeSpeed', name: 'Recharge Speed', price: (userUpgrades?.rechargeSpeed || 1) * 2000, icon: <Clock className="text-green-400 w-6 h-6" />, desc: 'Faster energy recovery', level: userUpgrades?.rechargeSpeed || 1 },
    { id: 'tapBot', name: 'Tap Bot', price: 50000, icon: <Bot className="text-purple-400 w-6 h-6" />, desc: 'Automated taps while away', level: userUpgrades?.tapBot ? 1 : 0 },
  ];

  const handlePurchase = async (upgradeId: string, price: number) => {
    if (points < price || purchasing) return;
    
    const tg = (window as any).Telegram?.WebApp;
    const userId = tg?.initDataUnsafe?.user?.id?.toString() || "0";
    setPurchasing(upgradeId);

    try {
      const res = await fetch('/api/user/upgrade', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ telegramId: userId, upgradeId })
      });
      const data = await res.json();
      
      if (data.points !== undefined) {
        setPoints(data.points);
        setUpgrades(data.upgrades);
        setMaxEnergy(data.maxEnergy);
        if (tg) tg.HapticFeedback.notificationOccurred('success');
      }
    } catch (err) {
      console.error("Purchase failed", err);
    } finally {
      setPurchasing(null);
    }
  };

  return (
    <div className="space-y-6 pt-4 px-4 pb-12">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-black italic text-white tracking-tighter uppercase">Arsenal <span className="text-yellow-500">Boosts</span></h2>
        <p className="text-zinc-500 text-[10px] font-bold uppercase tracking-widest mt-1">Upgrade your equipment for maximum efficiency</p>
      </div>

      <div className="grid gap-4">
        {upgradeList.map((item) => (
          <motion.div
            key={item.id}
            whileTap={{ scale: 0.98 }}
            className="bg-zinc-900 border border-white/5 p-5 rounded-2xl flex items-center justify-between group hover:border-yellow-500/20 transition-all shadow-lg"
          >
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-xl bg-zinc-800 flex items-center justify-center border border-white/5 group-hover:border-yellow-500/30 transition-colors">
                {item.icon}
              </div>
              <div>
                <h3 className="font-bold text-sm tracking-tight">{item.name} <span className="text-zinc-500 text-[10px] ml-1">Lvl {item.level}</span></h3>
                <p className="text-[10px] text-zinc-500 font-medium">{item.desc}</p>
              </div>
            </div>
            <button 
              onClick={() => handlePurchase(item.id, item.price)}
              disabled={points < item.price || purchasing === item.id || (item.id === 'tapBot' && userUpgrades?.tapBot)}
              className={`px-5 py-2 rounded-xl text-xs font-black uppercase tracking-tight transition-all
                ${(points >= item.price && !(item.id === 'tapBot' && userUpgrades?.tapBot)) 
                  ? 'bg-yellow-500 text-zinc-950 shadow-[0_0_15px_rgba(234,179,8,0.4)] hover:scale-105' 
                  : 'bg-zinc-800 text-zinc-600 opacity-50 cursor-not-allowed'}`}
            >
              {item.id === 'tapBot' && userUpgrades?.tapBot ? 'OWNED' : item.price.toLocaleString()}
            </button>
          </motion.div>
        ))}
      </div>

      {/* Turbo Boost Section */}
      <div className="mt-10 pt-8 border-t border-white/5">
        <h3 className="text-[10px] text-zinc-500 font-black uppercase tracking-[0.3em] mb-6 text-center">Daily Tactical Advancements</h3>
        <div className="grid grid-cols-2 gap-4">
           <button className="bg-zinc-900 border border-white/5 p-6 rounded-2xl flex flex-col items-center gap-3 active:scale-95 transition-transform">
              <Zap className="w-10 h-10 text-yellow-500 drop-shadow-[0_0_10px_rgba(234,179,8,0.3)]" />
              <div className="text-center">
                <p className="text-xs font-black italic tracking-widest uppercase">TURBO</p>
                <div className="flex items-center justify-center gap-1 mt-1">
                   {[1,2,3].map(i => <div key={i} className="w-2 h-1 bg-yellow-500 rounded-full" />)}
                </div>
              </div>
           </button>
           <button className="bg-zinc-900 border border-white/5 p-6 rounded-2xl flex flex-col items-center gap-3 active:scale-95 transition-transform">
              <ZapOff className="w-10 h-10 text-blue-500 drop-shadow-[0_0_10px_rgba(59,130,246,0.3)]" />
              <div className="text-center">
                <p className="text-xs font-black italic tracking-widest uppercase">REFILL</p>
                <div className="flex items-center justify-center gap-1 mt-1">
                   {[1,2,3].map(i => <div key={i} className="w-2 h-1 bg-blue-500 rounded-full" />)}
                </div>
              </div>
           </button>
        </div>
      </div>
    </div>
  );
}
