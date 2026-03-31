'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { Loader2 } from 'lucide-react'

export default function PassToggle({ passId, activo }: { passId: string; activo: boolean }) {
  const [isActive, setIsActive] = useState(activo)
  const [isLoading, setIsLoading] = useState(false)

  const toggle = async () => {
    setIsLoading(true)
    const supabase = createClient()
    
    // El RLS normal no dejaría a un usuario cualquiera actualizar 'passes'.
    // Como esto es un Client Component, DEBEMOS llamar a un API route o Server Action
    // protegido por Rol de Admin o usar el Admin Client si fuera una accion de servidor.
    // Para no complicarlo mucho y mantener bypass RLS, llamaremos a una API o haremos Server Action.
    
    try {
      const res = await fetch(`/api/admin/passes/toggle`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ passId, activo: !isActive }),
      })

      if (!res.ok) throw new Error('Error al actualizar el estado')
      
      setIsActive(!isActive)
      toast.success(isActive ? 'Pass desactivado' : 'Pass activado')
    } catch (error) {
      console.error(error)
      toast.error('Ocurrió un error')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <button
      onClick={toggle}
      disabled={isLoading}
      className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer items-center justify-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-[#ff535b] focus:ring-offset-2 focus:ring-offset-[#13131b] ${
        isActive ? 'bg-[#30a193]' : 'bg-[#1e1e28]'
      }`}
    >
      <span className="sr-only">Cambiar estado del pass</span>
      {isLoading ? (
        <Loader2 className="w-3 h-3 animate-spin text-white absolute" />
      ) : (
        <span
          aria-hidden="true"
          className={`pointer-events-none absolute left-0 inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition-transform duration-200 ease-in-out ${
            isActive ? 'translate-x-4' : 'translate-x-0.5'
          }`}
        />
      )}
    </button>
  )
}
