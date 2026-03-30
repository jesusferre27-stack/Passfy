import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

// Merge clases de Tailwind sin conflictos
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Formatear moneda MXN: $1,299.00 MXN
export function formatMXN(amount: number): string {
  return new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: 'MXN',
    minimumFractionDigits: 2,
  }).format(amount) + ' MXN'
}

// Formatear moneda corta: $199
export function formatMXNShort(amount: number): string {
  return new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: 'MXN',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

// Formatear fecha en español: "12 de octubre de 2026"
export function formatDateES(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date
  return d.toLocaleDateString('es-MX', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

// Formatear fecha corta: "12 oct 2026"
export function formatDateShort(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date
  return d.toLocaleDateString('es-MX', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

// Generar código único de pass: CIN-AB3X92-MX
export function generatePassCode(prefix: string): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  let random = ''
  for (let i = 0; i < 6; i++) {
    random += chars[Math.floor(Math.random() * chars.length)]
  }
  return `${prefix.toUpperCase().slice(0, 3)}-${random}-MX`
}

// Obtener prefijo de pass por slug
export function getPassPrefix(slug: string): string {
  const prefixes: Record<string, string> = {
    cinepass:       'CIN',
    burgerpass:     'BRG',
    coffeepass:     'COF',
    gympass:        'GYM',
    restaurantpass: 'RST',
  }
  return prefixes[slug] ?? slug.slice(0, 3).toUpperCase()
}

// Calcular días restantes hasta expiración
export function daysUntilExpiry(expiryDate: string): number {
  const expiry = new Date(expiryDate)
  const now = new Date()
  const diff = expiry.getTime() - now.getTime()
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)))
}

// Verificar si un pass expiró
export function isExpired(expiryDate: string): boolean {
  return new Date(expiryDate) < new Date()
}

// Obtener fecha de expiración: +1 año desde hoy
export function getExpiryDate(): Date {
  const date = new Date()
  date.setFullYear(date.getFullYear() + 1)
  return date
}

// Tiempo relativo en español: "hace 3 minutos"
export function timeAgoES(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date
  const seconds = Math.floor((new Date().getTime() - d.getTime()) / 1000)

  if (seconds < 60) return 'hace un momento'
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return `hace ${minutes} min`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `hace ${hours} h`
  const days = Math.floor(hours / 24)
  if (days < 7) return `hace ${days} días`
  return formatDateShort(d)
}

// Truncar texto
export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text
  return text.slice(0, maxLength) + '...'
}
