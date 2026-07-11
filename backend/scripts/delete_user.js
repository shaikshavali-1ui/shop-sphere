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

const emailToDelete = process.argv[2];

if (!emailToDelete) {
  console.log("Usage: node backend/scripts/delete_user.js <email_address>");
  process.exit(1);
}

async function deleteUser() {
  console.log("Fetching user list from Supabase Auth...");
  const { data: { users }, error: listError } = await supabase.auth.admin.listUsers();
  
  if (listError) {
    console.error("Error listing users:", listError.message);
    process.exit(1);
  }

  const user = users.find(u => u.email === emailToDelete);
  if (!user) {
    console.log(`User not found for email: ${emailToDelete}`);
    process.exit(1);
  }

  console.log(`Deleting user account ${emailToDelete} (ID: ${user.id}) from Supabase Auth...`);

  // Try deleting customer row in db if it exists
  const { error: dbError } = await supabase.from('customers').delete().eq('customer_id', user.id);
  if (dbError) {
    console.log(`Note: customer table row deletion info: ${dbError.message}`);
  }

  // Delete from Supabase Auth
  const { error } = await supabase.auth.admin.deleteUser(user.id);

  if (error) {
    console.error(`Failed to delete user account ${emailToDelete}:`, error.message);
  } else {
    console.log(`Successfully deleted user account ${emailToDelete}!`);
  }
}

deleteUser();
