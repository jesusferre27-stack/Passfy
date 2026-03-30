import { notFound } from 'next/navigation'
import Link from 'next/link'
import { Sparkles, ArrowLeft, CheckCircle2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { type Pass, type Benefit } from '@/lib/types'
import { formatMXN, formatMXNShort } from '@/lib/utils'
import { Button } from '@/components/ui/Button'
import { BenefitsAccordion } from './BenefitsAccordion'

export async function generateMetadata({ params }: { params: { slug: string } }) {
  const supabase = await createClient()
  const { data: pass } = await supabase.from('passes').select('nombre, descripcion').eq('slug', params.slug).single()
  
  if (!pass) return { title: 'Pass no encontrado' }
  return {
    title: `${pass.nombre} — Detalles`,
    description: pass.descripcion,
  }
}

export default async function PassDetailPage({ params }: { params: { slug: string } }) {
  const supabase = await createClient()
  
  // Obtener pass y beneficios
  const { data: passData } = await supabase
    .from('passes')
    .select(`
      *,
      benefits (
        id, descripcion, usos_totales, tipo, icono
      )
    `)
    .eq('slug', params.slug)
    .single()

  if (!passData) notFound()
  const pass = passData as Pass

  // Obtener conteo de usuarios ("Social proof") - Mockeado a 1500 + random si está vacío para la demo
  const { count } = await supabase.from('user_passes').select('*', { count: 'exact', head: true }).eq('pass_id', pass.id)
  const socialProofCount = (count || 0) + 1240

  // Verificar si el usuario actual ya lo tiene
  let alreadyOwned = false
  const { data: { user } } = await supabase.auth.getUser()
  if (user) {
    const { data: userPass } = await supabase
      .from('user_passes')
      .select('id')
      .eq('user_id', user.id)
      .eq('pass_id', pass.id)
      .eq('activo', true)
      .single()
    
    if (userPass) alreadyOwned = true
  }

  const gradientStyle = {
    background: `linear-gradient(135deg, ${pass.color_brand_end || pass.color_brand}, ${pass.color_brand})`
  }

  return (
    <div className="min-h-screen bg-pf-bg pb-32"> {/* Espacio para el fixed bottom bar */}
      
      {/* Navbar Transparente / Backbutton */}
      <nav className="absolute top-0 w-full p-4 z-20 flex items-center justify-between safe-top">
        <Link href="/passes" className="w-10 h-10 rounded-full bg-black/20 backdrop-blur-md flex items-center justify-center text-white">
          <ArrowLeft size={20} />
        </Link>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-24 pb-12 px-6 overflow-hidden rounded-b-[40px] shadow-pf-float" style={gradientStyle}>
        <div className="absolute inset-0 opacity-10 mix-blend-overlay bg-[url('https://www.transparenttextures.com/patterns/stardust.png')]" />
        <div className="absolute -top-12 -right-12 w-48 h-48 rounded-full bg-white/10 blur-3xl pointer-events-none" />
        
        <div className="relative z-10 animate-slide-up">
          <div className="bg-white/20 backdrop-blur-md w-12 h-12 rounded-2xl flex items-center justify-center mb-6 shadow-pf-glow">
            <Sparkles className="text-white w-6 h-6" />
          </div>
          
          <h1 className="pf-display text-4xl leading-tight text-white tracking-tight mb-4">
            {pass.nombre}
          </h1>
          <p className="text-white/90 text-sm pf-body mb-8 opacity-90 leading-relaxed max-w-sm">
            {pass.descripcion}
          </p>

          <div className="flex items-center gap-3">
            <div className="flex -space-x-2">
              {[1,2,3].map(i => (
                <div key={i} className="w-8 h-8 rounded-full border-2 border-pf-surface-highest bg-pf-surface-high flex items-center justify-center overflow-hidden">
                  <UserAvatar seed={i} />
                </div>
              ))}
            </div>
            <div className="text-xs text-white/80 font-medium font-body">
              <span className="font-bold text-white">+{socialProofCount.toLocaleString()}</span> usuarios lo están usando
            </div>
          </div>
        </div>
      </section>

      <main className="px-6 py-8 space-y-10">
        {/* Beneficios */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="pf-headline text-xl">¿Qué incluye?</h2>
            <span className="text-xs font-semibold text-pf-on-surface-var uppercase bg-pf-surface px-2 py-1 rounded-full">
              {pass.benefits?.length || 0} beneficios
            </span>
          </div>
          
          <BenefitsAccordion benefits={pass.benefits || []} />
        </section>

        {/* Marcas Afiliadas */}
        <section className="pf-card p-6 border border-pf-surface-high">
          <h2 className="pf-headline text-lg mb-4">Marcas Afiliadas</h2>
          <div className="flex flex-wrap gap-3">
            {/* Simulando marcas por nicho desde la UI (esto normalmente vendría relacional de merchants) */}
            <div className="px-4 py-2 rounded-full bg-pf-surface border border-pf-outline-var/30 text-sm font-semibold flex items-center gap-2">
              ✅ Válido en múltiples sucursales
            </div>
          </div>
        </section>

        {/* Cómo usar */}
        <section>
          <h2 className="pf-headline text-xl mb-6">¿Cómo funciona?</h2>
          <div className="space-y-6">
            <Step number="1" title="Adquiere tu Pass" text="Paga de forma 100% segura y activa tu pase al instante." />
            <div className="w-[2px] h-6 bg-pf-outline-var/30 ml-4 -my-4 relative z-0" />
            <Step number="2" title="Visita una marca afiliada" text="Ve a tu sucursal favorita y pide tu beneficio." />
            <div className="w-[2px] h-6 bg-pf-outline-var/30 ml-4 -my-4 relative z-0" />
            <Step number="3" title="Muestra tu código QR" text="El cajero escaneará tu código y aplicará el descuento." />
          </div>
        </section>
      </main>

      {/* Sticky Bottom Bar */}
      <div className="fixed bottom-[72px] left-0 right-0 p-4 bg-pf-surface-highest/80 backdrop-blur-xl border-t border-pf-outline-var/20 z-40 max-w-md mx-auto rounded-t-2xl">
        {alreadyOwned ? (
          <div className="bg-pf-secondary-ctn/10 border border-pf-secondary-ctn rounded-2xl p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="text-pf-secondary-ctn w-6 h-6" />
              <div>
                <p className="font-semibold text-pf-on-surface text-sm">Ya tienes este Pass</p>
                <p className="text-xs text-pf-on-surface-var">Válido en tu wallet</p>
              </div>
            </div>
            <Link href="/wallet">
              <Button variant="secondary" size="sm">Ver en Wallet</Button>
            </Link>
          </div>
        ) : (
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-xs text-pf-on-surface-var font-semibold uppercase tracking-wider">Pago único</p>
              <p className="text-2xl font-bold font-mono text-pf-on-surface">{formatMXNShort(pass.precio)}</p>
            </div>
            <Link href={`/checkout/${pass.slug}`} className="flex-1">
              <Button className="w-full shadow-pf-glow animate-pf-pulse-glow" size="lg">
                Comprar Pass
              </Button>
            </Link>
          </div>
        )}
      </div>

    </div>
  )
}

function Step({ number, title, text }: { number: string, title: string, text: string }) {
  return (
    <div className="flex gap-4 relative z-10">
      <div className="w-8 h-8 shrink-0 rounded-full bg-pf-surface-high border border-pf-outline-var/50 flex items-center justify-center font-bold text-pf-primary-ctn text-sm">
        {number}
      </div>
      <div>
        <h3 className="font-semibold text-pf-on-surface m-0 text-base">{title}</h3>
        <p className="text-sm text-pf-on-surface-var leading-relaxed mt-1">{text}</p>
      </div>
    </div>
  )
}

// Helper rápido para avatares mock
function UserAvatar({ seed }: { seed: number }) {
  return (
    <img 
      src={`https://api.dicebear.com/7.x/notionists/svg?seed=${seed}&backgroundColor=transparent`} 
      alt="User" 
      className="w-full h-full object-cover"
    />
  )
}
