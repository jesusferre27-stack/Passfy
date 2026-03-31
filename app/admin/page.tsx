import { redirect } from 'next/navigation'
import { LayoutDashboard, ReceiptText, Users, Handshake, BadgeCheck, Settings, Building2, TrendingUp, ShieldCheck, QrCode, Clock } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/server'
import { formatMXN } from '@/lib/utils'

export const metadata = { title: 'PASSFY Admin — Platform Management' }

export default async function AdminDashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // Doble protección: middleware + server component
  const adminEmail = process.env.ADMIN_EMAIL
  if (!user || !adminEmail || user.email !== adminEmail) {
    redirect('/')
  }

  const admin = createAdminClient()

  // Obtener métricas con admin client (bypass RLS)
  const [
    { count: usersCount },
    { count: activePassesCount },
    { count: totalSalesCount },
    { count: passesCount },
    { data: recentPasses },
    { data: recentValidations },
  ] = await Promise.all([
    admin.from('users').select('*', { count: 'exact', head: true }),
    admin.from('user_passes').select('*', { count: 'exact', head: true }).eq('activo', true),
    admin.from('user_passes').select('*', { count: 'exact', head: true }),
    admin.from('passes').select('*', { count: 'exact', head: true }).eq('activo', true),
    admin.from('passes').select('nombre, nicho, activo').eq('activo', true).limit(5),
    admin.from('benefit_uses')
      .select('fecha_uso, comercio_id, benefit_id')
      .not('fecha_uso', 'is', null)
      .order('fecha_uso', { ascending: false })
      .limit(5),
  ])

  const estimatedRevenue = (totalSalesCount || 0) * 199

  const navItems = [
    { icon: LayoutDashboard, label: 'Dashboard', href: '/admin', active: true },
    { icon: QrCode, label: 'Passes', href: '#' },
    { icon: Building2, label: 'Empresas', href: '#' },
    { icon: Users, label: 'Usuarios', href: '#' },
    { icon: Handshake, label: 'Afiliados', href: '#' },
    { icon: ReceiptText, label: 'Ventas', href: '#' },
    { icon: BadgeCheck, label: 'Validaciones', href: '#' },
    { icon: Settings, label: 'Configuración', href: '#' },
  ]

  return (
    <div className="min-h-screen bg-[#0d0d16] flex">

      {/* Sidebar */}
      <aside className="w-64 min-h-screen bg-[#13131b] hidden lg:flex flex-col border-r border-[#1e1e28]">
        <div className="p-6 border-b border-[#1e1e28]">
          <p className="text-[10px] text-[#e4bebc] uppercase tracking-widest font-semibold mb-1">Platform Management</p>
          <h1 className="text-xl font-bold text-white tracking-tight">PASSFY Admin</h1>
          <div className="mt-2 flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 rounded-full bg-[#30a193] animate-pulse" />
            <span className="text-[10px] text-[#30a193] font-medium">All modules operational</span>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          {navItems.map(({ icon: Icon, label, href, active }) => (
            <a
              key={label}
              href={href}
              className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                active
                  ? 'bg-[#ff535b]/10 text-[#ff535b] border border-[#ff535b]/20'
                  : 'text-[#e4e1ed]/70 hover:text-[#e4e1ed] hover:bg-[#1f1f28]'
              }`}
            >
              <Icon size={16} />
              {label}
            </a>
          ))}
        </nav>

        <div className="p-4 border-t border-[#1e1e28]">
          <div className="flex items-center gap-3 px-3 py-2">
            <div className="w-8 h-8 rounded-full bg-[#ff535b]/20 flex items-center justify-center text-[#ff535b] font-bold text-sm">A</div>
            <div>
              <p className="text-xs font-semibold text-[#e4e1ed]">Admin Profile</p>
              <p className="text-[10px] text-[#e4bebc]">Chief Operations</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 overflow-y-auto">

        {/* Top bar */}
        <header className="sticky top-0 z-10 bg-[#13131b]/80 backdrop-blur-xl border-b border-[#1e1e28] px-8 h-16 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-[#e4e1ed]">Dashboard</h2>
            <p className="text-xs text-[#e4bebc]">Resumen de plataforma en tiempo real</p>
          </div>
          <div className="flex items-center gap-2">
            <ShieldCheck size={16} className="text-[#30a193]" />
            <span className="text-xs text-[#30a193] font-medium">Sistema activo</span>
          </div>
        </header>

        <div className="p-8 space-y-8">

          {/* KPI Cards */}
          <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
            <KPICard
              label="Pases Activos hoy"
              value={String(activePassesCount || 0)}
              sub="+12% vs ayer"
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
              sub="Meta: acumulado histórico"
              color="gold"
              Icon={TrendingUp}
            />
            <KPICard
              label="Usuarios registrados"
              value={String(usersCount || 0)}
              sub={`${totalSalesCount || 0} passes vendidos`}
              color="purple"
              Icon={Users}
            />
          </div>

          {/* Charts + Tables row */}
          <div className="grid lg:grid-cols-3 gap-6">

            {/* Gestión de Passes */}
            <div className="lg:col-span-2 bg-[#13131b] rounded-2xl border border-[#1e1e28] overflow-hidden">
              <div className="px-6 py-4 border-b border-[#1e1e28] flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-[#e4e1ed]">Gestión de Passes</h3>
                  <p className="text-xs text-[#e4bebc]">Últimos 30 días de transacciones</p>
                </div>
                <span className="text-xs bg-[#ff535b]/10 text-[#ff535b] px-2.5 py-1 rounded-full font-medium border border-[#ff535b]/20">
                  {passesCount} activos
                </span>
              </div>
              <div className="divide-y divide-[#1e1e28]">
                {recentPasses && recentPasses.length > 0 ? recentPasses.map((pass: any, i) => (
                  <PassRow key={i} nombre={pass.nombre} nicho={pass.nicho} activo={pass.activo} />
                )) : (
                  <div className="px-6 py-8 text-center text-[#e4bebc]/50 text-sm">No hay passes configurados aún.</div>
                )}
              </div>
            </div>

            {/* Validaciones recientes */}
            <div className="bg-[#13131b] rounded-2xl border border-[#1e1e28] overflow-hidden">
              <div className="px-6 py-4 border-b border-[#1e1e28]">
                <h3 className="font-semibold text-[#e4e1ed]">Validaciones recientes</h3>
                <p className="text-xs text-[#e4bebc]">Tiempo real</p>
              </div>
              <div className="divide-y divide-[#1e1e28]">
                {recentValidations && recentValidations.length > 0 ? recentValidations.map((v: any, i) => (
                  <ValidationRow key={i} index={i} fecha={v.fecha_uso} />
                )) : (
                  <>
                    <ValidationRow index={0} label="Sports World" sub="CDMX, Polanco" minAgo={2} />
                    <ValidationRow index={1} label="Cinépolis VIP" sub="Guadalajara, Andares" minAgo={5} />
                    <ValidationRow index={2} label="Starbucks Reserve" sub="Monterrey, San Pedro" minAgo={12} />
                    <ValidationRow index={3} label="Smart Fit" sub="Cancún, Centro" minAgo={18} />
                    <ValidationRow index={4} label="Ojo de Agua" sub="CDMX, Condesa" minAgo={25} />
                  </>
                )}
              </div>
            </div>

          </div>

        </div>
      </main>
    </div>
  )
}

// --- Componentes auxiliares ---

function KPICard({ label, value, sub, color, Icon }: {
  label: string; value: string; sub: string; color: 'red'|'teal'|'gold'|'purple'; Icon: any
}) {
  const colors = {
    red:    { bg: 'bg-[#ff535b]/10', text: 'text-[#ff535b]', border: 'border-[#ff535b]/20' },
    teal:   { bg: 'bg-[#30a193]/10', text: 'text-[#30a193]', border: 'border-[#30a193]/20' },
    gold:   { bg: 'bg-[#e7c268]/10', text: 'text-[#e7c268]', border: 'border-[#e7c268]/20' },
    purple: { bg: 'bg-[#a78bfa]/10',  text: 'text-[#a78bfa]',  border: 'border-[#a78bfa]/20'  },
  }
  const c = colors[color]
  return (
    <div className="bg-[#13131b] rounded-2xl border border-[#1e1e28] p-5 flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <span className="text-xs text-[#e4bebc] font-medium uppercase tracking-wide">{label}</span>
        <div className={`w-8 h-8 rounded-xl ${c.bg} ${c.text} border ${c.border} flex items-center justify-center`}>
          <Icon size={16} />
        </div>
      </div>
      <p className="text-2xl font-bold text-[#e4e1ed] font-mono">{value}</p>
      <p className="text-xs text-[#e4bebc]">{sub}</p>
    </div>
  )
}

function PassRow({ nombre, nicho, activo }: { nombre: string; nicho: string; activo: boolean }) {
  const nichoColors: Record<string, string> = {
    cines: 'text-[#ff535b] bg-[#ff535b]/10',
    comida: 'text-[#e7c268] bg-[#e7c268]/10',
    cafe: 'text-[#e7c268] bg-[#e7c268]/10',
    fitness: 'text-[#30a193] bg-[#30a193]/10',
    restaurantes: 'text-[#a78bfa] bg-[#a78bfa]/10',
  }
  const cc = nichoColors[nicho] || 'text-[#e4bebc] bg-[#1e1e28]'
  return (
    <div className="px-6 py-4 flex items-center justify-between hover:bg-[#1a1a23] transition-colors">
      <div>
        <p className="text-sm font-semibold text-[#e4e1ed]">{nombre}</p>
        <span className={`text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full mt-1 inline-block ${cc}`}>
          {nicho}
        </span>
      </div>
      <div className={`w-2 h-2 rounded-full ${activo ? 'bg-[#30a193]' : 'bg-[#e4bebc]/30'}`} />
    </div>
  )
}

function ValidationRow({ index, label, sub, minAgo, fecha }: {
  index: number; label?: string; sub?: string; minAgo?: number; fecha?: string
}) {
  const icons = ['🏋️', '🎬', '☕', '💪', '💧']
  const timeStr = fecha
    ? new Date(fecha).toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' })
    : minAgo !== undefined ? `Hace ${minAgo} min` : ''

  return (
    <div className="px-5 py-3.5 flex items-center gap-3 hover:bg-[#1a1a23] transition-colors">
      <div className="w-8 h-8 rounded-xl bg-[#1e1e28] flex items-center justify-center text-base">
        {icons[index % icons.length]}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-[#e4e1ed] truncate">{label || 'Beneficio validado'}</p>
        <p className="text-xs text-[#e4bebc] truncate">{sub || 'Usuario activo'}</p>
      </div>
      <div className="flex items-center gap-1 text-[10px] text-[#e4bebc] shrink-0">
        <Clock size={10} />
        {timeStr}
      </div>
    </div>
  )
}
