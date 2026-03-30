'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, Sparkles, QrCode, Wallet, User } from 'lucide-react'
import { cn } from '@/lib/utils'

const NAV_ITEMS = [
  { href: '/',          label: 'Home',      Icon: Home      },
  { href: '/passes',    label: 'Benefits',  Icon: Sparkles  },
  { href: '/validar',   label: 'Pay',       Icon: QrCode    },
  { href: '/wallet',    label: 'Wallet',    Icon: Wallet    },
  { href: '/perfil',    label: 'Profile',   Icon: User      },
]

export default function BottomNav() {
  const pathname = usePathname()

  return (
    <nav className="pf-bottom-nav fixed bottom-0 left-0 right-0 z-50 pb-safe mx-auto max-w-md w-full rounded-t-2xl border-x" aria-label="Navegación principal">
      <div className="flex items-center justify-around px-2 h-16">
        {NAV_ITEMS.map(({ href, label, Icon }) => {
          const isActive = pathname === href || (href !== '/' && pathname.startsWith(href))
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex flex-col items-center justify-center gap-1 py-2 px-4 rounded-2xl transition-all duration-200 min-w-[52px]',
                isActive
                  ? 'text-pf-primary-ctn'
                  : 'text-pf-on-surface-var hover:text-pf-on-surface'
              )}
              aria-current={isActive ? 'page' : undefined}
            >
              <div className={cn(
                'relative flex items-center justify-center w-10 h-6 rounded-full transition-all duration-200',
                isActive && 'bg-pf-primary-ctn bg-opacity-15'
              )}>
                <Icon
                  size={20}
                  strokeWidth={isActive ? 2.5 : 1.8}
                  className={isActive ? 'text-pf-primary-ctn' : ''}
                />
              </div>
              <span className={cn(
                'text-[10px] font-semibold transition-colors duration-200',
                isActive ? 'text-pf-primary-ctn' : 'text-pf-on-surface-var'
              )}>
                {label}
              </span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
