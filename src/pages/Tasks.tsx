import React, { useEffect, useState } from 'react';
import { CheckCircle2, ExternalLink, Play, Youtube, Instagram, Twitter, Trophy, Loader2 } from 'lucide-react';
import { motion } from 'motion/react';

interface Task {
  _id: string;
  title: string;
  reward: number;
  link?: string;
  type: 'social' | 'daily' | 'adsgram';
  completed: boolean;
}

export default function Tasks({ setPoints }: { setPoints: (points: number | ((p: number) => number)) => void }) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [claimingId, setClaimingId] = useState<string | null>(null);

  const fetchTasks = async () => {
    const tg = (window as any).Telegram?.WebApp;
    const userId = tg?.initDataUnsafe?.user?.id?.toString() || "0";

    try {
      const res = await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ telegramId: userId }),
      });
      const data = await res.json();
      if (Array.isArray(data)) {
        setTasks(data);
      }
    } catch (err) {
      console.error("Failed to load tasks", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  const handleTaskClick = async (task: Task) => {
    if (task.completed) return;

    const tg = (window as any).Telegram?.WebApp;
    const userId = tg?.initDataUnsafe?.user?.id?.toString() || "0";

    // 1. Initiate Action
    if (task.type === 'social' && task.link) {
      tg?.openTelegramLink(task.link);
    } else if (task.type === 'adsgram') {
      // AdsGram Simulation / Real Integration Hook
      console.log("Playing AdsGram rewarded video...");
      if (tg) tg.HapticFeedback.impactOccurred('medium');
      // In production, use the AdsGram SDK callback here
      await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate ad duration
    } else {
      // Daily check-in or other
      if (tg) tg.HapticFeedback.impactOccurred('light');
    }

    // 2. Claim Reward
    setClaimingId(task._id);
    try {
      const res = await fetch('/api/tasks/complete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ telegramId: userId, taskId: task._id }),
      });
      const data = await res.json();

      if (data.success) {
        setPoints(data.points);
        setTasks(prev => prev.map(t => t._id === task._id ? { ...t, completed: true } : t));
        if (tg) tg.HapticFeedback.notificationOccurred('success');
      }
    } catch (err) {
      console.error("Failed to complete task", err);
    } finally {
      setClaimingId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-20 space-y-4">
        <Loader2 className="w-10 h-10 text-yellow-500 animate-spin" />
        <p className="text-zinc-500 text-[10px] uppercase font-bold tracking-[0.2em]">Syncing Missions...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 pt-4 px-4 pb-12">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-black italic text-white tracking-tighter uppercase">Mission <span className="text-yellow-500">Hub</span></h2>
        <p className="text-zinc-500 text-[10px] font-bold uppercase tracking-widest mt-1">Complete operations to secure UC rewards</p>
      </div>

      <div className="space-y-4">
        {tasks.map((task) => (
          <div 
            key={task._id}
            className={`bg-zinc-900 border border-white/5 rounded-2xl p-5 flex items-center justify-between group transition-all shadow-lg ${task.completed ? 'opacity-60' : 'hover:border-yellow-500/20'}`}
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-zinc-800 flex items-center justify-center border border-white/10 group-hover:bg-zinc-700 transition-colors">
                {task.type === 'social' && task.title.includes('YouTube') ? <Youtube className="text-red-500 w-6 h-6" /> : 
                 task.type === 'social' && task.title.includes('Instagram') ? <Instagram className="text-pink-500 w-6 h-6" /> :
                 task.type === 'adsgram' ? <Play className="text-yellow-500 w-6 h-6" /> :
                 <Trophy className="text-yellow-500 w-6 h-6" />}
              </div>
              <div>
                <h3 className="text-sm font-bold tracking-tight">{task.title}</h3>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-xs font-black text-yellow-500 italic">+{task.reward.toLocaleString()}</span>
                  <div className="bg-zinc-800 px-2 py-0.5 rounded text-[8px] text-zinc-500 font-bold uppercase tracking-widest">UC Point</div>
                </div>
              </div>
            </div>
            
            {task.completed ? (
              <div className="bg-green-500/10 text-green-500 p-3 rounded-xl">
                 <CheckCircle2 className="w-5 h-5" />
              </div>
            ) : (
              <button 
                onClick={() => handleTaskClick(task)}
                disabled={claimingId === task._id}
                className="bg-zinc-800 hover:bg-yellow-500 hover:text-zinc-950 p-3 rounded-xl transition-all shadow-inner disabled:opacity-50"
              >
                {claimingId === task._id ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <ExternalLink className="w-4 h-4" />
                )}
              </button>
            )}
          </div>
        ))}
      </div>

      {/* Daily Reward Section */}
      <div className="bg-zinc-900 p-8 rounded-3xl border border-white/5 shadow-2xl relative overflow-hidden group">
        <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
           <Trophy className="w-24 h-24 text-white" />
        </div>
        <h3 className="font-black italic uppercase tracking-tighter mb-6 text-sm flex items-center gap-2">
           <div className="w-1.5 h-4 bg-yellow-500 rounded-full" />
           Daily Supply Rewards
        </h3>
        <div className="grid grid-cols-4 gap-3">
           {[1, 2, 3, 4].map((day) => (
             <div key={day} className={`aspect-square rounded-2xl border-2 flex flex-col items-center justify-center gap-1 transition-all ${day === 1 ? 'border-yellow-500 bg-yellow-500/10' : 'border-white/5 bg-zinc-800'}`}>
                <span className="text-[8px] text-zinc-500 font-bold uppercase">Day {day}</span>
                <span className="text-xs font-black text-yellow-500 italic">{day * 500}</span>
                {day === 1 && <div className="w-2 h-2 bg-yellow-500 rounded-full absolute top-2 right-2 animate-pulse" />}
             </div>
           ))}
        </div>
        <button className="w-full mt-8 bg-yellow-500 text-zinc-950 font-black py-4 rounded-2xl uppercase tracking-widest text-xs shadow-[0_10px_20px_rgba(234,179,8,0.2)] active:scale-95 transition-transform">
          Claim Day 01 Supply
        </button>
      </div>
    </div>
  );
}
