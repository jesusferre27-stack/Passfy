import Link from 'next/link'
import { Sparkles } from 'lucide-react'
import { type Pass } from '@/lib/types'
import { formatMXNShort } from '@/lib/utils'
import { Badge } from '@/components/ui/Badge'

interface PassCardProps {
  pass: Pass
  isPopular?: boolean
  className?: string
}

export function PassCard({ pass, isPopular, className }: PassCardProps) {
  // Use custom gradient from pass
  const gradientStyle = {
    background: `linear-gradient(135deg, ${pass.color_brand_end || pass.color_brand}, ${pass.color_brand})`
  }

  // Count benefits
  const benefitCount = pass.benefits?.length || 0

  return (
    <Link href={`/passes/${pass.slug}`} className={`block group ${className || ''}`}>
      <div 
        className="relative w-full rounded-pf-lg p-5 overflow-hidden text-white shadow-pf-float transition-transform duration-300 group-hover:scale-[1.02] group-active:scale-100"
        style={gradientStyle}
      >
        {/* Subtle texture/noise overlay */}
        <div className="absolute inset-0 opacity-10 mix-blend-overlay bg-[url('https://www.transparenttextures.com/patterns/stardust.png')]" />
        
        {/* Glass effect on top right corner */}
        <div className="absolute -top-12 -right-12 w-32 h-32 rounded-full bg-white/10 blur-2xl" />

        <div className="relative z-10 flex flex-col h-full justify-between min-h-[140px]">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="pf-display text-xl tracking-tight mb-1">{pass.nombre}</h3>
              <p className="text-white/80 text-xs font-medium">{benefitCount} beneficios incluidos</p>
            </div>
            {isPopular ? (
              <Badge variant="popular" className="shadow-pf-amber">POPULAR</Badge>
            ) : (
              <div className="bg-white/20 backdrop-blur-md p-2 rounded-full">
                <Sparkles size={16} className="text-white" />
              </div>
            )}
          </div>

          <div className="mt-8 flex justify-between items-end">
            <div>
              <div className="text-xs text-white/70 mb-1 uppercase tracking-wider font-semibold">Mensualidad</div>
              <div className="pf-mono text-2xl font-bold tracking-tight">
                {formatMXNShort(pass.precio)}
                <span className="text-sm font-normal text-white/70">/mes</span>
              </div>
            </div>
            
            <div className="bg-pf-surface/20 backdrop-blur-md px-3 py-1.5 rounded-full text-xs font-semibold">
              Ver detalle →
            </div>
          </div>
        </div>
      </div>
    </Link>
  )
}

export function PassCardSkeleton() {
  return (
    <div className="w-full h-[160px] rounded-pf-lg pf-skeleton" />
  )
}
