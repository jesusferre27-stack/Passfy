import { createAdminClient } from '@/lib/supabase/server'
import { formatMXN } from '@/lib/utils'

export const metadata = { title: 'Afiliados | PASSFY Admin' }

export default async function AdminAfiliadosPage() {
  const admin = createAdminClient()

  // Fetch affiliates data with their sales
  const { data: affiliates, count } = await admin
    .from('affiliates')
    .select(`
      id, codigo_afiliado, comision_pct, created_at,
      users:user_id(nombre, email),
      affiliate_sales(monto, comision, pagado)
    `, { count: 'exact' })
    .order('created_at', { ascending: false })

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-[#e4e1ed]">Programa de Afiliados</h2>
          <p className="text-sm text-[#e4bebc]">{count || 0} afiliados activos</p>
        </div>
      </div>

      <div className="bg-[#13131b] rounded-2xl border border-[#1e1e28] overflow-hidden">
        {/* Header tabla */}
        <div className="hidden md:grid grid-cols-[1.5fr_1fr_1fr_1fr_1fr] gap-4 px-5 py-3 border-b border-[#1e1e28] text-[10px] text-[#e4bebc] font-semibold uppercase tracking-wide">
          <span>Usuario / Email</span>
          <span>Código</span>
          <span>Comisión %</span>
          <span>Ventas Totales</span>
          <span>Comisión Pendiente</span>
        </div>

        <div className="divide-y divide-[#1e1e28]">
          {!affiliates || affiliates.length === 0 ? (
            <div className="p-10 text-center text-[#e4bebc]/50">No hay afiliados registrados.</div>
          ) : affiliates.map((aff: any) => {
            const userName = aff.users?.nombre || aff.users?.email || 'Desconocido'
            const numVentas = aff.affiliate_sales?.length || 0
            
            // Calc pending commission
            const pendingSales = (aff.affiliate_sales || []).filter((s:any) => !s.pagado)
            const pendiente = pendingSales.reduce((acc: number, curr: any) => acc + (curr.comision || 0), 0)

            return (
              <div key={aff.id} className="grid grid-cols-1 md:grid-cols-[1.5fr_1fr_1fr_1fr_1fr] gap-4 px-5 py-4 items-center hover:bg-[#1a1a23] transition-colors">
                <div>
                  <p className="text-sm font-semibold text-[#e4e1ed]">{userName}</p>
                </div>
                <span className="text-sm font-mono text-[#30a193]">{aff.codigo_afiliado}</span>
                <span className="text-sm font-bold text-[#e4bebc]">{aff.comision_pct}%</span>
                <span className="text-sm font-medium text-[#e4e1ed]">{numVentas} passes</span>
                
                <div className="flex items-center gap-2">
                  <span className={`text-sm font-mono ${pendiente > 0 ? 'text-[#e7c268]' : 'text-[#e4bebc]'}`}>
                    {formatMXN(pendiente)}
                  </span>
                  {pendiente > 0 && (
                    <button className="text-[9px] uppercase px-2 py-0.5 rounded border border-[#e7c268]/50 text-[#e7c268] hover:bg-[#e7c268]/10 transition-colors ml-auto">
                      Pagar
                    </button>
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
