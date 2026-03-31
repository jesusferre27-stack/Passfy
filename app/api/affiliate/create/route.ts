export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'
import { createClient, createAdminClient } from '@/lib/supabase/server'

export async function POST(req: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const random4 = Math.floor(1000 + Math.random() * 9000);
    const cleanName = (user.user_metadata?.nombre || user.email || 'USER').split(' ')[0].toUpperCase().replace(/[^A-Z]/g, '') || 'USER';
    const newCode = `REF-${cleanName}-${random4}`;

    // Usamos el cliente admin para saltarnos RLS
    const supabaseAdmin = createAdminClient()

    // Crear afiliado, intentar insertar el comision_pct por defecto si la BD lo pide o simplemente dejarlo por default.
    // Usamos el cliente admin o el mismo usuario.
    const { error, data } = await supabaseAdmin.from('affiliates').insert({
      user_id: user.id,
      codigo_afiliado: newCode,
      comision_pct: 15
    }).select().single();

    if (error) {
       console.error("Supabase error insertando afiliado:", error);
       // Forzar fallback: intentamos sin comision_pct si falló por RLS o schema
       const { error: err2, data: data2 } = await supabaseAdmin.from('affiliates').insert({
         user_id: user.id,
         codigo_afiliado: newCode
       }).select().single();
       
       if (err2) {
         return NextResponse.json({ error: err2.message || 'Error al crear cuenta' }, { status: 500 })
       }
       return NextResponse.json({ success: true, affiliate: data2 })
    }

    return NextResponse.json({ success: true, affiliate: data })

  } catch (err: any) {
    console.error('Affiliate Create API Error:', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
