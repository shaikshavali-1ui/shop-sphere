'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase/client';

export default function RootRouter() {
  const router = useRouter();

  useEffect(() => {
    const isDbConfigured = process.env.NEXT_PUBLIC_SUPABASE_URL && 
                           !process.env.NEXT_PUBLIC_SUPABASE_URL.includes('dummy-project-id');

    const handleRedirect = (activeSession: any) => {
      if (!activeSession) {
        router.push('/login');
      } else {
        const email = activeSession.user.email || '';
        const userRole = activeSession.user.user_metadata?.role || 'customer';
        
        const isAdmin = userRole === 'admin' || 
                        email.includes('admin') || 
                        email.endsWith('@shopsphere.com');
        
        if (isAdmin) {
          router.push('/dashboard');
        } else {
          router.push('/store');
        }
      }
    };

    if (!isDbConfigured) {
      let activeSession = null;
      const demoSession = localStorage.getItem('shopsphere_demo_session');
      if (demoSession) {
        try {
          activeSession = JSON.parse(demoSession);
        } catch (e) {}
      }
      handleRedirect(activeSession);
      return;
    }

    supabase.auth.getSession().then(({ data: { session } }) => {
      let activeSession = session;
      if (!activeSession) {
        const demoSession = localStorage.getItem('shopsphere_demo_session');
        if (demoSession) {
          try {
            activeSession = JSON.parse(demoSession);
          } catch (e) {
            console.error("Failed to parse demo session", e);
          }
        }
      }
      handleRedirect(activeSession);
    });
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 text-slate-450 text-xs">
      Directing you to your ShopSphere portal...
    </div>
  );
}
