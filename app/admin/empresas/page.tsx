import { createAdminClient } from '@/lib/supabase/server'
import { PlusCircle, Search } from 'lucide-react'

export const metadata = { title: 'Empresas | PASSFY Admin' }

export default async function AdminEmpresasPage() {
  const admin = createAdminClient()

  const { data: merchants, count } = await admin
    .from('merchants')
    .select('*', { count: 'exact' })
    .order('nombre')

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-[#e4e1ed]">Empresas y Comercios</h2>
          <p className="text-sm text-[#e4bebc]">{count || 0} aliados registrados</p>
        </div>
        <button className="flex items-center gap-2 bg-[#30a193] hover:bg-[#288a7e] text-white px-4 py-2 rounded-xl text-sm font-semibold transition-colors">
          <PlusCircle size={16} />
          Nueva Empresa
        </button>
      </div>

      <div className="bg-[#13131b] rounded-2xl border border-[#1e1e28] overflow-hidden">
        {/* Header tabla */}
        <div className="hidden md:grid grid-cols-[2fr_1fr_1.5fr_1fr_80px] gap-4 px-5 py-3 border-b border-[#1e1e28] text-[10px] text-[#e4bebc] font-semibold uppercase tracking-wide">
          <span>Nombre</span>
          <span>Nicho</span>
          <span>Dirección</span>
          <span>PIN Verificación</span>
          <span>Activo</span>
        </div>

        <div className="divide-y divide-[#1e1e28]">
          {!merchants || merchants.length === 0 ? (
            <div className="p-10 text-center text-[#e4bebc]/50">No hay empresas registradas.</div>
          ) : merchants.map((merchant: any) => (
            <div key={merchant.id} className="grid grid-cols-1 md:grid-cols-[2fr_1fr_1.5fr_1fr_80px] gap-4 px-5 py-4 items-center hover:bg-[#1a1a23] transition-colors">
              <div>
                <p className="text-sm font-semibold text-[#e4e1ed]">{merchant.nombre}</p>
              </div>
              <span className="text-[10px] font-bold uppercase text-[#e4bebc]">{merchant.nicho}</span>
              <span className="text-xs text-[#e4bebc] line-clamp-1">{merchant.direccion || 'No especificada'}</span>
              <div className="flex items-center gap-2">
                <span className="font-mono text-sm tracking-widest text-[#e4e1ed] bg-[#1e1e28] px-2 py-0.5 rounded">
                  {merchant.pin ? '••••' : 'N/A'} {/* Por seguridad no lo mostramos crudo si está encriptado, pero como demo: */}
                </span>
                {merchant.pin && !merchant.pin.startsWith('$2') && (
                  <span className="text-[10px] text-red-400" title="PIN expuesto sin hash">⚠️</span>
                )}
              </div>
              <div className={`w-2 h-2 rounded-full ${merchant.activo ? 'bg-[#30a193]' : 'bg-red-500/40'}`} />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
