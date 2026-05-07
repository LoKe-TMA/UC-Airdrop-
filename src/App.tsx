import { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Trophy, Zap, Users, Rocket, ListChecks, Home as HomeIcon } from 'lucide-react';
import Home from './pages/Home';
import Boost from './pages/Boost';
import Tasks from './pages/Tasks';
import Friends from './pages/Friends';
import Leaderboard from './pages/Leaderboard';
import Airdrop from './pages/Airdrop';

// Telegram WebApp Type Definition
declare global {
  interface Window {
    Telegram: {
      WebApp: any;
    };
  }
}

export default function App() {
  const [activeTab, setActiveTab] = useState('home');
  const [user, setUser] = useState<any>(null);
  const [fullUser, setFullUser] = useState<any>(null);
  const [points, setPoints] = useState(0);
  const [energy, setEnergy] = useState(1000);
  const [maxEnergy, setMaxEnergy] = useState(1000);
  const [showAirdrop, setShowAirdrop] = useState(false);
  const [canClaimDaily, setCanClaimDaily] = useState(false);
  const [dailyStreak, setDailyStreak] = useState(0);
  const [upgrades, setUpgrades] = useState<any>({ multitap: 1, energyLimit: 1, rechargeSpeed: 1, tapBot: false });

  useEffect(() => {
    const tg = window.Telegram?.WebApp;
    if (tg) {
      tg.ready();
      tg.expand();
      tg.enableClosingConfirmation();
      
      const initData = tg.initDataUnsafe;
      const userData = initData.user || { first_name: "Player", id: 0 };
      setUser(userData);

      // Capture Referrer ID from start_param
      const urlParams = new URLSearchParams(window.location.search);
      const referrerId = urlParams.get('tgWebAppStartParam');

      // Sync with Backend
      fetch('/api/user/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ initData: tg.initData, userData, referrerId })
      })
      .then(res => res.json())
      .then(data => {
        setFullUser(data);
        if (data.points !== undefined) setPoints(data.points);
        if (data.energy !== undefined) setEnergy(data.energy);
        if (data.maxEnergy !== undefined) setMaxEnergy(data.maxEnergy);
        if (data.canClaimDaily !== undefined) setCanClaimDaily(data.canClaimDaily);
        if (data.dailyLoginStreak !== undefined) setDailyStreak(data.dailyLoginStreak);
        if (data.upgrades) setUpgrades(data.upgrades);
      })
      .catch(err => console.error("Sync failed", err));
    }
  }, []);

  // Energy regeneration logic (Visual only, server verifies)
  useEffect(() => {
    const interval = setInterval(() => {
      setEnergy((prev) => Math.min(prev + (upgrades?.rechargeSpeed || 1), maxEnergy));
    }, 1000);
    return () => clearInterval(interval);
  }, [maxEnergy, upgrades?.rechargeSpeed]);

  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    // Target date: End of the current month
    const now = new Date();
    const target = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);

    const timer = setInterval(() => {
      const currentTime = new Date();
      const diff = target.getTime() - currentTime.getTime();

      if (diff <= 0) {
        clearInterval(timer);
        return;
      }

      setTimeLeft({
        days: Math.floor(diff / (1000 * 60 * 60 * 24)),
        hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((diff / 1000 / 60) % 60),
        seconds: Math.floor((diff / 1000) % 60)
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const renderPage = () => {
    switch (activeTab) {
      case 'home': return (
        <Home 
          points={points} 
          setPoints={setPoints} 
          energy={energy} 
          setEnergy={setEnergy} 
          maxEnergy={maxEnergy} 
          canClaimDaily={canClaimDaily}
          setCanClaimDaily={setCanClaimDaily}
          dailyStreak={dailyStreak}
          setDailyStreak={setDailyStreak}
          pointsPerTap={upgrades?.multitap || 1}
        />
      );
      case 'boost': return (
        <Boost 
          points={points} 
          setPoints={setPoints} 
          maxEnergy={maxEnergy} 
          setMaxEnergy={setMaxEnergy} 
          upgrades={upgrades}
          setUpgrades={setUpgrades}
        />
      );
      case 'tasks': return <Tasks setPoints={setPoints} />;
      case 'friends': return <Friends user={fullUser || user} />;
      case 'leaderboard': return <Leaderboard />;
      default: return (
        <Home 
          points={points} 
          setPoints={setPoints} 
          energy={energy} 
          setEnergy={setEnergy} 
          maxEnergy={maxEnergy} 
          canClaimDaily={canClaimDaily}
          setCanClaimDaily={setCanClaimDaily}
          dailyStreak={dailyStreak}
          setDailyStreak={setDailyStreak}
          pointsPerTap={upgrades?.multitap || 1}
        />
      );
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-white font-sans selection:bg-yellow-500 flex flex-col relative overflow-hidden">
      {/* Background Atmosphere */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_40%,_rgba(234,179,8,0.1),transparent_70%)] pointer-events-none"></div>

      {/* Top Header: User Stats */}
      <header className="relative z-10 flex items-center justify-between p-6 bg-zinc-900/50 border-b border-white/10 backdrop-blur-sm">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-yellow-500 rounded-lg flex items-center justify-center shadow-[0_0_15px_rgba(234,179,8,0.3)] border-2 border-yellow-600">
            <span className="text-zinc-950 font-black text-xl italic">{user?.first_name?.charAt(0) || 'P'}</span>
          </div>
          <div>
            <div className="text-[10px] text-yellow-500 font-bold tracking-[0.2em] uppercase">Vanguard Operator</div>
            <div className="text-lg font-bold italic tracking-tight">{user?.first_name || 'Survivor'}</div>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="bg-zinc-800/80 px-4 py-2 rounded-full border border-white/5 flex items-center gap-2">
            <div className="w-5 h-5 bg-yellow-500 rounded-full flex items-center justify-center">
              <span className="text-zinc-950 text-[8px] font-black underline italic">UC</span>
            </div>
            <span className="text-lg font-black tracking-tighter tabular-nums text-yellow-500">
              {points.toLocaleString()}
            </span>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto relative z-10 pb-32">
        {/* Airdrop Countdown Bar */}
        <div className="mx-6 mt-4 mb-2 bg-zinc-900/80 border border-white/5 rounded-xl p-3 flex items-center justify-between backdrop-blur-md">
           <div className="flex items-center gap-2">
             <div className="w-2 h-2 bg-red-600 rounded-full animate-pulse shadow-[0_0_8px_rgba(220,38,38,0.5)]"></div>
             <span className="text-[9px] font-black uppercase tracking-[0.2em] text-zinc-400">Season 01 Drop In:</span>
           </div>
           <div className="flex gap-3">
             <div className="flex flex-col items-center">
                <span className="text-xs font-black text-yellow-500 tabular-nums">{timeLeft.days}d</span>
             </div>
             <span className="text-zinc-700 font-bold">:</span>
             <div className="flex flex-col items-center">
                <span className="text-xs font-black text-yellow-500 tabular-nums">{timeLeft.hours.toString().padStart(2, '0')}h</span>
             </div>
             <span className="text-zinc-700 font-bold">:</span>
             <div className="flex flex-col items-center">
                <span className="text-xs font-black text-yellow-500 tabular-nums">{timeLeft.minutes.toString().padStart(2, '0')}m</span>
             </div>
             <span className="text-zinc-700 font-bold">:</span>
             <div className="flex flex-col items-center">
                <span className="text-xs font-black text-white tabular-nums animate-pulse">{timeLeft.seconds.toString().padStart(2, '0')}s</span>
             </div>
           </div>
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.02 }}
            transition={{ duration: 0.2 }}
          >
            {renderPage()}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-zinc-900 border-t border-white/10 px-6 py-4 flex items-center justify-around z-50 shadow-[0_-10px_20px_rgba(0,0,0,0.5)]">
        <NavButton active={activeTab === 'home'} onClick={() => setActiveTab('home')} icon={<HomeIcon className="w-6 h-6" />} label="Base" />
        <NavButton active={activeTab === 'boost'} onClick={() => setActiveTab('boost')} icon={<Rocket className="w-6 h-6" />} label="Boost" />
        <NavButton active={activeTab === 'tasks'} onClick={() => setActiveTab('tasks')} icon={<ListChecks className="w-6 h-6" />} label="Tasks" />
        <NavButton active={activeTab === 'friends'} onClick={() => setActiveTab('friends')} icon={<Users className="w-6 h-6" />} label="Squad" />
        <NavButton active={activeTab === 'leaderboard'} onClick={() => setActiveTab('leaderboard')} icon={<Trophy className="w-6 h-6" />} label="Drops" />
      </nav>

      {/* Side Badges (Vibrant Palette style) */}
      <div className="fixed right-6 top-1/2 -translate-y-1/2 flex flex-col gap-4 z-40 hidden md:flex">
        <div className="bg-zinc-900 border border-white/10 p-3 rounded-xl flex flex-col items-center shadow-lg">
           <div className="text-red-500 font-bold text-[8px] mb-1">ADS</div>
           <div className="w-6 h-6 bg-zinc-800 rounded flex items-center justify-center text-yellow-500 text-xs">▶</div>
        </div>
        <div className="bg-zinc-900 border border-white/10 p-3 rounded-xl flex flex-col items-center shadow-lg">
           <div className="text-blue-500 font-bold text-[8px] mb-1">BOT</div>
           <div className="w-6 h-6 bg-zinc-800 rounded flex items-center justify-center text-green-500 text-[8px] font-bold">ON</div>
        </div>
      </div>

      {/* Cinematic Airdrop Overlay */}
      {showAirdrop && <Airdrop onClose={() => setShowAirdrop(false)} points={points} setPoints={setPoints} />}
    </div>
  );
}

function NavButton({ active, onClick, icon, label }: any) {
  return (
    <button 
      onClick={onClick}
      className={`flex flex-col items-center gap-1 transition-all duration-300 relative ${active ? 'text-yellow-500 scale-110' : 'text-zinc-500 opacity-60'}`}
    >
      <div className={`p-2 rounded-xl transition-all duration-300 ${active ? 'bg-yellow-500 text-zinc-950 shadow-[0_0_15px_rgba(234,179,8,0.4)]' : ''}`}>
        {icon}
      </div>
      <span className="text-[9px] uppercase font-black tracking-widest leading-none">{label}</span>
    </button>
  );
}
