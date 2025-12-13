import { supabase } from './supabase';

// This configuration maps internal website tiers/achievements to actual Discord Role IDs.
// YOU MUST UPDATE THESE VALUES WITH YOUR REAL SERVER DATA FROM DISCORD
export const DISCORD_CONFIG = {
    // The ID of the specific server where roles will be assigned
    OFFICIAL_GUILD_ID: "1449337912503046178", 
    OFFICIAL_GUILD_NAME: "CrystalScans Official",
    
    // Links to join if not in the server
    INVITE_URL: "https://discord.gg/73ttFzMMSd",

    // Map Subscription Tiers to Role IDs (Right-Click Role in Discord -> Copy ID)
    // NOTE: Replace "ROLE_ID_HERE" with the 18-digit ID from your Discord Server Settings
    ROLES: {
        // The role given automatically when someone joins the server (handled by bot/keep-alive.js)
        BASIC_MEMBER: "ROLE_ID_HERE", 

        // Subscription Tiers
        TIER_KNIGHT: "ROLE_ID_HERE",
        TIER_SOVEREIGN: "ROLE_ID_HERE",
        
        // Achievements
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
    if (roleIdsToAdd.some(id => id === "ROLE_ID_HERE")) {
        console.warn("[Bot Sync] Role ID placeholders detected. Please update services/discordConfig.ts with real Role IDs.");
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
            // We return true to not block the UI if the bot fails (e.g. hierarchy issues)
            return true; 
        }

        console.log('[Bot Sync] Response:', data);
        return true;
    } catch (e) {
        console.error("[Bot Sync] Failed to invoke Edge Function:", e);
        return false;
    }
};