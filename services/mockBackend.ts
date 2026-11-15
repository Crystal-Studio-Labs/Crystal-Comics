import { Manga, Chapter, User, SubscriptionTier, Comment, HistoryEntry, ChapterPanel } from '../types';
import { DISCORD_CONFIG, syncRolesWithBot } from './discordConfig';
import { isRealDbAvailable, fetchAllMangaFromDb } from './dbService';
import { getChapterImageUrls, getChapterPanels } from './storageService';

// --- INITIAL SEED DATA ---
const INITIAL_MANGA: Manga[] = [
  {
    id: '1',
    title: 'Solo Leveling: Ragnarok',
    coverUrl: 'https://placehold.co/400x600/1a1a2e/FFF?text=SL:R',
    heroUrl: 'https://placehold.co/1920x1080/0a0a12/FFF?text=Solo+Leveling+Ragnarok',
    rating: 4.9,
    status: 'Ongoing',
    type: 'Manhwa',
    tags: ['Action', 'System', 'Fantasy'],
    synopsis: 'The son of the Shadow Monarch begins his own journey. The gates are opening again, and Sung Suho must awaken his powers to save the world his father protected.',
    author: 'Chugong',
    views: '12.5M',
    match: 98,
    year: 2024,
    rank: 1,
    chapters: Array.from({ length: 20 }, (_, i) => ({
      id: `c${20 - i}`,
      number: 20 - i,
      title: `Episode ${20 - i}`,
      releaseDate: i < 2 ? '1 hour ago' : '1 week ago',
      isPremium: i < 2,
      tokenPrice: 50
    })),
    comments: [
        { 
          id: 'c1', 
          userId: 'u2', 
          username: 'Hunter123', 
          avatarUrl: 'https://placehold.co/100/333/FFF?text=H', 
          content: 'The art is absolutely insane! Especially the battle at the start [spoiler]Suho awakens his shadow beast early[/spoiler]!', 
          timestamp: '2 hours ago', 
          likes: 45, 
          mangaId: '1',
          reactions: { '👍': 32, '❤️': 12, '😮': 5 },
          userReaction: '👍'
        }
    ]
  },
  {
    id: '2',
    title: 'The Beginning After The End',
    coverUrl: 'https://placehold.co/600x800/0f3460/FFF?text=TBATE',
    heroUrl: 'https://placehold.co/1920x1080/0f3460/FFF?text=TBATE',
    rating: 4.8,
    status: 'Hiatus',
    type: 'Manhwa',
    tags: ['Adventure', 'Magic', 'Reincarnation'],
    synopsis: 'King Grey has unrivaled strength, wealth, and prestige in a world governed by martial ability. However, solitude lingers closely behind those with great power.',
    author: 'TurtleMe',
    views: '8.2M',
    match: 95,
    year: 2018,
    rank: 3,
    chapters: Array.from({ length: 175 }, (_, i) => ({
      id: `c${175 - i}`,
      number: 175 - i,
      title: `Chapter ${175 - i}`,
      releaseDate: '1 week ago',
      isPremium: false,
      tokenPrice: 50
    })).slice(0, 10)
  },
  {
    id: '3',
    title: 'Omniscient Reader',
    coverUrl: 'https://placehold.co/600x600/16213e/FFF?text=ORV',
    rating: 4.9,
    status: 'Ongoing',
    type: 'Manhwa',
    tags: ['Apocalypse', 'Psychological', 'Action'],
    synopsis: 'Dokja was an average office worker whose sole interest was reading his favorite web novel "Three Ways to Survive the Apocalypse". But when the novel becomes reality...',
    author: 'SingNsong',
    views: '9.1M',
    match: 97,
    year: 2020,
    rank: 2,
    chapters: Array.from({ length: 50 }, (_, i) => ({
      id: `c${50 - i}`,
      number: 50 - i,
      title: `Episode ${50 - i}`,
      releaseDate: i < 3 ? '2 hours ago' : '5 days ago',
      isPremium: i < 3,
      tokenPrice: 50
    }))
  }
];

