const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

// 1. Read env variables from frontend/.env.local
const envPath = path.join(__dirname, '../../frontend/.env.local');
if (!fs.existsSync(envPath)) {
  console.error(`Error: .env.local file not found at ${envPath}`);
  process.exit(1);
}

const envContent = fs.readFileSync(envPath, 'utf-8');

const getEnvVar = (name) => {
  const match = envContent.match(new RegExp(`${name}=(.*)`));
  return match ? match[1].trim() : null;
};

const supabaseUrl = getEnvVar('NEXT_PUBLIC_SUPABASE_URL');
const serviceRoleKey = getEnvVar('SUPABASE_SERVICE_ROLE_KEY');

if (!supabaseUrl || !serviceRoleKey) {
  console.error("Error: NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY is missing from .env.local");
  process.exit(1);
}

// 2. Initialize Supabase Admin Client
const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  }
});

async function listAdmins() {
  console.log("Fetching user list from Supabase Auth...\n");
  const { data: { users }, error } = await supabase.auth.admin.listUsers();
  
  if (error) {
    console.error("Error listing users:", error.message);
    process.exit(1);
  }

  console.log("--------------------------------------------------------------------------------");
  console.log("EMAIL                           | ROLE          | ID");
  console.log("--------------------------------------------------------------------------------");
  
  users.forEach(user => {
    const email = user.email || 'N/A';
    const roleMetadata = user.user_metadata?.role || 'customer';
    
    // Check if email contains 'admin' as a fallback identification
    const isFallbackAdmin = email.toLowerCase().includes('admin');
    const displayRole = (roleMetadata === 'admin' || isFallbackAdmin) ? 'ADMIN' : 'customer';
    
    console.log(`${email.padEnd(32)} | ${displayRole.padEnd(13)} | ${user.id}`);
  });
  console.log("--------------------------------------------------------------------------------");
}

listAdmins();
