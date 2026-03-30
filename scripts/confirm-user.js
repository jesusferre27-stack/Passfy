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
  const emailToConfirm = 'jesusferre27@gmail.com';
  console.log(`Buscando usuario ${emailToConfirm}...`);
  
  const { data: users, error } = await supabase.auth.admin.listUsers();
  if (error) {
    console.error('Error listando usuarios:', error);
    return;
  }
  
  const user = users.users.find(u => u.email === emailToConfirm);
  if (user) {
    const { data, error: updateError } = await supabase.auth.admin.updateUserById(user.id, {
      email_confirm: true
    });
    if (updateError) {
      console.error('Error confirmando el email:', updateError);
    } else {
      console.log('¡Éxito! El email ha sido confirmado forzadamente en la base de datos.');
      console.log('El usuario ya puede iniciar sesión con su contraseña.');
    }
  } else {
    console.log('No se encontró a ningún usuario con ese correo.');
  }
}

run();
