export interface Chapter {
  id: string;
  number: number;
  title: string;
  releaseDate: string;
  isPremium?: boolean;
}

export interface Comment {
    id: string;
    userId: string;
    username: string;
    displayName?: string;
    avatarUrl: string;
    content: string;
    timestamp: string;
    likes: number;
    mangaId: string;
}

export interface Manga {
  id: string;
  title: string;
  coverUrl: string; // Used for vertical cards
  heroUrl?: string; // Used for horizontal/hero sections
  rating: number;
  status: 'Ongoing' | 'Completed' | 'Hiatus';
  type: 'Manhwa' | 'Manga' | 'Manhua';
  tags: string[];
  synopsis: string;
  author: string;
  chapters: Chapter[];
  views: string;
  match?: number;
  year?: number;
  rank?: number;
  comments?: Comment[];
}

export interface Achievement {
    id: string;
    title: string;
    description: string;
    icon: string; // Lucide icon name
    unlockedAt?: string;
    rarity: 'common' | 'rare' | 'legendary' | 'secret';
    isSecret?: boolean; // For Easter eggs
}

export type SubscriptionTier = 'Squire' | 'Knight' | 'Sovereign';
export type UserRole = 'User' | 'Moderator' | 'Admin';
export type BookmarkShelf = 'Reading' | 'Plan to Read' | 'Completed' | 'Favorites';

export interface DiscordState {
    connected: boolean;
    username?: string;
    displayName?: string;
    id?: string;
    roles: string[]; // e.g. ["Booster", "Server Moderator"]
}

export interface HistoryEntry {
    mangaId: string;
    chapterId: string;
    timestamp: number;
    scrollPercent?: number;
}

export interface User {
  id: string;
  username: string;
  displayName?: string;
  role: UserRole;
  avatarUrl: string;
  discriminator: string;
  level: number;
  rank: string; // Gameplay rank (e.g. S-Rank)
  subscriptionTier: SubscriptionTier; // Paid tier
  discord: DiscordState;
  xp: number;
  maxXp: number;
  stats: {
    label: string;
    value: number;
    color: string;
    text: string;
    icon: string;
  }[];
  achievements: Achievement[];
  joinDate: string;
  bookmarks: string[]; // Array of Manga IDs
  history: HistoryEntry[];
}