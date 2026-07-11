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

const emailToDemote = process.argv[2];

if (!emailToDemote) {
  console.log("Usage: node backend/scripts/demote_admin.js <email_address>");
  process.exit(1);
}

async function demoteUser() {
  console.log("Fetching user list from Supabase Auth...");
  const { data: { users }, error: listError } = await supabase.auth.admin.listUsers();
  
  if (listError) {
    console.error("Error listing users:", listError.message);
    process.exit(1);
  }

  const user = users.find(u => u.email === emailToDemote);
  if (!user) {
    console.log(`User not found for email: ${emailToDemote}`);
    process.exit(1);
  }

  console.log(`Demoting ${emailToDemote} (ID: ${user.id}) to customer role...`);

  const { data, error } = await supabase.auth.admin.updateUserById(
    user.id,
    {
      user_metadata: {
        ...user.user_metadata,
        role: 'customer'
      }
    }
  );

  if (error) {
    console.error(`Failed to demote ${emailToDemote}:`, error.message);
  } else {
    console.log(`Successfully demoted ${emailToDemote} to customer role!`);
  }
}

demoteUser();
