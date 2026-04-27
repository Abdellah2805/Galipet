import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL || '';
const SUPABASE_ANON_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || '';

let supabaseClient: any = null;

// Utiliser localStorage sur le web, et un fallback memoire pour SSR/build statique
const getStorage = () => {
  if (typeof window !== 'undefined' && window.localStorage) {
    return {
      getItem: (key: string) => Promise.resolve(window.localStorage.getItem(key)),
      setItem: (key: string, value: string) => Promise.resolve(window.localStorage.setItem(key, value)),
      removeItem: (key: string) => Promise.resolve(window.localStorage.removeItem(key)),
    };
  }
  // Fallback memoire pour le rendu statique / SSR
  const memoryStore: Record<string, string> = {};
  return {
    getItem: (key: string) => Promise.resolve(memoryStore[key] || null),
    setItem: (key: string, value: string) => { memoryStore[key] = value; return Promise.resolve(); },
    removeItem: (key: string) => { delete memoryStore[key]; return Promise.resolve(); },
  };
};

export const getSupabase = () => {
  if (!supabaseClient) {
    supabaseClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      auth: {
        storage: getStorage() as any,
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: false,
      },
    });
  }
  return supabaseClient;
};

export const supabase = getSupabase();
