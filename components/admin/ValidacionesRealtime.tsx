'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Clock } from 'lucide-react'

const ICONS = ['🏋️', '🎬', '☕', '💪', '💧', '🍔', '🎭', '🍕']

type Validation = {
  id: string
  fecha_uso: string
  comercio?: string
  pass_nombre?: string
}

export default function ValidacionesRealtime({ initial }: { initial: Validation[] }) {
  const [validations, setValidations] = useState<Validation[]>(initial)

  useEffect(() => {
    const supabase = createClient()

    const channel = supabase
      .channel('benefit_uses_realtime')
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'benefit_uses' },
        async (payload) => {
          if (!payload.new.fecha_uso) return

          // Fetch comercio info
          const { data: benefitData } = await supabase
            .from('benefit_uses')
            .select('fecha_uso, merchants(nombre), benefits(nombre)')
            .eq('id', payload.new.id)
            .single()

          const newItem: Validation = {
            id: payload.new.id,
            fecha_uso: payload.new.fecha_uso,
            comercio: (benefitData?.merchants as any)?.nombre || 'Comercio',
            pass_nombre: (benefitData?.benefits as any)?.nombre || 'Beneficio',
          }

          setValidations(prev => [newItem, ...prev.slice(0, 4)])
        }
      )
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [])

  const timeAgo = (fecha: string) => {
    const diffMs = Date.now() - new Date(fecha).getTime()
    const mins = Math.floor(diffMs / 60000)
    if (mins < 1) return 'Ahora'
    if (mins < 60) return `Hace ${mins} min`
    const hrs = Math.floor(mins / 60)
    return `Hace ${hrs}h`
  }

  return (
    <div className="bg-[#13131b] rounded-2xl border border-[#1e1e28] overflow-hidden">
      <div className="px-5 py-4 border-b border-[#1e1e28] flex items-center justify-between">
        <div>
          <h3 className="font-semibold text-[#e4e1ed] text-sm">Validaciones recientes</h3>
          <p className="text-[10px] text-[#e4bebc] flex items-center gap-1 mt-0.5">
            <span className="w-1.5 h-1.5 rounded-full bg-[#30a193] inline-block animate-pulse" />
            Tiempo real
          </p>
        </div>
      </div>
      <div className="divide-y divide-[#1e1e28]">
        {validations.length === 0 ? (
          <p className="p-6 text-center text-[#e4bebc]/50 text-sm">Sin validaciones recientes</p>
        ) : validations.map((v, i) => (
          <div key={v.id} className="px-5 py-3.5 flex items-center gap-3 hover:bg-[#1a1a23] transition-colors">
            <div className="w-8 h-8 rounded-xl bg-[#1e1e28] flex items-center justify-center text-sm shrink-0">
              {ICONS[i % ICONS.length]}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-[#e4e1ed] truncate">{v.comercio || 'Comercio'}</p>
              <p className="text-[10px] text-[#e4bebc] truncate">{v.pass_nombre || 'Beneficio validado'}</p>
            </div>
            <div className="flex items-center gap-1 text-[10px] text-[#e4bebc] shrink-0">
              <Clock size={9} />
              {v.fecha_uso ? timeAgo(v.fecha_uso) : '—'}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
