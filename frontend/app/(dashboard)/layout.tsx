'use client';

import React from 'react';
import { useAuth } from '@/components/auth-provider';
import { Sidebar } from '@/components/sidebar';
import { Navbar } from '@/components/navbar';
import { Loader2 } from 'lucide-react';

export default function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { session, loading } = useAuth();

  // Show a loading screen while Supabase session is resolving on initial load
  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-950 text-slate-400 gap-4">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-500" />
        <span className="text-sm font-medium tracking-wide">Syncing Admin Session...</span>
      </div>
    );
  }

  // Fallback check
  if (!session) {
    return null;
  }

  return (
    <div className="flex min-h-screen bg-slate-950">
      <Sidebar />
      <div className="flex-1 flex flex-col min-h-screen">
        <Navbar />
        <main className="flex-1 p-8 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
