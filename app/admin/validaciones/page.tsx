import { createAdminClient } from '@/lib/supabase/server'
import { Clock } from 'lucide-react'

export const metadata = { title: 'Validaciones | PASSFY Admin' }

export default async function AdminValidacionesPage() {
  const admin = createAdminClient()

  const { data: validations, count } = await admin
    .from('benefit_uses')
    .select(`
      id, fecha_uso, usos_restantes,
      benefits:benefit_id(nombre),
      merchants:comercio_id(nombre, nicho, ciudad),
      user_passes:user_pass_id(users:user_id(nombre, email))
    `, { count: 'exact' })
    .not('fecha_uso', 'is', null)
    .order('fecha_uso', { ascending: false })
    .limit(100)

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-[#e4e1ed]">Historial de Validaciones</h2>
          <p className="text-sm text-[#e4bebc]">{count || 0} beneficios canjeados (Últimos 100)</p>
        </div>
      </div>

      <div className="bg-[#13131b] rounded-2xl border border-[#1e1e28] overflow-hidden">
        {/* Header tabla */}
        <div className="hidden md:grid grid-cols-[1.5fr_1.5fr_1fr_1fr_1fr] gap-4 px-5 py-3 border-b border-[#1e1e28] text-[10px] text-[#e4bebc] font-semibold uppercase tracking-wide">
          <span>Usuario</span>
          <span>Beneficio</span>
          <span>Comercio / Ubicación</span>
          <span>Fecha y Hora</span>
          <span>Usos Restantes</span>
        </div>

        <div className="divide-y divide-[#1e1e28]">
          {!validations || validations.length === 0 ? (
            <div className="p-10 text-center text-[#e4bebc]/50">No hay validaciones registradas.</div>
          ) : validations.map((val: any) => {
            const dateStr = new Date(val.fecha_uso).toLocaleString('es-MX', {
              day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute:'2-digit'
            })
            // Extract deeply nested data safely
            const userInfo = val.user_passes?.users
            const userName = userInfo?.nombre || userInfo?.email || 'Usuario Desconocido'
            const benName = val.benefits?.nombre || 'Desconocido'
            const merch = val.merchants
            const merchName = merch?.nombre || 'Comercio Eliminado'
            const merchCity = merch?.ciudad || ''

            return (
              <div key={val.id} className="grid grid-cols-1 md:grid-cols-[1.5fr_1.5fr_1fr_1fr_1fr] gap-4 px-5 py-4 items-center hover:bg-[#1a1a23] transition-colors">
                
                {/* Mobile View */}
                <div className="md:hidden">
                  <p className="text-sm font-semibold text-[#e4e1ed]">{userName}</p>
                  <p className="text-[10px] text-[#e7c268]">{benName} @ {merchName}</p>
                </div>

                {/* Desktop View */}
                <span className="text-xs font-semibold text-[#e4e1ed] hidden md:block">{userName}</span>
                <span className="text-xs font-medium text-[#e7c268] hidden md:block">{benName}</span>
                
                <div className="hidden md:block">
                  <p className="text-xs text-[#e4e1ed]">{merchName}</p>
                  {merchCity && <p className="text-[9px] text-[#e4bebc] uppercase">{merchCity}</p>}
                </div>
                
                <div className="flex items-center gap-1.5 hidden md:flex text-[#e4bebc] text-[10px]">
                  <Clock size={12} />
                  <span>{dateStr}</span>
                </div>
                
                <span className="text-xs font-mono text-[#30a193]">{val.usos_restantes}</span>
                
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
