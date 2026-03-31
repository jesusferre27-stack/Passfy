import { NextResponse } from 'next/server'
import { createClient, createAdminClient } from '@/lib/supabase/server'

export async function GET(req: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const supabaseAdmin = createAdminClient()

    // Buscar afiliado (bypass RLS)
    const { data: affiliate } = await supabaseAdmin
      .from('affiliates')
      .select('id')
      .eq('user_id', user.id)
      .single()

    if (!affiliate) {
      return NextResponse.json({ error: 'Usuario no es afiliado' }, { status: 404 })
    }

    // Obtener últimas 20 ventas (bypass RLS)
    const { data: sales, error } = await supabaseAdmin
      .from('affiliate_sales')
      .select(`
        id, 
        created_at, 
        monto, 
        comision, 
        pagado,
        user_passes (
          passes (
            nombre
          )
        )
      `)
      .eq('affiliate_id', affiliate.id)
      .order('created_at', { ascending: false })
      .limit(20)

    if (error) throw error

    // Formatear respuesta
    const formattedSales = sales?.map(sale => {
      // Intentar extraer el nombre del pass si la relación existe en Supabase
      // Si el tipado de Supabase no resuelve user_passes.passes, mostramos genérico
      const passData = (sale as any).user_passes?.passes
      
      return {
        id: sale.id,
        fecha: sale.created_at,
        monto: sale.comision, // Mostramos la comisión que se lleva, o el monto pagado
        pagado: sale.pagado,
        pass_nombre: passData?.nombre || 'Beneficio Passfy'
      }
    })

    return NextResponse.json({ sales: formattedSales })

  } catch (err: any) {
    console.error('Affiliate Sales Error:', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
