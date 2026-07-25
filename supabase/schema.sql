-- ====================================================================
-- CRYSTAL COMICS (CRYSTAL-SCANS) — SUPABASE POSTGRESQL SCHEMA & RLS POLICIES
-- ====================================================================
-- Execute this SQL migration script in your Supabase SQL Editor.
-- It creates all required database tables, relationships, indexes, 
-- Row Level Security (RLS) policies, and automatic user profile triggers.
-- ====================================================================

-- 1. EXTENSIONS & TYPES
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TYPE subscription_tier_enum AS ENUM ('Squire', 'Knight', 'Sovereign');
CREATE TYPE user_role_enum AS ENUM ('User', 'Moderator', 'Admin');
CREATE TYPE manga_status_enum AS ENUM ('Ongoing', 'Completed', 'Hiatus');
CREATE TYPE manga_type_enum AS ENUM ('Manhwa', 'Manga', 'Manhua');

-- 2. PROFILES TABLE (Tied to Supabase Auth)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    username TEXT NOT NULL DEFAULT 'Hunter',
    discriminator TEXT DEFAULT '0000',
    avatar_url TEXT DEFAULT 'https://placehold.co/400x400/222/FFF?text=Hunter',
    role user_role_enum NOT NULL DEFAULT 'User',
    subscription_tier subscription_tier_enum NOT NULL DEFAULT 'Squire',
    level INT NOT NULL DEFAULT 1,
    rank TEXT NOT NULL DEFAULT 'E-Rank',
    xp INT NOT NULL DEFAULT 0,
    max_xp INT NOT NULL DEFAULT 1000,
    discord_id TEXT,
    discord_username TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. MANGA CATALOG TABLE
CREATE TABLE IF NOT EXISTS public.manga (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    cover_url TEXT NOT NULL,
    hero_url TEXT,
    rating NUMERIC(3,2) DEFAULT 5.00,
    status manga_status_enum NOT NULL DEFAULT 'Ongoing',
    type manga_type_enum NOT NULL DEFAULT 'Manhwa',
    tags TEXT[] NOT NULL DEFAULT '{}',
    synopsis TEXT NOT NULL,
    author TEXT NOT NULL DEFAULT 'Unknown',
    views_count BIGINT DEFAULT 0,
    match_percentage INT DEFAULT 95,
    release_year INT DEFAULT 2024,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. CHAPTERS TABLE
CREATE TABLE IF NOT EXISTS public.chapters (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    manga_id UUID NOT NULL REFERENCES public.manga(id) ON DELETE CASCADE,
    chapter_number INT NOT NULL,
    title TEXT NOT NULL,
    release_date TEXT DEFAULT 'Just now',
    is_premium BOOLEAN DEFAULT FALSE,
    images TEXT[] NOT NULL DEFAULT '{}', -- Array of Cloudflare R2 / CDN image URLs
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT unique_manga_chapter UNIQUE(manga_id, chapter_number)
);

-- 5. BOOKMARKS TABLE
CREATE TABLE IF NOT EXISTS public.bookmarks (
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    manga_id UUID NOT NULL REFERENCES public.manga(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    PRIMARY KEY (user_id, manga_id)
);

-- 6. READING HISTORY TABLE
CREATE TABLE IF NOT EXISTS public.reading_history (
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    manga_id UUID NOT NULL REFERENCES public.manga(id) ON DELETE CASCADE,
    chapter_id UUID NOT NULL REFERENCES public.chapters(id) ON DELETE CASCADE,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    PRIMARY KEY (user_id, manga_id)
);

-- 7. COMMENTS TABLE
CREATE TABLE IF NOT EXISTS public.comments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    manga_id UUID NOT NULL REFERENCES public.manga(id) ON DELETE CASCADE,
    chapter_id UUID REFERENCES public.chapters(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    likes INT DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 8. KEEP-ALIVE LOGS TABLE (Heartbeat Ping Tracker)
CREATE TABLE IF NOT EXISTS public.keep_alive_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    source TEXT NOT NULL DEFAULT 'server_cron',
    status TEXT NOT NULL DEFAULT 'healthy',
    pinged_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ====================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ====================================================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.manga ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chapters ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookmarks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reading_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;

-- Profiles: Public read, self-update
CREATE POLICY "Public Profiles Read" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users Update Own Profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- Manga & Chapters: Public read, Admin write
CREATE POLICY "Public Manga Read" ON public.manga FOR SELECT USING (true);
CREATE POLICY "Public Chapters Read" ON public.chapters FOR SELECT USING (true);

-- Bookmarks: Authenticated users manage own bookmarks
CREATE POLICY "Users Read Own Bookmarks" ON public.bookmarks FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users Insert Own Bookmarks" ON public.bookmarks FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users Delete Own Bookmarks" ON public.bookmarks FOR DELETE USING (auth.uid() = user_id);

-- Reading History: Authenticated users manage own history
CREATE POLICY "Users Read Own History" ON public.reading_history FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users Insert/Update Own History" ON public.reading_history FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Comments: Public read, Authenticated insert
CREATE POLICY "Public Comments Read" ON public.comments FOR SELECT USING (true);
CREATE POLICY "Authenticated Users Add Comments" ON public.comments FOR INSERT WITH CHECK (auth.uid() = user_id);

-- ====================================================================
-- AUTOMATIC PROFILE CREATION TRIGGER ON AUTH SIGNUP
-- ====================================================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, username, avatar_url, discord_id, discord_username)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1), 'Hunter'),
    COALESCE(NEW.raw_user_meta_data->>'avatar_url', NEW.raw_user_meta_data->>'picture', 'https://placehold.co/400x400/222/FFF?text=Hunter'),
    NEW.raw_user_meta_data->>'provider_id',
    NEW.raw_user_meta_data->>'name'
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
