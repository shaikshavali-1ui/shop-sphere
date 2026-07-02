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

// 3. New premium products with images
const newProducts = [
  {
    name: 'Curved UltraWide Monitor 34"', 
    price: 499.99, 
    category: 'Electronics', 
    stock: 12, 
    status: 'Active', 
    image_url: 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?auto=format&fit=crop&w=600&q=80'
  },
  {
    name: 'Wireless Charging Dock', 
    price: 39.99, 
    category: 'Electronics', 
    stock: 25, 
    status: 'Active', 
    image_url: 'https://images.unsplash.com/photo-1622445262465-2481c4574875?auto=format&fit=crop&w=600&q=80'
  },
  {
    name: 'Premium Leather Desk Mat', 
    price: 45.00, 
    category: 'Furniture', 
    stock: 15, 
    status: 'Active', 
    image_url: 'https://images.unsplash.com/photo-1585776245991-cf89dd7fc73a?auto=format&fit=crop&w=600&q=80'
  },
  {
    name: 'Minimalist LED Desk Lamp', 
    price: 79.99, 
    category: 'Furniture', 
    stock: 10, 
    status: 'Active', 
    image_url: 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&w=600&q=80'
  },
  {
    name: 'Anodized Aluminum Keycap Set', 
    price: 89.00, 
    category: 'Electronics', 
    stock: 30, 
    status: 'Active', 
    image_url: 'https://images.unsplash.com/photo-1595225476474-87563907a212?auto=format&fit=crop&w=600&q=80'
  },
  {
    name: 'Premium Mechanical Keyboard',
    price: 189.99,
    category: 'Electronics',
    stock: 15,
    status: 'Active',
    image_url: 'https://images.unsplash.com/photo-1618384887929-16ec33fab9ef?auto=format&fit=crop&w=600&q=80'
  },
  {
    name: 'Ergonomic Wood Monitor Stand',
    price: 69.50,
    category: 'Furniture',
    stock: 20,
    status: 'Active',
    image_url: 'https://images.unsplash.com/photo-1593642632823-8f785ba67e45?auto=format&fit=crop&w=600&q=80'
  },
  {
    name: 'Studio Desk Microphone',
    price: 149.00,
    category: 'Electronics',
    stock: 8,
    status: 'Active',
    image_url: 'https://images.unsplash.com/photo-1590608897129-79da98d15969?auto=format&fit=crop&w=600&q=80'
  },
  {
    name: 'Leather Valet Tray',
    price: 29.99,
    category: 'Furniture',
    stock: 30,
    status: 'Active',
    image_url: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=600&q=80'
  },
  {
    name: 'Noise-Cancelling Earbuds',
    price: 129.99,
    category: 'Electronics',
    stock: 22,
    status: 'Active',
    image_url: 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?auto=format&fit=crop&w=600&q=80'
  }
];

async function insertProducts() {
  console.log("Inserting products via Supabase REST API (excluding rating column to handle cache)...");

  for (const product of newProducts) {
    console.log(`Inserting: ${product.name}...`);
    
    // Check if product with the same name already exists
    const { data: existing, error: checkError } = await supabase
      .from('products')
      .select('product_id')
      .eq('name', product.name)
      .maybeSingle();

    if (checkError) {
      console.error(`Error checking product existence for ${product.name}:`, checkError.message);
      continue;
    }

    if (existing) {
      console.log(`Product "${product.name}" already exists. Skipping.`);
      continue;
    }

    // Insert new product
    const { data, error } = await supabase
      .from('products')
      .insert(product)
      .select();

    if (error) {
      console.error(`Failed to insert ${product.name}:`, error.message);
    } else {
      console.log(`Successfully inserted: ${product.name}`);
    }
  }

  console.log("\nProduct catalog insertion completed!");
}

insertProducts();
