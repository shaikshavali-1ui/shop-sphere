const { Client } = require('pg');

const regions = [
  'ap-south-1',
  'ap-southeast-1',
  'us-east-1',
  'eu-central-1',
  'us-west-1'
];

async function scan() {
  for (const region of regions) {
    const host = `aws-0-${region}.pooler.supabase.com`;
    console.log(`Testing connection to region ${region} (${host})...`);
    const client = new Client({
      host,
      port: 6543,
      user: 'postgres.mxllyirrzimhhrghnarp',
      password: 'Shaikshavali',
      database: 'postgres',
      ssl: { rejectUnauthorized: false },
      connectionTimeoutMillis: 4000
    });

    try {
      await client.connect();
      console.log(`\n🎉 SUCCESS! Connected successfully to region: ${region}!\n`);
      await client.end();
      return;
    } catch (err) {
      console.log(`-> Failed for ${region}: ${err.message}`);
    }
  }
  console.log("\n❌ All pooler regions failed.\n");
}

scan();
