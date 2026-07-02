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

// 2. Initialize Supabase Client
const supabase = createClient(supabaseUrl, serviceRoleKey);

// 3. Image URL updates for products missing images
const updates = [
  {
    name: 'Mechanical Keyboard Pro',
    image_url: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&w=600&q=80'
  },
  {
    name: 'Wireless Gaming Mouse',
    image_url: 'https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?auto=format&fit=crop&w=600&q=80'
  },
  {
    name: 'USB-C Hub Multiport',
    image_url: 'https://images.unsplash.com/photo-1468495244123-6c6c332eeece?auto=format&fit=crop&w=600&q=80'
  },
  {
    name: 'Ergonomic Office Chair',
    image_url: 'https://images.unsplash.com/photo-1505797149-43b0069ec26b?auto=format&fit=crop&w=600&q=80'
  },
  {
    name: 'Noise Cancelling Headphones',
    image_url: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=600&q=80'
  }
];

async function updateProductImages() {
  console.log("Updating product images via Supabase REST API...");

  for (const update of updates) {
    console.log(`Updating image for: "${update.name}"...`);

    const { data, error } = await supabase
      .from('products')
      .update({ image_url: update.image_url })
      .eq('name', update.name)
      .select();

    if (error) {
      console.error(`Failed to update "${update.name}":`, error.message);
    } else if (data && data.length > 0) {
      console.log(`Successfully updated: "${update.name}" with image_url.`);
    } else {
      console.log(`Product "${update.name}" not found in database. Skipping.`);
    }
  }

  console.log("\nProduct images update completed!");
}

updateProductImages();
