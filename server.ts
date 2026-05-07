import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import path from "path";
import { fileURLToPath } from "url";
import { createServer as createViteServer } from "vite";
import mongoose from "mongoose";
import TelegramBot from "node-telegram-bot-api";
import dotenv from "dotenv";
import crypto from "crypto";
import { User, Task, Withdrawal } from "./src/models";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const httpServer = createServer(app);
  const io = new Server(httpServer, {
    cors: { origin: "*" },
  });

  const PORT = 3000;

  // MongoDB Connection
  if (process.env.MONGODB_URI) {
    mongoose.connect(process.env.MONGODB_URI)
      .then(() => console.log("MongoDB Connected"))
      .catch(err => console.error("MongoDB Error:", err));
  }

  // Telegram Bot
  const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
  const bot = BOT_TOKEN ? new TelegramBot(BOT_TOKEN, { polling: true }) : null;

  app.use(express.json());

  // Verification helper
  const verifyInitData = (initData: string) => {
    if (!BOT_TOKEN) return true;
    const urlParams = new URLSearchParams(initData);
    const hash = urlParams.get('hash');
    urlParams.delete('hash');
    urlParams.sort();
    const dataCheckString = Array.from(urlParams.entries()).map(([k, v]) => `${k}=${v}`).join('\n');
    const secretKey = crypto.createHmac('sha256', 'WebAppData').update(BOT_TOKEN).digest();
    const computedHash = crypto.createHmac('sha256', secretKey).update(dataCheckString).digest('hex');
    return computedHash === hash;
  };

  // API: User Sync (Enhanced with Referrals)
  app.post("/api/user/sync", async (req, res) => {
    const { initData, userData, referrerId } = req.body;
    if (!verifyInitData(initData)) return res.status(401).json({ error: "Invalid login" });

    try {
      let isNewUser = false;
      let user = await User.findOne({ telegramId: userData.id.toString() });
      
      if (!user) {
        isNewUser = true;
        user = await User.create({
          telegramId: userData.id.toString(),
          username: userData.username,
          firstName: userData.first_name,
        });

        // Handle Referral
        if (referrerId && referrerId !== userData.id.toString()) {
          const referrer = await User.findOne({ telegramId: referrerId });
          if (referrer) {
            user.referrer = referrer._id as any;
            user.points += 5000; // Bonus for invited user
            await user.save();

            referrer.referrals.push(user._id as any);
            referrer.points += 25000; // Bonus for inviter
            await referrer.save();
          }
        }
      }

      // Energy Regen Calculation (Server Side)
      const now = new Date();
      const lastUpdate = new Date(user.energyLastUpdated || user.createdAt);
      const secondsPassed = Math.floor((now.getTime() - lastUpdate.getTime()) / 1000);
      const regenRate = user.upgrades?.rechargeSpeed || 1;
      const energyGained = secondsPassed * regenRate;
      
      const updatedEnergy = Math.min(user.maxEnergy, user.energy + energyGained);
      user.energy = updatedEnergy;
      user.energyLastUpdated = now;
      await user.save();
      
      const lastClaim = user.lastDailyClaim ? new Date(user.lastDailyClaim) : null;
      const canClaim = !lastClaim || 
        now.getUTCFullYear() !== lastClaim.getUTCFullYear() ||
        now.getUTCMonth() !== lastClaim.getUTCMonth() ||
        now.getUTCDate() !== lastClaim.getUTCDate();

      res.json({ ...user.toObject(), canClaimDaily: canClaim });
    } catch (err) {
      res.status(500).json({ error: "DB Error" });
    }
  });

  // API: Purchase Upgrade
  app.post("/api/user/upgrade", async (req, res) => {
    const { telegramId, upgradeId } = req.body;
    try {
      const user = await User.findOne({ telegramId });
      if (!user) return res.status(404).json({ error: "User not found" });

      const costs: any = {
        multitap: user.upgrades.multitap * 1000,
        energyLimit: user.upgrades.energyLimit * 1000,
        rechargeSpeed: user.upgrades.rechargeSpeed * 2000,
        tapBot: 50000
      };

      const cost = costs[upgradeId];
      if (user.points < cost) return res.status(400).json({ error: "Insufficient points" });

      user.points -= cost;
      if (upgradeId === 'multitap') user.upgrades.multitap += 1;
      if (upgradeId === 'energyLimit') {
        user.upgrades.energyLimit += 1;
        user.maxEnergy += 500;
      }
      if (upgradeId === 'rechargeSpeed') user.upgrades.rechargeSpeed += 1;
      if (upgradeId === 'tapBot') user.upgrades.tapBot = true;

      await user.save();
      res.json(user);
    } catch (err) {
      res.status(500).json({ error: "Upgrade failed" });
    }
  });

  // API: Leaderboard
  app.get("/api/leaderboard", async (req, res) => {
    try {
      const players = await User.find().sort({ points: -1 }).limit(100);
      res.json(players);
    } catch (err) {
      res.status(500).json({ error: "Failed to fetch leaderboard" });
    }
  });

  // API: Withdrawal Request
  app.post("/api/withdraw", async (req, res) => {
    const { telegramId, pubgId, amount } = req.body;
    try {
      const user = await User.findOne({ telegramId });
      if (!user) return res.status(404).json({ error: "User not found" });
      if (user.points < amount) return res.status(400).json({ error: "Points mismatch" });

      // Create request
      await Withdrawal.create({
        user: user._id,
        pubgId,
        amount,
        status: 'pending'
      });

      user.points -= amount; // Lock points
      await user.save();

      res.json({ success: true });
    } catch (err) {
      res.status(500).json({ error: "Withdrawal failed" });
    }
  });

  // API: Daily Claim
  app.post("/api/daily-claim", async (req, res) => {
    const { telegramId } = req.body;
    try {
      const user = await User.findOne({ telegramId });
      if (!user) return res.status(404).json({ error: "User not found" });

      const now = new Date();
      const lastClaim = user.lastDailyClaim ? new Date(user.lastDailyClaim) : null;
      
      const canClaim = !lastClaim || 
        now.getUTCFullYear() !== lastClaim.getUTCFullYear() ||
        now.getUTCMonth() !== lastClaim.getUTCMonth() ||
        now.getUTCDate() !== lastClaim.getUTCDate();

      if (!canClaim) return res.status(400).json({ error: "Already claimed today" });

      // Check for streak
      let newStreak = 1;
      if (lastClaim) {
        const yesterday = new Date(now);
        yesterday.setUTCDate(yesterday.getUTCDate() - 1);
        
        const isYesterday = 
          yesterday.getUTCFullYear() === lastClaim.getUTCFullYear() &&
          yesterday.getUTCMonth() === lastClaim.getUTCMonth() &&
          yesterday.getUTCDate() === lastClaim.getUTCDate();

        if (isYesterday) {
          newStreak = (user.dailyLoginStreak || 0) + 1;
        }
      }

      const reward = Math.min(500 * newStreak, 10000);

      user.points += reward;
      user.dailyLoginStreak = newStreak;
      user.lastDailyClaim = now;
      await user.save();

      res.json({ 
        success: true, 
        points: user.points, 
        streak: newStreak, 
        reward 
      });
    } catch (err) {
      res.status(500).json({ error: "Claim failed" });
    }
  });

  // API: Tap Action
  app.post("/api/user/tap", async (req, res) => {
    const { telegramId, count } = req.body;
    try {
      const user = await User.findOneAndUpdate(
        { telegramId },
        { $inc: { points: count, energy: -count } },
        { new: true }
      );
      res.json(user);
    } catch (err) {
      res.status(500).json({ error: "Tap failed" });
    }
  });

  // API: Get Tasks
  app.post("/api/tasks", async (req, res) => {
    const { telegramId } = req.body;
    try {
      const user = await User.findOne({ telegramId });
      if (!user) return res.status(404).json({ error: "User not found" });

      const tasks = await Task.find();
      
      // Map tasks to include completion status
      const mappedTasks = tasks.map(task => ({
        ...task.toObject(),
        completed: task.completedBy.some(id => id.toString() === user._id.toString())
      }));

      res.json(mappedTasks);
    } catch (err) {
      res.status(500).json({ error: "Failed to fetch tasks" });
    }
  });

  // API: Complete Task
  app.post("/api/tasks/complete", async (req, res) => {
    const { telegramId, taskId } = req.body;
    try {
      const task = await Task.findById(taskId);
      const user = await User.findOne({ telegramId });

      if (!task || !user) return res.status(404).json({ error: "Required data missing" });
      
      if (task.completedBy.some(id => id.toString() === user._id.toString())) {
        return res.status(400).json({ error: "Task already completed" });
      }

      task.completedBy.push(user._id);
      await task.save();

      const updatedUser = await User.findOneAndUpdate(
        { telegramId },
        { $inc: { points: task.reward } },
        { new: true }
      );

      res.json({ success: true, points: updatedUser?.points });
    } catch (err) {
      res.status(500).json({ error: "Failed to reward user" });
    }
  });

  // Seed tasks helper
  const seedTasks = async () => {
    const count = await Task.countDocuments();
    if (count === 0) {
      await Task.create([
        { title: "Join Official Telegram", reward: 5000, link: "https://t.me/pubgmobile", type: "social" },
        { title: "Watch Tactical Ad", reward: 1000, type: "adsgram" },
        { title: "Follow on Instagram", reward: 2000, link: "https://instagram.com/pubgmobile", type: "social" },
        { title: "Daily Mission: Base Check", reward: 500, type: "daily" }
      ]);
      console.log("Mission database seeded");
    }
  };
  seedTasks();

  // Admin Commands
  if (bot) {
    bot.onText(/\/admin_stats/, async (msg) => {
      const usersCount = await User.countDocuments();
      const withdrawals = await Withdrawal.find({ status: 'pending' });
      bot.sendMessage(msg.chat.id, `📊 Admin Dashboard\nTotal Users: ${usersCount}\nPending Withdrawals: ${withdrawals.length}`);
    });
  }

  // Vite
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({ server: { middlewareMode: true }, appType: "spa" });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => res.sendFile(path.join(distPath, 'index.html')));
  }

  httpServer.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on port ${PORT}`);
  });
}

startServer();
