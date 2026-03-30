import Link from 'next/link'
import { Sparkles } from 'lucide-react'

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen flex flex-col bg-pf-bg relative overflow-hidden">
      {/* Glow effects */}
      <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-pf-primary-ctn/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-pf-secondary-ctn/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <header className="p-6 relative z-10 flex justify-center lg:justify-start">
        <Link href="/" className="flex items-center gap-2 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-pf-primary-ctn to-pf-primary flex items-center justify-center shadow-pf-glow group-hover:scale-105 transition-transform duration-300">
            <Sparkles className="text-pf-on-primary-ctn w-5 h-5" />
          </div>
          <span className="pf-display text-2xl tracking-tighter text-white">PASSFY</span>
        </Link>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center p-6 relative z-10">
        <div className="w-full max-w-md animate-fade-in">
          {children}
        </div>
      </main>
    </div>
  )
}
