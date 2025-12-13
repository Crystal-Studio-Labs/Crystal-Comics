// This script runs the Discord Bot to:
// 1. Appear "Online" in the server.
// 2. Automatically assign a "Basic" role when new members join.
//
// Usage:
// 1. Set DISCORD_BOT_TOKEN and DISCORD_BASIC_ROLE_ID in your .env file
// 2. Run: npm run bot

import { Client, GatewayIntentBits, ActivityType, Events } from 'discord.js';
import 'dotenv/config'; 

const token = process.env.DISCORD_BOT_TOKEN;
const basicRoleId = process.env.DISCORD_BASIC_ROLE_ID;

if (!token) {
    console.error("❌ Error: DISCORD_BOT_TOKEN environment variable is missing.");
    process.exit(1);
}

// Initialize Client with necessary intents
// GuildMembers is required to detect when someone joins
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMembers 
    ]
});

client.once(Events.ClientReady, (c) => {
    console.log(`✅ Bot is Online! Logged in as ${c.user.tag}`);
    console.log(`Watching ${c.guilds.cache.size} servers.`);
    
    // Set Status
    c.user.setPresence({
        activities: [{ name: 'Crystal Comics', type: ActivityType.Watching }],
        status: 'online',
    });

    if (!basicRoleId) {
        console.warn("⚠️ Warning: DISCORD_BASIC_ROLE_ID is not set in .env. Auto-role on join will not work.");
    } else {
        console.log(`✅ Auto-Role configured. Will assign Role ID: ${basicRoleId} to new members.`);
    }
});

// Event: When a new user joins the server
client.on(Events.GuildMemberAdd, async (member) => {
    if (!basicRoleId) return;

    try {
        console.log(`👤 New member joined: ${member.user.tag}. Assigning basic role...`);
        const role = member.guild.roles.cache.get(basicRoleId);
        
        if (!role) {
            console.error(`❌ Error: Could not find role with ID ${basicRoleId} in guild ${member.guild.name}`);
            return;
        }

        await member.roles.add(role);
        console.log(`✨ Successfully assigned ${role.name} to ${member.user.tag}`);
    } catch (error) {
        console.error(`❌ Failed to assign role to ${member.user.tag}:`, error);
    }
});

client.login(token);