'use client'

import * as React from 'react'
import { CheckCircle2, QrCode, XCircle } from 'lucide-react'
import { toast } from 'sonner'
import { Scanner } from '@/components/features/Scanner'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'

type ScanState = 'SCANNING' | 'LOADING' | 'SELECT_BENEFIT' | 'SUCCESS' | 'ERROR'

export default function ValidationPage() {
  const [state, setState] = React.useState<ScanState>('SCANNING')
  const [code, setCode] = React.useState('')
  const [passData, setPassData] = React.useState<any>(null)
  const [errorMsg, setErrorMsg] = React.useState('')
  const [selectedBenefitId, setSelectedBenefitId] = React.useState<string | null>(null)
  const [pin, setPin] = React.useState('')

  const handleScan = async (decodedText: string) => {
    setCode(decodedText)
    setState('LOADING')
    
    // Buscar pass
    try {
      const res = await fetch(`/api/validate?code=${decodedText}`)
      const data = await res.json()
      
      if (!res.ok) throw new Error(data.error || 'Código inválido')
      
      setPassData(data.userPass)
      setState('SELECT_BENEFIT')
      
      // Sonido de escaneo exitoso (beep)
      const beep = new Audio('data:audio/wav;base64,UklGRl9vT19XQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YU') // Mock
      beep.volume = 0.2
      beep.play().catch(() => {})
    } catch (err: any) {
      setErrorMsg(err.message)
      setState('ERROR')
    }
  }

  const handleRedeem = async (benefitUseId: string) => {
    setState('LOADING')
    try {
      const res = await fetch('/api/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ benefitUseId, code, pin })
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      
      setState('SUCCESS')
      setSelectedBenefitId(null)
      setPin('')
      toast.success('Beneficio canjeado exitosamente')
    } catch (err: any) {
      setErrorMsg(err.message)
      setState('ERROR')
      setSelectedBenefitId(null)
      setPin('')
    }
  }

  const reset = () => {
    setState('SCANNING')
    setCode('')
    setPassData(null)
  }

  return (
    <div className="min-h-screen bg-pf-bg pt-safe pb-24 flex flex-col">
      <header className="px-6 pt-8 pb-4 sticky top-0 bg-pf-bg/80 backdrop-blur-xl z-10 border-b border-pf-outline-var/20">
        <h1 className="pf-display text-3xl mb-2 text-white">Validar Pass</h1>
        <p className="text-pf-on-surface-var text-sm font-medium">Escanea el código QR del cliente.</p>
      </header>

      <main className="flex-1 px-6 py-8 flex flex-col max-w-md mx-auto w-full">
        {state === 'SCANNING' && (
          <div className="flex-1 flex flex-col animate-fade-in">
            <Scanner onScan={handleScan} />
            
            <div className="mt-12">
              <div className="flex items-center gap-4 mb-4">
                <hr className="flex-1 border-pf-surface-highest" />
                <span className="text-xs text-pf-on-surface-var uppercase tracking-wider font-semibold">O Ingreso Manual</span>
                <hr className="flex-1 border-pf-surface-highest" />
              </div>
              <div className="flex gap-2">
                <Input 
                  placeholder="Ej: BUR-1A2B-3C4D" 
                  value={code} 
                  onChange={(e) => setCode(e.target.value)}
                  className="font-mono uppercase text-center tracking-widest"
                />
                <Button onClick={() => handleScan(code)} disabled={!code || code.length < 5}>Buscar</Button>
              </div>
            </div>
          </div>
        )}

        {state === 'LOADING' && (
          <div className="flex-1 flex flex-col items-center justify-center">
            <div className="w-12 h-12 border-4 border-pf-surface-high border-t-pf-primary-ctn rounded-full animate-spin mb-4" />
            <p className="text-pf-on-surface-var">Procesando código...</p>
          </div>
        )}

        {state === 'ERROR' && (
          <div className="flex-1 flex flex-col items-center justify-center text-center animate-fade-in">
            <XCircle className="w-16 h-16 text-pf-error-ctn mb-4" />
            <h2 className="pf-headline text-2xl mb-2 text-white">Error de Validación</h2>
            <p className="text-pf-on-surface-var mb-8">{errorMsg}</p>
            <Button onClick={reset} className="w-full">Volver a Escanear</Button>
          </div>
        )}

        {state === 'SUCCESS' && (
          <div className="flex-1 flex flex-col items-center justify-center text-center animate-fade-in">
             <div className="w-20 h-20 bg-pf-secondary-ctn/20 rounded-full flex items-center justify-center mb-6 shadow-pf-glow relative">
              <div className="absolute inset-0 bg-pf-secondary-ctn rounded-full animate-ping opacity-20" />
              <CheckCircle2 className="text-pf-secondary-ctn w-10 h-10 relative z-10" />
            </div>
            <h2 className="pf-headline text-2xl mb-2 text-white">Canje Exitoso</h2>
            <p className="text-pf-on-surface-var mb-8">El beneficio ha sido registrado válidamente.</p>
            <Button onClick={reset} className="w-full" variant="secondary">Escanear Siguiente</Button>
          </div>
        )}

        {state === 'SELECT_BENEFIT' && passData && (
          <div className="flex-1 flex flex-col animate-fade-in">
            <h2 className="pf-headline text-2xl mb-1 text-white">{passData.passes.nombre}</h2>
            <p className="text-sm font-mono text-pf-on-surface-var tracking-wider mb-6">Cód: {passData.codigo_unico}</p>
            
            <p className="font-semibold mb-3">Seleccionar beneficio a canjear:</p>
            
            <div className="space-y-3 flex-1 overflow-y-auto pr-2 custom-scrollbar">
              {passData.benefit_uses.map((use: any) => {
                const benefit = passData.passes.benefits.find((b:any) => b.id === use.benefit_id)
                const isEmpty = benefit.usos_totales !== 999 && use.usos_restantes <= 0
                
                return (
                  <button 
                    key={use.id} 
                    disabled={isEmpty}
                    onClick={() => setSelectedBenefitId(use.id)}
                    className={`w-full text-left p-4 rounded-xl border flex items-center justify-between transition-colors
                      ${isEmpty ? 'bg-pf-surface-low border-pf-surface opacity-50 cursor-not-allowed grayscale' 
                                : 'bg-pf-surface border-pf-surface-high hover:border-pf-primary-ctn hover:bg-pf-surface-top active:scale-[0.98]'}`}
                  >
                    <div>
                      <h3 className="font-semibold text-sm mb-1">{benefit.descripcion}</h3>
                      <p className="text-xs text-pf-on-surface-var">
                        {benefit.usos_totales === 999 ? 'Ilimitado' : `Restan: ${use.usos_restantes} usos`}
                      </p>
                    </div>
                    {!isEmpty && (
                      <div className="bg-pf-primary-ctn/20 text-pf-primary-ctn px-3 py-1.5 rounded-full text-xs font-bold">
                        Canjear
                      </div>
                    )}
                  </button>
                )
              })}
            </div>
            
            <Button onClick={reset} variant="ghost" className="mt-6">Cancelar</Button>
          </div>
        )}

        {/* Modal para PIN */}
        {selectedBenefitId && (
          <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-6 z-50 animate-fade-in backdrop-blur-sm">
            <div className="bg-pf-surface p-6 rounded-2xl w-full max-w-sm border border-pf-surface-high shadow-2xl">
              <h3 className="text-lg font-bold mb-2">PIN de Autorización</h3>
              <p className="text-sm text-pf-on-surface-var mb-6">Ingresa tu PIN de comercio para validar y descontar este beneficio.</p>
              
              <Input
                type="password"
                value={pin}
                onChange={e => setPin(e.target.value)}
                placeholder="****"
                className="mb-6 text-center tracking-[0.5em] text-2xl font-mono h-14"
                maxLength={4}
                autoFocus
              />
              
              <div className="flex gap-3">
                <Button 
                  variant="ghost" 
                  onClick={() => { setSelectedBenefitId(null); setPin(''); }} 
                  className="flex-1"
                >
                  Cancelar
                </Button>
                <Button 
                  onClick={() => handleRedeem(selectedBenefitId)} 
                  disabled={pin.length < 4 || state === 'LOADING'} 
                  className="flex-1"
                >
                  Confirmar
                </Button>
              </div>
            </div>
          </div>
        )}

      </main>
    </div>
  )
}
