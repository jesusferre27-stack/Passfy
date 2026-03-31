import { redirect } from 'next/navigation'
import { LayoutDashboard, ReceiptText, Users, Handshake, BadgeCheck, Settings, Building2, ShieldCheck, QrCode } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'

const navItems = [
  { icon: LayoutDashboard, label: 'Dashboard',     href: '/admin' },
  { icon: QrCode,          label: 'Passes',        href: '/admin/passes' },
  { icon: Building2,       label: 'Empresas',      href: '/admin/empresas' },
  { icon: Users,           label: 'Usuarios',      href: '/admin/usuarios' },
  { icon: Handshake,       label: 'Afiliados',     href: '/admin/afiliados' },
  { icon: ReceiptText,     label: 'Ventas',        href: '/admin/ventas' },
  { icon: BadgeCheck,      label: 'Validaciones',  href: '/admin/validaciones' },
  { icon: Settings,        label: 'Configuración', href: '/admin/configuracion' },
]

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const adminEmail = process.env.ADMIN_EMAIL
  if (!user || !adminEmail || user.email !== adminEmail) {
    redirect('/')
  }

  return (
    <div className="min-h-screen bg-[#0d0d16] flex">
      {/* Sidebar */}
      <aside className="w-60 min-h-screen bg-[#13131b] hidden lg:flex flex-col border-r border-[#1e1e28] fixed top-0 left-0 z-30">
        <div className="p-5 border-b border-[#1e1e28]">
          <p className="text-[9px] text-[#e4bebc] uppercase tracking-widest font-semibold mb-0.5">Platform Management</p>
          <h1 className="text-lg font-bold text-white tracking-tight">PASSFY Admin</h1>
          <div className="mt-1.5 flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 rounded-full bg-[#30a193] animate-pulse" />
            <span className="text-[9px] text-[#30a193] font-medium">All modules operational</span>
          </div>
        </div>

        <nav className="flex-1 p-3 space-y-0.5">
          {navItems.map(({ icon: Icon, label, href }) => (
            <Link
              key={href}
              href={href}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors text-[#e4e1ed]/70 hover:text-[#e4e1ed] hover:bg-[#1f1f28] active-nav"
            >
              <Icon size={15} />
              {label}
            </Link>
          ))}
        </nav>

        <div className="p-4 border-t border-[#1e1e28]">
          <div className="flex items-center gap-3 px-2 py-1.5">
            <div className="w-8 h-8 rounded-full bg-[#ff535b]/20 flex items-center justify-center text-[#ff535b] font-bold text-sm shrink-0">A</div>
            <div className="min-w-0">
              <p className="text-xs font-semibold text-[#e4e1ed] truncate">Admin Profile</p>
              <p className="text-[9px] text-[#e4bebc]">Chief Operations</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Content */}
      <div className="flex-1 lg:ml-60 min-h-screen">
        {/* Topbar */}
        <header className="sticky top-0 z-20 bg-[#13131b]/80 backdrop-blur-xl border-b border-[#1e1e28] px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldCheck size={15} className="text-[#30a193]" />
            <span className="text-xs text-[#30a193] font-medium">Sistema activo</span>
          </div>
          <Link href="/" className="text-xs text-[#e4bebc] hover:text-[#e4e1ed] transition-colors">Volver a la app →</Link>
        </header>

        {/* Page content */}
        <main className="p-6">
          {children}
        </main>
      </div>
    </div>
  )
}
