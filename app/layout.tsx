import type { Metadata, Viewport } from 'next'
import Script from 'next/script'
import { Toaster } from 'sonner'
import './globals.css'

export const metadata: Metadata = {
  title: {
    default: 'PASSFY — Beneficios Digitales',
    template: '%s | PASSFY',
  },
  description: 'La plataforma de beneficios digitales para México. Compra tu pass, recibe un QR y canjea descuentos en tus marcas favoritas.',
  keywords: ['beneficios', 'descuentos', 'México', 'CinePass', 'BurgerPass', 'QR', 'Cinépolis', 'McDonald\'s'],
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'PASSFY',
  },
  openGraph: {
    type: 'website',
    locale: 'es_MX',
    siteName: 'PASSFY',
    title: 'PASSFY — Beneficios Digitales en México',
    description: 'Compra tu pass y canjea beneficios en Cinépolis, McDonald\'s, Domino\'s y más.',
  },
}

export const viewport: Viewport = {
  themeColor: '#13131B',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es-MX">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body className="bg-pf-bg text-pf-on-surface font-body antialiased">
        {children}
        <Toaster
          theme="dark"
          position="top-center"
          toastOptions={{
            style: {
              background: '#292932',
              border: '1px solid rgba(91,64,63,0.3)',
              color: '#E4E1ED',
              fontFamily: '"Plus Jakarta Sans", sans-serif',
            },
          }}
        />
        <Script id="pwa-sw" strategy="afterInteractive">
          {`
            if ('serviceWorker' in navigator) {
              window.addEventListener('load', function() {
                navigator.serviceWorker.register('/sw.js').then(
                  function(registration) { console.log('SW registered: ', registration.scope); },
                  function(err) { console.log('SW registration failed: ', err); }
                );
              });
            }
          `}
        </Script>
      </body>
    </html>
  )
}
