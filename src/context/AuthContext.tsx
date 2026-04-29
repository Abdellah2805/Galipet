import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { getSupabase } from '../lib/supabase';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);
  const [userRole, setUserRole] = useState(null);

  useEffect(() => {
    setMounted(true);
    return () => {};
  }, []);

  // Extracted fetchRole to be reusable
  const fetchRole = useCallback(async (supabase, userId) => {
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', userId)
      .maybeSingle();
    if (profileError) {
      console.warn('AuthContext profile fetch error:', profileError);
    }
    return profile?.role || null;
  }, []);

  useEffect(() => {
    if (!mounted) return;

    if (typeof window === 'undefined') {
      setLoading(false);
      return;
    }

    const supabase = getSupabase();
    if (!supabase) {
      setLoading(false);
      return;
    }

    const timeoutId = setTimeout(() => {
      setLoading(false);
    }, 3000);

    // Listen to auth state changes
    const { data: sub } = supabase.auth.onAuthStateChange(async (_event, s) => {
      setSession(s);
      if (s?.user) {
        const role = await fetchRole(supabase, s.user.id);
        setUserRole(role);
      } else {
        setUserRole(null);
      }
    });

    // Initial session check with retry logic for post-signup race condition
    const initSession = async () => {
      try {
        const { data, error } = await supabase.auth.getSession();

        if (error?.message?.includes('lock') || error?.message?.includes('Lock')) {
          console.warn('Auth lock detected, clearing corrupted session:', error);
          await supabase.auth.signOut();
          setSession(null);
          setLoading(false);
          clearTimeout(timeoutId);
          return;
        }

        setSession(data?.session || null);

        if (data?.session?.user) {
          const role = await fetchRole(supabase, data.session.user.id);
          setUserRole(role);

          // If role is still null, retry a few times to handle post-registration race condition
          if (!role) {
            let attempts = 0;
            const maxAttempts = 5;
            const retryInterval = setInterval(async () => {
              attempts++;
              const retryRole = await fetchRole(supabase, data.session.user.id);
              if (retryRole) {
                setUserRole(retryRole);
                clearInterval(retryInterval);
                setLoading(false);
              } else if (attempts >= maxAttempts) {
                clearInterval(retryInterval);
                console.warn('AuthContext: role still null after retries, user might be a new customer without profile yet');
                setLoading(false);
              }
            }, 800);

            // Cleanup interval on unmount or if component reruns
            return () => clearInterval(retryInterval);
          }
        }
      } catch (error) {
        console.warn('Auth session error:', error);
      } finally {
        clearTimeout(timeoutId);
        setLoading(false);
      }
    };

    initSession();

    return () => {
      clearTimeout(timeoutId);
      sub.subscription.unsubscribe();
    };
  }, [mounted, fetchRole]);

  // Retry mechanism: if session exists but role is null, retry periodically
  useEffect(() => {
    if (!session?.user?.id || userRole) return;

    const supabase = getSupabase();
    if (!supabase) return;

    let attempts = 0;
    const maxAttempts = 10;

    const interval = setInterval(async () => {
      attempts++;
      const role = await fetchRole(supabase, session.user.id);
      if (role) {
        setUserRole(role);
        clearInterval(interval);
      } else if (attempts >= maxAttempts) {
        clearInterval(interval);
        console.warn('AuthContext: stopped retrying role fetch after max attempts');
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [session, userRole, fetchRole]);

  return (
    <AuthContext.Provider value={{ session, loading, userRole }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
