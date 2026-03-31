'use client'

import * as React from 'react'
import { Download } from 'lucide-react'
import { toast } from 'sonner'

export function PWAInstallButton() {
  const [deferredPrompt, setDeferredPrompt] = React.useState<any>(null)
  const [isStandalone, setIsStandalone] = React.useState(false)

  React.useEffect(() => {
    // Si ya está instalado y ejecutándose como PWA, ocultamos o cambiamos el estado
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsStandalone(true)
    }

    const handleBeforeInstallPrompt = (e: any) => {
      e.preventDefault()
      setDeferredPrompt(e)
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
  }, [])

  const handleInstallPWA = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt()
      const { outcome } = await deferredPrompt.userChoice
      if (outcome === 'accepted') {
        setDeferredPrompt(null)
      }
    } else {
      const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream
      const isDesktop = !(/Mobi|Android/i.test(navigator.userAgent))

      if (isIOS) {
        toast('Abre en Safari para instalar', {
          description: 'Toca el ícono Compartir en la barra inferior y luego selecciona "Agregar a inicio".',
        })
      } else if (isDesktop) {
         toast('Abre en Chrome para instalar', {
          description: 'Haz clic en el ícono de instalación en la barra de direcciones de tu navegador Chrome o Edge.',
        })
      } else {
        toast('Abre en Chrome para instalar', {
          description: 'Abre el menú de Chrome (tres puntos) y selecciona "Agregar a la pantalla principal".',
        })
      }
    }
  }

  // Opcional: Si ya está en modo standalone, podríamos evitar que se renderice
  if (isStandalone) return null;

  return (
    <button onClick={handleInstallPWA} className="w-full flex items-center justify-between p-4 hover:bg-pf-surface-top transition-colors">
      <div className="flex items-center gap-3">
        <Download className="text-pf-on-surface-var w-5 h-5" />
        <span className="font-medium text-sm">Instalar App (PWA)</span>
      </div>
    </button>
  )
}
