const fs = require('fs');
const path = require('path');
const { Client } = require('pg');

// Read connection string from .env.local
const envContent = fs.readFileSync(path.join(__dirname, '../../frontend/.env.local'), 'utf-8');
const dbUrlMatch = envContent.match(/DATABASE_URL=(.+)/);
if (!dbUrlMatch) {
  console.error("DATABASE_URL not found in .env.local");
  process.exit(1);
}
const connectionString = dbUrlMatch[1].trim();

const sql = fs.readFileSync(path.join(__dirname, '../database/insert_more_products.sql'), 'utf-8');

const client = new Client({
  connectionString,
  ssl: { rejectUnauthorized: false }
});

client.connect()
  .then(() => {
    console.log("Connected successfully to Supabase direct database node...");
    return client.query(sql);
  })
  .then(() => {
    console.log("Additional storefront products successfully added!");
  })
  .catch(err => {
    console.error("Insert failed:", err);
  })
  .finally(() => {
    client.end();
  });
