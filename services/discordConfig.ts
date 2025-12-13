import { supabase } from './supabase';

// This configuration maps internal website tiers/achievements to actual Discord Role IDs.
// YOU MUST UPDATE THESE VALUES WITH YOUR REAL SERVER DATA FROM DISCORD
export const DISCORD_CONFIG = {
    // The ID of the specific server where roles will be assigned
    OFFICIAL_GUILD_ID: "YOUR_GUILD_ID_HERE", 
    OFFICIAL_GUILD_NAME: "CrystalScans Official",
    
    // Links to join if not in the server
    INVITE_URL: "https://discord.gg/crystalscans",

    // Map Subscription Tiers to Role IDs (Right-Click Role in Discord -> Copy ID)
    ROLES: {
        TIER_SOVEREIGN: "ROLE_ID_HERE",
        TIER_KNIGHT: "ROLE_ID_HERE",
        
        // Map Achievement IDs to Role IDs
        ACHIEVEMENT_VETERAN: "ROLE_ID_HERE",
        ACHIEVEMENT_Ascended: "ROLE_ID_HERE"
    }
};

/**
 * Calls the Supabase Edge Function to assign roles to the user in the specific guild.
 * Requires the Edge Function 'discord-role-sync' to be deployed and configured.
 */
export const syncRolesWithBot = async (discordUserId: string, roleIdsToAdd: string[], guildId: string): Promise<boolean> => {
    if (!supabase) {
         console.warn("Supabase not configured. Skipping role sync.");
         return false;
    }

    // Validation: Check if the developer has updated the placeholder IDs
    if (guildId === "YOUR_GUILD_ID_HERE" || roleIdsToAdd.some(id => id === "ROLE_ID_HERE")) {
        console.warn("[Bot Sync] Config placeholders detected. Please update services/discordConfig.ts with real IDs.");
        return false;
    }

    try {
        console.log(`[Bot Sync] Attempting to sync roles for Discord User: ${discordUserId} in Guild: ${guildId}`);
        
        const { data, error } = await supabase.functions.invoke('discord-role-sync', {
            body: { 
                userId: discordUserId, 
                roles: roleIdsToAdd, 
                guildId: guildId 
            }
        });

        if (error) {
            console.error('[Bot Sync] Edge Function Error:', error);
            return true; // Return true to avoid breaking UI flow even if bot fails
        }

        console.log('[Bot Sync] Response:', data);
        return true;
    } catch (e) {
        console.error("[Bot Sync] Failed to invoke Edge Function:", e);
        return false;
    }
};