<div align="center">

# 💎 Crystal Comics (`crystal-scans`)

**A Modern, Production-Ready, Self-Hostable Manga & Manhwa Scanlation Platform Template**

[![React](https://img.shields.io/badge/React-18.2-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.4-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-5.1-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)
[![Supabase](https://img.shields.io/badge/Supabase-Auth_%26_DB-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white)](https://supabase.com)
[![Cloudflare R2](https://img.shields.io/badge/Cloudflare_R2-$0_Egress-F38020?style=for-the-badge&logo=cloudflare&logoColor=white)](https://www.cloudflare.com/products/r2/)
[![Discord](https://img.shields.io/badge/Discord-Linked_Roles-5865F2?style=for-the-badge&logo=discord&logoColor=white)](https://discord.com)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge)](LICENSE)

[Live Demo](https://crystal-comics.vercel.app) • [Deployment Guide](DEPLOYMENT.md) • [Design System](docs/design.md) • [Architecture](docs/architecture.md) • [Documentation Hub](#-documentation-index)

---

</div>

## 🌟 Overview

**Crystal Comics** is an open-source, self-hostable manga/manhwa reading platform designed for scanlation teams, comic creators, and webtoon publishers. Inspired by industry-leading platforms like **Asura Scans** and **Flame Comics**, it combines high-impact dark glassmorphism UI with enterprise-grade cloud architecture.

Built to run **100% free of charge**, Crystal Comics leverages **Cloudflare R2** ($0 egress bandwidth fees), **Supabase Auth & Dual-DB Failover**, and **Discord Linked Roles Integration** to serve millions of chapter page views without cloud server bills.

---

## 🔥 Key Features Matrix

| Feature | Description | Inspired By / Tech |
| :--- | :--- | :--- |
| **🎨 Dark Glassmorphism UI** | Sleek obsidian surfaces (`#050508`), neon violet accents (`#8B5CF6`), and floating glass control docks. | Asura Scans |
| **📖 Dual Reader Engine** | Instant toggle between **Vertical Continuous Webtoon Scroll** and **Horizontal Paged Spread** with panel preloading. | Flame Comics |
| **🖼️ Serialized Chapter Ingestion** | Batch upload 30–50 panels with natural alphanumeric sorting (`01`, `02`...) and drag-and-drop re-ordering. | Admin Console |
| **☁️ Zero Egress Image CDN** | Cloudflare R2 integration for uploading and serving high-res chapter panels with **$0 egress fees**. | Cloudflare R2 S3 API |
| **🆔 Discord Profile Sync** | Full extraction and sync of Discord **Avatar URL**, **`@username`**, and **Display Name** (Global Name) across profiles and comments. | Discord OAuth 2.0 |
| **💳 Guild Payment Portal** | Multi-gateway checkout portal supporting **Lemon Squeezy**, **Stripe Checkout**, **PayPal**, and instant test unlocks. | Payment Webhooks |
| **🔐 Supabase OAuth & DB** | Discord OAuth authentication, PostgreSQL catalog storage, and Row Level Security (RLS) policies. | Supabase Auth |
| **🛡️ Dual-DB Failover Engine** | Automatic primary/secondary Supabase connection resolver that switches DB instances if primary is paused or full. | Custom Failover |
| **⏰ 24/7 Auto-Keep-Alive** | Background 48-hour heartbeat scheduler preventing free-tier Supabase projects from auto-pausing after inactivity. | Express Scheduler |
| **🤖 Discord Linked Roles** | Direct synchronization of user site ranks (S-Rank, Knight, Sovereign) onto Discord profile cards (`role_connections.write`). | Discord API v10 |
| **✨ Gemini AI Assistant** | AI-powered manhwa recommendation assistant (`components/CrystalAI.tsx`) analyzing tags and reading history. | Gemini AI |
| **🎮 Gamification & XP** | User level progression (+50 XP/chapter), S-Rank gameplay badges, unlockable achievements, and reading history tracking. | Gamified UX |

---

## 🚀 Quickstart (Zero Configuration)

Get Crystal Comics running locally in 3 simple commands. If Supabase keys are not present, the app automatically falls back to an out-of-the-box local mock database (`services/mockBackend.ts`).

```bash
# 1. Clone the repository
git clone https://github.com/your-org/crystal-comics.git
cd crystal-comics

# 2. Install dependencies
npm install

# 3. Start local development server
npm run dev
```

Open **`http://localhost:5173/`** in your browser to view the application live!

---

## 📂 Repository Sitemap & Architecture

```
Crystal-Comics/
├── .env.example                          # 📄 Template environment variables configuration
├── DEPLOYMENT.md                         # 🌐 Step-by-step 100% free hosting guide
├── SECURITY.md                           # 🛡️ Vulnerability disclosure & RLS security policies
├── CODE_OF_CONDUCT.md                    # 🤝 Contributor Covenant v2.1 community guidelines
├── CONTRIBUTING.md                       # 🛠️ Contribution guide & PR workflow
├── LICENSE                               # 📜 MIT License
├── docs/                                 # 📚 Technical Specification Documents
│   ├── architecture.md                   # 🏗️ System architecture & data flow specification
│   ├── design.md                         # 🎨 UI/UX design system, color tokens & reader specs
│   ├── memory.md                         # 🧠 Self-contained Architectural Decision Records (ADRs)
│   ├── phases.md                         # 🚀 Multi-phase implementation roadmap
│   └── rules.md                          # 📜 Engineering standards & anti-patterns checklist
├── bot/                                  # 🤖 Discord Bot Daemon
│   └── keep-alive.js                     # Auto-role member join & bot status presence script
├── scripts/                              # 🛠️ CLI Setup Utility Scripts
│   └── register-discord-linked-roles.js   # Discord Linked Roles metadata setup script
├── server/                               # ⚡ Express Backend Server (R2 + Discord + Keep-Alive)
│   ├── config.js                         # Server environment configuration loader
│   ├── index.js                          # Express API backend server entry point
│   ├── keep-alive-db.js                  # Background 48h Supabase keep-alive ping engine
│   └── routes/
│       ├── discord.js                    # Discord Linked Roles OAuth code exchange
│       └── storage.js                    # Cloudflare R2 presigned upload URL endpoints
├── services/                             # 💾 Frontend Cloud Adapters & Data Services
│   ├── dbService.ts                      # Dual-DB failover database adapter
│   ├── discordConfig.ts                  # Discord role mapping & Edge Function bridge
│   ├── discordLinkedRoles.ts             # Discord Linked Roles client API helper
│   ├── mockBackend.ts                    # LocalStorage fallback database & API mock
│   ├── storageService.ts                 # Cloudflare R2 S3 storage adapter
│   └── supabase.ts                       # Primary & Secondary Supabase client manager
└── supabase/                             # ⚡ Supabase Cloud Infrastructure
    ├── schema.sql                        # Complete PostgreSQL DDL & RLS security policies
    └── functions/
        └── discord-role-sync/
            └── index.ts                  # Deno Edge Function for Discord server roles
```

---

## 🛠️ Environment Variables Configuration

Copy `.env.example` to `.env` and configure your credentials:

| Environment Variable | Service | Description |
| :--- | :--- | :--- |
| `VITE_SUPABASE_URL` | Supabase | Primary Supabase project URL |
| `VITE_SUPABASE_ANON_KEY` | Supabase | Primary Supabase anon public API key |
| `VITE_SUPABASE_SECONDARY_URL` | Supabase | Secondary Supabase failover project URL (Optional) |
| `VITE_SUPABASE_SECONDARY_ANON_KEY` | Supabase | Secondary Supabase failover anon key (Optional) |
| `VITE_CLOUDFLARE_R2_PUBLIC_URL` | Cloudflare R2 | Public CDN domain (e.g. `https://cdn.yourdomain.com`) |
| `CLOUDFLARE_R2_ACCESS_KEY_ID` | Cloudflare R2 | S3 API Access Key ID |
| `CLOUDFLARE_R2_SECRET_ACCESS_KEY` | Cloudflare R2 | S3 API Secret Access Key |
| `DISCORD_CLIENT_ID` | Discord | Application Client ID from Discord Dev Portal |
| `DISCORD_CLIENT_SECRET` | Discord | Application Client Secret from Discord Dev Portal |
| `DISCORD_BOT_TOKEN` | Discord | Bot User Authentication Token |

---

## 📚 Documentation Index

- **[Deployment Manual (`DEPLOYMENT.md`)](DEPLOYMENT.md)**: Free hosting setup on Vercel, Cloudflare R2, Supabase Dual DB, and Render.com.
- **[Design System (`docs/design.md`)](docs/design.md)**: Color tokens, glassmorphic UI specs, hero sliders, and reader layouts.
- **[Architecture Specification (`docs/architecture.md`)](docs/architecture.md)**: Mermaid system diagrams, data pipelines, and TypeScript schemas.
- **[Development Rules (`docs/rules.md`)](docs/rules.md)**: Coding standards, typing rules, and anti-patterns checklist.
- **[Implementation Phases (`docs/phases.md`)](docs/phases.md)**: Multi-phase feature roadmap.
- **[Architectural Memory (`docs/memory.md`)](docs/memory.md)**: ADRs and database storage keys schema.
- **[Security Policy (`SECURITY.md`)](SECURITY.md)**: Security reporting procedures and Row Level Security rules.
- **[Contribution Guidelines (`CONTRIBUTING.md`)](CONTRIBUTING.md)**: Development workflow, bug reporting, and PR steps.
- **[Code of Conduct (`CODE_OF_CONDUCT.md`)](CODE_OF_CONDUCT.md)**: Community behavior standards.

---

## 📄 License

This project is open-source software licensed under the **[MIT License](LICENSE)**. Free to use, modify, and host for personal, scanlation, or commercial projects.
