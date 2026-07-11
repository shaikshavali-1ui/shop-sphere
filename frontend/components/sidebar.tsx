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
      localStorage.removeItem('shopsphere_demo_session');
      await supabase.auth.signOut();
      router.push('/login');
      router.refresh();
    } catch (err) {
      console.error('Error logging out:', err);
    }
  };

  return (
    <aside className="w-64 bg-white border-r border-slate-200 flex flex-col justify-between shrink-0 h-screen sticky top-0 z-30 shadow-sm">
      <div className="p-6">
        <Link 
          href="/dashboard" 
          className="flex flex-col items-start gap-0.5 group shrink-0 mb-8"
        >
          <div className="flex items-center gap-1">
            <span className="text-xl font-extrabold italic tracking-tight text-[#172554] flex items-center">
              <span className="text-blue-600 mr-0.5 font-black">S</span>hop<span className="text-[#fb641b]">Sphere</span>
            </span>
          </div>
          <span className="text-[9px] italic text-slate-450 font-bold flex items-center gap-0.5">
            Explore <span className="text-[#fb641b] font-black">Plus</span>
            <span className="text-yellow-500 font-extrabold">★</span>
          </span>
        </Link>

        <nav className="space-y-1.5">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-bold transition-all duration-200 ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-600/10 border border-blue-500/10'
                    : 'text-slate-655 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                <Icon className="h-4.5 w-4.5" />
                {item.name}
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="p-6 border-t border-slate-100 bg-slate-50/50">
        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-slate-100 hover:bg-rose-50 hover:text-rose-600 hover:border-rose-200 border border-slate-200 text-slate-700 font-bold rounded-lg text-xs tracking-wider uppercase transition-all duration-200 cursor-pointer shadow-sm active:scale-95"
        >
          <LogOut className="h-4 w-4" />
          Logout
        </button>
      </div>
    </aside>
  );
};
