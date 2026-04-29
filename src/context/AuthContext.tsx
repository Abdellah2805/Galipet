import React, { createContext, useContext, useEffect, useState } from 'react';
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

  useEffect(() => {
    if (!mounted) return;

    // Bypass complet lors du rendu statique (SSR/build)
    if (typeof window === 'undefined') {
      setLoading(false);
      return;
    }

    const supabase = getSupabase();
    if (!supabase) {
      setLoading(false);
      return;
    }

    // Timeout de securite : evite le chargement infini si getSession ne repond jamais
    const timeoutId = setTimeout(() => {
      setLoading(false);
    }, 3000);

    const { data: sub } = supabase.auth.onAuthStateChange(async (_event, s) => {
      setSession(s);

      if (s?.user) {
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', s.user.id)
          .maybeSingle();
        if (profileError) {
          console.warn('AuthContext profile fetch error:', profileError);
        }
        setUserRole(profile?.role || null);
      } else {
        setUserRole(null);
      }
        setUserRole(profile?.role || null);
      } else {
        setUserRole(null);
      }
    });

    supabase.auth.getSession().then(async ({ data, error }) => {
      // Gestion des erreurs de lock de session Supabase
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
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', data.session.user.id)
          .maybeSingle();
        if (profileError) {
          console.warn('AuthContext profile fetch error:', profileError);
        }
        setUserRole(profile?.role || null);
      }
        setUserRole(profile?.role || null);
      }
      clearTimeout(timeoutId);
      setLoading(false);
    }).catch((error) => {
      console.warn('Auth session error:', error);
      clearTimeout(timeoutId);
      setLoading(false);
    });

    return () => {
      clearTimeout(timeoutId);
      sub.subscription.unsubscribe();
    };
  }, [mounted]);

  return (
    <AuthContext.Provider value={{ session, loading, userRole }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
