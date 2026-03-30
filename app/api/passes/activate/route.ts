import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { generatePassCode } from '@/lib/utils'
import { generateQR } from '@/lib/qr'
import { sendPassActivationEmail } from '@/lib/mail'

export async function POST(req: Request) {
  try {
    const { passId, passSlug } = await req.json()
    const supabase = await createClient()

    // 1. Verificar autenticación
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    // 2. Obtener datos del pass y sus beneficios
    const { data: pass } = await supabase
      .from('passes')
      .select('*, benefits(*)')
      .eq('id', passId)
      .single()

    if (!pass) {
      return NextResponse.json({ error: 'Pass no encontrado' }, { status: 404 })
    }

    // Opcional: verificar que no lo tenga activo ya
    const { data: existing } = await supabase
      .from('user_passes')
      .select('id')
      .eq('user_id', user.id)
      .eq('pass_id', pass.id)
      .eq('activo', true)
      .single()

    if (existing) {
      return NextResponse.json({ error: 'Ya tienes este pass activo' }, { status: 400 })
    }

    // 3. Generar Código y QR
    const prefix = passSlug.substring(0, 3).toUpperCase()
    const codigoUnico = generatePassCode(prefix)
    const qrB64 = await generateQR(codigoUnico)

    // 4. Crear UserPass
    const { data: userPass, error: insertError } = await supabase
      .from('user_passes')
      .insert({
        user_id: user.id,
        pass_id: passId,
        codigo_unico: codigoUnico,
        qr_url: qrB64,
        mercadopago_payment_id: 'mock_payment_' + Date.now(), // Simulado por ahora
      })
      .select()
      .single()

    if (insertError) throw insertError

    // 5. Crear usos de beneficios (benefit_uses)
    const benefitUsesData = (pass.benefits || []).map((b: any) => ({
      user_pass_id: userPass.id,
      benefit_id: b.id,
      usos_restantes: b.usos_totales
    }))

    if (benefitUsesData.length > 0) {
      const { error: benefitsError } = await supabase
        .from('benefit_uses')
        .insert(benefitUsesData)
      
      if (benefitsError) console.error('Error insertando benefit_uses:', benefitsError)
    }

    // 6. Obtener nombre del usuario para el email
    const { data: profile } = await supabase.from('users').select('nombre, email').eq('id', user.id).single()

    // 7. Enviar Email
    if (profile && process.env.RESEND_API_KEY) {
      await sendPassActivationEmail({
        email: profile.email,
        nombre: profile.nombre || 'Usuario',
        passName: pass.nombre,
        codigoUnico: codigoUnico
      })
    }

    // 8. Trackeo de Afiliados (si existe cookie)
    // Se extraería de request.cookies.get('pf_ref'), buscar el ID en tabla affiliates
    // y crear entrada en affiliate_sales...
    const refCookie = req.headers.get('cookie')?.split(';').find(c => c.trim().startsWith('pf_ref='))
    if (refCookie) {
      const code = refCookie.split('=')[1]
      const { data: affiliate } = await supabase.from('affiliates').select('id, comision_pct').eq('codigo_afiliado', code).single()
      
      if (affiliate) {
        const comisionAgreed = (pass.precio * affiliate.comision_pct) / 100
        await supabase.from('affiliate_sales').insert({
          affiliate_id: affiliate.id,
          user_pass_id: userPass.id,
          monto: pass.precio,
          comision: comisionAgreed
        })
      }
    }

    return NextResponse.json({ success: true, codigo_unico: codigoUnico })

  } catch (error: any) {
    console.error('API Activate Error:', error)
    return NextResponse.json({ error: error.message || 'Error interno' }, { status: 500 })
  }
}
