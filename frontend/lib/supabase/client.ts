import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

// Fallback dummy credentials to prevent build-time crashes if keys are absent in Vercel compilation
const activeUrl = supabaseUrl || 'https://dummy-project-id.supabase.co';
const activeKey = supabaseAnonKey || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR1bW15LXBvcnRhbCIsInJvbGUiOiJhbm9uIiwiaWF0IjoxNzgyNzkxNjczLCJleHAiOjIwOTgzNjc2NzN9.dummy-signature';

export const supabase = createClient(activeUrl, activeKey);
