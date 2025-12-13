// Follow this setup guide to deploy: https://supabase.com/docs/guides/functions
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

declare const Deno: any;

const DISCORD_BOT_TOKEN = Deno.env.get('DISCORD_BOT_TOKEN');

serve(async (req) => {
  // 1. Handle CORS (Browser requests)
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    }})
  }

  // 2. Validate Environment
  if (!DISCORD_BOT_TOKEN) {
      console.error("Missing DISCORD_BOT_TOKEN");
      return new Response(JSON.stringify({ error: "Server misconfiguration: DISCORD_BOT_TOKEN is missing" }), { status: 500 });
  }

  try {
    // 3. Parse Body
    const { userId, roles, guildId } = await req.json();

    if (!userId || !roles || !guildId) {
        return new Response(JSON.stringify({ error: 'Missing userId, roles, or guildId in request body' }), { status: 400 });
    }

    const results = [];

    // 4. Loop through roles and call Discord API
    for (const roleId of roles) {
        // Discord API: Add Guild Member Role
        // Endpoint: PUT /guilds/{guild.id}/members/{user.id}/roles/{role.id}
        const url = `https://discord.com/api/v10/guilds/${guildId}/members/${userId}/roles/${roleId}`;
        
        console.log(`Assigning Role ${roleId} to User ${userId}...`);
        
        const res = await fetch(url, {
            method: 'PUT',
            headers: {
                'Authorization': `Bot ${DISCORD_BOT_TOKEN}`,
                'Content-Type': 'application/json'
            }
        });
        
        if (res.ok) {
            results.push({ roleId, status: 'added' });
        } else {
            const text = await res.text();
            console.error(`Failed to add role ${roleId}. Status: ${res.status}. Response: ${text}`);
            
            // Provide helpful hints for common errors
            let helpfulMessage = text;
            if (res.status === 403) {
                helpfulMessage = "Forbidden: The Bot likely has a lower role hierarchy than the role it is trying to assign. Move the Bot role HIGHER in Server Settings.";
            } else if (res.status === 404) {
                helpfulMessage = "Not Found: User is likely not in the server.";
            }

            results.push({ roleId, status: 'failed', error: helpfulMessage, code: res.status });
        }
    }

    return new Response(JSON.stringify({ success: true, results }), {
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
    });

  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
    });
  }
})