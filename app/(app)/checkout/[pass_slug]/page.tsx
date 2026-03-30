import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { type Pass } from '@/lib/types'
import { CheckoutFlow } from './CheckoutFlow'

export async function generateMetadata({ params }: { params: { pass_slug: string } }) {
  const supabase = await createClient()
  const { data: pass } = await supabase.from('passes').select('nombre').eq('slug', params.pass_slug).single()
  
  if (!pass) return { title: 'Checkout' }
  return { title: `Checkout — ${pass.nombre}` }
}

export default async function CheckoutPage({ params }: { params: { pass_slug: string } }) {
  const supabase = await createClient()
  
  // Obtener data del pass
  const { data: passData } = await supabase
    .from('passes')
    .select(`
      *,
      benefits (
        id, descripcion, usos_totales, tipo, icono
      )
    `)
    .eq('slug', params.pass_slug)
    .single()

  if (!passData) notFound()
  const pass = passData as Pass

  return (
    <div className="min-h-screen bg-pf-bg pt-safe pb-24 flex flex-col">
      <CheckoutFlow pass={pass} />
    </div>
  )
}
