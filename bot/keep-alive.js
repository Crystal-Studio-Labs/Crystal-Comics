// This script is optional. The website uses Serverless Edge Functions to assign roles.
// However, if you want your Bot to appear "Online" (Green Dot) in your server, run this script.
//
// Usage:
// 1. Set DISCORD_BOT_TOKEN in your environment or .env
// 2. Run: npm run bot

import { Client, GatewayIntentBits, ActivityType } from 'discord.js';

// If you have a .env file locally, you might need 'dotenv'
// import 'dotenv/config'; 

const token = process.env.DISCORD_BOT_TOKEN;

if (!token) {
    console.error("❌ Error: DISCORD_BOT_TOKEN environment variable is missing.");
    console.log("👉 Usage: DISCORD_BOT_TOKEN=your_token_here npm run bot");
    process.exit(1);
}

const client = new Client({
    intents: [GatewayIntentBits.Guilds]
});

client.once('ready', () => {
    console.log(`✅ Bot is Online! Logged in as ${client.user?.tag}`);
    
    // Set Status
    client.user?.setPresence({
        activities: [{ name: 'Crystal Comics', type: ActivityType.Watching }],
        status: 'online',
    });
});

client.login(token);