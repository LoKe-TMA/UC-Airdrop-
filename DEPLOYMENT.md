# 🪂 PUBG Clicker TMA - Deployment Guide

This guide describes how to deploy the PUBG Clicker Telegram Mini App to a Linux VPS (Ubuntu 22.04+).

## 1. Prerequisites
- Node.js 18+ & NPM
- MongoDB (Local or Atlas)
- Nginx
- PM2 (`npm install -g pm2`)
- Telegram Bot Token (from @BotFather)

## 2. Environment Setup
Create a `.env` file in the root directory:
```env
MONGODB_URI="mongodb+srv://..."
TELEGRAM_BOT_TOKEN="123456:ABC..."
APP_URL="https://yourdomain.com"
NODE_ENV="production"
```

## 3. Installation
```bash
git clone <repo-url>
cd pubg-clicker
npm install
npm run build
```

## 4. Run with PM2
```bash
pm2 start server.ts --interpreter tsx --name pubg-clicker
```

## 5. Nginx Configuration
Add this to `/etc/nginx/sites-available/default`:
```nginx
server {
    listen 80;
    server_name yourdomain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```
Then restart Nginx: `sudo systemctl restart nginx`

## 6. Telegram Bot Setup
- Set the **Menu Button** URL to `https://yourdomain.com` using @BotFather.
- Set the **Web App** URL in your bot settings.

## 7. Admin Commands
- `/admin_stats` - View global stats.
- `/broadcast` - Use this pattern in code to send alerts.
