export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { nanoid } from 'nanoid' // Usaré una lib externa o simplemente Math.random si no está instalada, pero mejor algo nativo para no instalar más
import crypto from 'crypto'

export async function POST(req: Request) {
  try {
    const supabase = await createClient()

    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.redirect(new URL('/login', req.url))
    }

    // Generar un código alfa numérico único corto
    const uniqueCode = crypto.randomBytes(4).toString('hex').toUpperCase()

    // Comisiones por defecto (ej. 15%)
    const { error: insertError } = await supabase
      .from('affiliates')
      .insert({
        user_id: user.id,
        codigo_afiliado: uniqueCode,
        comision_pct: 15.00
      })

    if (insertError) {
      console.error('Error uniendo a afiliados:', insertError)
      // Puede que ya exista, por UX redirigimos igual
    }

    return NextResponse.redirect(new URL('/afiliados', req.url))

  } catch (error) {
    console.error('API Join Affiliates Error:', error)
    return NextResponse.redirect(new URL('/perfil?error=affiliate_failed', req.url))
  }
}
