import { createClient, SupabaseClient } from '@supabase/supabase-js';

// These environment variables must be set in your .env file
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Check if Supabase is configured
export const isSupabaseConfigured = !!(supabaseUrl && supabaseAnonKey);

// Create a single supabase client for interacting with your database
// Returns null if env vars are missing (graceful degradation)
export const supabase: SupabaseClient | null = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

// Log warning in development if env vars are missing
if (!isSupabaseConfigured) {
  console.warn(
    '⚠️  Supabase not configured. Auth features will be disabled.\n' +
    'Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your .env file.'
  );
}

// Helper to get the current user's JWT token for backend requests
export const getAuthToken = async () => {
  if (!supabase) {
    return null;
  }
  try {
    const { data } = await supabase.auth.getSession();
    return data.session?.access_token || null;
  } catch (error) {
    console.error('Error getting auth token:', error);
    return null;
  }
};
