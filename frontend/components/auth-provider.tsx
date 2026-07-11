'use client';

import React, { useEffect, createContext, useContext, useState } from 'react';
import { supabase } from '@/lib/supabase/client';
import { User, Session } from '@supabase/supabase-js';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  loading: true,
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 1. Fetch initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        setSession(session);
        setUser(session.user);
        syncCookies(session);
      } else {
        const demoSession = localStorage.getItem('shopsphere_demo_session');
        if (demoSession) {
          try {
            const parsed = JSON.parse(demoSession);
            setSession(parsed);
            setUser(parsed.user);
            syncCookies(parsed);
          } catch (e) {}
        }
      }
      setLoading(false);
    });

    // 2. Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, currentSession) => {
      if (currentSession) {
        setSession(currentSession);
        setUser(currentSession.user);
        syncCookies(currentSession);
      } else {
        const demoSession = localStorage.getItem('shopsphere_demo_session');
        if (demoSession) {
          try {
            const parsed = JSON.parse(demoSession);
            setSession(parsed);
            setUser(parsed.user);
            syncCookies(parsed);
          } catch (e) {}
        } else {
          setSession(null);
          setUser(null);
          syncCookies(null);
        }
      }
      setLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Helper function to sync session token into document cookies for Edge Middleware read
  const syncCookies = (session: Session | null) => {
    if (session) {
      // Set secure cookies
      document.cookie = `sb-access-token=${session.access_token}; path=/; max-age=${session.expires_in}; SameSite=Lax; Secure`;
      document.cookie = `sb-refresh-token=${session.refresh_token}; path=/; max-age=604800; SameSite=Lax; Secure`;
    } else {
      // Delete cookies by setting expiration in the past
      document.cookie = 'sb-access-token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC; SameSite=Lax; Secure';
      document.cookie = 'sb-refresh-token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC; SameSite=Lax; Secure';
    }
  };

  return (
    <AuthContext.Provider value={{ user, session, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
