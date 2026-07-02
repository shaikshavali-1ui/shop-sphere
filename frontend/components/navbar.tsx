'use client';

import React from 'react';
import { useAuth } from '@/components/auth-provider';
import { User, Bell } from 'lucide-react';

export const Navbar: React.FC = () => {
  const { user } = useAuth();

  return (
    <header className="h-16 border-b border-white/5 bg-slate-900/10 backdrop-blur-md px-8 flex items-center justify-between sticky top-0 z-20">
      <div className="flex items-center">
        <h2 className="text-lg font-bold tracking-tight text-slate-100">
          ShopSphere Admin Panel
        </h2>
      </div>

      <div className="flex items-center gap-4">
        {/* Notifications indicator */}
        <button className="p-2 hover:bg-white/5 rounded-lg text-slate-400 hover:text-slate-200 transition-colors relative">
          <Bell className="h-5 w-5" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-indigo-500 rounded-full glow-indigo" />
        </button>

        {/* User profile details */}
        <div className="flex items-center gap-3 border-l border-white/5 pl-4">
          <div className="flex flex-col text-right hidden sm:flex">
            <span className="text-xs font-semibold text-slate-200">
              Admin Account
            </span>
            <span className="text-[10px] text-slate-400">
              {user?.email || 'authenticating...'}
            </span>
          </div>

          <div className="p-2 bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 rounded-full">
            <User className="h-4 w-4" />
          </div>
        </div>
      </div>
    </header>
  );
};
