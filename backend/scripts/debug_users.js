const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

// Read env variables
const envContent = fs.readFileSync(path.join(__dirname, '../../frontend/.env.local'), 'utf-8');
const getEnvVar = (name) => {
  const match = envContent.match(new RegExp(`${name}=(.*)`));
  return match ? match[1].trim() : null;
};

const supabaseUrl = getEnvVar('NEXT_PUBLIC_SUPABASE_URL');
const serviceRoleKey = getEnvVar('SUPABASE_SERVICE_ROLE_KEY');

const supabase = createClient(supabaseUrl, serviceRoleKey);

async function run() {
  console.log("Fetching customers from public.customers...");
  const { data: customers, error: custErr } = await supabase.from('customers').select('*');
  if (custErr) {
    console.error("Failed to fetch customers:", custErr);
  } else {
    console.log("Customers in public.customers:");
    console.log(customers);
  }

  console.log("\nFetching users from auth.users...");
  const { data: { users }, error: authErr } = await supabase.auth.admin.listUsers();
  if (authErr) {
    console.error("Failed to fetch auth users:", authErr);
  } else {
    console.log("Auth Users in Supabase:");
    console.log(users.map(u => ({ id: u.id, email: u.email, metadata: u.user_metadata })));
  }
}

run();
