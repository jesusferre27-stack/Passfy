export const dynamic = 'force-dynamic'

import { createAdminClient } from '@/lib/supabase/server'
import { formatMXN } from '@/lib/utils'
import PassToggle from './PassToggle'

export const metadata = { title: 'Passes | PASSFY Admin' }

export default async function AdminPassesPage() {
  const admin = createAdminClient()

  const { data: passes } = await admin
    .from('passes')
    .select(`id, nombre, nicho, precio, activo, descripcion, user_passes(count)`)
    .order('nombre')

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-[#e4e1ed]">Passes</h2>
          <p className="text-sm text-[#e4bebc]">{passes?.length || 0} passes en el catálogo</p>
        </div>
      </div>

      <div className="bg-[#13131b] rounded-2xl border border-[#1e1e28] overflow-hidden">
        {/* Header tabla */}
        <div className="hidden md:grid grid-cols-[2fr_1fr_1fr_1fr_80px] gap-4 px-5 py-3 border-b border-[#1e1e28] text-[10px] text-[#e4bebc] font-semibold uppercase tracking-wide">
          <span>Pass</span>
          <span>Nicho</span>
          <span>Precio</span>
          <span>Vendidos</span>
          <span>Estado</span>
        </div>

        <div className="divide-y divide-[#1e1e28]">
          {!passes || passes.length === 0 ? (
            <div className="p-10 text-center text-[#e4bebc]/50">No hay passes registrados.</div>
          ) : passes.map((pass: any) => {
            const vendidos = pass.user_passes?.[0]?.count || 0
            return (
              <div key={pass.id} className="grid grid-cols-1 md:grid-cols-[2fr_1fr_1fr_1fr_80px] gap-4 px-5 py-4 items-center hover:bg-[#1a1a23] transition-colors">
                <div>
                  <p className="text-sm font-semibold text-[#e4e1ed]">{pass.nombre}</p>
                  {pass.descripcion && <p className="text-[10px] text-[#e4bebc] mt-0.5 line-clamp-1">{pass.descripcion}</p>}
                </div>
                <NichoBadge nicho={pass.nicho} />
                <span className="text-sm font-mono text-[#e4e1ed]">{formatMXN(pass.precio || 199)}</span>
                <span className="text-sm text-[#e4bebc] font-medium">{vendidos}</span>
                <PassToggle passId={pass.id} activo={pass.activo} />
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

function NichoBadge({ nicho }: { nicho: string }) {
  const colors: Record<string, string> = {
    cines: 'text-[#ff535b] bg-[#ff535b]/10',
    comida: 'text-[#e7c268] bg-[#e7c268]/10',
    cafe: 'text-[#e7c268] bg-[#e7c268]/10',
    fitness: 'text-[#30a193] bg-[#30a193]/10',
    restaurantes: 'text-[#a78bfa] bg-[#a78bfa]/10',
  }
  const cc = colors[nicho] || 'text-[#e4bebc] bg-[#1e1e28]'
  return (
    <span className={`text-[10px] font-bold uppercase px-2.5 py-1 rounded-full inline-block ${cc}`}>
      {nicho}
    </span>
  )
}
