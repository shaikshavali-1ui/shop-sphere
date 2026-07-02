const fs = require('fs');
const path = require('path');
const { Client } = require('pg');

const envContent = fs.readFileSync(path.join(__dirname, '../../frontend/.env.local'), 'utf-8');
const dbUrlMatch = envContent.match(/DATABASE_URL=(.+)/);
if (!dbUrlMatch) {
  console.error("DATABASE_URL not found");
  process.exit(1);
}
const connectionString = dbUrlMatch[1].trim();

const sql = fs.readFileSync(path.join(__dirname, '../database/rls_policies.sql'), 'utf-8');

const client = new Client({
  connectionString,
  ssl: { rejectUnauthorized: false }
});

client.connect()
  .then(() => {
    console.log("Applying RLS policies to Supabase...");
    return client.query(sql);
  })
  .then(() => {
    console.log("RLS policies applied successfully!");
  })
  .catch(err => {
    console.error("RLS application failed:", err);
  })
  .finally(() => {
    client.end();
  });
