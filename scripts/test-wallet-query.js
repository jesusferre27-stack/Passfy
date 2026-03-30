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

const supabase = createClient(supabaseUrl, supabaseKey);

async function testQuery() {
  const { data: users } = await supabase.auth.admin.listUsers();
  const user = users.users.find(u => u.email === 'jesusferre27@gmail.com');
  console.log("User ID:", user.id);

  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || envLocal.split('\n').find(l => l.startsWith('NEXT_PUBLIC_SUPABASE_ANON_KEY=')).split('=')[1].trim();
  const userClient = createClient(supabaseUrl, anonKey);
  
  const { data: authData, error: authErr } = await userClient.auth.signInWithPassword({
    email: 'jesusferre27@gmail.com',
    password: 'Password123!'
  });

  if (authErr) {
    console.error("Auth error:", authErr);
    return;
  }

  const { data: userPasses, error } = await userClient
    .from('user_passes')
    .select(`
      id, activo, codigo_unico, created_at,
      passes (
        id, nombre, descripcion, color_brand, color_brand_end,
        benefits (id)
      )
    `)
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  console.log("Query Error:", error);
  console.log("Query Result Length:", userPasses ? userPasses.length : 0);
  console.log("Query Result:", JSON.stringify(userPasses, null, 2));
}

testQuery();
