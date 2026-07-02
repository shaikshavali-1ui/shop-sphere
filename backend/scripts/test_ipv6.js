const { Client } = require('pg');

const connectionString = 'postgresql://postgres:Shaikshavali@[2406:da18:e5c:b700:cf2:35d5:81ac:72f6]:5432/postgres';

async function test() {
  console.log("Attempting direct connection to IPv6 address...");
  const client = new Client({
    connectionString,
    ssl: { rejectUnauthorized: false },
    connectionTimeoutMillis: 10000
  });

  try {
    await client.connect();
    console.log("SUCCESSFULLY CONNECTED via IPv6!");
    await client.end();
  } catch (err) {
    console.log("FAILED to connect via IPv6:", err.message);
  }
}

test();
