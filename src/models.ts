import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
  telegramId: { type: String, required: true, unique: true },
  username: String,
  firstName: String,
  points: { type: Number, default: 0 },
  energy: { type: Number, default: 1000 },
  maxEnergy: { type: Number, default: 1000 },
  energyLastUpdated: { type: Date, default: Date.now },
  level: { type: Number, default: 1 },
  referrals: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  referrer: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  upgrades: {
    multitap: { type: Number, default: 1 },
    energyLimit: { type: Number, default: 1 },
    rechargeSpeed: { type: Number, default: 1 },
    tapBot: { type: Boolean, default: false },
  },
  lastOfflineReward: { type: Date, default: Date.now },
  pubgId: String,
  ucReward: { type: Number, default: 0 },
  dailyLoginStreak: { type: Number, default: 0 },
  lastDailyClaim: { type: Date },
  createdAt: { type: Date, default: Date.now },
});

export const User = mongoose.model('User', UserSchema);

const TaskSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: String,
  reward: { type: Number, required: true },
  link: String,
  type: { type: String, enum: ['social', 'daily', 'adsgram'], default: 'social' },
  completedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
});

export const Task = mongoose.model('Task', TaskSchema);

const WithdrawalSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  pubgId: { type: String, required: true },
  amount: { type: Number, required: true },
  status: { type: String, enum: ['pending', 'completed', 'rejected'], default: 'pending' },
  createdAt: { type: Date, default: Date.now },
});

export const Withdrawal = mongoose.model('Withdrawal', WithdrawalSchema);
