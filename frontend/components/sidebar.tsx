'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase/client';
import { Layers, LayoutDashboard, ShoppingBag, ShoppingCart, Users, LogOut } from 'lucide-react';

export const Sidebar: React.FC = () => {
  const pathname = usePathname();
  const router = useRouter();

  const menuItems = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Products', href: '/products', icon: ShoppingBag },
    { name: 'Orders', href: '/orders', icon: ShoppingCart },
    { name: 'Customers', href: '/customers', icon: Users },
  ];

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      router.push('/login');
      router.refresh();
    } catch (err) {
      console.error('Error logging out:', err);
    }
  };

  return (
    <aside className="w-64 bg-slate-900/40 border-r border-white/5 backdrop-blur-md flex flex-col justify-between shrink-0 h-screen sticky top-0 z-30">
      <div className="p-6">
        <Link href="/dashboard" className="flex items-center gap-3 text-indigo-400 font-extrabold text-xl tracking-tight mb-8">
          <Layers className="h-6 w-6" />
          <span>ShopSphere</span>
        </Link>

        <nav className="space-y-1.5">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/15 border border-indigo-500/30'
                    : 'text-slate-400 hover:bg-white/5 hover:text-slate-200'
                }`}
              >
                <Icon className="h-4.5 w-4.5" />
                {item.name}
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="p-6 border-t border-white/5 bg-slate-950/20">
        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-slate-800 hover:bg-rose-950/20 hover:text-rose-400 hover:border-rose-500/30 border border-slate-700/50 text-slate-300 font-medium rounded-lg text-sm transition-all duration-200"
        >
          <LogOut className="h-4 w-4" />
          Logout
        </button>
      </div>
    </aside>
  );
};
