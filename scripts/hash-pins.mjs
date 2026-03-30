import bcrypt from 'bcryptjs';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: join(__dirname, '../.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

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
