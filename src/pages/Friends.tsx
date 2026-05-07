import { Share2, Users, Gift, Copy } from 'lucide-react';
import { motion } from 'motion/react';

export default function Friends({ user }: { user: any }) {
  const referLink = `https://t.me/PUBGClickerBot/app?startapp=${user?.telegramId || user?.id || 'player'}`;

  const handleShare = () => {
    const tg = (window as any).Telegram?.WebApp;
    if (tg) {
      tg.openTelegramLink(`https://t.me/share/url?url=${encodeURIComponent(referLink)}&text=${encodeURIComponent("Join me in PUBG Clicker and earn UC rewards! 🪂")}`);
    }
  };

  const referralsCount = user?.referrals?.length || 0;
  const bonusUC = referralsCount * 25000;

  return (
    <div className="space-y-6 pt-4 px-4 pb-12">
      <div className="text-center mb-8 pt-4">
        <div className="w-24 h-24 bg-yellow-500/10 rounded-3xl flex items-center justify-center mx-auto mb-6 border-2 border-yellow-500/20 shadow-2xl rotate-3 hover:rotate-0 transition-transform">
           <Users className="w-12 h-12 text-yellow-500" />
        </div>
        <h2 className="text-3xl font-black italic text-white tracking-tighter uppercase">Squad <span className="text-yellow-500">Recruitment</span></h2>
        <p className="text-zinc-500 text-[10px] font-bold uppercase tracking-widest mt-1 px-8 leading-relaxed">Build your tactical squad and secure bonus UC for every recruit!</p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="bg-zinc-900 p-6 rounded-3xl border border-white/5 text-center shadow-lg">
           <p className="text-3xl font-black italic text-white">{referralsCount}</p>
           <p className="text-[10px] text-zinc-500 uppercase font-black tracking-[0.2em] mt-1">Squad Size</p>
        </div>
        <div className="bg-zinc-900 p-6 rounded-3xl border border-white/5 text-center shadow-lg">
           <p className="text-3xl font-black italic text-yellow-500">+{bonusUC.toLocaleString()}</p>
           <p className="text-[10px] text-zinc-500 uppercase font-black tracking-[0.2em] mt-1">Recruit Bonus</p>
        </div>
      </div>

      <div className="bg-zinc-900 rounded-3xl border border-white/10 p-8 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 p-4 opacity-5">
           <Gift className="w-16 h-16 text-white" />
        </div>
        <h3 className="font-black italic uppercase tracking-tighter mb-6 flex items-center gap-2 text-sm">
          <div className="w-4 h-4 bg-yellow-500 rounded-full flex items-center justify-center">
            <Gift className="w-2.5 h-2.5 text-zinc-950" />
          </div>
          Recruitment Rewards
        </h3>
        <ul className="space-y-5">
          <li className="flex items-center justify-between">
            <span className="text-xs font-bold text-zinc-400">Regular Recruit</span>
            <div className="flex items-center gap-2">
               <span className="text-xs font-black text-yellow-500 italic">+5,000</span>
               <div className="w-4 h-4 rounded-full bg-zinc-800 flex items-center justify-center text-[7px] font-black underline italic text-yellow-500">UC</div>
            </div>
          </li>
          <li className="flex items-center justify-between">
            <span className="text-xs font-bold text-zinc-400">Premium Recruit</span>
            <div className="flex items-center gap-2">
               <span className="text-xs font-black text-yellow-500 italic">+25,000</span>
               <div className="w-4 h-4 rounded-full bg-zinc-800 flex items-center justify-center text-[7px] font-black underline italic text-yellow-500">UC</div>
            </div>
          </li>
        </ul>
      </div>

      <div className="flex gap-3 pt-6">
        <button 
          onClick={handleShare}
          className="flex-1 bg-yellow-500 text-zinc-950 font-black py-5 rounded-2xl flex items-center justify-center gap-3 uppercase text-xs tracking-[0.1em] shadow-[0_10px_20px_rgba(234,179,8,0.2)] active:scale-95 transition-transform"
        >
          <Share2 className="w-5 h-5" /> Recruit Friends
        </button>
        <button 
          onClick={() => {
            navigator.clipboard.writeText(referLink);
            const tg = (window as any).Telegram?.WebApp;
            if (tg) tg.HapticFeedback.notificationOccurred('success');
          }}
          className="bg-zinc-800 border border-white/10 p-5 rounded-2xl active:bg-zinc-700 transition-colors"
        >
          <Copy className="w-6 h-6 text-zinc-400" />
        </button>
      </div>

      <div className="mt-10">
        <h3 className="text-[10px] text-zinc-500 font-black uppercase tracking-[0.3em] mb-4 pl-2">Active Squad Members</h3>
        <div className="bg-zinc-900 rounded-3xl p-16 flex flex-col items-center justify-center border border-dashed border-white/5 opacity-40">
           <Users className="w-12 h-12 text-zinc-700 mb-4" />
           <p className="text-[10px] text-zinc-600 font-bold uppercase tracking-widest">No active members found</p>
        </div>
      </div>
    </div>
  );
}
