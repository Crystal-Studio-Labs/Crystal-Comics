# 🧠 Crystal Comics — Project Memory & Architectural Decision Records (ADR)

> **Platform**: Crystal Comics (`crystal-scans`)  
> **Repository Root**: `D:\Projects\Crystal-Comics`  
> **Note**: This memory specification is self-contained strictly within this project repository.

---

## 🏛️ 1. Architectural Decision Records (ADRs)

### ADR-001: Hybrid Backend Architecture (LocalStorage + Supabase)
- **Status**: Decided & Active
- **Context**: The application requires immediate UI responsiveness for manga browsing, reading progress, and bookmarking without requiring a full live SQL server setup during initial development.
- **Decision**: Implement `mockBackend.ts` using LocalStorage (`crystal_user`, `crystal_db_manga`) as the client-side state engine while embedding Supabase Auth for real Discord OAuth user identity.
- **Consequences**: Fast local testing, zero latency for read operations, seamless migration path to Supabase Database tables when scaling.

### ADR-002: Serverless Edge Function for Discord Role Automation
- **Status**: Decided & Active
- **Context**: Updating user roles in a Discord server requires a privileged bot token (`DISCORD_BOT_TOKEN`). Exposing this token on the browser client is a severe security risk.
- **Decision**: Delegate role assignment to a Deno Edge Function (`supabase/functions/discord-role-sync/index.ts`). The frontend calls `supabase.functions.invoke('discord-role-sync')` passing only user snowflake IDs and role IDs.
- **Consequences**: Secure execution, serverless scalability, zero client-side credential exposure.

### ADR-003: Standalone Bot Process for Guild Member Detection
- **Status**: Decided & Active
- **Context**: Detecting when a user joins the Discord server requires a persistent websocket connection to Discord's Gateway with `GuildMembers` intent enabled.
- **Decision**: Maintain `bot/keep-alive.js` as a lightweight Node.js script using `discord.js` running alongside the dev server (`npm run bot`).
- **Consequences**: Real-time event handling on `GuildMemberAdd` to grant basic member roles instantly upon joining.

### ADR-004: Dual-Supabase Connection Engine with Automatic Failover
- **Status**: Decided & Active
- **Context**: Free-tier databases can reach row limits or experience temporary maintenance.
- **Decision**: Implement Primary + Secondary Supabase client instantiation (`services/supabase.ts`) with automatic query failover in `services/dbService.ts`.
- **Consequences**: High availability, uninterrupted user reading experience.

### ADR-005: Multi-Gateway Payment Portal Architecture
- **Status**: Decided & Active
- **Context**: Scanlation platforms need global recurring subscription payments with tax/VAT compliance across different regions.
- **Decision**: Support Lemon Squeezy (Merchant of Record), Stripe Checkout Sessions, and PayPal inside `pages/Guild.tsx` and `server/routes/payment.js` with instant webhook role sync.
- **Consequences**: Zero tax risk for publishers, instant tier activation for readers.

### ADR-006: Natural Alphanumeric Chapter Panel Serialization Engine
- **Status**: Decided & Active
- **Context**: Raw uploaded chapter images (`1.jpg`, `2.jpg`, `10.jpg`) often get misordered by standard string sorting (`1.jpg`, `10.jpg`, `2.jpg`).
- **Decision**: Use `Intl.Collator` with numeric sensitivity in `services/storageService.ts` to naturally sort files and render drag-and-drop re-ordering cards in `pages/Admin.tsx`.
- **Consequences**: Zero misordered chapter panels, effortless admin ingestion workflow.

---

## 🔑 2. State Keys & Storage Schema

| Storage Key | Data Format | Description |
| :--- | :--- | :--- |
| `crystal_user` | `JSON (User)` | Persists active user profile, level, rank, XP, bookmarks array, reading history array, and connected Discord state. |
| `crystal_db_manga` | `JSON (Manga[])` | Persists catalog manga items, chapters, ratings, tags, views, and comments array. Initialized from `INITIAL_MANGA` seed if absent. |

---

## ⚙️ 3. Environment & Secrets Reference

```env
# Supabase Project Credentials (Primary & Secondary Failover)
VITE_SUPABASE_URL=https://your-primary-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=your-primary-anon-public-key
VITE_SUPABASE_SECONDARY_URL=https://your-secondary-project-ref.supabase.co
VITE_SUPABASE_SECONDARY_ANON_KEY=your-secondary-anon-public-key

# Cloudflare R2 ($0 Egress CDN Storage)
VITE_CLOUDFLARE_R2_PUBLIC_URL=https://cdn.yourdomain.com
CLOUDFLARE_R2_ACCESS_KEY_ID=your_r2_access_key_id
CLOUDFLARE_R2_SECRET_ACCESS_KEY=your_r2_secret_access_key

# Discord Bot Credentials (Edge Function & Bot Process)
DISCORD_BOT_TOKEN=<your-bot-token>
DISCORD_BASIC_ROLE_ID=<discord-role-snowflake-id>
```

---

## 📋 4. Discord Bot & Hierarchy Setup Checklist

1. **Enable Privileged Intent**: In Discord Developer Portal -> Bot -> Enable **"Server Members Intent"**.
2. **Bot Permissions**: Scope `bot` with permission `Manage Roles`.
3. **Server Role Hierarchy**: In Discord Server Settings -> Roles, drag the **Crystal Bot** role above all tier roles (`Crystal Knight`, `Sovereign`, `Veteran`).
