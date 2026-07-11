'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase/client';

export default function RootRouter() {
  const router = useRouter();

  useEffect(() => {
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

      if (!activeSession) {
        // Guest user -> Redirect to unified login portal
        router.push('/login');
      } else {
        // Authenticated user -> Check their role traits
        const email = activeSession.user.email || '';
        const userRole = activeSession.user.user_metadata?.role || 'customer';
        
        // Admin if metadata role is 'admin' or email matches admin patterns
        const isAdmin = userRole === 'admin' || 
                        email.includes('admin') || 
                        email.endsWith('@shopsphere.com');
        
        if (isAdmin) {
          router.push('/dashboard');
        } else {
          router.push('/store');
        }
      }
    });
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 text-slate-450 text-xs">
      Directing you to your ShopSphere portal...
    </div>
  );
}
