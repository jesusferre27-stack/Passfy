'use client'

import * as React from 'react'
import { ChevronDown } from 'lucide-react'
import { type Benefit } from '@/lib/types'

export function BenefitsAccordion({ benefits }: { benefits: Benefit[] }) {
  const [openId, setOpenId] = React.useState<string | null>(benefits.length > 0 ? benefits[0].id : null)

  return (
    <div className="flex flex-col gap-3">
      {benefits.map((benefit) => {
        const isOpen = openId === benefit.id
        
        return (
          <div 
            key={benefit.id} 
            className={`pf-card transition-all duration-300 border ${
              isOpen ? 'border-pf-primary-ctn/50 bg-pf-surface-highest' : 'border-pf-outline-var/30 hover:border-pf-outline-var/60'
            }`}
          >
            <button
              onClick={() => setOpenId(isOpen ? null : benefit.id)}
              className="w-full text-left p-4 flex items-center justify-between"
            >
              <div className="flex items-center gap-4">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg ${
                  isOpen ? 'bg-pf-primary-ctn/20 text-pf-primary-ctn' : 'bg-pf-surface-high text-pf-on-surface-var'
                }`}>
                  {benefit.icono}
                </div>
                <div>
                  <h3 className={`font-semibold text-sm transition-colors ${isOpen ? 'text-pf-primary' : 'text-pf-on-surface'}`}>
                    {benefit.tipo === 'descuento' ? 'Descuento Especial' : 
                     benefit.tipo === 'gratis' ? 'Beneficio Gratuito' : 
                     benefit.tipo === 'clase' ? 'Clase Incluida' : 
                     'Beneficio Extra'}
                  </h3>
                  <p className="text-xs text-pf-on-surface-var font-medium uppercase tracking-wider mt-0.5">
                    {benefit.usos_totales === 999 ? 'Ilimitado' : `${benefit.usos_totales} usos por ciclo`}
                  </p>
                </div>
              </div>
              
              <ChevronDown 
                size={20} 
                className={`text-pf-on-surface-var transition-transform duration-300 ${isOpen ? 'rotate-180 text-pf-primary-ctn' : ''}`} 
              />
            </button>
            
            <div 
              className={`overflow-hidden transition-all duration-300 ease-in-out ${
                isOpen ? 'max-h-40 opacity-100' : 'max-h-0 opacity-0'
              }`}
            >
              <div className="px-4 pb-4 pt-1 ml-[56px] text-sm text-pf-on-surface-var leading-relaxed font-medium">
                {benefit.descripcion}
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
