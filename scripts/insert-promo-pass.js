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

async function insertPromo() {
  console.log("Insertando nuevo Pass...");
  const { data: pass, error: passErr } = await supabase.from('passes').insert({
    nombre: 'PromoPass Mensual',
    slug: 'promopass',
    nicho: 'comida',
    precio: 59.00,
    descripcion: 'Pase especial mensual: Disfruta de cupones y descuentos exclusivos todos los días para probar todo el catálogo.',
    color_brand: '#8A2BE2',
    color_brand_end: '#DDA0DD'
  }).select('*').single();

  if (passErr) {
    if (passErr.code === '23505') {
       console.log('El PromoPass ya existía.');
       return;
    }
    console.error('Error insertando pass:', passErr);
    return;
  }

  console.log('Pass creado con éxito ID:', pass.id);

  const { error: benErr } = await supabase.from('benefits').insert([
    { pass_id: pass.id, descripcion: 'Postre gratis en tus comidas (1 al día)', usos_totales: 30, tipo: 'gratis', icono: '🍰' },
    { pass_id: pass.id, descripcion: '15% de descuento en ticket final', usos_totales: 15, tipo: 'descuento', icono: '🎟️' },
    { pass_id: pass.id, descripcion: 'Bebida de cortesía al comprar platillo', usos_totales: 30, tipo: 'gratis', icono: '🥤' }
  ]);

  if (benErr) {
    console.error('Error insertando beneficios:', benErr);
  } else {
    console.log('Beneficios insertados correctamente.');
  }
}

insertPromo();
