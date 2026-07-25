/**
 * Discord Linked Roles Metadata Setup Script
 * 
 * Run this script ONCE using Node.js to register your custom website metadata fields 
 * on the Discord Developer Portal so users can unlock linked roles in your Discord server.
 * 
 * Usage:
 * node scripts/register-discord-linked-roles.js
 */

import 'dotenv/config';

const DISCORD_CLIENT_ID = process.env.DISCORD_CLIENT_ID;
const DISCORD_BOT_TOKEN = process.env.DISCORD_BOT_TOKEN;

if (!DISCORD_CLIENT_ID || !DISCORD_BOT_TOKEN) {
  console.error('❌ Error: DISCORD_CLIENT_ID and DISCORD_BOT_TOKEN environment variables must be set in .env');
  process.exit(1);
}

const metadataRecords = [
  {
    key: 'level',
    name: 'Reader Level',
    description: 'Minimum user reading level on website',
    type: 2 // INTEGER_GREATER_THAN_OR_EQUAL
  },
  {
    key: 'is_knight',
    name: 'Crystal Knight Tier',
    description: 'User is a Knight tier subscriber',
    type: 7 // BOOLEAN_EQUAL
  },
  {
    key: 'is_sovereign',
    name: 'Sovereign Tier',
    description: 'User is a Sovereign tier subscriber',
    type: 7 // BOOLEAN_EQUAL
  },
  {
    key: 'is_s_rank',
    name: 'S-Rank Hunter',
    description: 'User achieved S-Rank gameplay status',
    type: 7 // BOOLEAN_EQUAL
  }
];

async function registerMetadata() {
  const url = `https://discord.com/api/v10/applications/${DISCORD_CLIENT_ID}/role-connections/metadata`;
  
  console.log(`📡 Registering metadata fields on Discord Developer Portal...`);

  try {
    const res = await fetch(url, {
      method: 'PUT',
      headers: {
        'Authorization': `Bot ${DISCORD_BOT_TOKEN}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(metadataRecords)
    });

    if (!res.ok) {
      const errText = await res.text();
      console.error(`❌ Failed to register metadata. Status: ${res.status}. Response: ${errText}`);
      process.exit(1);
    }

    const data = await res.json();
    console.log('✅ Successfully registered Discord Linked Roles metadata fields!');
    console.log(JSON.stringify(data, null, 2));
  } catch (error) {
    console.error('❌ Error executing metadata registration request:', error);
  }
}

registerMetadata();
