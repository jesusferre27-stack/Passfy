import { NextResponse } from 'next/server'
import { MercadoPagoConfig, Payment } from 'mercadopago'
import { createClient } from '@/lib/supabase/server'
import { generatePassCode } from '@/lib/utils'
import { generateQR } from '@/lib/qr'
import { sendPassActivationEmail } from '@/lib/mail'

const client = new MercadoPagoConfig({ accessToken: process.env.MP_ACCESS_TOKEN! })

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { passId, passSlug, paymentData } = body
    
    // 1. Verificar autenticación
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    // 2. Obtener info del Pass
    const { data: pass } = await supabase
      .from('passes')
      .select('*, benefits(*)')
      .eq('id', passId)
      .single()

    if (!pass) return NextResponse.json({ error: 'Pass no encontrado' }, { status: 404 })

    // 3. Obtener cookie de afiliado para el metadata
    const refCookie = req.headers.get('cookie')?.split(';').find(c => c.trim().startsWith('affiliate_ref='))
    const affiliateCode = refCookie ? refCookie.split('=')[1] : null

    // 4. Procesar pago en Mercado Pago
    const payment = new MercadoPagoConfig({ accessToken: process.env.MP_ACCESS_TOKEN! })
    const prefPayment = new Payment(client)
    const result = await prefPayment.create({
      body: {
        transaction_amount: pass.precio,
        token: paymentData.token,
        description: `Compra de ${pass.nombre}`,
        installments: paymentData.installments,
        payment_method_id: paymentData.payment_method_id,
        issuer_id: paymentData.issuer_id,
        payer: {
          email: paymentData.payer?.email || user.email,
          identification: paymentData.payer?.identification
        },
        external_reference: `${user.id}_${passId}`,
        metadata: {
          user_id: user.id,
          pass_id: passId,
          affiliate_code: affiliateCode
        }
        // Configurar webhook url si es necesario
      }
    })

    if (result.status !== 'approved') {
      // OXXO/SPEI quedan pending, se manejarán en webhook.
      // Retornamos status pending para que el front muestre mensaje.
      return NextResponse.json({ status: result.status, payment_id: result.id })
    }

    // --- Si fue aprobado (Tarjeta) ---
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
        mercadopago_payment_id: String(result.id),
      })
      .select()
      .single()

    if (insertError) throw insertError

    // 5. Crear usos
    const benefitUsesData = (pass.benefits || []).map((b: any) => ({
      user_pass_id: userPass.id,
      benefit_id: b.id,
      usos_restantes: b.usos_totales
    }))
    if (benefitUsesData.length > 0) {
      await supabase.from('benefit_uses').insert(benefitUsesData)
    }

    // Eliminado bloque obsoleto de Afiliados, movido a webhook.

    // 7. Enviar Mail
    const { data: profile } = await supabase.from('users').select('nombre, email').eq('id', user.id).single()
    if (profile && process.env.RESEND_API_KEY) {
      await sendPassActivationEmail({
        email: profile.email,
        nombre: profile.nombre || 'Usuario',
        passName: pass.nombre,
        codigoUnico: codigoUnico
      })
    }

    return NextResponse.json({ success: true, status: 'approved', codigo_unico: codigoUnico, qr_url: qrB64 })

  } catch (err: any) {
    console.error('API MercadoPago Process Error:', err)
    return NextResponse.json({ error: err.message || 'Error interno' }, { status: 500 })
  }
}
