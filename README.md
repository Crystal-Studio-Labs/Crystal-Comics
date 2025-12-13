# Crystal Comics 💎

A premium manga/manhwa reading platform with Supabase Authentication and Discord Role Integration.

**Live URL**: [https://crystal-comics.vercel.app](https://crystal-comics.vercel.app)

---

## 🛠️ Critical Setup Guide

To ensure the **Authentication works correctly** and does NOT redirect to localhost, and to get the **Discord Bot working**, follow these exact steps.

### Phase 1: Supabase Configuration (Fixes Redirects)

1.  **Create Project**: Go to [Supabase](https://supabase.com) and create a new project.
2.  **Get API Keys**:
    *   Settings -> API.
    *   Copy `Project URL` and `anon public` key.
    *   Add them to your Vercel Environment Variables (or local `.env`).
3.  **Setup Discord Auth Provider**:
    *   Go to **Authentication** -> **Providers** -> **Discord**.
    *   **Enable** Discord.
    *   Copy the **Callback URL** (e.g., `https://your-ref.supabase.co/auth/v1/callback`).
    *   Go to [Discord Developer Portal](https://discord.com/developers/applications) -> Select App -> **OAuth2**.
    *   Add Redirect: Paste the Callback URL.
    *   Copy **Client ID** and **Client Secret** from Discord back to Supabase.
4.  **🛑 URL Configuration (The Most Important Step)**:
    *   Go to Supabase -> **Authentication** -> **URL Configuration**.
    *   **Site URL**: Set this to `https://crystal-comics.vercel.app`.
    *   **Redirect URLs**: Add the following explicitly:
        *   `https://crystal-comics.vercel.app/`
        *   `https://crystal-comics.vercel.app/**`
        *   `http://localhost:5173` (Keep this for local testing)
    *   *If you do not do this, Supabase will default to localhost and break your production login.*

### Phase 2: Discord Bot Setup (Role Sync)

This app uses **Serverless Edge Functions** to assign roles. The bot does not need to be running on a server to assign roles, but it needs permissions.

1.  **Bot Permissions**:
    *   Discord Dev Portal -> **Bot**.
    *   Reset Token -> Copy it.
    *   Go to **OAuth2** -> **URL Generator**.
    *   Scopes: `bot`.
    *   Permissions: `Manage Roles`.
    *   Invite the bot to your server.
2.  **Server Hierarchy (Crucial)**:
    *   In Discord Server Settings -> **Roles**.
    *   **Drag the "Crystal Bot" role ABOVE the roles you want it to assign** (e.g., above "Knight" or "Sovereign").
    *   *If the bot is below the role, it will fail with a 403 Forbidden error.*
3.  **Deploy Function**:
    *   Install CLI: `npm install -g supabase`
    *   Login: `supabase login`
    *   Link: `supabase link --project-ref your-project-id`
    *   Set Secret: `supabase secrets set DISCORD_BOT_TOKEN=your_token_here`
    *   Deploy: `supabase functions deploy discord-role-sync`
4.  **Update Config**:
    *   Edit `services/discordConfig.ts`.
    *   Replace `YOUR_GUILD_ID_HERE` with your Discord Server ID.
    *   Replace `ROLE_ID_HERE` with your actual Role IDs.

### Phase 3: Making the Bot "Online" (Optional)

The Edge Function handles logic, so the bot works even if offline. However, if you want the **Green Dot** status:

1.  We have included a script `bot/keep-alive.js`.
2.  Host this script on a service like Railway, Heroku, or a VPS.
3.  Command: `DISCORD_BOT_TOKEN=your_token npm run bot`.

---

## 💻 Development

```bash
# Install dependencies
npm install

# Run locally
npm run dev
```

## 📄 Environment Variables (.env)

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

## 🔍 Troubleshooting

**Login redirects to localhost?**
Check Phase 1, Step 4. Ensure `https://crystal-comics.vercel.app` is in the Redirect URLs list in Supabase.

**Bot fails to assign role?**
Check Phase 2, Step 2. The Bot's role MUST be visually higher in the list than the role it is trying to give.
