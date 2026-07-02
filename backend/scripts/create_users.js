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

const defaultUsers = [
  {
    email: 'admin@shopsphere.com',
    password: 'admin123',
    role: 'admin',
    name: 'ShopSphere Admin'
  },
  {
    email: 'customer@example.com',
    password: 'customer123',
    role: 'customer',
    name: 'Jane Customer'
  }
];

async function seedUsers() {
  console.log("Seeding default authentication users in Supabase Auth...");

  for (const user of defaultUsers) {
    console.log(`\nCreating ${user.role} user: ${user.email}...`);
    
    // Check if user already exists
    const { data: { users }, error: listError } = await supabase.auth.admin.listUsers();
    if (listError) {
      console.error(`Error checking existing users:`, listError.message);
      continue;
    }

    const existingUser = users.find(u => u.email === user.email);
    if (existingUser) {
      console.log(`User ${user.email} already exists in Supabase Auth. Skipping creation.`);
      continue;
    }

    // Create user via admin API
    const { data, error } = await supabase.auth.admin.createUser({
      email: user.email,
      password: user.password,
      email_confirm: true,
      user_metadata: {
        role: user.role,
        name: user.name
      }
    });

    if (error) {
      console.error(`Failed to create ${user.email}:`, error.message);
    } else {
      console.log(`Successfully created and auto-confirmed user: ${user.email}`);
      console.log(`Credentials -> Email: ${user.email} | Password: ${user.password}`);
    }
  }

  console.log("\nAuthentication seeding completed!");
}

seedUsers();