export const MOCK_USER: User = {
  id: 'u1',
  username: "ShadowHunter_99",
  discriminator: "9999",
  role: 'Admin',
  avatarUrl: "https://placehold.co/400x400/222/FFF?text=SH",
  level: 42,
  rank: "S-Rank",
  subscriptionTier: 'Squire', 
  tokens: 150, // Virtual currency for comic chapter early access
  shards: 25,  // Virtual currency for novel chapters
  unlockedChapters: [],
  discord: {
      connected: false,
      roles: []
  },
  xp: 8450,
  maxXp: 10000,
  joinDate: "Oct 2023",
  stats: [
    { label: "STR", value: 85, icon: "Sword", color: "bg-red-500", text: "text-red-500" },
    { label: "INT", value: 62, icon: "Brain", color: "bg-blue-500", text: "text-blue-500" },
    { label: "CHA", value: 94, icon: "Sparkles", color: "bg-pink-500", text: "text-pink-500" },
    { label: "VIT", value: 78, icon: "Shield", color: "bg-green-500", text: "text-green-500" },
  ],
  achievements: [
    { id: '1', title: 'Early Adopter', description: 'Joined before 2025', icon: 'Award', rarity: 'legendary', unlockedAt: '2023-10-01' },
    { id: '2', title: 'Speed Reader', description: 'Read 50 chapters in one day', icon: 'Zap', rarity: 'rare', unlockedAt: '2024-01-15' },
  ],
  bookmarks: [],
  history: []
};

// --- HELPER FUNCTIONS FOR STORAGE ---
const getStorageManga = (): Manga[] => {
    const stored = localStorage.getItem('crystal_db_manga');
    if (stored) return JSON.parse(stored);
    localStorage.setItem('crystal_db_manga', JSON.stringify(INITIAL_MANGA));
    return INITIAL_MANGA;
};

const setStorageManga = (manga: Manga[]) => {
    localStorage.setItem('crystal_db_manga', JSON.stringify(manga));
};

export const getStorageUser = (): User => {
    const stored = localStorage.getItem('crystal_user');
    if (!stored) return MOCK_USER;
    const u = JSON.parse(stored);
    return {
        ...MOCK_USER,
        ...u,
        tokens: u.tokens !== undefined ? u.tokens : 150,
        shards: u.shards !== undefined ? u.shards : 25,
        unlockedChapters: Array.isArray(u.unlockedChapters) ? u.unlockedChapters : []
    };
};

const setStorageUser = (user: User) => {
    localStorage.setItem('crystal_user', JSON.stringify(user));
};

// --- API SIMULATION ---

export const getPopularManga = async (): Promise<Manga[]> => {
  await new Promise(resolve => setTimeout(resolve, 300));
  return getStorageManga();
};

export const getLatestUpdates = async (): Promise<Manga[]> => {
  await new Promise(resolve => setTimeout(resolve, 300));
  const manga = getStorageManga();
  return [...manga].sort(() => 0.5 - Math.random());
};

export const getMangaById = async (id: string): Promise<Manga | undefined> => {
  await new Promise(resolve => setTimeout(resolve, 200));
  return getStorageManga().find(m => m.id === id);
};

export const getAllManga = async (): Promise<Manga[]> => {
    await new Promise(resolve => setTimeout(resolve, 200));
    return getStorageManga();
};

// --- INTERACTION FUNCTIONS (Bookmarks, History, Comments) ---

export const toggleBookmark = async (mangaId: string): Promise<boolean> => {
    const user = getStorageUser();
    let isBookmarked = false;
    
    if (user.bookmarks.includes(mangaId)) {
        user.bookmarks = user.bookmarks.filter(id => id !== mangaId);
        isBookmarked = false;
    } else {
        user.bookmarks.push(mangaId);
        isBookmarked = true;
    }
    
    setStorageUser(user);
    return isBookmarked;
};

export const addToHistory = async (mangaId: string, chapterId: string): Promise<void> => {
    const user = getStorageUser();
    // Remove existing entry for this manga to avoid duplicates/update timestamp
    const filteredHistory = user.history.filter(h => h.mangaId !== mangaId);
    
    // Add new entry to top
    filteredHistory.unshift({
        mangaId,
        chapterId,
        timestamp: Date.now()
    });
    
    // Limit history to 50 items
    user.history = filteredHistory.slice(0, 50);
    setStorageUser(user);
};

export const getLibraryData = async (): Promise<{ bookmarks: Manga[], history: Manga[] }> => {
    await new Promise(resolve => setTimeout(resolve, 300));
    const user = getStorageUser();
    const allManga = getStorageManga();
    
    const bookmarkedManga = allManga.filter(m => user.bookmarks.includes(m.id));
    
    const historyManga = user.history.map(h => {
        const m = allManga.find(am => am.id === h.mangaId);
        return m ? { ...m } : null; // Clone to avoid mutation issues if we modified it
    }).filter(m => m !== null) as Manga[];

    return { bookmarks: bookmarkedManga, history: historyManga };
};

