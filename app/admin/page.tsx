import { TrendingUp, Users, QrCode, BadgeCheck } from 'lucide-react'
import { createAdminClient } from '@/lib/supabase/server'
import { formatMXN } from '@/lib/utils'
import ValidacionesRealtime from '@/components/admin/ValidacionesRealtime'

export const metadata = { title: 'Dashboard | PASSFY Admin' }

export default async function AdminDashboardPage() {
  const admin = createAdminClient()

  // Inicio del día actual (hora CDMX = UTC-6)
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const todayISO = today.toISOString()

  const [
    { count: usersCount },
    { count: activePassesToday },
    { count: totalSalesCount },
    { count: passesCount },
    { data: passesData },
    { data: validationsData },
  ] = await Promise.all([
    // Usuarios totales
    admin.from('users').select('*', { count: 'exact', head: true }),
    // Passes ACTIVOS comprados HOY
    admin.from('user_passes').select('*', { count: 'exact', head: true })
      .eq('activo', true)
      .gte('fecha_compra', todayISO),
    // Total compras históricas  
    admin.from('user_passes').select('*', { count: 'exact', head: true }),
    // Passes en catálogo activos
    admin.from('passes').select('*', { count: 'exact', head: true }).eq('activo', true),
    // Passes con conteo de ventas
    admin.from('passes').select(`
      id, nombre, nicho, activo,
      user_passes(count)
    `).order('nombre'),
    // Validaciones recientes con comercio
    admin.from('benefit_uses')
      .select('id, fecha_uso, comercio_id, merchants(nombre), benefits(nombre)')
      .not('fecha_uso', 'is', null)
      .order('fecha_uso', { ascending: false })
      .limit(5),
  ])

  const estimatedRevenue = (totalSalesCount || 0) * 199

  // Formatear para ValidacionesRealtime
  const formattedValidations = (validationsData || []).map((v: any) => ({
    id: v.id,
    fecha_uso: v.fecha_uso,
    comercio: v.merchants?.nombre || 'Comercio',
    pass_nombre: v.benefits?.nombre || 'Beneficio',
  }))

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-[#e4e1ed]">Dashboard</h2>
        <p className="text-sm text-[#e4bebc]">Resumen de plataforma en tiempo real</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        <KPICard
          label="Pases activos hoy"
          value={String(activePassesToday || 0)}
          sub="+% de nuevas activaciones"
          color="red"
          Icon={QrCode}
        />
        <KPICard
          label="Passes en catálogo"
          value={String(passesCount || 0)}
          sub="En múltiples categorías"
          color="teal"
          Icon={BadgeCheck}
        />
        <KPICard
          label="Ingresos estimados"
          value={formatMXN(estimatedRevenue)}
          sub={`${totalSalesCount || 0} passes vendidos`}
          color="gold"
          Icon={TrendingUp}
        />
        <KPICard
          label="Usuarios registrados"
          value={String(usersCount || 0)}
          sub="Total de cuentas activas"
          color="purple"
          Icon={Users}
        />
      </div>

      {/* Passes + Validaciones */}
      <div className="grid lg:grid-cols-3 gap-5">

        {/* Gestión de Passes */}
        <div className="lg:col-span-2 bg-[#13131b] rounded-2xl border border-[#1e1e28] overflow-hidden">
          <div className="px-5 py-4 border-b border-[#1e1e28] flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-[#e4e1ed] text-sm">Gestión de Passes</h3>
              <p className="text-[10px] text-[#e4bebc]">Últimos 30 días de transacciones</p>
            </div>
            <a href="/admin/passes" className="text-[10px] bg-[#ff535b]/10 text-[#ff535b] px-2.5 py-1 rounded-full font-medium border border-[#ff535b]/20 hover:bg-[#ff535b]/20 transition-colors">
              {passesCount} activos →
            </a>
          </div>
          <div className="divide-y divide-[#1e1e28]">
            {!passesData || passesData.length === 0 ? (
              <div className="px-5 py-8 text-center text-[#e4bebc]/50 text-sm">No hay passes configurados.</div>
            ) : passesData.map((pass: any) => {
              const vendidos = pass.user_passes?.[0]?.count || 0
              return (
                <PassRow key={pass.id} pass={pass} vendidos={vendidos} />
              )
            })}
          </div>
        </div>

        {/* Validaciones con Realtime */}
        <ValidacionesRealtime initial={formattedValidations} />
      </div>

    </div>
  )
}

// ---- Componentes ----

function KPICard({ label, value, sub, color, Icon }: {
  label: string; value: string; sub: string; color: 'red'|'teal'|'gold'|'purple'; Icon: any
}) {
  const colors = {
    red:    { bg: 'bg-[#ff535b]/10', text: 'text-[#ff535b]', border: 'border-[#ff535b]/20' },
    teal:   { bg: 'bg-[#30a193]/10', text: 'text-[#30a193]', border: 'border-[#30a193]/20' },
    gold:   { bg: 'bg-[#e7c268]/10', text: 'text-[#e7c268]', border: 'border-[#e7c268]/20' },
    purple: { bg: 'bg-[#a78bfa]/10',  text: 'text-[#a78bfa]',  border: 'border-[#a78bfa]/20' },
  }
  const c = colors[color]
  return (
    <div className="bg-[#13131b] rounded-2xl border border-[#1e1e28] p-5 flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <span className="text-[10px] text-[#e4bebc] font-medium uppercase tracking-wide">{label}</span>
        <div className={`w-7 h-7 rounded-lg ${c.bg} ${c.text} border ${c.border} flex items-center justify-center`}>
          <Icon size={14} />
        </div>
      </div>
      <p className="text-2xl font-bold text-[#e4e1ed] font-mono">{value}</p>
      <p className="text-[10px] text-[#e4bebc]">{sub}</p>
    </div>
  )
}

function PassRow({ pass, vendidos }: { pass: any; vendidos: number }) {
  const nichoColors: Record<string, string> = {
    cines: 'text-[#ff535b] bg-[#ff535b]/10',
    comida: 'text-[#e7c268] bg-[#e7c268]/10',
    cafe: 'text-[#e7c268] bg-[#e7c268]/10',
    fitness: 'text-[#30a193] bg-[#30a193]/10',
    restaurantes: 'text-[#a78bfa] bg-[#a78bfa]/10',
  }
  const cc = nichoColors[pass.nicho] || 'text-[#e4bebc] bg-[#1e1e28]'
  return (
    <a href={`/admin/passes`} className="px-5 py-4 flex items-center justify-between hover:bg-[#1a1a23] transition-colors group">
      <div className="flex-1">
        <p className="text-sm font-semibold text-[#e4e1ed] group-hover:text-white">{pass.nombre}</p>
        <div className="flex items-center gap-2 mt-1">
          <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${cc}`}>
            {pass.nicho}
          </span>
          <span className="text-[10px] text-[#e4bebc]">{vendidos} vendidos</span>
        </div>
      </div>
      <div className={`w-2 h-2 rounded-full ml-4 ${pass.activo ? 'bg-[#30a193]' : 'bg-red-500/40'}`} />
    </a>
  )
}
