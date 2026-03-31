import { createAdminClient } from '@/lib/supabase/server'
import { formatMXN } from '@/lib/utils'

export const metadata = { title: 'Ventas | PASSFY Admin' }

export default async function AdminVentasPage() {
  const admin = createAdminClient()

  // Fetch all user_passes (sales) with user and pass info
  const { data: sales, count } = await admin
    .from('user_passes')
    .select(`
      id, fecha_compra, activo, mercadopago_payment_id,
      users:user_id(nombre, email),
      passes:pass_id(nombre, precio)
    `, { count: 'exact' })
    .order('fecha_compra', { ascending: false })
    .limit(100)

  // Calculate total revenue from these sales for the top bar
  const totalRevenue = sales?.reduce((acc: number, curr: any) => acc + (curr.passes?.precio || 0), 0) || 0

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-[#e4e1ed]">Historial de Ventas</h2>
          <p className="text-sm text-[#e4bebc]">{count || 0} compras totales</p>
        </div>
      </div>

      <div className="bg-[#13131b] rounded-2xl border border-[#1e1e28] overflow-hidden">
        {/* Header tabla */}
        <div className="grid grid-cols-1 md:grid-cols-[2fr_2fr_1fr_1fr_1fr] gap-4 px-5 py-3 border-b border-[#1e1e28] text-[10px] text-[#e4bebc] font-semibold uppercase tracking-wide">
          <span>Usuario</span>
          <span className="hidden md:block">Pass Comprado</span>
          <span className="hidden md:block">Fecha</span>
          <span>Monto</span>
          <span>Estado MP</span>
        </div>

        <div className="divide-y divide-[#1e1e28]">
          {!sales || sales.length === 0 ? (
            <div className="p-10 text-center text-[#e4bebc]/50">No hay ventas registradas.</div>
          ) : sales.map((sale: any) => {
            const dateStr = new Date(sale.fecha_compra).toLocaleString('es-MX', {
              day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute:'2-digit'
            })
            const userName = sale.users?.nombre || sale.users?.email || 'Usuario Anónimo'
            const passName = sale.passes?.nombre || 'Pass Desconocido'
            const precio = sale.passes?.precio || 199

            return (
              <div key={sale.id} className="grid grid-cols-1 md:grid-cols-[2fr_2fr_1fr_1fr_1fr] gap-4 px-5 py-4 items-center hover:bg-[#1a1a23] transition-colors">
                
                {/* Mobile View: show user + pass info together */}
                <div className="md:hidden">
                  <p className="text-sm font-semibold text-[#e4e1ed]">{userName}</p>
                  <p className="text-[10px] text-[#ff535b]">{passName}</p>
                  <p className="text-[10px] text-[#e4bebc] mt-1">{dateStr}</p>
                </div>

                {/* Desktop View */}
                <span className="text-xs font-medium text-[#e4e1ed] hidden md:block">{userName}</span>
                <span className="text-xs font-bold text-[#ff535b] hidden md:block">{passName}</span>
                <span className="text-[10px] text-[#e4bebc] hidden md:block">{dateStr}</span>
                
                <span className="text-sm font-mono text-[#30a193]">{formatMXN(precio)}</span>
                
                <div className="flex items-center gap-2">
                  <span className={`text-[9px] font-bold uppercase px-2 py-0.5 rounded-full ${sale.activo ? 'bg-[#30a193]/10 text-[#30a193]' : 'bg-red-500/10 text-red-500'}`}>
                    {sale.activo ? 'Aprovado' : 'Pendiente'}
                  </span>
                  {sale.mercadopago_payment_id && (
                    <span className="text-[8px] text-[#e4bebc] truncate max-w-[80px]" title={sale.mercadopago_payment_id}>
                      #{sale.mercadopago_payment_id}
                    </span>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