export const getComments = async (mangaId: string): Promise<Comment[]> => {
    await new Promise(resolve => setTimeout(resolve, 300));
    const manga = getStorageManga().find(m => m.id === mangaId);
    return manga?.comments || [];
};

export const addComment = async (mangaId: string, content: string): Promise<Comment> => {
    const user = getStorageUser();
    const allManga = getStorageManga();
    const mangaIndex = allManga.findIndex(m => m.id === mangaId);
    
    if (mangaIndex === -1) throw new Error("Manga not found");

    const newComment: Comment = {
        id: Date.now().toString(),
        userId: user.id,
        username: user.username,
        avatarUrl: user.avatarUrl,
        content: content,
        timestamp: 'Just now',
        likes: 0,
        mangaId
    };

    if (!allManga[mangaIndex].comments) {
        allManga[mangaIndex].comments = [];
    }
    
    allManga[mangaIndex].comments!.unshift(newComment);
    setStorageManga(allManga);
    return newComment;
};

/**
 * Toraka-style Emoji Reaction Toggle Engine:
 * Allows readers to react with 👍, ❤️, 😂, 😮, 😠, 😢 to comments
 */
export const reactToComment = async (mangaId: string, commentId: string, emoji: string): Promise<Comment | null> => {
    const allManga = getStorageManga();
    const mangaIndex = allManga.findIndex(m => m.id === mangaId);
    if (mangaIndex === -1 || !allManga[mangaIndex].comments) return null;

    const comment = allManga[mangaIndex].comments!.find(c => c.id === commentId);
    if (!comment) return null;

    if (!comment.reactions) {
        comment.reactions = { '👍': 0, '❤️': 0, '😂': 0, '😮': 0, '😠': 0, '😢': 0 };
    }

    // Toggle reaction
    if (comment.userReaction === emoji) {
        // Remove existing reaction
        comment.reactions[emoji] = Math.max(0, (comment.reactions[emoji] || 1) - 1);
        comment.userReaction = undefined;
    } else {
        // If had a previous reaction, decrement it
        if (comment.userReaction && comment.reactions[comment.userReaction]) {
            comment.reactions[comment.userReaction] = Math.max(0, comment.reactions[comment.userReaction] - 1);
        }
        comment.reactions[emoji] = (comment.reactions[emoji] || 0) + 1;
        comment.userReaction = emoji;
    }

    setStorageManga(allManga);
    return comment;
};

// --- ADMIN / WRITE FUNCTIONS ---

export const createManga = async (manga: Manga): Promise<void> => {
    await new Promise(resolve => setTimeout(resolve, 500));
    const current = getStorageManga();
    setStorageManga([manga, ...current]);
};

export const updateManga = async (manga: Manga): Promise<void> => {
    await new Promise(resolve => setTimeout(resolve, 400));
    const current = getStorageManga();
    const index = current.findIndex(m => m.id === manga.id);
    if(index !== -1) {
        current[index] = manga;
        setStorageManga(current);
    }
};

export const deleteManga = async (id: string): Promise<void> => {
    await new Promise(resolve => setTimeout(resolve, 400));
    const current = getStorageManga();
    setStorageManga(current.filter(m => m.id !== id));
};

// --- FILE UPLOAD SIMULATION ---
export const uploadImage = async (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = error => reject(error);
    });
};

// --- USER & DISCORD LOGIC ---

export const getUser = async (): Promise<User> => {
    await new Promise(resolve => setTimeout(resolve, 200));
    return getStorageUser();
}

/**
 * Updates the user profile and synchronizes roles based on:
 * 1. Subscription Tier (e.g., Knight -> 'Crystal Knight' role)
 * 2. Achievements (e.g., 'Veteran' role)
 * 
 * NOTE: This now uses DISCORD_CONFIG to map to specific Server Role IDs
 */
