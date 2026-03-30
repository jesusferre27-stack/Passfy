const bcrypt = require('bcryptjs');
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

const envLocal = fs.readFileSync(path.join(__dirname, '../.env.local'), 'utf-8');
let supabaseUrl = '';
let supabaseKey = '';
envLocal.split('\n').forEach(line => {
  if (line.startsWith('NEXT_PUBLIC_SUPABASE_URL=')) supabaseUrl = line.split('=')[1].trim();
  if (line.startsWith('SUPABASE_SERVICE_ROLE_KEY=')) supabaseKey = line.split('=')[1].trim();
});

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing SUPABASE env vars.");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
  const { data: merchants, error } = await supabase.from('merchants').select('id, pin');
  
  if (error) {
    console.error('Error fetching merchants:', error);
    return;
  }

  let updated = 0;
  for (const m of merchants) {
    if (m.pin && !m.pin.startsWith('$2')) {
      const hashed = await bcrypt.hash(m.pin, 10);
      await supabase.from('merchants').update({ pin: hashed }).eq('id', m.id);
      console.log(`Hashed PIN for merchant ${m.id}`);
      updated++;
    }
  }
  console.log(`Done! Updated ${updated} merchants' PINs.`);
}

run();
