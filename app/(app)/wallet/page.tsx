import Link from 'next/link'
import { redirect } from 'next/navigation'
import { QrCode, Search } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { type UserPass } from '@/lib/types'
import { generateQR } from '@/lib/qr'

export const metadata = { title: 'Mi Wallet' }

export default async function WalletPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect('/login?redirect=/wallet')
  }

  // Obtener pases activos del usuario
  const { data: userPasses } = await supabase
    .from('user_passes')
    .select(`
      id, activo, codigo_unico, fecha_compra,
      passes (
        id, nombre, descripcion, color_brand, color_brand_end,
        benefits (id)
      )
    `)
    .eq('user_id', user.id)
    .order('fecha_compra', { ascending: false })

  const activePasses = userPasses?.filter(up => up.activo) || []
  const pastPasses = userPasses?.filter(up => !up.activo) || []

  return (
    <div className="min-h-screen bg-pf-bg pt-safe pb-24">
      <header className="px-6 pt-8 pb-4 sticky top-0 bg-pf-bg/80 backdrop-blur-xl z-10 border-b border-pf-outline-var/20 flex items-center justify-between">
        <div>
          <h1 className="pf-display text-3xl mb-2 text-white">Mi Wallet</h1>
          <p className="text-pf-on-surface-var text-sm font-medium">Tus pases activos y beneficios listos para usar.</p>
        </div>
        <Link href="/passes" className="bg-pf-primary-ctn/10 text-pf-primary-ctn hover:bg-pf-primary-ctn/20 px-4 py-2 rounded-full text-sm font-bold transition-colors">
          + Nuevo
        </Link>
      </header>

      <main className="px-6 py-6">
        {activePasses.length === 0 ? (
          <div className="text-center py-12 px-6 pf-card border border-pf-surface-high border-dashed mt-4">
            <div className="w-16 h-16 bg-pf-surface-high rounded-full flex items-center justify-center mx-auto mb-4">
              <QrCode className="h-8 w-8 text-pf-on-surface-var" />
            </div>
            <h3 className="pf-title text-lg mb-2">Aún no tienes Passes</h3>
            <p className="text-sm text-pf-on-surface-var text-pretty mb-6">
              Explora el catálogo y adquiere un pass para empezar a disfrutar de beneficios.
            </p>
            <Link href="/passes" className="inline-flex bg-white text-black font-semibold rounded-full px-6 py-3">
              Explorar Catálogo
            </Link>
          </div>
        ) : (
          <div className="grid gap-5">
            {activePasses.map((up) => (
              <WalletCard key={up.id} userPass={up} />
            ))}
          </div>
        )}

        {/* Historial o inactivos */}
        {pastPasses.length > 0 && (
          <div className="mt-12">
            <h3 className="pf-headline text-lg mb-4 text-pf-on-surface-var">Historial</h3>
            <div className="grid gap-4 opacity-60 grayscale filter">
               {pastPasses.map((up) => (
                <WalletCard key={up.id} userPass={up} disabled />
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  )
}

async function WalletCard({ userPass, disabled }: { userPass: any, disabled?: boolean }) {
  const pass = userPass.passes
  const gradientStyle = {
    background: `linear-gradient(135deg, ${pass.color_brand_end || pass.color_brand}, ${pass.color_brand})`
  }
  const qrBase64 = disabled ? '' : await generateQR(userPass.codigo_unico)

  return (
    <Link href={disabled ? '#' : `/wallet/${userPass.id}`} className={`block group ${disabled ? 'pointer-events-none' : ''}`}>
      <div 
        className="relative w-full rounded-pf-lg p-5 overflow-hidden text-white shadow-pf-float transition-transform duration-300 group-hover:scale-[1.02]"
        style={gradientStyle}
      >
        <div className="absolute inset-0 opacity-10 mix-blend-overlay bg-[url('https://www.transparenttextures.com/patterns/stardust.png')]" />
        
        <div className="relative z-10 flex flex-col h-full justify-between min-h-[160px]">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="pf-display text-2xl tracking-tight mb-1">{pass.nombre}</h3>
              <p className="text-white/80 text-xs font-medium uppercase tracking-wider">{userPass.codigo_unico}</p>
            </div>
            
            <div className="bg-white/90 backdrop-blur-md p-1 rounded-xl shadow-sm overflow-hidden flex items-center justify-center w-12 h-12">
              {disabled ? (
                <QrCode size={24} className="text-black/50" />
              ) : (
                <img src={qrBase64} alt="QR" className="w-full h-full object-contain" />
              )}
            </div>
          </div>

          <div className="mt-6 flex justify-between items-end">
            <div>
              <div className="text-xs text-white/70 mb-1 uppercase tracking-wider font-semibold">Estado</div>
              <div className="font-semibold text-sm">
                {disabled ? 'Expirado / Inactivo' : 'Activo y listo'}
              </div>
            </div>
            
            {!disabled && (
              <div className="bg-white text-black px-4 py-2 rounded-full text-xs font-bold shadow-pf-glow animate-pulse">
                Tocar para usar
              </div>
            )}
          </div>
        </div>
      </div>
    </Link>
  )
}
