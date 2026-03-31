'use client'

import * as React from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { LogOut, User, ChevronRight, Settings, ShieldQuestion, HeartHandshake, Link as LinkIcon, Download, LayoutDashboard } from 'lucide-react'
import { useUserStore } from '@/store/useUserStore'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase/client'
import { Skeleton } from '@/components/ui/Skeleton'
import { PWAInstallButton } from '@/components/PWAInstallButton'

export default function ProfilePage() {
  const router = useRouter()
  const { user, isLoading, signOut, fetchProfile } = useUserStore()
  const [activePassesCount, setActivePassesCount] = React.useState<number | null>(null)
  const [affiliateCode, setAffiliateCode] = React.useState<string | null>(null)


  React.useEffect(() => {
    if (!user) {
      fetchProfile()
    }
  }, [user, fetchProfile])

  React.useEffect(() => {
    async function loadData() {
      if (!user) return
      const supabase = createClient()
      
      // Contar pases activos
      const { count } = await supabase
        .from('user_passes')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .eq('activo', true)
        
      setActivePassesCount(count || 0)

      // Verificar si es afiliado
      const { data: aff } = await supabase.from('affiliates').select('codigo_afiliado').eq('user_id', user.id).single()
      if (aff) setAffiliateCode(aff.codigo_afiliado)
    }
    loadData()
  }, [user])

  const handleSignout = async () => {
    await signOut()
    toast.success('Sesión cerrada')
    router.push('/login')
  }

  const handleCopyLink = () => {
    if (!affiliateCode) return
    const link = `${window.location.origin}?ref=${affiliateCode}`
    navigator.clipboard.writeText(link)
    toast.success('Enlace de afiliado copiado al portapapeles', { description: link })
  }

  const handleCreateAffiliate = async () => {
    if (!user) return
    const toastId = toast.loading('Creando tu cuenta de afiliado...')
    try {
      const res = await fetch('/api/affiliate/create', { method: 'POST' })
      const data = await res.json()

      if (!res.ok || data.error) {
        throw new Error(data.error || 'Error al crear tu cuenta.')
      }

      setAffiliateCode(data.affiliate.codigo_afiliado)
      toast.success('¡Bienvenido al programa!', { id: toastId })
      router.push('/afiliado')
    } catch (err: any) {
      console.error(err)
      toast.error(`Error: ${err.message}`, { id: toastId })
    }
  }




  return (
    <div className="min-h-screen bg-pf-bg pt-safe pb-24">
      <header className="px-6 pt-8 pb-4 sticky top-0 bg-pf-bg/80 backdrop-blur-xl z-10 border-b border-pf-surface-highest">
        <h1 className="pf-display text-3xl mb-2 text-white">Mi Perfil</h1>
      </header>

      <main className="px-6 py-6 space-y-6">
        
        {/* Info del Usuario */}
        <div className="flex items-center gap-4 pf-card p-6 border border-pf-surface-highest">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-pf-primary-ctn to-pf-primary p-0.5">
            <div className="w-full h-full bg-pf-surface rounded-full flex items-center justify-center overflow-hidden">
              <User className="text-pf-on-surface-var w-8 h-8" />
            </div>
          </div>
          <div className="flex-1">
            {isLoading || !user ? (
              <>
                <Skeleton className="h-6 w-3/4 mb-2" />
                <Skeleton className="h-4 w-1/2" />
              </>
            ) : (
              <>
                <h2 className="pf-headline text-xl">{user.nombre || 'Usuario PASSFY'}</h2>
                <p className="text-sm text-pf-on-surface-var">{user.email}</p>
                {activePassesCount !== null && (
                  <div className="mt-2 text-xs font-semibold uppercase tracking-wider text-pf-primary-ctn">
                    {activePassesCount} {activePassesCount === 1 ? 'Pass activo' : 'Passes activos'}
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        {/* Programa de Afiliados */}
        <div className="pf-card p-6 border border-pf-primary-ctn/30 bg-gradient-to-br from-pf-surface to-pf-surface-highest relative overflow-hidden">
          <div className="absolute -top-10 -right-10 w-32 h-32 bg-pf-primary-ctn/10 rounded-full blur-2xl pointer-events-none" />
          
          <div className="flex items-start justify-between relative z-10">
            <div>
              <h3 className="pf-headline text-lg flex items-center gap-2 mb-1">
                <HeartHandshake className="text-pf-primary-ctn w-5 h-5" />
                Programa de Referidos
              </h3>
              <p className="text-sm text-pf-on-surface-var mb-4">
                {affiliateCode ? 'Gana dinero invitando a tus amigos a PASSFY.' : 'Únete y gana comisiones por cada pass vendido con tu enlace.'}
              </p>
            </div>
          </div>
          
          {affiliateCode ? (
            <div className="flex gap-2">
              <button 
                onClick={handleCopyLink}
                className="flex-1 flex items-center justify-center gap-2 bg-pf-primary-ctn/10 text-pf-primary-ctn hover:bg-pf-primary-ctn/20 px-4 py-2.5 rounded-xl font-semibold text-sm transition-colors"
              >
                <LinkIcon size={16} /> Copiar mi enlace
              </button>
              <Link href="/afiliado" className="flex items-center justify-center bg-pf-surface-highest text-pf-on-surface hover:bg-pf-surface-top px-4 py-2.5 rounded-xl text-sm font-semibold transition-colors border border-pf-surface-high">
                Panel
              </Link>
            </div>
          ) : (
            <button 
              onClick={handleCreateAffiliate}
              className="w-full bg-pf-primary-ctn text-white font-semibold py-2.5 rounded-xl shadow-pf-glow transition-transform active:scale-95 text-sm"
            >
              Convertirme en Afiliado
            </button>
          )}
        </div>

        {/* Opciones */}
        <div className="pf-card overflow-hidden border border-pf-surface-highest divide-y divide-pf-surface-highest">
          <Link href="/perfil/ajustes" className="flex items-center justify-between p-4 hover:bg-pf-surface-top transition-colors">
            <div className="flex items-center gap-3">
              <Settings className="text-pf-on-surface-var w-5 h-5" />
              <span className="font-medium text-sm">Ajustes de Cuenta</span>
            </div>
            <ChevronRight className="text-pf-on-surface-var w-5 h-5" />
          </Link>
          
          <Link href="/soporte" className="flex items-center justify-between p-4 hover:bg-pf-surface-top transition-colors">
            <div className="flex items-center gap-3">
              <ShieldQuestion className="text-pf-on-surface-var w-5 h-5" />
              <span className="font-medium text-sm">Ayuda y Soporte</span>
            </div>
            <ChevronRight className="text-pf-on-surface-var w-5 h-5" />
          </Link>

          {user?.email === process.env.NEXT_PUBLIC_ADMIN_EMAIL && (
            <Link href="/admin" className="flex items-center justify-between p-4 hover:bg-pf-surface-top transition-colors">
              <div className="flex items-center gap-3">
                <LayoutDashboard className="text-[#ff535b] w-5 h-5" />
                <span className="font-medium text-sm text-[#ff535b]">Panel Admin</span>
              </div>
              <ChevronRight className="text-[#ff535b] w-5 h-5" />
            </Link>
          )}
          
          <PWAInstallButton />
        </div>

        {/* Cerrar sesión */}
        <button 
          onClick={handleSignout}
          className="w-full flex items-center justify-center gap-2 text-pf-error p-4 hover:bg-pf-error/10 rounded-2xl transition-colors font-semibold text-sm"
        >
          <LogOut className="w-5 h-5" />
          Cerrar Sesión
        </button>

        <div className="text-center pb-8 pt-4">
          <p className="text-xs text-pf-on-surface-var">PASSFY App v1.0.0</p>
          <div className="flex items-center justify-center gap-4 mt-2 text-xs text-pf-primary hover:underline underline-offset-4">
            <Link href="/terminos">Términos</Link>
            <Link href="/privacidad">Privacidad</Link>
          </div>
        </div>

      </main>
    </div>
  )
}
