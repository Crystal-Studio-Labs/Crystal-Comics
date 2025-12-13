import { createClient } from '@supabase/supabase-js';

// Safe access to environment variables.
// In some environments, import.meta.env might be undefined during initialization.
const env = import.meta.env || ({} as any);

const supabaseUrl = env.VITE_SUPABASE_URL;
const supabaseAnonKey = env.VITE_SUPABASE_ANON_KEY;

// Fallback for development if keys aren't present yet, so the app doesn't crash
const isConfigured = Boolean(supabaseUrl && supabaseAnonKey);

export const supabase = isConfigured 
  ? createClient(supabaseUrl, supabaseAnonKey) 
  : null;

export const isSupabaseConfigured = () => isConfigured;