export const updateUserProfile = async (user: User): Promise<User> => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 300));

    // Role Calculation Logic
    const roleIdsToSync: string[] = [];
    const displayRoles: string[] = []; // For UI display purposes only

    // 1. Subscription Roles
    if (user.subscriptionTier === 'Knight') {
        roleIdsToSync.push(DISCORD_CONFIG.ROLES.TIER_KNIGHT);
        displayRoles.push('Crystal Knight');
    } else if (user.subscriptionTier === 'Sovereign') {
        roleIdsToSync.push(DISCORD_CONFIG.ROLES.TIER_KNIGHT);
        roleIdsToSync.push(DISCORD_CONFIG.ROLES.TIER_SOVEREIGN);
        displayRoles.push('Crystal Knight');
        displayRoles.push('Sovereign');
    }

    // 2. Achievement Roles
    if (user.achievements.some(a => a.id === '1' && a.unlockedAt)) {
        roleIdsToSync.push(DISCORD_CONFIG.ROLES.ACHIEVEMENT_VETERAN);
        displayRoles.push('Veteran');
    }
    if (user.level >= 50) {
        roleIdsToSync.push(DISCORD_CONFIG.ROLES.ACHIEVEMENT_Ascended);
        displayRoles.push('Ascended');
    }

    // 3. Sync with "Official Server" via Real Bot
    // Critical Fix: Pass user.discord.id (the snowflake) not user.id (the app uuid)
    if (user.discord.connected && user.discord.id) {
        await syncRolesWithBot(user.discord.id, roleIdsToSync, DISCORD_CONFIG.OFFICIAL_GUILD_ID);
    }

    const updatedUser = {
        ...user,
        discord: {
            ...user.discord,
            roles: displayRoles
        }
    };

    setStorageUser(updatedUser);
    return updatedUser;
};

export const syncDiscordStatus = async (user: User): Promise<User> => {
    await new Promise(resolve => setTimeout(resolve, 1000)); 

    // This simulates fetching fresh data from Discord
    // For now, we just ensure the user is 'connected' and run the role calculator
    const tempUser = { 
        ...user,
        discord: {
            ...user.discord,
            connected: true,
            username: user.discord.username || `${user.username}#${user.discriminator}`,
            id: user.discord.id || '123456789',
        }
    };

    return updateUserProfile(tempUser);
};

export const getChapterImages = async (mangaId: string, chapterId: string, quality?: 'HD' | 'SD'): Promise<string[]> => {
    const panels = await getChapterPanelData(mangaId, chapterId, quality);
    return panels.map(p => p.url);
};

/**
 * Pre-computed Layout Dimension Resolver for Zero-CLS 'rea' Reader Viewport:
 * Supplies exact width, height, and CSS aspectRatio for layout preservation
 */
export const getChapterPanelData = async (mangaId: string, chapterId: string, quality?: 'HD' | 'SD'): Promise<ChapterPanel[]> => {
    const user = getStorageUser();
    const isPremium = user && (user.subscriptionTier === 'Knight' || user.subscriptionTier === 'Sovereign');
    const effectiveQuality = quality || (isPremium ? 'HD' : 'SD');
    await new Promise(resolve => setTimeout(resolve, 200));
    
    return getChapterPanels(mangaId, chapterId, 8, effectiveQuality);
};

/**
 * Microtransaction Chapter Unlock Engine (Asura Tokens Model):
 * Allows readers to spend 50 tokens to permanently unlock early access chapters
 */
export const unlockChapterWithTokens = async (
    mangaId: string, 
    chapterId: string, 
    tokenCost: number = 50
): Promise<{ success: boolean; error?: string; user: User }> => {
    const user = getStorageUser();
    const unlockKey = `${mangaId}:${chapterId}`;

    if (user.unlockedChapters && user.unlockedChapters.includes(unlockKey)) {
        return { success: true, user };
    }

    if (user.tokens < tokenCost) {
        return { 
            success: false, 
            error: `Insufficient Tokens. You have ${user.tokens} tokens, but ${tokenCost} are required.`, 
            user 
        };
    }

    const updatedUser: User = {
        ...user,
        tokens: user.tokens - tokenCost,
        unlockedChapters: [...(user.unlockedChapters || []), unlockKey]
    };

    setStorageUser(updatedUser);
    return { success: true, user: updatedUser };
};

/**
 * Daily Virtual Currency Claim Engine:
 * Awards +25 Tokens per 24-hour cycle to drive daily active retention
 */
export const claimDailyTokens = async (): Promise<{ success: boolean; tokensClaimed: number; user: User; error?: string }> => {
    const user = getStorageUser();
    const today = new Date().toISOString().split('T')[0];

    if (user.lastClaimDate === today) {
        return { success: false, tokensClaimed: 0, user, error: 'Daily reward already claimed today. Come back tomorrow!' };
    }

    const updatedUser: User = {
        ...user,
        tokens: user.tokens + 25,
        lastClaimDate: today
    };

    setStorageUser(updatedUser);
    return { success: true, tokensClaimed: 25, user: updatedUser };
};