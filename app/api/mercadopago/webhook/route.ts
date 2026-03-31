import { NextResponse } from 'next/server'
import crypto from 'crypto'
import { MercadoPagoConfig, Payment } from 'mercadopago'
import { createClient } from '@/lib/supabase/server'
import { generatePassCode } from '@/lib/utils'
import { generateQR } from '@/lib/qr'
import { sendPassActivationEmail } from '@/lib/mail'

export async function POST(req: Request) {
  try {
    const body = await req.json()
    // const url = new URL(req.url)
    
    // Aquí iría la lógica de verificación HMAC provista por MP
    const xSignature = req.headers.get('x-signature')
    const xRequestId = req.headers.get('x-request-id')

    if (!xSignature || !xRequestId) {
      return NextResponse.json({ error: 'Missing headers' }, { status: 401 })
    }

    if (body.type === 'payment') {
      const paymentId = body.data.id
      
      const parts = xSignature.split(',')
      let ts = '';
      let hash = '';
      parts.forEach(part => {
        const [key, value] = part.split('=')
        if (key && key.trim() === 'ts') ts = value
        if (key && key.trim() === 'v1') hash = value
      });

      const secret = process.env.MP_WEBHOOK_SECRET || ''
      if (secret) {
        const manifest = `id:${paymentId};request-id:${xRequestId};ts:${ts};`
        const hmac = crypto.createHmac('sha256', secret)
        const digest = hmac.update(manifest).digest('hex')
        
        if (digest !== hash) {
          return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
        }
      }

      console.log(`[Webhook] Notificación de pago recibida: MP_ID=${paymentId}`)

      // Inicializar cliente
      const client = new MercadoPagoConfig({ accessToken: process.env.MP_ACCESS_TOKEN! })
      const payment = new Payment(client)
      const paymentInfo = await payment.get({ id: paymentId })

      // Verificar en BD si la orden existe y marcarla como PAGADA
      if (paymentInfo.status === 'approved') {
        const supabase = await createClient()
        
        // Buscar si ya tenemos ese payment_id en user_passes
        const { data: userPass } = await supabase
          .from('user_passes')
          .select('*, passes(*, benefits(*))')
          .eq('mercadopago_payment_id', String(paymentId))
          .single()

        // Si existe y no está activo, activarlo
        if (userPass && !userPass.activo) {
          await supabase.from('user_passes').update({ activo: true }).eq('id', userPass.id)

          // Si es OXXO/SPEI, mandarle su correo de confirmación
          const { data: profile } = await supabase.from('users').select('nombre, email').eq('id', userPass.user_id).single()
          if (profile && process.env.RESEND_API_KEY) {
            await sendPassActivationEmail({
              email: profile.email,
              nombre: profile.nombre || 'Usuario',
              passName: userPass.passes.nombre,
              codigoUnico: userPass.codigo_unico
            })
          }
        }
        
        // Tracking de afiliado via webhook metadata
        if (paymentInfo.metadata && paymentInfo.metadata.affiliate_code) {
           const code = paymentInfo.metadata.affiliate_code;
           if (code) {
             const { data: affiliate } = await supabase.from('affiliates').select('id, comision_pct').eq('codigo_afiliado', code).single();
             if (affiliate && userPass) {
                const { count } = await supabase.from('affiliate_sales').select('*', { count: 'exact', head: true }).eq('user_pass_id', userPass.id);
                if (count === 0) {
                   const monto = userPass.passes?.precio || 199;
                   const comision = (monto * affiliate.comision_pct) / 100;
                   await supabase.from('affiliate_sales').insert({
                     affiliate_id: affiliate.id,
                     user_pass_id: userPass.id,
                     monto: monto,
                     comision: comision,
                     pagado: false
                   });
                }
             }
           }
        }
      }
    }

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Webhook Error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
