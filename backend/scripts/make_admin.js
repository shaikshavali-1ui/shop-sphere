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

const targetEmails = [
  'shaikshavali05335@gmail.com',
  'shaikshavali@gmail.com'
];

async function promoteUsersToAdmin() {
  console.log("Fetching user list from Supabase Auth...");
  const { data: { users }, error: listError } = await supabase.auth.admin.listUsers();
  
  if (listError) {
    console.error("Error listing users:", listError.message);
    process.exit(1);
  }

  for (const email of targetEmails) {
    const user = users.find(u => u.email === email);
    if (!user) {
      console.log(`User not found for email: ${email}`);
      continue;
    }

    console.log(`Promoting ${email} (ID: ${user.id}) to admin role...`);

    const { data, error } = await supabase.auth.admin.updateUserById(
      user.id,
      {
        user_metadata: {
          ...user.user_metadata,
          role: 'admin'
        }
      }
    );

    if (error) {
      console.error(`Failed to promote ${email}:`, error.message);
    } else {
      console.log(`Successfully promoted ${email} to admin!`);
    }
  }

  console.log("\nAdministration promotion completed!");
}

promoteUsersToAdmin();
