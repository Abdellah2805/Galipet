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

    const supabase = getSupabase();
    if (!supabase) {
      setLoading(false);
      return;
    }

    const { data: sub } = supabase.auth.onAuthStateChange(async (_event, s) => {
      setSession(s);
      
      if (s?.user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', s.user.id)
          .single();
        setUserRole(profile?.role || null);
      }
    });

    supabase.auth.getSession().then(async ({ data }) => {
      setSession(data.session);
      if (data.session?.user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', data.session.user.id)
          .single();
        setUserRole(profile?.role || null);
      }
      setLoading(false);
    });
    return () => sub.subscription.unsubscribe();
  }, [mounted]);

  return (
    <AuthContext.Provider value={{ session, loading, userRole }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);