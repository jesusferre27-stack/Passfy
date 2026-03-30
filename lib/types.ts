// Tipos TypeScript para PASSFY — mapeados al esquema de Supabase

export interface User {
  id: string
  nombre: string
  email: string
  avatar_url?: string
  affiliate_id?: string
  created_at: string
}

export interface Pass {
  id: string
  nombre: string
  slug: string
  nicho: 'cines' | 'comida' | 'cafe' | 'fitness' | 'restaurantes'
  precio: number
  descripcion: string
  color_brand: string
  color_brand_end?: string
  activo: boolean
  created_at: string
  // Joined
  benefits?: Benefit[]
  user_count?: number
}

export interface Benefit {
  id: string
  pass_id: string
  descripcion: string
  usos_totales: number
  tipo: string
  icono: string
  activo: boolean
}

export interface UserPass {
  id: string
  user_id: string
  pass_id: string
  codigo_unico: string
  qr_url?: string
  fecha_compra: string
  fecha_expiry: string
  activo: boolean
  mercadopago_payment_id?: string
  // Joined
  pass?: Pass
  benefit_uses?: BenefitUse[]
}

export interface BenefitUse {
  id: string
  user_pass_id: string
  benefit_id: string
  usos_restantes: number
  fecha_uso?: string
  comercio_id?: string
  validado_por?: string
  // Joined
  benefit?: Benefit
}

export interface Affiliate {
  id: string
  user_id: string
  codigo_afiliado: string
  comision_pct: number
  activo: boolean
  total_ganado: number
  // Joined
  user?: User
}

export interface AffiliateSale {
  id: string
  affiliate_id: string
  user_pass_id: string
  monto: number
  comision: number
  pagado: boolean
  fecha: string
  // Joined
  user_pass?: UserPass
}

export interface Merchant {
  id: string
  nombre: string
  nicho: string
  logo_url?: string
  ciudad: string
  activo: boolean
  contacto_email?: string
  pin?: string
}

// ---- Tipos de UI / helpers ----

export type NichoFilter = 'todos' | 'cines' | 'comida' | 'cafe' | 'fitness' | 'restaurantes'

export interface CheckoutStep {
  step: 1 | 2 | 3
  passSlug: string
}

export interface PaymentMethod {
  id: 'tarjeta' | 'oxxo' | 'spei'
  label: string
  icon: string
  descripcion: string
}

export interface WalletStats {
  totalAhorros: number
  passesActivos: number
  passesVencidos: number
}
