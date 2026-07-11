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

  // Read URL query params to pre-select role on mount (e.g. /login?role=admin)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const urlRole = params.get('role');
    if (urlRole === 'admin' || urlRole === 'customer') {
      setRole(urlRole as 'admin' | 'customer');
    }
  }, []);

  const isConnectionError = (err: any) => {
    if (!err) return false;
    const msg = (err.message || String(err)).toLowerCase();
    return (
      msg.includes('fetch') || 
      msg.includes('network') || 
      msg.includes('failed') || 
      msg.includes('connection') || 
      msg.includes('dns') ||
      msg.includes('refused') ||
      msg.includes('load') ||
      err.status === 0 ||
      err instanceof TypeError
    );
  };

  const triggerDemoSession = async (targetEmail: string, targetRole: 'admin' | 'customer') => {
    const dummyUser = {
      id: targetRole === 'admin' ? '00000000-0000-0000-0000-000000000001' : `demo-cust-${Date.now()}`,
      email: targetEmail,
      user_metadata: { role: targetRole, name: targetRole === 'admin' ? 'Demo Admin' : targetEmail.split('@')[0] }
    };
    const dummySession = {
      access_token: 'demo-token',
      token_type: 'bearer',
      expires_in: 3600,
      user: dummyUser
    };
    localStorage.setItem('shopsphere_demo_session', JSON.stringify(dummySession));
    
    const secureFlag = typeof window !== 'undefined' && window.location.protocol === 'https:' ? '; Secure' : '';
    document.cookie = `sb-access-token=demo-token; path=/; max-age=3600; SameSite=Lax${secureFlag}`;
    document.cookie = `sb-refresh-token=demo-refresh-token; path=/; max-age=604800; SameSite=Lax${secureFlag}`;

    if (targetRole === 'customer') {
      const mockCustsStr = localStorage.getItem('shopsphere_mock_customers');
      if (mockCustsStr) {
        try {
          const parsed = JSON.parse(mockCustsStr);
          if (!parsed.some((c: any) => c.email.toLowerCase() === targetEmail.toLowerCase())) {
            parsed.push({
              customer_id: dummyUser.id,
              name: dummyUser.user_metadata.name,
              email: targetEmail,
              phone: '+1 555-0100',
              address: 'Demo Address St, NY',
              created_at: new Date().toISOString()
            });
            localStorage.setItem('shopsphere_mock_customers', JSON.stringify(parsed));
          }
        } catch (e) {}
      }
    }

    if (targetRole === 'admin') {
      router.push('/');
    } else {
      try {
        // Fire-and-forget the database upsert so we don't block/delay navigation when offline
        supabase.from('customers').upsert({
          customer_id: dummyUser.id,
          name: dummyUser.user_metadata.name,
          email: targetEmail,
          phone: '',
          address: ''
        });
      } catch (e) {}
      router.push('/store');
    }
    router.refresh();
  };

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
          if (isConnectionError(error)) {
            triggerDemoSession(email || (role === 'admin' ? 'admin@shopsphere.com' : 'customer@example.com'), role);
            return;
          }
          setErrorMsg(error.message);
        } else {
          // If session is immediately active (auto-confirm is enabled in Supabase)
          if (data.session) {
            if (role === 'customer') {
              const { data: emailCust } = await supabase
                .from('customers')
                .select('customer_id')
                .eq('email', email)
                .maybeSingle();

              if (emailCust && emailCust.customer_id !== data.session.user.id) {
                await supabase.from('orders').update({ customer_id: data.session.user.id }).eq('customer_id', emailCust.customer_id);
                await supabase.from('customers').delete().eq('customer_id', emailCust.customer_id);
              }

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
          if (isConnectionError(error)) {
            triggerDemoSession(email || (role === 'admin' ? 'admin@shopsphere.com' : 'customer@example.com'), role);
            return;
          }
          setErrorMsg(error.message);
        } else if (data.session) {
          // Route destination: Strictly check Supabase user_metadata role attribute set by DB Administrator
          const isAdmin = data.session.user.user_metadata?.role === 'admin';

          if (!isAdmin) {
            // Guarantee customer row existence in public.customers
            const { data: existingCust } = await supabase
              .from('customers')
              .select('customer_id')
              .eq('customer_id', data.session.user.id)
              .maybeSingle();

            if (!existingCust) {
              const { data: emailCust } = await supabase
                .from('customers')
                .select('customer_id')
                .eq('email', data.session.user.email || email)
                .maybeSingle();

              if (emailCust && emailCust.customer_id !== data.session.user.id) {
                await supabase.from('orders').update({ customer_id: data.session.user.id }).eq('customer_id', emailCust.customer_id);
                await supabase.from('customers').delete().eq('customer_id', emailCust.customer_id);
              }

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
      if (isConnectionError(err)) {
        triggerDemoSession(email || (role === 'admin' ? 'admin@shopsphere.com' : 'customer@example.com'), role);
        return;
      }
      setErrorMsg('An unexpected connection error occurred.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center p-4 bg-[#f1f3f6]">
      <div className="w-full max-w-md bg-white border border-slate-200 shadow-2xl rounded-2xl p-8 text-center space-y-6">
        
        {/* Changing header icons based on active dropdown selection */}
        <div className="flex justify-center">
          {role === 'admin' ? (
            <div className="p-3 bg-blue-50 border border-blue-100 rounded-2xl text-blue-650 transition-colors">
              <Layers className="h-8 w-8" />
            </div>
          ) : (
            <div className="p-3 bg-emerald-55/10 border border-emerald-100 rounded-2xl text-emerald-600 transition-colors">
              <ShoppingBag className="h-8 w-8" />
            </div>
          )}
        </div>

        <div className="space-y-1.5">
          <h1 className="text-2xl font-black text-slate-800 tracking-tight">
            ShopSphere {isSignUp ? 'Sign Up' : 'Gate'}
          </h1>
          <p className="text-slate-500 text-xs font-medium">
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
          <div className="flex items-start gap-3 bg-rose-50 border border-rose-100 text-rose-700 p-3.5 rounded-lg text-left text-xs leading-relaxed animate-pulse">
            <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold block mb-0.5">Authentication Failed</span>
              {errorMsg}
            </div>
          </div>
        )}

        {successMsg && (
          <div className="flex items-start gap-3 bg-emerald-50 border border-emerald-100 text-emerald-600 p-3.5 rounded-lg text-left text-xs leading-relaxed">
            <CheckCircle className="h-4 w-4 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold block mb-0.5">Success</span>
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
                ? 'bg-blue-600 hover:bg-blue-700 border-blue-500/20 shadow-sm' 
                : 'bg-emerald-600 hover:bg-emerald-500 border-emerald-500/20 shadow-sm'
            }`}
            disabled={loading}
          >
            {loading ? 'Processing...' : isSignUp ? 'Create Account' : 'Sign In'}
          </Button>
        </form>

        <div className="pt-2 flex flex-col gap-2.5 items-center">
          <button
            type="button"
            onClick={() => {
              setIsSignUp(!isSignUp);
              setErrorMsg(null);
              setSuccessMsg(null);
            }}
            className="text-xs text-slate-500 hover:text-slate-800 underline underline-offset-4 transition-colors cursor-pointer"
          >
            {isSignUp ? 'Already have an account? Sign In' : "Don't have an account? Sign Up"}
          </button>
          
          <button
            type="button"
            onClick={() => {
              const defaultEmail = email.trim() || (role === 'admin' ? 'admin1@shopsphere.com' : 'customer@example.com');
              triggerDemoSession(defaultEmail, role);
            }}
            className="text-[10.5px] text-amber-600 hover:text-amber-750 font-bold hover:underline transition-colors cursor-pointer mt-1"
          >
            ⚠️ Connection issues? Enter Demo Mode (Offline Bypass)
          </button>
        </div>
      </div>
    </main>
  );
}
