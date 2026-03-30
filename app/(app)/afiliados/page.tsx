import { redirect } from 'next/navigation'
import { ArrowLeft, Copy, Wallet, TrendingUp, Users, ArrowUpRight } from 'lucide-react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { formatMXN } from '@/lib/utils'
import { Button } from '@/components/ui/Button'

export const metadata = { title: 'Panel de Afiliados' }

export default async function AffiliatesPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login?redirect=/afiliados')

  // Verificar si es afiliado
  const { data: affiliate } = await supabase
    .from('affiliates')
    .select('*')
    .eq('user_id', user.id)
    .single()

  if (!affiliate) {
    // Si no es afiliado, mostrar landing de registro de afiliado (MVP simple)
    return (
      <div className="min-h-screen bg-pf-bg pt-safe pb-24 px-6 flex flex-col items-center justify-center text-center">
        <div className="w-20 h-20 rounded-full bg-pf-primary-ctn/20 flex items-center justify-center mb-6 shadow-pf-glow">
          <TrendingUp className="text-pf-primary-ctn w-10 h-10" />
        </div>
        <h1 className="pf-display text-3xl mb-4 text-white">Gana con PASSFY</h1>
        <p className="text-pf-on-surface-var mb-8 max-w-sm">
          Por cada amigo que compre un pass con tu enlace, ganarás hasta un 15% de comisión. 
          Monetiza tu audiencia hoy mismo.
        </p>
        <form action="/api/affiliates/join" method="POST" className="w-full">
          <Button type="submit" className="w-full h-14 text-base shadow-pf-glow">
            Crear mi enlace de afiliado
          </Button>
        </form>
        <Link href="/perfil" className="mt-6 text-pf-on-surface-var hover:text-white transition-colors uppercase text-xs font-semibold tracking-wider">
          Volver al perfil
        </Link>
      </div>
    )
  }

  // Cargar estadísticas
  const { data: sales } = await supabase
    .from('affiliate_sales')
    .select('monto, comision, created_at')
    .eq('affiliate_id', affiliate.id)

  const totalSales = sales?.length || 0
  const totalEarned = sales?.reduce((acc, curr) => acc + curr.comision, 0) || 0
  const currentBalance = totalEarned // En MVP simplificamos balance = total ganado minus retiros (que no existen en MVP).

  const affiliateUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'https://passfy.mx'}?ref=${affiliate.codigo_afiliado}`

  return (
    <div className="min-h-screen bg-pf-bg pb-24 flex flex-col pt-safe">
      <header className="px-6 pt-6 pb-4 bg-pf-bg sticky top-0 z-10 flex items-center border-b border-pf-surface-highest">
        <Link href="/perfil" className="mr-4 text-pf-on-surface-var hover:text-white transition-colors">
          <ArrowLeft size={24} />
        </Link>
        <div className="flex-1">
          <h1 className="pf-display text-2xl text-white">Afiliados</h1>
        </div>
      </header>

      <main className="flex-1 px-6 py-6 space-y-6">
        
        {/* Balance Card */}
        <section className="relative overflow-hidden pf-card p-6 border-transparent bg-gradient-to-br from-pf-primary-ctn to-[#5b000e]">
          <div className="absolute top-0 right-0 p-4 opacity-20">
            <Wallet size={120} />
          </div>
          <div className="relative z-10 text-white">
            <p className="text-sm font-semibold uppercase tracking-wider text-white/80 mb-1">Balance Disponible</p>
            <h2 className="pf-mono text-4xl font-bold mb-6">{formatMXN(currentBalance)}</h2>
            
            <Button variant="secondary" className="w-full shadow-pf-amber text-sm font-semibold h-12">
              Solicitar Retiro
            </Button>
          </div>
        </section>

        {/* Enlace */}
        <section className="space-y-3">
          <h3 className="font-semibold text-sm uppercase tracking-wider text-pf-on-surface-var">Tu enlace único</h3>
          <div className="flex items-center gap-2">
            <div className="flex-1 bg-pf-surface border border-pf-surface-highest rounded-xl p-3 font-mono text-sm text-pf-on-surface truncate">
              {affiliateUrl}
            </div>
            {/* Componente cliente para copiar podría ir aquí, por ahora solo visual */}
            <button className="h-12 w-12 shrink-0 bg-pf-surface-high hover:bg-pf-surface-highest rounded-xl flex items-center justify-center border border-pf-surface-highest text-pf-on-surface transition-colors">
              <Copy size={20} />
            </button>
          </div>
          <p className="text-xs text-pf-on-surface-var">
            Comparte este enlace. Ganas <strong className="text-pf-primary">{affiliate.comision_pct}% de comisión</strong> por venta.
          </p>
        </section>

        <div className="grid grid-cols-2 gap-4">
          <div className="pf-card p-4 border border-pf-surface-highest">
            <div className="w-8 h-8 rounded-full bg-pf-secondary-ctn/20 text-pf-secondary-ctn flex items-center justify-center mb-3">
              <Users size={16} />
            </div>
            <p className="text-xl font-bold font-mono">{totalSales}</p>
            <p className="text-xs font-semibold uppercase tracking-wider text-pf-on-surface-var">Ventas</p>
          </div>
          <div className="pf-card p-4 border border-pf-surface-highest">
            <div className="w-8 h-8 rounded-full bg-pf-primary-ctn/20 text-pf-primary-ctn flex items-center justify-center mb-3">
              <TrendingUp size={16} />
            </div>
             <p className="text-xl font-bold font-mono">{formatMXN(totalEarned)}</p>
            <p className="text-xs font-semibold uppercase tracking-wider text-pf-on-surface-var">Total Ganado</p>
          </div>
        </div>

        {/* Útimas ventas */}
        <section className="pt-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-lg text-white">Últimas Ventas</h3>
            <span className="text-xs text-pf-primary hover:underline">Ver todas</span>
          </div>
          
          <div className="space-y-3">
            {sales && sales.length > 0 ? (
              sales.slice(0, 5).map((sale, i) => (
                <div key={i} className="flex items-center justify-between p-3 border border-pf-surface-highest rounded-xl bg-pf-surface hover:bg-pf-surface-top transition-colors">
                  <div className="flex flex-col">
                    <span className="font-medium text-sm">Venta de Pass</span>
                    <span className="text-xs text-pf-on-surface-var">{new Date(sale.created_at).toLocaleDateString('es-MX')}</span>
                  </div>
                  <div className="text-right">
                    <span className="font-bold text-pf-primary-ctn block">+{formatMXN(sale.comision)}</span>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-pf-on-surface-var text-center py-6">No hay ventas registradas aún.</p>
            )}
          </div>
        </section>

      </main>
    </div>
  )
}
