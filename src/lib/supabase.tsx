import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL || '';
const SUPABASE_ANON_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || '';

let supabaseClient: any = null;

// SSR-safe: check for window before using browser-only APIs
const isBrowser = typeof window !== 'undefined';

let storage: any = null;

if (isBrowser) {
  // Web/browser: use localStorage (sync interface expected by supabase-js for web)
  storage = {
    getItem: (key: string) => localStorage.getItem(key),
    setItem: (key: string, value: string) => localStorage.setItem(key, value),
    removeItem: (key: string) => localStorage.removeItem(key),
  };
}
// In React Native, supabase-js will use AsyncStorage automatically via react-native-url-polyfill
// In SSR (build time), storage is null and persistSession=false, so no storage is used

export const getSupabase = () => {
  if (!supabaseClient) {
    const config: any = {
      auth: {
        autoRefreshToken: true,
        persistSession: isBrowser,
        detectSessionInUrl: isBrowser,
      },
    };
    if (storage) {
      config.auth.storage = storage;
    }
    supabaseClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, config);
  }
  return supabaseClient;
};

export const supabase = getSupabase();
