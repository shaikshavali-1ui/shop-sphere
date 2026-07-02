'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase/client';

export default function RootRouter() {
  const router = useRouter();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        // Guest user -> Redirect to unified login portal
        router.push('/login');
      } else {
        // Authenticated user -> Check their role traits
        const email = session.user.email || '';
        
        // If email indicates admin role (or custom logic/meta matching), go to dashboard
        const isAdmin = email.includes('admin') || email.endsWith('@shopsphere.com');
        
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
