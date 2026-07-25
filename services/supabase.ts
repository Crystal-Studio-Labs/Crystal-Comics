import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Safe access to environment variables.
const env = (import.meta as any).env || ({} as any);

const primaryUrl = env.VITE_SUPABASE_URL;
const primaryAnonKey = env.VITE_SUPABASE_ANON_KEY;

const secondaryUrl = env.VITE_SUPABASE_SECONDARY_URL;
const secondaryAnonKey = env.VITE_SUPABASE_SECONDARY_ANON_KEY;

// Instantiation of Primary and Secondary Supabase Clients
export const primarySupabase: SupabaseClient | null = (primaryUrl && primaryAnonKey)
  ? createClient(primaryUrl, primaryAnonKey)
  : null;

export const secondarySupabase: SupabaseClient | null = (secondaryUrl && secondaryAnonKey)
  ? createClient(secondaryUrl, secondaryAnonKey)
  : null;

// Track active status
let isPrimaryHealthy = true;

/**
 * Checks if Supabase is configured in current environment.
 */
export const isSupabaseConfigured = (): boolean => {
  return Boolean(primarySupabase || secondarySupabase);
};

/**
 * Dual-DB Failover Resolver:
 * Returns Primary Supabase client if healthy. If Primary fails or returns errors,
 * automatically falls back to Secondary Supabase client.
 */
export const getActiveSupabaseClient = (): SupabaseClient | null => {
  if (isPrimaryHealthy && primarySupabase) {
    return primarySupabase;
  }
  if (secondarySupabase) {
    console.warn('[Supabase Failover] Primary DB unavailable/unhealthy. Falling back to Secondary Supabase DB.');
    return secondarySupabase;
  }
  return primarySupabase || null;
};

/**
 * Reports failure on Primary DB to trigger seamless failover to Secondary DB.
 */
export const markPrimaryUnhealthy = () => {
  if (secondarySupabase) {
    console.warn('[Supabase Failover] Switching active connection to Secondary Supabase DB.');
    isPrimaryHealthy = false;
  }
};

/**
 * Resets Primary DB health status.
 */
export const resetPrimaryHealth = () => {
  isPrimaryHealthy = true;
};

// Default export for backward compatibility
export const supabase = primarySupabase;