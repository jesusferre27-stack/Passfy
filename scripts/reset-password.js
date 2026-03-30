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

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: { autoRefreshToken: false, persistSession: false }
});

async function run() {
  const emailToReset = 'jesusferre27@gmail.com';
  const newPassword = 'Password123!';
  console.log(`Buscando usuario ${emailToReset}...`);
  
  const { data: users, error } = await supabase.auth.admin.listUsers();
  if (error) {
    console.error('Error listando usuarios:', error);
    return;
  }
  
  const user = users.users.find(u => u.email === emailToReset);
  if (user) {
    const { data, error: updateError } = await supabase.auth.admin.updateUserById(user.id, {
      password: newPassword,
      email_confirm: true // Aseguramos que siga confirmado
    });
    
    if (updateError) {
      console.error('Error restableciendo contraseña:', updateError);
    } else {
      console.log('¡Éxito! La contraseña ha sido restablecida forzadamente.');
      console.log(`Tu correo: ${emailToReset}`);
      console.log(`Tu nueva contraseña: ${newPassword}`);
    }
  } else {
    console.log('No se encontró a ningún usuario con ese correo.');
  }
}

run();
