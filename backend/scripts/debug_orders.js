const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

const envContent = fs.readFileSync(path.join(__dirname, '../../frontend/.env.local'), 'utf-8');
const getEnvVar = (name) => {
  const match = envContent.match(new RegExp(`${name}=(.*)`));
  return match ? match[1].trim() : null;
};

const supabaseUrl = getEnvVar('NEXT_PUBLIC_SUPABASE_URL');
const serviceRoleKey = getEnvVar('SUPABASE_SERVICE_ROLE_KEY');

const supabase = createClient(supabaseUrl, serviceRoleKey);

async function run() {
  console.log("Fetching all orders...");
  const { data: orders, error } = await supabase.from('orders').select('*');
  if (error) {
    console.error("Error fetching orders:", error);
  } else {
    console.log("Orders count:", orders.length);
    console.log(orders.map(o => ({ order_id: o.order_id, customer_id: o.customer_id, status: o.status })));
  }
}

run();
