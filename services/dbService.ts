import { getActiveSupabaseClient, isSupabaseConfigured, markPrimaryUnhealthy } from './supabase';
import { Manga, Chapter, User } from '../types';

/**
 * Supabase Database API Adapter
 * Handles real PostgreSQL queries with Dual-DB Failover support.
 */

export const isRealDbAvailable = (): boolean => {
  return isSupabaseConfigured() && getActiveSupabaseClient() !== null;
};

/**
 * Executes a query against active Supabase DB with automatic secondary failover.
 */
async function executeWithFailover<T>(queryFn: (client: any) => Promise<{ data: T | null; error: any }>): Promise<T | null> {
  let client = getActiveSupabaseClient();
  if (!client) return null;

  try {
    let { data, error } = await queryFn(client);

    if (error) {
      console.warn('[DB Service] Primary query failed. Attempting failover:', error.message);
      markPrimaryUnhealthy();
      client = getActiveSupabaseClient();
      if (client) {
        const retryResult = await queryFn(client);
        data = retryResult.data;
      }
    }

    return data;
  } catch (err) {
    console.error('[DB Service] Unhandled query error:', err);
    return null;
  }
}

export const fetchAllMangaFromDb = async (): Promise<Manga[]> => {
  if (!isRealDbAvailable()) return [];

  const data = await executeWithFailover<any[]>(async (client) => {
    return client
      .from('manga')
      .select(`
        *,
        chapters (*)
      `)
      .order('created_at', { ascending: false });
  });

  if (!data) return [];

  return data.map(m => ({
    id: m.id,
    title: m.title,
    coverUrl: m.cover_url,
    heroUrl: m.hero_url,
    rating: parseFloat(m.rating),
    status: m.status,
    type: m.type,
    tags: m.tags || [],
    synopsis: m.synopsis,
    author: m.author,
    views: `${m.views_count || 0}`,
    match: m.match_percentage,
    year: m.release_year,
    chapters: (m.chapters || []).map((c: any) => ({
      id: c.id,
      number: c.chapter_number,
      title: c.title,
      releaseDate: c.release_date,
      isPremium: c.is_premium
    }))
  }));
};

export const fetchUserProfileFromDb = async (userId: string): Promise<User | null> => {
  if (!isRealDbAvailable()) return null;

  const data = await executeWithFailover<any>(async (client) => {
    return client
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();
  });

  if (!data) return null;

  return {
    id: data.id,
    username: data.username,
    discriminator: data.discriminator || '0000',
    role: data.role || 'User',
    avatarUrl: data.avatar_url,
    level: data.level || 1,
    rank: data.rank || 'E-Rank',
    subscriptionTier: data.subscription_tier || 'Squire',
    discord: {
      connected: Boolean(data.discord_id),
      username: data.discord_username,
      id: data.discord_id,
      roles: []
    },
    xp: data.xp || 0,
    maxXp: data.max_xp || 1000,
    joinDate: new Date(data.created_at).toLocaleDateString(),
    stats: [
      { label: "STR", value: 85, icon: "Sword", color: "bg-red-500", text: "text-red-500" },
      { label: "INT", value: 62, icon: "Brain", color: "bg-blue-500", text: "text-blue-500" },
      { label: "CHA", value: 94, icon: "Sparkles", color: "bg-pink-500", text: "text-pink-500" },
      { label: "VIT", value: 78, icon: "Shield", color: "bg-green-500", text: "text-green-500" },
    ],
    achievements: [],
    bookmarks: [],
    history: [],
    tokens: data.tokens ?? 150,
    shards: data.shards ?? 0,
    unlockedChapters: data.unlocked_chapters ?? [],
    lastClaimDate: data.last_claim_date
  };
};
