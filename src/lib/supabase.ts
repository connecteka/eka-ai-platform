import { createClient } from '@supabase/supabase-js';

// These environment variables must be set in your .env file
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Validate environment variables - fail fast in production
if (!supabaseUrl) {
  throw new Error(
    '🔴 CRITICAL: VITE_SUPABASE_URL is missing! ' +
    'Please set it in your environment variables.'
  );
}
if (!supabaseAnonKey) {
  throw new Error(
    '🔴 CRITICAL: VITE_SUPABASE_ANON_KEY is missing! ' +
    'Please set it in your environment variables.'
  );
}

// Create a single supabase client for interacting with your database
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Helper to get the current user's JWT token for backend requests
export const getAuthToken = async () => {
  try {
    const { data } = await supabase.auth.getSession();
    return data.session?.access_token || null;
  } catch (error) {
    console.error('Error getting auth token:', error);
    return null;
  }
};
