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

// Read schema.sql
const schemaPath = path.join(__dirname, '../database/schema.sql');
const sql = fs.readFileSync(schemaPath, 'utf-8');

console.log("Connecting to Supabase PostgreSQL database...");
const client = new Client({
  connectionString,
  ssl: {
    rejectUnauthorized: false
  }
});

client.connect()
  .then(() => {
    console.log("Connected successfully. Running migration script...");
    return client.query(sql);
  })
  .then(() => {
    console.log("Migration executed successfully!");
    console.log("Tables, indexes, RLS policies, and seed data created successfully.");
  })
  .catch((err) => {
    console.error("Migration failed with error:", err);
  })
  .finally(() => {
    client.end();
  });
