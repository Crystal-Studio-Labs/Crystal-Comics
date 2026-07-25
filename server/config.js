import 'dotenv/config';

export const CONFIG = {
  PORT: process.env.PORT || 3001,
  
  // Cloudflare R2 Credentials
  R2: {
    ACCOUNT_ID: process.env.CLOUDFLARE_R2_ACCOUNT_ID || '',
    ACCESS_KEY_ID: process.env.CLOUDFLARE_R2_ACCESS_KEY_ID || '',
    SECRET_ACCESS_KEY: process.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY || '',
    BUCKET_NAME: process.env.CLOUDFLARE_R2_BUCKET_NAME || 'crystal-comics-chapters',
    PUBLIC_CDN_URL: process.env.CLOUDFLARE_R2_PUBLIC_URL || 'http://localhost:3001/cdn'
  },

  // Discord OAuth Credentials
  DISCORD: {
    CLIENT_ID: process.env.DISCORD_CLIENT_ID || '',
    CLIENT_SECRET: process.env.DISCORD_CLIENT_SECRET || '',
    BOT_TOKEN: process.env.DISCORD_BOT_TOKEN || '',
    GUILD_ID: process.env.DISCORD_GUILD_ID || '1449337912503046178'
  }
};
