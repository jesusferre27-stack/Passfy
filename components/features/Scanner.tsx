'use client'

import * as React from 'react'
import { Html5QrcodeScanner } from 'html5-qrcode'
import { QrCode, Smartphone } from 'lucide-react'

interface ScannerProps {
  onScan: (decodedText: string) => void
}

export function Scanner({ onScan }: ScannerProps) {
  const scannerRef = React.useRef<HTMLDivElement>(null)

  React.useEffect(() => {
    if (!scannerRef.current) return

    const scanner = new Html5QrcodeScanner(
      'qr-reader',
      { 
        fps: 10,
        qrbox: { width: 250, height: 250 },
        aspectRatio: 1.0,
        showTorchButtonIfSupported: true,
      },
      false
    )

    let isScanning = true

    scanner.render(
      (decodedText) => {
        if (isScanning) {
          isScanning = false
          scanner.pause(true) // Pausar tras leer para evitar múltiples lecturas
          onScan(decodedText)
          
          // Reanudar tras 3 segundos
          setTimeout(() => {
            isScanning = true
            scanner.resume()
          }, 3000)
        }
      },
      (error) => {
        // Ignorar errores de "no QR found" continuos
      }
    )

    return () => {
      scanner.clear().catch(console.error)
    }
  }, [onScan])

  return (
    <div className="w-full max-w-sm mx-auto overflow-hidden rounded-[32px] border-2 border-pf-surface-highest bg-black relative shadow-pf-glow">
      <div id="qr-reader" ref={scannerRef} className="w-full text-white [&_video]:object-cover" />
      <div className="absolute inset-0 border-4 border-pf-primary/50 rounded-[32px] pointer-events-none" />
      
      {/* Fallback de CSS extra para adaptar la librería que inyecta código feo */}
      <style dangerouslySetInnerHTML={{__html: `
        #qr-reader { border: none !important; }
        #qr-reader__dashboard_section_csr span { color: white !important; }
        #qr-reader button { 
          background-color: #292932; 
          color: white; 
          border: none; 
          padding: 8px 16px; 
          border-radius: 99px;
          margin-top: 10px;
          font-family: 'Plus Jakarta Sans', sans-serif;
          font-size: 14px;
        }
        #qr-reader select { background: #13131B; color: white; padding: 8px; border-radius: 8px; margin-bottom: 10px; border: 1px solid #292932;}
      `}} />
    </div>
  )
}
