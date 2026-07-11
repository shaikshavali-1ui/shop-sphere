const fs = require('fs');
const path = require('path');
const { Client } = require('pg');

// Read env variables
const envContent = fs.readFileSync(path.join(__dirname, '../../frontend/.env.local'), 'utf-8');
const dbUrlMatch = envContent.match(/DATABASE_URL=(.+)/);
if (!dbUrlMatch) {
  console.error("Error: DATABASE_URL not found in .env.local");
  process.exit(1);
}
const connectionString = dbUrlMatch[1].trim();

const sql = `
  -- 1. Drop existing selector policies if they exist
  drop policy if exists "Allow select to public on products" on public.products;
  drop policy if exists "Allow public select on products" on public.products;

  -- 2. Create a new policy that grants public SELECT access to all roles (anon and authenticated)
  create policy "Allow select to public on products"
  on public.products
  for select
  to public
  using (true);

  console_log('Public SELECT policy successfully configured on products table.');
`;

// Wait, let's fix the SQL structure to run purely in Postgres (removing JS console_log from SQL string)
const postgresSql = `
  -- 1. Drop existing selector policies if they exist
  drop policy if exists "Allow select to public on products" on public.products;
  drop policy if exists "Allow public select on products" on public.products;

  -- 2. Create a new policy that grants public SELECT access to all roles (anon and authenticated)
  create policy "Allow select to public on products"
  on public.products
  for select
  to public
  using (true);
`;

console.log("Connecting to PostgreSQL database...");
const client = new Client({
  connectionString,
  ssl: {
    rejectUnauthorized: false
  }
});

client.connect()
  .then(() => {
    console.log("Connected successfully. Applying SQL policy update...");
    return client.query(postgresSql);
  })
  .then(() => {
    console.log("RLS policy applied successfully! Everyone can now read the storefront products catalog.");
  })
  .catch((err) => {
    console.error("Failed to apply policy:", err.message);
  })
  .finally(() => {
    client.end();
  });
