'use client'

import Link from 'next/link'
import { ArrowLeft, Mail, MessageCircle, Clock, ChevronRight, HelpCircle, AlertCircle, QrCode, CreditCard } from 'lucide-react'
import { useRouter } from 'next/navigation'

const FAQS = [
  {
    q: '¿Cómo uso mi pass para canjear un beneficio?',
    a: 'Abre tu Wallet en la app, selecciona tu pass activo y muestra el código QR al cajero o personal del establecimiento para que lo escaneen.'
  },
  {
    q: '¿Cuándo se activa mi pass después del pago?',
    a: 'Tu pass se activa automáticamente al confirmar el pago con Mercado Pago. Recibirás un correo con los detalles. Si en 10 minutos no apparece, contáctanos.'
  },
  {
    q: '¿Puedo usar mi pass en cualquier sucursal?',
    a: 'Sí, puedes usarlo en cualquier sucursal participante del establecimiento. La lista de comercios aparece en los detalles de cada pass.'
  },
  {
    q: '¿Cuántas veces puedo usar un beneficio?',
    a: 'Depende del pass. Algunos beneficios son de uso ilimitado, otros tienen un número específico de usos indicado en la descripción del pass.'
  },
  {
    q: '¿Puedo solicitar un reembolso?',
    a: 'Si tuviste un problema con tu compra, escríbenos a soporte@passfy.mx dentro de los primeros 7 días. Analizamos cada caso individualmente.'
  },
]

export default function SoportePage() {
  const router = useRouter()

  return (
    <div className="min-h-screen bg-pf-bg pb-24">
      {/* Header */}
      <header className="sticky top-0 z-10 px-4 pt-safe bg-pf-bg/90 backdrop-blur-xl border-b border-pf-surface-highest flex items-center gap-3 h-16">
        <button
          onClick={() => router.back()}
          className="w-9 h-9 flex items-center justify-center rounded-xl hover:bg-pf-surface-top transition-colors"
        >
          <ArrowLeft size={20} />
        </button>
        <h1 className="font-semibold text-lg">Ayuda y Soporte</h1>
      </header>

      <main className="px-6 py-6 space-y-6 max-w-lg mx-auto">

        {/* Contacto directo */}
        <div className="bg-gradient-to-br from-pf-primary-ctn/20 to-pf-primary-ctn/5 rounded-2xl p-5 border border-pf-primary-ctn/30">
          <h2 className="font-bold text-pf-on-surface text-base mb-1">¿Necesitas ayuda?</h2>
          <p className="text-sm text-pf-on-surface-var mb-4">Estamos disponibles de lunes a viernes de 9am a 6pm (hora Ciudad de México).</p>

          <div className="flex flex-col gap-3">
            <a
              href="mailto:soporte@passfy.mx"
              className="flex items-center gap-3 bg-pf-primary-ctn text-white px-4 py-3 rounded-xl font-semibold text-sm active:scale-95 transition-transform"
            >
              <Mail size={18} />
              <div>
                <p className="font-semibold">Enviar correo</p>
                <p className="text-xs text-white/80">soporte@passfy.mx</p>
              </div>
            </a>

            <a
              href="https://wa.me/521XXXXXXXXXX?text=Hola%2C%20necesito%20ayuda%20con%20mi%20PASSFY"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 bg-[#25D366] text-white px-4 py-3 rounded-xl font-semibold text-sm active:scale-95 transition-transform"
            >
              <MessageCircle size={18} />
              <div>
                <p className="font-semibold">WhatsApp</p>
                <p className="text-xs text-white/80">Respuesta en menos de 24 hrs</p>
              </div>
            </a>
          </div>
        </div>

        {/* Horario */}
        <div className="flex items-center gap-3 bg-pf-surface rounded-xl p-4 border border-pf-surface-highest">
          <div className="w-9 h-9 rounded-xl bg-pf-surface-highest flex items-center justify-center">
            <Clock size={18} className="text-pf-on-surface-var" />
          </div>
          <div>
            <p className="text-sm font-semibold">Lunes — Viernes</p>
            <p className="text-xs text-pf-on-surface-var">9:00 am — 6:00 pm · CDMX</p>
          </div>
        </div>

        {/* FAQs */}
        <div>
          <h2 className="font-semibold text-pf-on-surface mb-3 flex items-center gap-2">
            <HelpCircle size={16} className="text-pf-on-surface-var" />
            Preguntas frecuentes
          </h2>
          <div className="bg-pf-surface rounded-2xl border border-pf-surface-highest overflow-hidden divide-y divide-pf-surface-highest">
            {FAQS.map((faq, i) => (
              <details key={i} className="group">
                <summary className="flex items-center justify-between p-4 cursor-pointer hover:bg-pf-surface-top transition-colors list-none">
                  <span className="text-sm font-medium text-pf-on-surface pr-4">{faq.q}</span>
                  <ChevronRight size={16} className="text-pf-on-surface-var shrink-0 group-open:rotate-90 transition-transform" />
                </summary>
                <div className="px-4 pb-4 text-sm text-pf-on-surface-var leading-relaxed">
                  {faq.a}
                </div>
              </details>
            ))}
          </div>
        </div>

        {/* Accesos rápidos */}
        <div>
          <h2 className="font-semibold text-pf-on-surface mb-3 flex items-center gap-2">
            <AlertCircle size={16} className="text-pf-on-surface-var" />
            Problemas comunes
          </h2>
          <div className="grid grid-cols-2 gap-3">
            <Link href="/wallet" className="bg-pf-surface rounded-xl p-4 border border-pf-surface-highest flex flex-col gap-2 hover:bg-pf-surface-top transition-colors">
              <QrCode size={20} className="text-pf-primary-ctn" />
              <p className="text-sm font-semibold text-pf-on-surface">Ver mi QR</p>
              <p className="text-xs text-pf-on-surface-var">Accede a tu Wallet</p>
            </Link>
            <a href="mailto:pagos@passfy.mx" className="bg-pf-surface rounded-xl p-4 border border-pf-surface-highest flex flex-col gap-2 hover:bg-pf-surface-top transition-colors">
              <CreditCard size={20} className="text-[#e7c268]" />
              <p className="text-sm font-semibold text-pf-on-surface">Problema de pago</p>
              <p className="text-xs text-pf-on-surface-var">pagos@passfy.mx</p>
            </a>
          </div>
        </div>

        <p className="text-center text-xs text-pf-on-surface-var pb-4">
          PASSFY · v1.0.0 · Todos los derechos reservados
        </p>

      </main>
    </div>
  )
}
