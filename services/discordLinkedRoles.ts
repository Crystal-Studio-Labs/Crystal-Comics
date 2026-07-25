import { User } from '../types';

/**
 * Discord Linked Roles Service
 * 
 * Synchronizes user website profile stats (Subscription Tier, Level, S-Rank badge)
 * directly with Discord's Role Connections API (role_connections.write scope).
 */

export interface DiscordRoleConnectionMetadata {
  platform_name: string;
  platform_username: string;
  metadata: {
    level: number;
    is_knight: number; // 0 or 1 for boolean check
    is_sovereign: number; // 0 or 1 for boolean check
    is_s_rank: number; // 0 or 1 for boolean check
  };
}

/**
 * Prepares the Discord Role Connection payload based on user profile state.
 */
export const buildDiscordLinkedRolesPayload = (user: User): DiscordRoleConnectionMetadata => {
  return {
    platform_name: "Crystal Comics",
    platform_username: user.username,
    metadata: {
      level: user.level,
      is_knight: user.subscriptionTier === 'Knight' || user.subscriptionTier === 'Sovereign' ? 1 : 0,
      is_sovereign: user.subscriptionTier === 'Sovereign' ? 1 : 0,
      is_s_rank: user.rank === 'S-Rank' || user.level >= 50 ? 1 : 0
    }
  };
};

/**
 * Sends profile metadata to Express backend to update user's Discord Linked Roles metadata.
 */
export const syncDiscordLinkedRoles = async (user: User, accessToken: string): Promise<boolean> => {
  const serverUrl = (import.meta as any).env?.VITE_BACKEND_SERVER_URL || 'http://localhost:3001';

  try {
    const payload = buildDiscordLinkedRolesPayload(user);
    const res = await fetch(`${serverUrl}/api/discord/linked-roles`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        accessToken,
        payload
      })
    });

    if (!res.ok) {
      const errText = await res.text();
      console.error('[Discord Linked Roles] Sync failed:', errText);
      return false;
    }

    console.log('[Discord Linked Roles] Successfully synced role metadata to Discord identity!');
    return true;
  } catch (error) {
    console.error('[Discord Linked Roles] Error during metadata sync:', error);
    return false;
  }
};
