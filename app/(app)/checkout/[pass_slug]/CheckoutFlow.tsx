'use client'

import * as React from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, CreditCard, ReceiptText, Landmark, Loader2, CheckCircle2 } from 'lucide-react'
import { toast } from 'sonner'
import { type Pass } from '@/lib/types'
import { formatMXN } from '@/lib/utils'
import { Button } from '@/components/ui/Button'
import { PassCard } from '@/components/ui/PassCard'
import { initMercadoPago, Payment } from '@mercadopago/sdk-react'

initMercadoPago(process.env.NEXT_PUBLIC_MERCADOPAGO_PUBLIC_KEY!, { locale: 'es-MX' })

type Step = 1 | 2 | 3
type PaymentMethodId = 'tarjeta' | 'oxxo' | 'spei'

export function CheckoutFlow({ pass }: { pass: Pass }) {
  const router = useRouter()
  const [step, setStep] = React.useState<Step>(1)
  const [paymentMethod, setPaymentMethod] = React.useState<PaymentMethodId>('tarjeta')
  const [isProcessing, setIsProcessing] = React.useState(false)
  const [generatedCode, setGeneratedCode] = React.useState<string | null>(null)
  const [qrBase64, setQrBase64] = React.useState<string | null>(null)

  return (
    <div className="flex flex-col flex-1">
      {/* Header */}
      <header className="px-6 pt-6 pb-2 safe-top bg-pf-bg sticky top-0 z-10 flex items-center">
        {step < 3 && (
          <button onClick={() => step === 2 ? setStep(1) : router.back()} className="mr-4 text-pf-on-surface-var hover:text-white">
            <ArrowLeft size={24} />
          </button>
        )}
        <div className="flex-1">
          <h1 className="pf-headline text-xl">Checkout</h1>
          {step < 3 && (
            <div className="flex items-center gap-2 mt-2">
              <div className={`h-1.5 flex-1 rounded-full ${step >= 1 ? 'bg-pf-primary-ctn' : 'bg-pf-surface-high'}`} />
              <div className={`h-1.5 flex-1 rounded-full ${step >= 2 ? 'bg-pf-primary-ctn' : 'bg-pf-surface-high'}`} />
              <div className={`h-1.5 flex-1 rounded-full ${step >= 3 ? 'bg-pf-primary-ctn' : 'bg-pf-surface-high'}`} />
            </div>
          )}
        </div>
      </header>

      <main className="flex-1 px-6 py-4 flex flex-col justify-between">
        
        {/* PASO 1: RESUMEN */}
        {step === 1 && (
          <div className="animate-fade-in space-y-6">
            <h2 className="text-lg font-semibold mb-4">Resumen de tu pedido</h2>
            <PassCard pass={pass} className="pointer-events-none" />
            
            <div className="pf-card p-5 border border-pf-surface-high space-y-3">
              <div className="flex justify-between text-sm text-pf-on-surface-var">
                <span>Pass</span>
                <span className="text-pf-on-surface font-medium">{pass.nombre}</span>
              </div>
              <div className="flex justify-between text-sm text-pf-on-surface-var">
                <span>Beneficios</span>
                <span className="text-pf-on-surface font-medium">{pass.benefits?.length || 0} incluidos</span>
              </div>
              <div className="flex justify-between text-sm text-pf-on-surface-var">
                <span>Válido por</span>
                <span className="text-pf-on-surface font-medium">1 año</span>
              </div>
              
              <div className="pf-separator my-2" />
              
              <div className="flex justify-between items-center pt-2">
                <span className="font-semibold text-lg">Total a pagar</span>
                <span className="pf-mono font-bold text-xl text-pf-primary">{formatMXN(pass.precio)}</span>
              </div>
            </div>

            <Button onClick={() => setStep(2)} className="w-full mt-6 shadow-pf-glow">
              Continuar al pago
            </Button>
          </div>
        )}

        {/* PASO 2: PAGO */}
        {step === 2 && (
          <div className="animate-fade-in flex flex-col h-full space-y-6">
            <h2 className="text-lg font-semibold mb-2">Método de pago</h2>
            
            <div className="space-y-3">
              {/* Tarjeta */}
              <button 
                onClick={() => setPaymentMethod('tarjeta')}
                className={`w-full pf-card p-4 border transition-colors flex items-center justify-between ${
                  paymentMethod === 'tarjeta' ? 'border-pf-primary-ctn bg-pf-surface-highest' : 'border-pf-surface-high'
                }`}
              >
                <div className="flex items-center gap-4">
                  <div className={`p-2 rounded-lg ${paymentMethod === 'tarjeta' ? 'bg-pf-primary-ctn/20 text-pf-primary-ctn' : 'bg-pf-surface-low text-pf-on-surface-var'}`}>
                    <CreditCard size={20} />
                  </div>
                  <div className="text-left">
                    <div className="font-semibold text-sm">Tarjeta Débito/Crédito</div>
                    <div className="text-xs text-pf-on-surface-var">Inmediato</div>
                  </div>
                </div>
                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${paymentMethod === 'tarjeta' ? 'border-pf-primary-ctn' : 'border-pf-on-surface-var'}`}>
                  {paymentMethod === 'tarjeta' && <div className="w-2.5 h-2.5 rounded-full bg-pf-primary-ctn" />}
                </div>
              </button>

              {/* OXXO */}
              <button 
                onClick={() => setPaymentMethod('oxxo')}
                className={`w-full pf-card p-4 border transition-colors flex items-center justify-between ${
                  paymentMethod === 'oxxo' ? 'border-pf-primary-ctn bg-pf-surface-highest' : 'border-pf-surface-high'
                }`}
              >
                <div className="flex items-center gap-4">
                  <div className={`p-2 rounded-lg ${paymentMethod === 'oxxo' ? 'bg-pf-primary-ctn/20 text-pf-primary-ctn' : 'bg-pf-surface-low text-pf-on-surface-var'}`}>
                    <ReceiptText size={20} />
                  </div>
                  <div className="text-left">
                    <div className="font-semibold text-sm">Efectivo (OXXO)</div>
                    <div className="text-xs text-pf-on-surface-var">Hasta 1 hora</div>
                  </div>
                </div>
                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${paymentMethod === 'oxxo' ? 'border-pf-primary-ctn' : 'border-pf-on-surface-var'}`}>
                  {paymentMethod === 'oxxo' && <div className="w-2.5 h-2.5 rounded-full bg-pf-primary-ctn" />}
                </div>
              </button>

              {/* SPEI */}
              <button 
                onClick={() => setPaymentMethod('spei')}
                className={`w-full pf-card p-4 border transition-colors flex items-center justify-between ${
                  paymentMethod === 'spei' ? 'border-pf-primary-ctn bg-pf-surface-highest' : 'border-pf-surface-high'
                }`}
              >
                <div className="flex items-center gap-4">
                  <div className={`p-2 rounded-lg ${paymentMethod === 'spei' ? 'bg-pf-primary-ctn/20 text-pf-primary-ctn' : 'bg-pf-surface-low text-pf-on-surface-var'}`}>
                    <Landmark size={20} />
                  </div>
                  <div className="text-left">
                    <div className="font-semibold text-sm">Transferencia SPEI</div>
                    <div className="text-xs text-pf-on-surface-var">En minutos</div>
                  </div>
                </div>
                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${paymentMethod === 'spei' ? 'border-pf-primary-ctn' : 'border-pf-on-surface-var'}`}>
                  {paymentMethod === 'spei' && <div className="w-2.5 h-2.5 rounded-full bg-pf-primary-ctn" />}
                </div>
              </button>
            </div>

            {/* MercadoPago Form */}
            <div className="mt-4 p-4 rounded-xl bg-pf-surface-highest border border-pf-surface-high border-dashed">
              <Payment
                initialization={{ amount: pass.precio }}
                customization={{
                  visual: {
                    style: {
                      theme: 'dark'
                    }
                  },
                  paymentMethods: (() => {
                    const methods: any = { maxInstallments: 1 }
                    if (paymentMethod === 'tarjeta') {
                      methods.creditCard = 'all'
                      methods.debitCard = 'all'
                    } else if (paymentMethod === 'oxxo') {
                      methods.ticket = 'all'
                    } else if (paymentMethod === 'spei') {
                      methods.bankTransfer = 'all'
                    }
                    return methods
                  })()
                }}
                onSubmit={async (param: any) => {
                  setIsProcessing(true)
                  try {
                    const formData = param.formData || param; // Compatibilidad con docs
                    const res = await fetch('/api/mercadopago/process', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ passId: pass.id, passSlug: pass.slug, paymentData: formData })
                    })
                    const data = await res.json()
                    if (!res.ok) throw new Error(data.error || 'Error procesando el pago')
                    
                    if (data.status === 'approved') {
                      setGeneratedCode(data.codigo_unico)
                      setStep(3)
                    } else {
                      toast.success('Pago pendiente. Te avisaremos cuando se acredite.')
                      router.push('/wallet')
                    }
                  } catch (error: any) {
                    toast.error('Error procesando el pago', { description: error.message })
                  } finally {
                    setIsProcessing(false)
                  }
                }}
              />
            </div>

            <div className="mt-8">
              <div className="flex justify-between items-center mb-4">
                <span className="font-semibold">Total a cobrar:</span>
                <span className="pf-mono font-bold text-xl text-pf-primary">{formatMXN(pass.precio)}</span>
              </div>
              <p className="text-center text-xs mt-4 text-pf-on-surface-var">Pagos seguros procesados por MercadoPago</p>
            </div>
          </div>
        )}

        {/* PASO 3: CONFIRMACIÓN */}
        {step === 3 && (
          <div className="animate-fade-in flex flex-col items-center justify-center flex-1 py-12 text-center text-balance">
            <div className="w-20 h-20 bg-pf-secondary-ctn/20 rounded-full flex items-center justify-center mb-6 shadow-pf-glow relative">
              <div className="absolute inset-0 bg-pf-secondary-ctn rounded-full animate-ping opacity-20" />
              <CheckCircle2 className="text-pf-secondary-ctn w-10 h-10 relative z-10" />
            </div>
            
            <h1 className="pf-headline text-2xl mb-3">¡Pago Exitoso!</h1>
            <p className="text-pf-on-surface-var mb-8">
              Tu <strong>{pass.nombre}</strong> ya está activo en tu wallet y listo para usarse.
            </p>

            <div className="pf-card p-6 w-full max-w-sm mb-8 border border-pf-secondary-ctn/30 bg-pf-surface-highest">
              <p className="text-xs uppercase tracking-wider text-pf-on-surface-var mb-2">Código Único</p>
              <p className="pf-mono text-xl font-bold tracking-[0.2em] text-pf-secondary">{generatedCode}</p>
            </div>

            <Link href="/wallet" className="w-full">
              <Button className="w-full">
                Ir a mi Wallet
              </Button>
            </Link>
          </div>
        )}

      </main>
    </div>
  )
}
