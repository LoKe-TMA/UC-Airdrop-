import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Plane, Package, Send, X } from 'lucide-react';
import confetti from 'canvas-confetti';

export default function Airdrop({ onClose, points, setPoints }: { onClose: () => void, points: number, setPoints: (p: number) => void }) {
  const [step, setStep] = useState<'plane' | 'box' | 'claim' | 'form' | 'success' | 'loading'>('plane');
  const [pubgId, setPubgId] = useState('');

  const ucAmount = Math.floor(points / 1000); // Conversion logic

  useEffect(() => {
    // Sequence the animation
    const timers = [
      setTimeout(() => setStep('box'), 3500), // Start drop as plane clears center
      setTimeout(() => setStep('claim'), 8000), // Show loot after landing impact
    ];
    return () => timers.forEach(clearTimeout);
  }, []);

  const handleClaim = () => {
    if (ucAmount < 60) {
      const tg = (window as any).Telegram?.WebApp;
      if (tg) tg.showAlert("Minimum extraction value is 60 UC (60,000 points)");
      else alert("Minimum extraction value is 60 UC (60,000 points)");
      return;
    }
    setStep('form');
  };

  const handleSubmit = async () => {
    if (!pubgId) return;

    const tg = (window as any).Telegram?.WebApp;
    const userId = tg?.initDataUnsafe?.user?.id?.toString() || "0";
    setStep('loading');

    try {
      const res = await fetch('/api/withdraw', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ telegramId: userId, pubgId, amount: points })
      });
      const data = await res.json();
      
      if (data.success) {
        setPoints(0);
        confetti({
          particleCount: 150,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#eab308', '#ffffff', '#dc2626']
        });
        setStep('success');
      }
    } catch (err) {
      console.error("Extraction failed", err);
      setStep('form');
    }
  };

  return (
    <div className="fixed inset-0 z-[100] bg-zinc-950/98 flex flex-col items-center justify-center p-6 overflow-hidden">
      <button onClick={onClose} className="absolute top-8 right-8 text-zinc-500 hover:text-white transition-colors">
        <X className="w-10 h-10" />
      </button>

      {/* Atmospheric Background */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,_rgba(234,179,8,0.05),transparent_70%)] pointer-events-none"></div>

      <AnimatePresence mode="wait">
        {step === 'plane' && (
          <motion.div
            key="plane"
            initial={{ x: '-120vw', y: '20vh', rotate: 5 }}
            animate={{ x: '120vw', y: '-20vh', rotate: -5 }}
            transition={{ duration: 4, ease: 'linear' }}
            className="relative flex flex-col items-center"
          >
            <div className="text-yellow-500 animate-pulse mb-12 uppercase font-black italic tracking-[0.5em] text-4xl">Cargo Plane Incoming</div>
            
            {/* Plane Body */}
            <div className="relative">
              <Plane className="w-64 h-64 text-white drop-shadow-[0_20px_50px_rgba(255,255,255,0.2)]" />
              
              {/* Complex Smoke Trails */}
              <div className="absolute top-1/2 left-0 -translate-x-full space-y-4">
                {[...Array(3)].map((_, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: [0, 0.4, 0], scale: [1, 2, 4], x: [-20, -200 - (i * 50)] }}
                    transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.2 }}
                    className="w-8 h-8 bg-white/10 rounded-full blur-xl"
                  />
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {step === 'box' && (
          <motion.div
            key="box"
            initial={{ scale: 0.2 }}
            animate={{ scale: 1 }}
            className="relative flex flex-col items-center"
          >
            {/* Parachute Deployment */}
            <motion.div
              initial={{ y: '-80vh', opacity: 0 }}
              animate={{ y: '-10vh', opacity: 1 }}
              transition={{ duration: 2, ease: "easeOut" }}
              className="relative flex flex-col items-center"
            >
               {/* Parachute Canopy */}
               <motion.div 
                 animate={{ rotate: [-2, 2, -2] }}
                 transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                 className="w-48 h-24 bg-white border-4 border-zinc-200 rounded-t-full relative shadow-2xl"
               >
                 <div className="absolute inset-0 flex justify-between px-4">
                   {[...Array(6)].map((_, i) => (
                     <div key={i} className="w-px h-full bg-zinc-400/20" />
                   ))}
                 </div>
               </motion.div>
               
               {/* Strings */}
               <div className="h-24 w-48 relative overflow-hidden">
                 <svg className="w-full h-full" viewBox="0 0 200 100">
                    <path d="M10,0 L100,100 M50,0 L100,100 M90,0 L100,100 M110,0 L100,100 M150,0 L100,100 M190,0 L100,100" stroke="white" strokeWidth="1" opacity="0.4" />
                 </svg>
               </div>
            </motion.div>

            {/* The Supply Crate */}
            <motion.div
              initial={{ y: '-10vh' }}
              animate={{ y: '10vh' }}
              transition={{ 
                duration: 2.5, 
                times: [0, 0.8, 1],
                ease: "easeIn"
              }}
              onAnimationComplete={() => {
                const tg = (window as any).Telegram?.WebApp;
                if (tg) tg.HapticFeedback.impactOccurred('heavy');
              }}
              className="relative"
            >
               {/* Red Flare Smoke (Visible after impact) */}
               <motion.div 
                 initial={{ opacity: 0, scale: 0 }}
                 animate={{ opacity: 1, scale: 1 }}
                 transition={{ delay: 2.2 }}
                 className="absolute -top-64 left-1/2 -translate-x-1/2 w-32 h-[500px] bg-gradient-to-t from-red-600 via-red-600/20 to-transparent blur-3xl animate-pulse z-0" 
               />
               
               <div className="w-64 h-64 bg-zinc-800 border-x-[16px] border-zinc-700 shadow-[0_0_100px_rgba(220,38,38,0.4)] rounded-sm flex items-center justify-center relative z-10 overflow-hidden">
                  {/* Top Lid */}
                  <div className="absolute top-0 left-0 right-0 h-1/4 bg-red-600 border-b-4 border-black/20" />
                  {/* Straps */}
                  <div className="absolute inset-y-0 left-1/4 w-4 bg-zinc-950 shadow-lg" />
                  <div className="absolute inset-y-0 right-1/4 w-4 bg-zinc-950 shadow-lg" />
                  
                  <Package className="w-32 h-32 text-white/90 drop-shadow-lg" />
                  <div className="absolute top-4 right-4 w-4 h-4 bg-red-500 rounded-full animate-ping" />
               </div>
               
               <motion.div 
                 initial={{ opacity: 0 }}
                 animate={{ opacity: 1 }}
                 transition={{ delay: 2.5 }}
                 className="mt-24 text-center"
               >
                 <p className="text-red-500 font-black italic tracking-[0.4em] uppercase text-2xl animate-bounce">Supply Drop Secured</p>
                 <div className="w-32 h-1 bg-gradient-to-r from-transparent via-red-600 to-transparent mx-auto mt-4" />
               </motion.div>
            </motion.div>
          </motion.div>
        )}

        {step === 'claim' && (
          <motion.div
            key="claim"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center space-y-10 w-full max-w-sm"
          >
             <h2 className="text-5xl font-black italic text-white tracking-tighter uppercase leading-none">Victory <span className="text-yellow-500">Loot</span></h2>
             
             <div className="bg-zinc-900 border-2 border-yellow-500/50 p-10 rounded-[2.5rem] shadow-[0_0_50px_rgba(234,179,8,0.2)] relative overflow-hidden">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,_rgba(234,179,8,0.2),transparent_70%)]" />
                <p className="text-zinc-500 uppercase font-bold text-xs mb-4 tracking-[0.2em] relative z-10">Accumulated Rewards</p>
                <div className="text-7xl font-black text-white flex items-center justify-center gap-4 italic relative z-10 tracking-tighter">
                   {ucAmount} <span className="text-yellow-500 text-4xl block translate-y-1">UC</span>
                </div>
                <div className="w-full h-px bg-white/5 my-6 relative z-10" />
                <p className="text-[10px] text-zinc-400 font-medium uppercase tracking-widest relative z-10">Available for immediate extraction</p>
             </div>

             <button 
               onClick={handleClaim}
               className="w-full bg-yellow-500 text-zinc-950 font-black py-6 rounded-3xl text-xl uppercase italic shadow-[0_15px_30px_rgba(234,179,8,0.3)] hover:scale-105 active:scale-95 transition-all"
             >
               Confirm Extraction
             </button>
          </motion.div>
        )}

        {step === 'form' && (
          <motion.div
            key="form"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full max-w-sm space-y-8"
          >
             <div className="text-center">
               <h2 className="text-3xl font-black italic text-yellow-500 uppercase tracking-tight">Identity <span className="text-white">Check</span></h2>
               <p className="text-zinc-500 text-[10px] font-bold uppercase tracking-[0.2em] mt-1">Loot requires a valid character destination</p>
             </div>

             <div className="space-y-6">
                <div className="space-y-3">
                  <div className="flex justify-between items-center px-1">
                    <label className="text-[10px] uppercase font-black text-zinc-500 tracking-widest">Player ID Profile</label>
                    <span className="text-[8px] font-bold text-yellow-600 bg-yellow-500/10 px-2 py-0.5 rounded">REQUIRED</span>
                  </div>
                  <input 
                    type="text" 
                    value={pubgId}
                    onChange={(e) => setPubgId(e.target.value)}
                    placeholder="E.g. 5123456789"
                    className="w-full bg-zinc-900 border-2 border-white/5 p-6 rounded-3xl text-center text-3xl font-mono focus:border-yellow-500/50 outline-none transition-all placeholder:text-zinc-800 tracking-wider shadow-inner"
                  />
                </div>

                <div className="bg-zinc-900/50 p-4 rounded-2xl border border-white/5 space-y-2">
                   <div className="flex items-start gap-3">
                      <div className="w-1.5 h-1.5 bg-yellow-500 rounded-full mt-1.5 shrink-0" />
                      <p className="text-[10px] text-zinc-400 uppercase leading-snug font-bold">Extraction takes 24-48 hours for secure delivery.</p>
                   </div>
                   <div className="flex items-start gap-3">
                      <div className="w-1.5 h-1.5 bg-yellow-500 rounded-full mt-1.5 shrink-0" />
                      <p className="text-[10px] text-zinc-400 uppercase leading-snug font-bold">Ensure Player ID is absolutely correct.</p>
                   </div>
                </div>

                <button 
                  onClick={handleSubmit}
                  disabled={!pubgId}
                  className="w-full bg-zinc-800 text-white font-black py-6 rounded-3xl uppercase tracking-[0.15em] text-xs shadow-xl disabled:opacity-20 hover:bg-red-600 active:scale-95 transition-all group"
                >
                  Initiate UC Transfer
                </button>
             </div>
          </motion.div>
        )}

        {step === 'success' && (
          <motion.div
            key="success"
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="text-center space-y-8"
          >
             <div className="w-32 h-32 bg-yellow-500 rounded-[2.5rem] border-4 border-yellow-600 flex items-center justify-center mx-auto shadow-[0_0_60px_rgba(234,179,8,0.3)] -rotate-6">
                <Send className="w-16 h-16 text-zinc-950 rotate-12" />
             </div>
             
             <div className="space-y-4">
                <h2 className="text-4xl font-black italic uppercase text-white tracking-tighter leading-none">Operation <br/><span className="text-yellow-500">Successful</span></h2>
                <p className="text-zinc-500 text-[10px] font-bold uppercase tracking-widest max-w-[200px] mx-auto leading-relaxed">Your tactical squad is processing the UC extraction dispatch.</p>
             </div>

             <button 
               onClick={onClose}
               className="w-full px-12 py-5 bg-zinc-900 border border-white/10 rounded-2xl text-[10px] uppercase font-black tracking-[0.3em] text-zinc-400 hover:text-white transition-colors"
             >
               Return To Base
             </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
