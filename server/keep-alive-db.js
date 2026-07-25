/**
 * Supabase 24/7 Keep-Alive Engine
 * 
 * Executes scheduled heartbeat pings against Primary and Secondary Supabase instances
 * to prevent free-tier databases from auto-pausing after 7 days of inactivity.
 */

import { createClient } from '@supabase/supabase-js';
import 'dotenv/config';

const primaryUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const primaryKey = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;

const secondaryUrl = process.env.VITE_SUPABASE_SECONDARY_URL || process.env.SUPABASE_SECONDARY_URL;
const secondaryKey = process.env.VITE_SUPABASE_SECONDARY_ANON_KEY || process.env.SUPABASE_SECONDARY_ANON_KEY;

const primarySupabase = (primaryUrl && primaryKey) ? createClient(primaryUrl, primaryKey) : null;
const secondarySupabase = (secondaryUrl && secondaryKey) ? createClient(secondaryUrl, secondaryKey) : null;

/**
 * Sends a lightweight heartbeat ping query to a Supabase database instance.
 */
export async function pingSupabaseInstance(client, name) {
  if (!client) {
    return { name, status: 'unconfigured', timestamp: new Date().toISOString() };
  }

  try {
    const start = Date.now();
    // Lightweight count query to keep DB active
    const { error } = await client.from('profiles').select('id', { count: 'exact', head: true });
    const durationMs = Date.now() - start;

    if (error && error.code !== 'PGRST116') {
      console.warn(`⚠️ [Keep-Alive Ping] ${name} returned error:`, error.message);
      return { name, status: 'error', error: error.message, durationMs, timestamp: new Date().toISOString() };
    }

    console.log(`✅ [Keep-Alive Ping] ${name} Heartbeat Successful (${durationMs}ms)`);
    return { name, status: 'healthy', durationMs, timestamp: new Date().toISOString() };
  } catch (err) {
    console.error(`❌ [Keep-Alive Ping] ${name} Exception:`, err.message);
    return { name, status: 'failed', error: err.message, timestamp: new Date().toISOString() };
  }
}

/**
 * Pings all configured Supabase database instances.
 */
export async function runKeepAlivePingAll() {
  console.log(`📡 [Keep-Alive Engine] Executing scheduled database ping at ${new Date().toISOString()}`);
  
  const results = await Promise.all([
    pingSupabaseInstance(primarySupabase, 'Primary Supabase DB'),
    pingSupabaseInstance(secondarySupabase, 'Secondary Supabase DB')
  ]);

  return results;
}

/**
 * Initializes continuous background interval (runs every 48 hours).
 */
export function startKeepAliveScheduler() {
  // Initial ping on server startup
  runKeepAlivePingAll();

  // Schedule interval ping every 48 hours (172,800,000 ms)
  const FORTY_EIGHT_HOURS = 48 * 60 * 60 * 1000;
  setInterval(() => {
    runKeepAlivePingAll();
  }, FORTY_EIGHT_HOURS);

  console.log('⏰ [Keep-Alive Engine] Background 48-hour heartbeat scheduler activated.');
}
