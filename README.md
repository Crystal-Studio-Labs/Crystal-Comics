# CrystalScans 💎

Next-generation manga and manhwa reading platform featuring a premium "crystal-glass" UI, gamified user profiles, and seamless community integration. Built with React, TypeScript, and Tailwind CSS.

## 🌟 Features

*   **Immersive UI**: Modern glassmorphism design with smooth animations and transitions.
*   **Advanced Reader**: Vertical scroll reader optimized for Manhwa/Webtoons with quality selection (SD/HD).
*   **Gamified Profiles**:
    *   **XP System**: Earn experience by reading chapters.
    *   **Ranks**: Progression from Squire to Knight to Sovereign.
    *   **Subscription Tiers**: Visual distinction for free vs premium users.
    *   **Discord Integration**: Auto-assign roles (e.g., "Crystal Knight") based on subscription status.
    *   **Stats**: RPG-style stats visualization (STR, INT, CHA, VIT).
*   **Content Discovery**: Cinematic Hero Carousel, Trending, Search and Filter.
*   **Library Management**: Bookmark series and track reading history.
*   **Admin Dashboard**: Manage content.

## 🚀 Getting Started

### 1. Installation

```bash
git clone https://github.com/yourusername/crystal-scans.git
cd crystal-scans
npm install
```

### 2. Discord Authentication Setup (Important)

To enable the "Login with Discord" feature, you must configure Supabase and Discord properly.

**Step A: Supabase**
1.  Go to [Supabase](https://supabase.com) and create a new project.
2.  Navigate to **Authentication** -> **Providers**.
3.  Enable **Discord**.
4.  Copy the **Callback URL** (it looks like `https://<your-project>.supabase.co/auth/v1/callback`).

**Step B: Discord Developer Portal**
1.  Go to [Discord Developer Portal](https://discord.com/developers/applications).
2.  Click **New Application** and name it (e.g., "CrystalScans").
3.  Go to the **OAuth2** tab in the sidebar.
4.  Under **Redirects**, click **Add Redirect** and paste the **Callback URL** from Supabase.
5.  **Important**: Copy the **Client ID** and **Client Secret** (you may need to reset the secret to see it).

**Step C: Connect Them**
1.  Go back to Supabase -> Authentication -> Providers -> Discord.
2.  Paste the **Client ID** and **Client Secret**.
3.  Click Save.

**Step D: Local Environment (Get your Keys)**
1.  **Find your keys in Supabase:**
    *   In your Supabase project dashboard, click on **Settings** (the cog/gear icon at the bottom of the left sidebar).
    *   Select **API** from the list.
    *   Look for the **Project URL** box. This is your `VITE_SUPABASE_URL`.
    *   Look for the **Project API keys** box. Copy the key labeled `anon` (public). This is your `VITE_SUPABASE_ANON_KEY`.
2.  Create a `.env` file in your project root:
    ```bash
    VITE_SUPABASE_URL=https://your-project-id.supabase.co
    VITE_SUPABASE_ANON_KEY=your-long-anon-key-string
    ```
3.  Start the app: `npm run dev`

### 3. Role System & "Official Server" Sync

The app currently uses a simulation (`services/discordConfig.ts` & `services/mockBackend.ts`) to demonstrate role assignment.

**To make this work in Production with a Real Backend:**

You cannot assign Discord roles purely from the frontend. You must use a **Supabase Edge Function** (or a Node.js server) that holds your Discord Bot Token.

1.  **Create a Discord Bot:**
    *   Go to Discord Developer Portal -> Bot -> Add Bot.
    *   Copy the **Token**.
    *   Invite the bot to your "Official Server" with `Manage Roles` permission.

2.  **Create a Supabase Edge Function:**
    ```bash
    supabase functions new discord-role-sync
    ```

3.  **Add the Code (example):**
    ```typescript
    // supabase/functions/discord-role-sync/index.ts
    import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

    const DISCORD_BOT_TOKEN = Deno.env.get('DISCORD_BOT_TOKEN')!;
    const GUILD_ID = "YOUR_OFFICIAL_GUILD_ID";

    serve(async (req) => {
      const { userId, roles } = await req.json(); // userId is the Discord User ID

      // Loop through roles and call Discord API
      for (const roleId of roles) {
        await fetch(`https://discord.com/api/v10/guilds/${GUILD_ID}/members/${userId}/roles/${roleId}`, {
            method: 'PUT',
            headers: {
                Authorization: `Bot ${DISCORD_BOT_TOKEN}`
            }
        });
      }

      return new Response(JSON.stringify({ success: true }), { headers: { "Content-Type": "application/json" } });
    })
    ```

4.  **Connect Client to Backend:**
    Update `services/discordConfig.ts` to call this function:
    ```typescript
    await supabase.functions.invoke('discord-role-sync', { body: { userId, roles } });
    ```

## 🛠️ Tech Stack

*   **Frontend**: React 18, TypeScript, Vite
*   **Styling**: Tailwind CSS, Lucide React
*   **Auth**: Supabase (Discord OAuth)
*   **State**: LocalStorage Mock Backend

## 📄 License

Educational purpose only.
