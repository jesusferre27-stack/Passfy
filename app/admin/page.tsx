import { redirect } from 'next/navigation'
import { LayoutDashboard, Users, ReceiptText, QrCode } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { formatMXN } from '@/lib/utils'

export const metadata = { title: 'PASSFY Admin' }

export default async function AdminDashboardPage() {
  const supabase = await createClient()

  // Verificar RLS/Auth (solo admin mediante service_role o usuario con roll admin)
  // Como simplificación para MVP, verificamos autenticación normal y podríamos verificar email.
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // En producción, aquí harías `if (user.role !== 'admin') redirect('/')` o revisar una tabla profiles
  
  // Obtener métricas
  const [
    { count: usersCount },
    { count: activePassesCount },
    { count: totalSalesCount },
    { data: salesMonto }
  ] = await Promise.all([
    supabase.from('users').select('*', { count: 'exact', head: true }),
    supabase.from('user_passes').select('*', { count: 'exact', head: true }).eq('activo', true),
    supabase.from('user_passes').select('*', { count: 'exact', head: true }),
    // Simulando suma de monto de passes para ventas totales (en real sería join con passes.precio o tabla transactions)
    supabase.rpc('get_total_revenue') // Necesitaríamos un RPC, hagámoslo simple con sumatorias JS
  ])

  // Fake revenue por simplicidad MVP sin complex queries
  const estimatedRevenue = (totalSalesCount || 0) * 199 // Asumiendo costo $199

  return (
    <div className="min-h-screen bg-pf-bg">
      <div className="flex h-screen overflow-hidden">
        
        {/* Sidebar Admin (Solo Desktop/Tablet) */}
        <aside className="w-64 bg-pf-surface hidden md:flex flex-col border-r border-pf-surface-highest">
          <div className="p-6 border-b border-pf-surface-highest">
            <h1 className="pf-display text-2xl text-pf-primary-ctn tracking-tighter">PASSFY Admin</h1>
          </div>
          <nav className="flex-1 p-4 space-y-2">
            <a href="#" className="flex items-center gap-3 px-4 py-3 bg-pf-primary-ctn/10 text-pf-primary-ctn rounded-xl font-semibold">
              <LayoutDashboard size={20} /> Panel
            </a>
            <a href="#" className="flex items-center gap-3 px-4 py-3 text-pf-on-surface hover:bg-pf-surface-top rounded-xl font-medium transition-colors">
              <Users size={20} /> Usuarios
            </a>
            <a href="#" className="flex items-center gap-3 px-4 py-3 text-pf-on-surface hover:bg-pf-surface-top rounded-xl font-medium transition-colors">
              <ReceiptText size={20} /> Finanzas
            </a>
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto px-6 py-8 md:px-12 w-full max-w-5xl mx-auto">
          <header className="mb-8 hidden md:block">
            <h2 className="text-2xl font-semibold">Hola, Admin</h2>
            <p className="text-pf-on-surface-var">Aquí está el resumen de PASSFY hoy.</p>
          </header>

          <header className="mb-8 md:hidden pt-safe mt-6">
            <h2 className="pf-display text-3xl text-pf-primary-ctn">PASSFY Admin</h2>
          </header>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <MetricCard title="Ventas Totales" value={formatMXN(estimatedRevenue)} icon={<ReceiptText className="text-pf-primary-ctn" />} />
            <MetricCard title="Usuarios Registrados" value={usersCount?.toString() || '0'} icon={<Users className="text-pf-secondary-ctn" />} />
            <MetricCard title="Passes Activos" value={activePassesCount?.toString() || '0'} icon={<QrCode className="text-pf-tertiary-fixed" />} />
            <MetricCard title="Passes Vendidos" value={totalSalesCount?.toString() || '0'} icon={<LayoutDashboard className="text-white" />} />
          </div>

          <div className="grid lg:grid-cols-3 gap-6">
            {/* Actividad Reciente */}
            <div className="lg:col-span-2 pf-card p-6 border border-pf-surface-highest">
              <h3 className="text-lg font-semibold mb-4">Actividad Reciente</h3>
              <div className="space-y-4">
                {[1, 2, 3, 4].map(i => (
                  <div key={i} className="flex items-center justify-between pb-4 border-b border-pf-surface-high last:border-0 last:pb-0">
                    <div>
                      <p className="font-semibold text-sm">Nuevo pass adquirido</p>
                      <p className="text-xs text-pf-on-surface-var">Juan P. compró BurgerPass</p>
                    </div>
                    <span className="text-xs text-pf-on-surface-var uppercase">+ $199.00</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Top Passes */}
            <div className="pf-card p-6 border border-pf-surface-highest">
              <h3 className="text-lg font-semibold mb-4">Top Ventas</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm">🍿 CinePass</span>
                  <span className="font-bold">45%</span>
                </div>
                <div className="w-full bg-pf-surface-high h-2 rounded-full overflow-hidden mb-4">
                  <div className="bg-pf-primary-ctn w-[45%] h-full rounded-full" />
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm">🍔 BurgerPass</span>
                  <span className="font-bold">30%</span>
                </div>
                <div className="w-full bg-pf-surface-high h-2 rounded-full overflow-hidden mb-4">
                  <div className="bg-pf-secondary-ctn w-[30%] h-full rounded-full" />
                </div>
              </div>
            </div>
          </div>

        </main>
      </div>
    </div>
  )
}

function MetricCard({ title, value, icon }: { title: string, value: string, icon: React.ReactNode }) {
  return (
    <div className="pf-card p-6 border border-pf-surface-highest flex flex-col justify-between h-32 hover:border-pf-outline-var/40 transition-colors">
      <div className="flex items-start justify-between">
        <h3 className="text-sm font-medium text-pf-on-surface-var uppercase tracking-wider">{title}</h3>
        <div className="p-2 bg-pf-surface-high rounded-lg">{icon}</div>
      </div>
      <p className="text-3xl font-bold font-mono">{value}</p>
    </div>
  )
}
