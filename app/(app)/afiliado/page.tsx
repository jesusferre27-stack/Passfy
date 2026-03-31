'use client'

import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useUserStore } from '@/store/useUserStore'
import { Copy, Share2, TrendingUp, DollarSign, Users, ChevronRight, Activity, Rocket, Info, CheckCircle2, Clock } from 'lucide-react'
import { toast } from 'sonner'
import Link from 'next/link'
import { BarChart, Bar, XAxis, Tooltip, ResponsiveContainer } from 'recharts'
import { Skeleton } from '@/components/ui/Skeleton'

type AffiliateStats = {
  codigo_afiliado: string
  ventas_mes: number
  comision_pendiente: number
  total_ganado: number
  ventas_semanales: { name: string; ventas: number }[]
}

type AffiliateSale = {
  id: string
  fecha: string
  monto: number
  pagado: boolean
  pass_nombre: string
}

export default function AffiliatePanelPage() {
  const router = useRouter()
  const { user, isLoading: isUserLoading } = useUserStore()
  
  const [stats, setStats] = useState<AffiliateStats | null>(null)
  const [sales, setSales] = useState<AffiliateSale[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (isUserLoading) return
    if (!user) {
      router.push('/login?redirect=/afiliado')
      return
    }

    async function loadAffiliateData() {
      try {
        const [statsRes, salesRes] = await Promise.all([
          fetch('/api/affiliate/stats'),
          fetch('/api/affiliate/sales')
        ])

        if (!statsRes.ok) {
           if (statsRes.status === 404) {
             // No es afiliado
             router.push('/perfil')
             return
           }
           throw new Error('Error al cargar stats')
        }

        const statsData = await statsRes.json()
        const salesData = await salesRes.json()

        setStats(statsData)
        setSales(salesData.sales || [])
      } catch (err: any) {
        toast.error(err.message || 'Error al cargar panel')
      } finally {
        setLoading(false)
      }
    }

    loadAffiliateData()
  }, [user, isUserLoading, router])

  const handleCopyLink = () => {
    if (!stats?.codigo_afiliado) return
    const link = `https://passfy.vercel.app/?ref=${stats.codigo_afiliado}`
    navigator.clipboard.writeText(link)
    toast.success('¡Link copiado!', { description: link })
  }

  const handleShareWhatsApp = (textType: 'link' | 'cta') => {
    if (!stats?.codigo_afiliado) return
    const link = `https://passfy.vercel.app/?ref=${stats.codigo_afiliado}`
    const text = textType === 'link' 
      ? `Obtén beneficios increíbles con Passfy: ${link}`
      : `¡Ya estoy en Passfy! Únete y obtén grandes beneficios con mi enlace: ${link}`
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank')
  }

  const handleShareTikTok = () => {
    window.open(`https://tiktok.com`, '_blank') // TikTok redirige sin url_schema predecible en web
  }

  // UI helpers
  const getInitials = (name?: string) => {
    if (!name) return 'U'
    return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()
  }

  if (loading || isUserLoading || !stats) {
    return (
      <div className="bg-pf-bg min-h-screen pt-safe p-6 space-y-6">
        <Skeleton className="h-10 w-2/3 mb-4" />
        <Skeleton className="h-40 w-full rounded-2xl" />
        <Skeleton className="h-32 w-full rounded-2xl" />
        <Skeleton className="h-32 w-full rounded-2xl" />
      </div>
    )
  }

  const linkUrl = `passfy.vercel.app/?ref=${stats.codigo_afiliado}`

  return (
    <div className="min-h-screen bg-pf-bg pt-safe pb-24">
      {/* 1. HEADER */}
      <header className="px-6 pt-8 pb-4 flex items-center justify-between">
        <div>
          <h1 className="pf-display text-2xl text-white">Panel de Afiliado</h1>
          <p className="text-sm text-pf-on-surface-var">Comparte y gana dinero</p>
        </div>
        <div className="w-10 h-10 rounded-full bg-pf-surface-high flex items-center justify-center font-bold text-pf-on-surface">
          {getInitials(user?.nombre)}
        </div>
      </header>

      <main className="px-6 space-y-6">
        {/* 2. TARJETA CÓDIGO */}
        <div className="bg-pf-primary-ctn rounded-2xl p-6 shadow-pf-glow relative overflow-hidden">
          <div className="absolute -top-10 -right-10 w-32 h-32 bg-white/10 rounded-full blur-2xl pointer-events-none" />
          <p className="text-white/80 text-sm font-medium mb-1">Tu código de afiliado</p>
          <div className="font-mono text-3xl font-bold tracking-wider text-white mb-2 pb-2 border-b border-white/20">
            {stats.codigo_afiliado}
          </div>
          <p className="font-mono text-xs text-white/70 truncate mb-6 pb-2">
            {linkUrl}
          </p>
          <div className="flex gap-3">
             <button 
               onClick={handleCopyLink}
               className="flex-1 bg-white/20 hover:bg-white/30 text-white py-3 rounded-xl flex items-center justify-center gap-2 font-semibold text-sm transition-colors"
             >
               <Copy size={16} /> Copiar enlace
             </button>
             <button 
               onClick={() => handleShareWhatsApp('link')}
               className="flex-1 bg-[#25D366] hover:bg-[#20BE5A] text-white py-3 rounded-xl flex items-center justify-center gap-2 font-semibold text-sm transition-colors"
             >
               <Share2 size={16} /> WhatsApp
             </button>
          </div>
        </div>

        {/* 3. STATS (3 tarjetas) */}
        <div className="grid grid-cols-2 gap-3">
          <div className="col-span-1 bg-pf-surface p-4 rounded-2xl border border-pf-surface-highest">
            <div className="w-8 h-8 rounded-full bg-teal-500/20 text-teal-400 flex items-center justify-center mb-2">
              <Users size={16} />
            </div>
            <p className="text-pf-on-surface-var text-xs mb-1">Ventas este mes</p>
            <p className="text-xl font-bold text-pf-on-surface">{stats.ventas_mes}</p>
          </div>
          
          <div className="col-span-1 bg-pf-surface p-4 rounded-2xl border border-pf-surface-highest flex flex-col justify-between">
            <div className="w-8 h-8 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center mb-2">
              <Clock size={16} />
            </div>
            <div>
              <p className="text-pf-on-surface-var text-xs mb-1">Comisión pdte.</p>
              <p className="text-xl font-bold text-pf-on-surface">MX${stats.comision_pendiente.toLocaleString('es-MX')}</p>
            </div>
          </div>

          <div className="col-span-2 bg-gradient-to-r from-pf-surface to-pf-surface-highest p-4 rounded-2xl border border-pf-surface-highest flex items-center justify-between">
            <div>
              <p className="text-pf-on-surface-var text-sm mb-1">Total ganado</p>
              <p className="text-2xl font-bold text-[#20BE5A]">MX${stats.total_ganado.toLocaleString('es-MX')}</p>
            </div>
            <div className="w-12 h-12 rounded-full bg-[#20BE5A]/10 text-[#20BE5A] flex items-center justify-center">
              <DollarSign size={24} />
            </div>
          </div>
        </div>

        {/* 4. GRÁFICA RENDIMIENTO SEMANAL */}
        <div className="bg-pf-surface rounded-2xl p-5 border border-pf-surface-highest">
          <div className="flex items-center gap-2 mb-6">
            <TrendingUp className="text-pf-primary-ctn" size={20} />
            <h3 className="font-semibold text-pf-on-surface">Rendimiento (últimas 4 sem)</h3>
          </div>
          <div className="h-[180px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats.ventas_semanales}>
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#85859E', fontSize: 12}} dy={10} />
                <Tooltip 
                  cursor={{fill: '#1E1E28'}}
                  contentStyle={{ backgroundColor: '#13131B', border: '1px solid #1E1E28', borderRadius: '8px', color: '#FFF' }}
                  itemStyle={{ color: '#F8323B' }}
                />
                <Bar dataKey="ventas" fill="#F8323B" radius={[4, 4, 0, 0]} barSize={32} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 5. CTA MOTIVACIONAL */}
        <div className="bg-gradient-to-br from-pf-primary-ctn/10 to-transparent p-5 rounded-2xl border border-pf-primary-ctn/30 text-center relative overflow-hidden">
          <Rocket className="text-pf-primary-ctn w-12 h-12 mx-auto mb-3" />
          <h3 className="font-bold text-lg text-pf-on-surface mb-2">¡Invita y gana $30 por venta!</h3>
          <p className="text-sm text-pf-on-surface-var mb-5">Comparte Passfy en tus redes y multiplica tus ingresos rápida y fácilmente.</p>
          <div className="flex gap-3">
             <button onClick={() => handleShareWhatsApp('cta')} className="flex-1 bg-[#25D366] text-white py-2.5 rounded-xl text-sm font-semibold hover:opacity-90 transition-opacity">
               WhatsApp
             </button>
             <button onClick={handleShareTikTok} className="flex-1 bg-black text-white py-2.5 rounded-xl border border-white/20 text-sm font-semibold hover:bg-neutral-900 transition-colors">
               TikTok
             </button>
          </div>
        </div>

        {/* 6. VENTAS RECIENTES */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-pf-on-surface flex items-center gap-2">
              <Activity size={18} className="text-pf-on-surface-var" />
              Ventas Recientes
            </h3>
            {/* Opcional: <Link href="/afiliados/ventas" className="text-sm text-pf-primary-ctn font-medium">Ver todas →</Link> */}
          </div>
          
          <div className="bg-pf-surface rounded-2xl border border-pf-surface-highest overflow-hidden divide-y divide-pf-surface-highest">
            {sales.length === 0 ? (
              <div className="p-6 text-center text-pf-on-surface-var text-sm">Aún no hay ventas. ¡Comparte tu link para empezar!</div>
            ) : (
              sales.slice(0, 5).map(sale => (
                <div key={sale.id} className="p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-pf-surface-highest flex items-center justify-center">
                      <DollarSign size={16} className="text-pf-on-surface-var" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-pf-on-surface">{sale.pass_nombre}</p>
                      <p className="text-xs text-pf-on-surface-var">{new Date(sale.fecha).toLocaleDateString('es-MX', { day: 'numeric', month: 'short' })}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-[#20BE5A]">+{sale.monto}</p>
                    <div className="mt-1">
                      {sale.pagado ? (
                         <span className="inline-flex items-center gap-1 text-[10px] uppercase font-bold text-[#20BE5A] bg-[#20BE5A]/10 px-2 py-0.5 rounded-md">
                           <CheckCircle2 size={10} /> Pagado
                         </span>
                      ) : (
                         <span className="inline-flex items-center gap-1 text-[10px] uppercase font-bold text-amber-500 bg-amber-500/10 px-2 py-0.5 rounded-md">
                           <Clock size={10} /> PENDIENTE
                         </span>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
            
            {sales.length > 5 && (
               <div className="p-3 text-center">
                 <button className="text-sm text-pf-primary-ctn font-medium">Ver todas las ventas →</button>
               </div>
            )}
          </div>
        </div>

        {/* 7. CÓMO FUNCIONA */}
        <div className="bg-pf-surface rounded-2xl p-5 border border-pf-surface-highest">
          <h3 className="font-semibold text-pf-on-surface mb-4 flex items-center gap-2">
            <Info size={18} className="text-pf-on-surface-var" /> 
            ¿Cómo funciona?
          </h3>
          <div className="space-y-4">
            <div className="flex items-start gap-4">
              <div className="w-8 h-8 rounded-full bg-pf-primary-ctn/20 text-pf-primary-ctn flex items-center justify-center flex-shrink-0 font-bold">1</div>
              <div>
                <p className="text-sm font-semibold text-pf-on-surface">Comparte tu link</p>
                <p className="text-xs text-pf-on-surface-var">Copia tu link único y compártelo con amigos, en grupos o en redes.</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="w-8 h-8 rounded-full bg-pf-primary-ctn/20 text-pf-primary-ctn flex items-center justify-center flex-shrink-0 font-bold">2</div>
              <div>
                <p className="text-sm font-semibold text-pf-on-surface">Alguien compra</p>
                <p className="text-xs text-pf-on-surface-var">Tus invitados entran a Passfy con tu enlace y adquieren un Beneficio.</p>
              </div>
            </div>
             <div className="flex items-start gap-4">
              <div className="w-8 h-8 rounded-full bg-[#20BE5A]/20 text-[#20BE5A] flex items-center justify-center flex-shrink-0 font-bold">3</div>
              <div>
                <p className="text-sm font-semibold text-pf-on-surface">Recibes $30</p>
                <p className="text-xs text-pf-on-surface-var">Por cada compra exitosa sumamos tu comisión. Retirables semanalmente.</p>
              </div>
            </div>
          </div>
        </div>

      </main>
    </div>
  )
}
