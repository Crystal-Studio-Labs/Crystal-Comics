# Crystal Comics 💎

A premium manga/manhwa reading platform with Supabase Authentication and Discord Role Integration.

**Live URL**: [https://crystal-comics.vercel.app](https://crystal-comics.vercel.app)

---

## 🛠️ Critical Setup Guide

To ensure the **Authentication works correctly** and the **Discord Bot works**, follow these exact steps.

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

Your Discord Server ID: `1449337912503046178`
Invite Link: `https://discord.gg/73ttFzMMSd`

This app uses **Serverless Edge Functions** for paid tiers and a **Node.js Bot** for auto-roles.

1.  **Bot Permissions**:
    *   Discord Dev Portal -> **Bot**.
    *   **Enable "Server Members Intent"** (Required for detecting new members).
    *   Go to **OAuth2** -> **URL Generator**.
    *   Scopes: `bot`.
    *   Permissions: `Manage Roles`.
    *   **Important**: Invite the bot to your server.
2.  **Server Hierarchy (Crucial)**:
    *   In Discord Server Settings -> **Roles**.
    *   **Drag the "Crystal Bot" role ABOVE the roles you want it to assign** (e.g., above "Member", "Knight", "Sovereign").
    *   *If the bot is below the role, it will fail with a 403 Forbidden error.*
3.  **Deploy Function (For Subscriptions)**:
    *   `supabase functions deploy discord-role-sync`
    *   `supabase secrets set DISCORD_BOT_TOKEN=your_token_here`
4.  **Update Config (For Subscriptions)**:
    *   Open `services/discordConfig.ts`.
    *   **Action Required**: Replace `"ROLE_ID_HERE"` with real Role IDs.
    *   *How to get IDs*: Enable Developer Mode in Discord (User Settings -> Advanced), then Right Click a Role -> Copy ID.

### Phase 3: Auto-Role on Join (Basic Role)

To automatically give people a role (e.g., "Member") when they join:

1.  Create a `.env` file in the root folder.
2.  Add your Bot Token: `DISCORD_BOT_TOKEN=your_token_here`
3.  Add the Basic Role ID: `DISCORD_BASIC_ROLE_ID=123456789...` (Copy this ID from Discord).
4.  Run: `npm run bot`

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
DISCORD_BOT_TOKEN=your_bot_token 
DISCORD_BASIC_ROLE_ID=your_role_id_for_new_members
```

## 🔍 Troubleshooting

**Bot fails to assign role?**
Check Phase 2, Step 2. The Bot's role MUST be visually higher in the list than the role it is trying to give.

**"Privileged Intent" Error?**
Go to Discord Developer Portal -> Bot -> Toggle "Server Members Intent" to ON.
