const fs = require('fs');
const path = require('path');
const { Client } = require('pg');

const regions = [
  'ap-south-1',
  'ap-southeast-1',
  'ap-southeast-2',
  'ap-northeast-1',
  'ap-northeast-2',
  'us-east-1',
  'us-east-2',
  'us-west-1',
  'us-west-2',
  'eu-central-1',
  'eu-west-1',
  'eu-west-2',
  'eu-west-3',
  'ca-central-1',
  'sa-east-1'
];

const projectRef = 'mxllyirrzimhhrghnarp';
const password = 'Shaikshavali';
const sql = fs.readFileSync(path.join(__dirname, '../database/schema.sql'), 'utf-8');

async function testRegions() {
  console.log("Searching for correct Supabase pooler region...");
  for (const region of regions) {
    const host = `aws-0-${region}.pooler.supabase.com`;
    const connectionString = `postgresql://postgres.${projectRef}:${password}@${host}:6543/postgres`;
    
    console.log(`Testing region ${region} (${host})...`);
    const client = new Client({
      connectionString,
      ssl: { rejectUnauthorized: false },
      connectionTimeoutMillis: 5000 // 5 seconds timeout
    });

    try {
      await client.connect();
      console.log(`\nSUCCESS! Connected to pooler region: ${region}`);
      console.log("Running migration query...");
      await client.query(sql);
      console.log("Migration executed successfully!");
      
      // Update .env.local with correct DATABASE_URL
      const envPath = path.join(__dirname, '../../frontend/.env.local');
      let envContent = fs.readFileSync(envPath, 'utf-8');
      envContent = envContent.replace(/DATABASE_URL=.*/, `DATABASE_URL=${connectionString}`);
      fs.writeFileSync(envPath, envContent);
      console.log("Updated .env.local with correct pooler DATABASE_URL.");
      
      await client.end();
      return;
    } catch (err) {
      // If error is tenant not found, it means wrong region. If other error (e.g. timeout), log it.
      if (err.message.includes('tenant/user') && err.message.includes('not found')) {
        // Expected for wrong region
      } else {
        console.log(`Failed with error on ${region}:`, err.message);
      }
    }
  }
  console.log("Error: Checked all pooler regions but could not connect. Check project ref or database password.");
}

testRegions();
