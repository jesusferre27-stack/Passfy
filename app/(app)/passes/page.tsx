import { createClient } from '@/lib/supabase/server'
import { CatalogClient } from './CatalogClient'
import { type Pass } from '@/lib/types'
import { WelcomeCarousel } from '@/components/WelcomeCarousel'

export default async function PassesPage() {
  const supabase = await createClient()

  // Fetch passes and their benefits
  const { data: passes, error } = await supabase
    .from('passes')
    .select(`
      *,
      benefits (
        id, descripcion, usos_totales, tipo, icono
      )
    `)
    .eq('activo', true)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching passes:', error)
  }

  // Cast
  const typedPasses = (passes || []) as Pass[]

  return (
    <div className="min-h-screen bg-pf-bg pt-safe pb-24">
      <header className="px-6 pt-8 pb-4 sticky top-0 bg-pf-bg/80 backdrop-blur-xl z-40 border-b border-pf-outline-var/20">
        <h1 className="pf-display text-3xl mb-2 text-white">Explorar</h1>
        <p className="text-pf-on-surface-var text-sm font-medium">Encuentra el pass perfecto para ti.</p>
      </header>
      
      <main className="px-6 py-6">
        <WelcomeCarousel />
        <CatalogClient initialPasses={typedPasses} />
      </main>
    </div>
  )
}
