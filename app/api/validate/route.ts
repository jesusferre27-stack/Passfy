import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import bcrypt from 'bcryptjs'

// GET /api/validate?code=XYZ - Obtiene los datos del código a validar
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const code = searchParams.get('code')
    if (!code) return NextResponse.json({ error: 'Código requerido' }, { status: 400 })

    const supabase = await createClient()

    // Opcional: Validar que el usuario que consulta es un Merchant autorizado
    // const { data: { user } } = await supabase.auth.getUser()
    // if (!user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

    const { data: userPass, error } = await supabase
      .from('user_passes')
      .select(`
        id, codigo_unico, activo,
        passes (
          id, nombre,
          benefits (*)
        ),
        benefit_uses (*)
      `)
      .eq('codigo_unico', code)
      .single()

    if (error || !userPass) {
      return NextResponse.json({ error: 'Código no encontrado o inválido' }, { status: 404 })
    }

    if (!userPass.activo) {
      return NextResponse.json({ error: 'Este Pass se encuentra inactivo' }, { status: 400 })
    }

    return NextResponse.json({ userPass })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

  // POST /api/validate - Registra el canje (reduce uso)
export async function POST(req: Request) {
  try {
    const { benefitUseId, code, pin } = await req.json()
    if (!benefitUseId || !code || !pin) {
      return NextResponse.json({ error: 'Datos incompletos o PIN faltante' }, { status: 400 })
    }

    const supabase = await createClient()

    // 1. Validar que exista y pertenezca al código
    const { data: benefitUse } = await supabase
      .from('benefit_uses')
      .select(`
        *,
        user_passes (codigo_unico, activo, pass_id)
      `)
      .eq('id', benefitUseId)
      .single()

    if (!benefitUse || benefitUse.user_passes.codigo_unico !== code) {
      return NextResponse.json({ error: 'Beneficio no pertenece al código enviado' }, { status: 400 })
    }

    if (!benefitUse.user_passes.activo) {
      return NextResponse.json({ error: 'Pass inactivo' }, { status: 400 })
    }

    // 1.5 Obtener Nicho del Pass y Validar PIN
    const { data: passData } = await supabase.from('passes').select('nicho').eq('id', benefitUse.user_passes.pass_id).single()
    if (!passData) return NextResponse.json({ error: 'Pass metadata not found' }, { status: 404 })

    const { data: merchants } = await supabase.from('merchants').select('id, pin, nombre').eq('nicho', passData.nicho).eq('activo', true)
    
    let validMerchantId = null
    let validMerchantName = null
    if (merchants) {
      for (const m of merchants) {
        // En un entorno de producción, los PINs ya estarán hasheados. 
        // Como parche retrocompatible, si el PIN en la BD no empieza con $2 (formato bcrypt) hacemos match directo
        if (m.pin?.startsWith('$2')) {
          const isMatch = await bcrypt.compare(pin, m.pin)
          if (isMatch) { validMerchantId = m.id; validMerchantName = m.nombre; break; }
        } else {
          // Fallback temporal si no están hasheados en la BD todavía
          if (pin === m.pin) { validMerchantId = m.id; validMerchantName = m.nombre; break; }
        }
      }
    }

    if (!validMerchantId) {
      return NextResponse.json({ error: 'PIN de comercio incorrecto o comercio inactivo' }, { status: 401 })
    }

    // 2. Revisar saldo de usos (si no es ilimitado = 999)
    // Para simplificar, obtenemos usos_totales del benefit_id
    const { data: benData } = await supabase.from('benefits').select('usos_totales').eq('id', benefitUse.benefit_id).single()
    const isUnlimited = benData?.usos_totales === 999

    if (!isUnlimited && benefitUse.usos_restantes <= 0) {
      return NextResponse.json({ error: 'Beneficio agotado' }, { status: 400 })
    }

    // 3. Registrar el uso (restar 1 si no es ilimitado)
    if (!isUnlimited) {
      const { error: updateError } = await supabase
        .from('benefit_uses')
        .update({ 
          usos_restantes: benefitUse.usos_restantes - 1,
          comercio_id: validMerchantId,
          validado_por: validMerchantName,
          fecha_uso: new Date().toISOString()
        })
        .eq('id', benefitUseId)
        
      if (updateError) throw updateError
    } else {
      // Registrar el uso en ilimitado de todas formas para tracking
      await supabase
        .from('benefit_uses')
        .update({ 
          comercio_id: validMerchantId,
          validado_por: validMerchantName,
          fecha_uso: new Date().toISOString()
        })
        .eq('id', benefitUseId)
    }

    return NextResponse.json({ success: true })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
