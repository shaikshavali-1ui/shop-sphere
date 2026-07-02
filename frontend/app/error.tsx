'use client';

import React, { useEffect } from 'react';
import { AlertCircle, RotateCcw, Home } from 'lucide-react';
import Link from 'next/link';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log exception context
    console.error('Unhandled runtime error captured:', error);
  }, [error]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-950 p-6 text-center">
      <div className="glass-panel w-full max-w-md p-8 border border-rose-500/20 bg-rose-950/5 flex flex-col items-center">
        <div className="p-4 bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-full glow-rose mb-6">
          <AlertCircle className="h-10 w-10 animate-pulse" />
        </div>

        <h1 className="text-2xl font-black text-slate-100 tracking-tight mb-2">
          System Anomaly Detected
        </h1>
        <p className="text-sm text-slate-400 leading-relaxed mb-6">
          ShopSphere captured an unexpected crash or network timeout. Secure session states are safe.
        </p>

        {error.message && (
          <div className="w-full bg-slate-950/80 border border-white/5 rounded-lg p-3 text-left font-mono text-xs text-rose-400 mb-6 truncate">
            {error.message}
          </div>
        )}

        <div className="flex gap-4 w-full justify-center">
          <button
            onClick={() => reset()}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 px-4 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold rounded-lg transition-colors shadow-md shadow-indigo-600/10"
          >
            <RotateCcw className="h-4 w-4" />
            Try Again
          </button>
          <Link
            href="/"
            className="flex-1 flex items-center justify-center gap-2 py-2.5 px-4 bg-slate-800 hover:bg-slate-700 text-slate-200 text-sm font-semibold rounded-lg transition-colors border border-slate-700/50"
          >
            <Home className="h-4 w-4" />
            Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
