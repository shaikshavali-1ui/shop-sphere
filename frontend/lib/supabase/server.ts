import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

// Fallback dummy credentials to prevent build-time crashes if keys are absent in Vercel compilation
const activeUrl = supabaseUrl || 'https://dummy-project-id.supabase.co';
const activeKey = supabaseServiceKey || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR1bW15LXBvcnRhbCIsInJvbGUiOiJzZXJ2aWNlX3JvbGUiLCJpYXQiOjE3ODI3OTE2NzMsImV4cCI6MjA5ODM2NzY3M30.dummy-signature';

export const supabaseServer = createClient(activeUrl, activeKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  },
});
