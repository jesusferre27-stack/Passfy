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
      .select('id, codigo_afiliado')
      .eq('user_id', user.id)
      .single()

    if (!affiliate) {
      return NextResponse.json({ error: 'Usuario no es afiliado' }, { status: 404 })
    }

    // Obtener TODAS las ventas del afiliado para calcular
    const { data: sales, error } = await supabaseAdmin
      .from('affiliate_sales')
      .select('fecha, comision, pagado')
      .eq('affiliate_id', affiliate.id)

    if (error) throw error

    let ventas_mes = 0
    let comision_pendiente = 0
    let total_ganado = 0

    const now = new Date()
    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)

    // Arreglo base para gráfica de 4 semanas
    // Calculamos los rangos desde la fecha actual para atrás (4 semanas)
    const ventas_semanales = [
      { name: 'Sem 1', ventas: 0 },
      { name: 'Sem 2', ventas: 0 },
      { name: 'Sem 3', ventas: 0 },
      { name: 'Sem 4', ventas: 0 }
    ]

    const oneWeekMs = 7 * 24 * 60 * 60 * 1000

    sales?.forEach((sale: any) => {
      const saleDate = new Date(sale.fecha)

      // Ventas este mes
      if (saleDate >= firstDayOfMonth) {
        ventas_mes++
      }

      // Comisiones pendientes y pagadas
      if (!sale.pagado) {
        comision_pendiente += sale.comision
      } else {
        total_ganado += sale.comision
      }

      // Agrupar por semanas en los últimos 28 días
      const diffTime = now.getTime() - saleDate.getTime()
      if (diffTime >= 0 && diffTime < oneWeekMs) {
        ventas_semanales[3].ventas++ // Semana 4 (actual, más reciente)
      } else if (diffTime >= oneWeekMs && diffTime < oneWeekMs * 2) {
         ventas_semanales[2].ventas++ // Semana 3
      } else if (diffTime >= oneWeekMs * 2 && diffTime < oneWeekMs * 3) {
         ventas_semanales[1].ventas++ // Semana 2
      } else if (diffTime >= oneWeekMs * 3 && diffTime < oneWeekMs * 4) {
         ventas_semanales[0].ventas++ // Semana 1 (hace 4 semanas)
      }
    })

    return NextResponse.json({
      codigo_afiliado: affiliate.codigo_afiliado,
      ventas_mes,
      comision_pendiente,
      total_ganado,
      ventas_semanales
    })

  } catch (err: any) {
    console.error('Affiliate Stats Error:', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
