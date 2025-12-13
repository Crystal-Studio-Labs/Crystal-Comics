import { createClient } from '@supabase/supabase-js';

// These environment variables must be set in your Vercel project settings
// We use import.meta.env which is the standard for Vite applications
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Fallback for development if keys aren't present yet, so the app doesn't crash
const isConfigured = Boolean(supabaseUrl && supabaseAnonKey);

export const supabase = isConfigured 
  ? createClient(supabaseUrl, supabaseAnonKey) 
  : null;

export const isSupabaseConfigured = () => isConfigured;