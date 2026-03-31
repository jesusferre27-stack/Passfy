import { createAdminClient } from '@/lib/supabase/server'
import { formatMXN } from '@/lib/utils'

export const metadata = { title: 'Usuarios | PASSFY Admin' }

export default async function AdminUsuariosPage() {
  const admin = createAdminClient()

  // Fetch all users with their valid user_passes count
  const { data: usersData, count } = await admin
    .from('users')
    .select(`
      id, created_at, nombre, email, auth_id, 
      user_passes(count)
    `, { count: 'exact' })
    .order('created_at', { ascending: false })
    .limit(100) // Limitamos a 100 para no saturar

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-[#e4e1ed]">Usuarios</h2>
          <p className="text-sm text-[#e4bebc]">{count || 0} cuentas registradas (Mostrando últimos 100)</p>
        </div>
      </div>

      <div className="bg-[#13131b] rounded-2xl border border-[#1e1e28] overflow-hidden">
        {/* Header tabla */}
        <div className="grid grid-cols-1 md:grid-cols-[2fr_2fr_1fr_1fr] gap-4 px-5 py-3 border-b border-[#1e1e28] text-[10px] text-[#e4bebc] font-semibold uppercase tracking-wide">
          <span>Usuario</span>
          <span className="hidden md:block">Email</span>
          <span className="hidden md:block">Fecha de Registro</span>
          <span>Pases Comprados</span>
        </div>

        <div className="divide-y divide-[#1e1e28]">
          {!usersData || usersData.length === 0 ? (
            <div className="p-10 text-center text-[#e4bebc]/50">No hay usuarios registrados.</div>
          ) : usersData.map((user: any) => {
            const dateStr = new Date(user.created_at).toLocaleDateString('es-MX', {
              day: '2-digit', month: 'short', year: 'numeric'
            })
            const passes = user.user_passes?.[0]?.count || 0

            return (
              <div key={user.id} className="grid grid-cols-1 md:grid-cols-[2fr_2fr_1fr_1fr] gap-4 px-5 py-3.5 items-center hover:bg-[#1a1a23] transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-[#30a193]/20 flex items-center justify-center text-[#30a193] font-bold text-sm shrink-0">
                    {(user.nombre || user.email || '?').charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-[#e4e1ed]">{user.nombre || 'Sin nombre'}</p>
                    <p className="text-[10px] text-[#e4bebc] md:hidden">{user.email}</p>
                  </div>
                </div>
                
                <span className="text-xs text-[#e4bebc] hidden md:block">{user.email}</span>
                <span className="text-xs text-[#e4bebc] hidden md:block">{dateStr}</span>
                
                <div className="flex items-center gap-2">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${passes > 0 ? 'bg-[#ff535b]/10 text-[#ff535b]' : 'bg-[#1e1e28] text-[#e4bebc]'}`}>
                    {passes} passes
                  </span>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
