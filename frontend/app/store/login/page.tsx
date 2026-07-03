'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase/client';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select } from '@/components/ui/select';
import { Layers, ShoppingBag, AlertTriangle, CheckCircle } from 'lucide-react';

export default function UnifiedLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState<'customer' | 'admin'>('customer');
  const [isSignUp, setIsSignUp] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  // Read URL query params to pre-select role on mount (e.g. /store/login?role=admin)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const urlRole = params.get('role');
    if (urlRole === 'admin' || urlRole === 'customer') {
      setRole(urlRole as 'admin' | 'customer');
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);
    setLoading(true);

    try {
      if (isSignUp) {
        // Sign Up Flow
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/login`,
            data: {
              name,
              role,
            }
          }
        });

        if (error) {
          setErrorMsg(error.message);
        } else {
          // If session is immediately active (auto-confirm is enabled in Supabase)
          if (data.session) {
            if (role === 'customer') {
              await supabase.from('customers').upsert({
                customer_id: data.session.user.id,
                name: name || email.split('@')[0],
                email: email,
                phone: '',
                address: ''
              });
              router.push('/store');
            } else {
              router.push('/');
            }
            router.refresh();
          } else {
            // Auto-confirm disabled (standard Supabase default)
            setSuccessMsg('Account created successfully! Please check your email to verify your registration.');
            setIsSignUp(false);
          }
        }
      } else {
        // Sign In Flow
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) {
          setErrorMsg(error.message);
        } else if (data.session) {
          // Route destination based on user's actual role metadata
          const actualRole = data.session.user.user_metadata?.role || 'customer';

          if (actualRole === 'customer') {
            // Guarantee customer row existence in public.customers
            const { data: existingCust } = await supabase
              .from('customers')
              .select('customer_id')
              .eq('customer_id', data.session.user.id)
              .maybeSingle();

            if (!existingCust) {
              await supabase.from('customers').insert({
                customer_id: data.session.user.id,
                name: data.session.user.user_metadata?.name || email.split('@')[0],
                email: data.session.user.email || email,
                phone: '',
                address: ''
              });
            }
            router.push('/store');
          } else {
            router.push('/');
          }
          router.refresh();
        }
      }
    } catch (err: any) {
      setErrorMsg('An unexpected connection error occurred.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center p-4 bg-slate-950">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800/80 shadow-2xl rounded-2xl p-8 text-center space-y-6">
        
        {/* Changing header icons based on active dropdown selection */}
        <div className="flex justify-center">
          {role === 'admin' ? (
            <div className="p-3 bg-indigo-600/10 border border-indigo-500/20 rounded-2xl text-indigo-400 transition-colors">
              <Layers className="h-8 w-8" />
            </div>
          ) : (
            <div className="p-3 bg-emerald-600/10 border border-emerald-500/20 rounded-2xl text-emerald-400 transition-colors">
              <ShoppingBag className="h-8 w-8" />
            </div>
          )}
        </div>

        <div className="space-y-1.5">
          <h1 className="text-2xl font-black text-slate-100 tracking-tight">
            ShopSphere {isSignUp ? 'Sign Up' : 'Gate'}
          </h1>
          <p className="text-slate-400 text-xs">
            {isSignUp 
              ? 'Create a new account to access the platform' 
              : role === 'admin' 
                ? 'Sign in to access your administrative dashboard' 
                : 'Sign in to view your customer collections catalog'
            }
          </p>
        </div>

        {/* Portal switcher dropdown in the middle */}
        <Select
          id="portal-role-select"
          label="Portal Access Role"
          options={[
            { label: 'Customer Portal', value: 'customer' },
            { label: 'Administrator Portal (Admin)', value: 'admin' }
          ]}
          value={role}
          onChange={(e) => setRole(e.target.value as 'customer' | 'admin')}
          className="text-center"
        />

        {errorMsg && (
          <div className="flex items-start gap-3 bg-rose-500/10 border border-rose-500/20 text-rose-400 p-3.5 rounded-lg text-left text-xs leading-relaxed">
            <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold block mb-0.5">Authentication Failed</span>
              {errorMsg}
            </div>
          </div>
        )}

        {successMsg && (
          <div className="flex items-start gap-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 p-3.5 rounded-lg text-left text-xs leading-relaxed">
            <CheckCircle className="h-4 w-4 shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold block mb-0.5">Success</span>
              {successMsg}
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-center">
          {isSignUp && (
            <Input
              id="unified-name"
              label="Full Name"
              type="text"
              placeholder="John Doe"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              disabled={loading}
              className="text-center"
            />
          )}

          <Input
            id="unified-email"
            label="Email Address"
            type="email"
            placeholder={role === 'admin' ? 'admin@shopsphere.com' : 'customer@example.com'}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            disabled={loading}
            className="text-center"
          />

          <Input
            id="unified-password"
            label="Password"
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            disabled={loading}
            className="text-center"
          />

          <Button
            type="submit"
            className={`w-full py-2.5 mt-2 transition-colors ${
              role === 'admin' 
                ? 'bg-indigo-600 hover:bg-indigo-500 border-indigo-500/20' 
                : 'bg-emerald-600 hover:bg-emerald-500 border-emerald-500/20'
            }`}
            disabled={loading}
          >
            {loading ? 'Processing...' : isSignUp ? 'Create Account' : 'Sign In'}
          </Button>
        </form>

        <div className="pt-2">
          <button
            type="button"
            onClick={() => {
              setIsSignUp(!isSignUp);
              setErrorMsg(null);
              setSuccessMsg(null);
            }}
            className="text-xs text-slate-400 hover:text-slate-200 underline underline-offset-4 transition-colors"
          >
            {isSignUp ? 'Already have an account? Sign In' : "Don't have an account? Sign Up"}
          </button>
        </div>
      </div>
    </main>
  );
}
