import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { ArrowLeft, CheckCircle2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { BenefitsAccordion } from '../../passes/[slug]/BenefitsAccordion'
import { generateQR } from '@/lib/qr'

export default async function ActiveQRPage({ params }: { params: { id: string } }) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user && params.id !== 'test') redirect('/login?redirect=/wallet')

  let userPassData: any = null

  if (params.id === 'test') {
    userPassData = {
      id: 'test',
      user_id: 'test-user',
      activo: true,
      codigo_unico: 'TEST-1234',
      qr_url: '',
      passes: {
        id: 'test-pass',
        nombre: 'Pass de Prueba',
        descripcion: 'Este es un pass de prueba',
        color_brand: '#3b82f6',
        color_brand_end: '#1d4ed8',
        benefits: []
      },
      benefit_uses: []
    }
  } else {
    const { data } = await supabase
      .from('user_passes')
      .select(`
        *,
        passes (
          *,
          benefits (*)
        ),
        benefit_uses (*)
      `)
      .eq('id', params.id)
      .eq('user_id', user?.id)
      .single()
    userPassData = data
  }

  if (!userPassData) notFound()

  const userPass = userPassData as any
  const pass = userPass.passes
  const isExpired = !userPass.activo

  const gradientStyle = {
    background: `linear-gradient(135deg, ${pass.color_brand_end || pass.color_brand}, ${pass.color_brand})`
  }

  const qrBase64 = await generateQR(userPass.codigo_unico)

  return (
    <div className="min-h-screen bg-pf-bg">
      <nav className="absolute top-0 w-full p-4 z-20 flex items-center justify-between safe-top">
        <Link href="/wallet" className="w-10 h-10 rounded-full bg-black/20 backdrop-blur-md flex items-center justify-center text-white">
          <ArrowLeft size={20} />
        </Link>
      </nav>

      {/* QR Code Prominent View */}
      <section 
        className="relative pt-24 pb-12 px-6 flex flex-col items-center justify-center min-h-[60vh] rounded-b-[40px] shadow-pf-float" 
        style={gradientStyle}
      >
        <div className="absolute inset-0 opacity-10 mix-blend-overlay bg-[url('https://www.transparenttextures.com/patterns/stardust.png')]" />

        <div className="relative z-10 w-full max-w-[320px] animate-slide-up flex flex-col items-center">
          <h1 className="pf-display text-3xl mb-1 text-white text-center tracking-tight">{pass.nombre}</h1>
          <p className="text-white/80 text-sm font-medium mb-8">
            Muéstrale este código al cajero
          </p>

          <div className="bg-white p-4 rounded-[32px] shadow-pf-glow relative isolate w-[280px] h-[280px] flex items-center justify-center">
             {/* Glow decorativo detrás del QR blanco */}
             <div className="absolute inset-0 bg-white/50 blur-xl -z-10 rounded-full" />
             
             {isExpired ? (
               <div className="text-center p-6 text-pf-on-surface">
                 <div className="w-16 h-16 bg-pf-surface-high rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">⚠️</span>
                 </div>
                 <h3 className="font-bold text-lg mb-2">Pass inactivo</h3>
                 <p className="text-sm text-pf-on-surface-var tracking-tight">Este Pass ha expirado o se ha agotado.</p>
               </div>
             ) : (
               <img 
                 src={qrBase64} 
                 alt="QR Code" 
                 width={240} 
                 height={240} 
                 className="w-full h-full object-contain bg-white rounded-xl"
               />
             )}
          </div>

          <div className="mt-8 text-center bg-black/20 backdrop-blur-md px-6 py-3 rounded-full">
            <p className="text-[10px] text-white/70 uppercase tracking-widest font-semibold mb-1">Tu Código Único</p>
            <p className="pf-mono text-2xl font-bold text-white tracking-[0.2em]" style={{ fontFamily: "'JetBrains Mono', monospace" }}>{userPass.codigo_unico}</p>
          </div>
        </div>
      </section>

      {/* Beneficios Restantes */}
      <main className="px-6 py-8 pb-32">
        <h2 className="pf-headline text-xl mb-6 flex items-center justify-between">
          <span>Beneficios Restantes</span>
          <span className="bg-pf-surface-high text-xs px-2 py-1 rounded-md text-pf-on-surface-var">Ciclo Actual</span>
        </h2>

        <div className="grid gap-3 mb-10">
          {userPass.benefit_uses.map((use: any) => {
            const benefit = pass.benefits.find((b: any) => b.id === use.benefit_id)
            if (!benefit) return null
            
            const isUnlimited = benefit.usos_totales === 999
            const isEmpty = !isUnlimited && use.usos_restantes <= 0

            return (
              <div key={use.id} className={`pf-card p-4 border flex items-center gap-4 ${isEmpty ? 'opacity-50 border-pf-surface-highest grayscale' : 'border-pf-outline-var/30'}`}>
                <div className="w-12 h-12 bg-pf-surface-high rounded-full flex items-center justify-center text-xl shrink-0">
                  {benefit.icono}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-sm truncate">{benefit.descripcion}</h3>
                  <p className="text-xs text-pf-on-surface-var mt-0.5 uppercase tracking-wider font-medium">
                    {benefit.tipo}
                  </p>
                </div>
                <div className="shrink-0 text-right">
                  {isUnlimited ? (
                    <div className="text-pf-primary-ctn font-bold bg-pf-primary-ctn/10 px-2 py-1 rounded">
                      ILIMITADO
                    </div>
                  ) : (
                    <div className="flex flex-col items-end">
                      <span className={`text-xl font-bold font-mono leading-none ${isEmpty ? 'text-pf-error/70' : 'text-pf-primary'}`}>
                        {use.usos_restantes}
                      </span>
                      <span className="text-[10px] text-pf-on-surface-var mt-1">de {benefit.usos_totales}</span>
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>

        {/* Info Legal */}
        <section className="text-center pt-8 border-t border-pf-surface-highest">
          <p className="text-xs text-pf-on-surface-var">
            Válido en sucursales participantes. Aplican términos y condiciones.
          </p>
        </section>
      </main>

    </div>
  )
}
