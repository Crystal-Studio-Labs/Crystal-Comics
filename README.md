# CrystalScans 💎

Next-generation manga and manhwa reading platform featuring a premium "crystal-glass" UI, gamified user profiles, and seamless community integration. Built with React, TypeScript, and Tailwind CSS.

## 🌟 Features

*   **Immersive UI**: Modern glassmorphism design with smooth animations and transitions.
*   **Advanced Reader**: Vertical scroll reader optimized for Manhwa/Webtoons with quality selection (SD/HD).
*   **Gamified Profiles**:
    *   **XP System**: Earn experience by reading chapters.
    *   **Ranks**: Progression from Squire to Knight to Sovereign.
    *   **Subscription Tiers**: Visual distinction for free vs premium users.
    *   **Stats**: RPG-style stats visualization (STR, INT, CHA, VIT).
*   **Discord Integration**: Log in via Discord using Supabase Auth to sync avatars and usernames.
*   **Content Discovery**:
    *   Cinematic Hero Carousel.
    *   Trending & Latest Updates sections.
    *   Search and Filter exploration page.
*   **Library Management**: Bookmark series and track reading history automatically.
*   **Admin Dashboard**: Manage manga series (Create, Read, Update, Delete) and view site stats.
*   **Responsive**: Fully optimized mobile navigation with a floating dock.

## 🛠️ Tech Stack

*   **Frontend**: React 18, TypeScript, Vite
*   **Styling**: Tailwind CSS, Lucide React (Icons)
*   **Routing**: React Router DOM
*   **Authentication**: Supabase Auth (Discord OAuth)
*   **Data**: Mock Backend Service (Simulating API calls with LocalStorage persistence)

## 🚀 Getting Started

Follow these steps to set up the project locally.

### 1. Prerequisites

*   Node.js (v16 or higher)
*   npm

### 2. Installation

Clone the repository and install dependencies:

```bash
git clone https://github.com/yourusername/crystal-scans.git
cd crystal-scans
npm install
```

### 3. Environment Setup (Supabase)

To enable real Discord authentication, you need to configure Supabase.

1.  **Create a Supabase Project**: Go to [Supabase](https://supabase.com/) and create a new project.
2.  **Enable Discord Auth**:
    *   In Supabase Dashboard, go to **Authentication** > **Providers**.
    *   Enable **Discord**.
    *   You will need a Client ID and Secret from the [Discord Developer Portal](https://discord.com/developers/applications).
    *   **Important**: Copy the "Callback URL" from Supabase and paste it into your Discord App's "Redirects" section.
3.  **Configure Environment Variables**:
    *   Copy `.env.example` to a new file named `.env`:
        ```bash
        cp .env.example .env
        ```
    *   Fill in your Supabase credentials:
        ```env
        VITE_SUPABASE_URL=your_project_url
        VITE_SUPABASE_ANON_KEY=your_anon_key
        ```

> **Note**: If you do not configure Supabase, the app includes a fallback "Mock Login" that simulates a login after a short delay so you can still test the UI.

### 4. Running the App

Start the development server:

```bash
npm run dev
```

Open your browser and navigate to `http://localhost:5173`.

## 📦 Deployment on Vercel

1.  Push your code to a GitHub repository.
2.  Go to [Vercel](https://vercel.com/) and "Add New Project".
3.  Import your repository.
4.  **Crucial Step**: In the Vercel Project Settings, go to **Environment Variables** and add:
    *   `VITE_SUPABASE_URL`
    *   `VITE_SUPABASE_ANON_KEY`
5.  Click **Deploy**.

## 🛡️ Admin & Permissions

The application uses a **Mock Backend** for data persistence (stored in your browser's LocalStorage).

*   **Admin Access**: The default mock user or the first user logged in is usually treated as a standard user. To test Admin features:
    1.  Log in.
    2.  Open your browser DevTools (F12) -> Application -> Local Storage.
    3.  Find `crystal_user`.
    4.  Edit the JSON object: change `"role": "User"` to `"role": "Admin"`.
    5.  Refresh the page. You will now see the "Admin Panel" tab in the Profile page.

*   **Premium Features**: Similarly, you can edit `"subscriptionTier"` in LocalStorage to `"Knight"` or `"Sovereign"` to unlock HD quality and premium badges.

## 📄 License

This project is created for educational and demonstration purposes.
