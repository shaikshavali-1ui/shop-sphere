const fs = require('fs');
const path = require('path');
const { Client } = require('pg');

const sql = fs.readFileSync(path.join(__dirname, '../database/add_ratings.sql'), 'utf-8');

const client = new Client({
  host: 'aws-0-ap-south-1.pooler.supabase.com',
  port: 6543,
  user: 'postgres.mxllyirrzimhhrghnarp',
  password: 'Shaikshavali',
  database: 'postgres',
  ssl: { rejectUnauthorized: false }
});

client.connect()
  .then(() => {
    console.log("Connected successfully to Supabase IPv4 Pooler via explicit object credentials...");
    return client.query(sql);
  })
  .then(() => {
    console.log("Product Ratings applied successfully via explicit connection parameters!");
  })
  .catch(err => {
    console.error("Migration failed:", err);
  })
  .finally(() => {
    client.end();
  });
