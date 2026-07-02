const { Client } = require('pg');

const projectRef = 'mxllyirrzimhhrghnarp';
const password = 'Shaikshavali';

const configs = [
  { host: 'aws-0-ap-south-1.pooler.supabase.com', port: 5432, user: `postgres.${projectRef}` },
  { host: 'aws-0-ap-south-1.pooler.supabase.com', port: 5432, user: 'postgres' },
  { host: 'aws-0-ap-south-1.pooler.supabase.com', port: 6543, user: `postgres.${projectRef}` },
  { host: 'aws-0-ap-south-1.pooler.supabase.com', port: 6543, user: 'postgres' },
  
  { host: 'aws-0-ap-southeast-1.pooler.supabase.com', port: 5432, user: `postgres.${projectRef}` },
  { host: 'aws-0-ap-southeast-1.pooler.supabase.com', port: 5432, user: 'postgres' },
  { host: 'aws-0-ap-southeast-1.pooler.supabase.com', port: 6543, user: `postgres.${projectRef}` },
  { host: 'aws-0-ap-southeast-1.pooler.supabase.com', port: 6543, user: 'postgres' }
];

async function run() {
  for (const config of configs) {
    const connectionString = `postgresql://${config.user}:${password}@${config.host}:${config.port}/postgres`;
    console.log(`Testing: host=${config.host}, port=${config.port}, user=${config.user}...`);
    
    const client = new Client({
      connectionString,
      ssl: { rejectUnauthorized: false },
      connectionTimeoutMillis: 5000
    });

    try {
      await client.connect();
      console.log("-> SUCCESS!");
      await client.end();
      return;
    } catch (err) {
      console.log("-> FAILED:", err.message);
    }
  }
}

run();
