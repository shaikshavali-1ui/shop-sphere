const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

const envPath = path.join(__dirname, '../../frontend/.env.local');
const envContent = fs.readFileSync(envPath, 'utf-8');

const getEnvVar = (name) => {
  const match = envContent.match(new RegExp(`${name}=(.*)`));
  return match ? match[1].trim() : null;
};

const supabaseUrl = getEnvVar('NEXT_PUBLIC_SUPABASE_URL');
const serviceRoleKey = getEnvVar('SUPABASE_SERVICE_ROLE_KEY');

const supabase = createClient(supabaseUrl, serviceRoleKey);

async function run() {
  const email = 'admin1@shopsphere.com';
  const password = 'admin123';
  const name = 'Admin One';
  const role = 'admin';

  console.log(`Checking/Creating user ${email}...`);
  
  const { data: { users }, error: listError } = await supabase.auth.admin.listUsers();
  if (listError) {
    console.error("Error listing users:", listError.message);
    process.exit(1);
  }

  const existing = users.find(u => u.email === email);
  if (existing) {
    console.log(`User ${email} already exists. Re-setting password to 'admin123'...`);
    const { error: resetErr } = await supabase.auth.admin.updateUserById(existing.id, {
      password: password,
      user_metadata: { role, name }
    });
    if (resetErr) console.error("Reset failed:", resetErr.message);
    else console.log("Password reset successfully.");
    return;
  }

  const { data, error } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: {
      role,
      name
    }
  });

  if (error) {
    console.error("Error creating user:", error.message);
  } else {
    console.log("User created successfully ID:", data.user.id);
  }
}

run();
