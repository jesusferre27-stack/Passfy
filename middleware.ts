import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

// Rutas protegidas (requieren sesión)
const PROTECTED_ROUTES = ['/wallet', '/passes', '/checkout', '/afiliado', '/admin']
// Rutas de auth (redirigir si ya hay sesión)
const AUTH_ROUTES = ['/login', '/registro', '/recuperar-password']
// Rutas públicas sin restricción
const PUBLIC_ROUTES = ['/validar', '/']

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          )
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // Refrescar sesión
  const { data: { user } } = await supabase.auth.getUser()
  const pathname = request.nextUrl.pathname

  // Guardar cookie de afiliado si ?ref=CODIGO está en la URL
  const refCode = request.nextUrl.searchParams.get('ref')
  if (refCode) {
    supabaseResponse.cookies.set('affiliate_ref', refCode, {
      maxAge: 60 * 60 * 24 * 30, // 30 días
      path: '/',
      sameSite: 'lax',
    })
  }

  // Redirigir rutas protegidas si no hay sesión
  const isProtected = PROTECTED_ROUTES.some(r => pathname.startsWith(r))
  if (isProtected && !user && !pathname.startsWith('/wallet/test')) {
    const loginUrl = new URL('/login', request.url)
    loginUrl.searchParams.set('redirect', pathname)
    return NextResponse.redirect(loginUrl)
  }

  // Redirigir rutas de auth si ya hay sesión
  const isAuth = AUTH_ROUTES.some(r => pathname.startsWith(r))
  if (isAuth && user) {
    return NextResponse.redirect(new URL('/wallet', request.url))
  }

  // Admin protegido
  if (pathname.startsWith('/admin')) {
    // Verificar rol admin (se verifica en el componente también)
    if (!user) {
      return NextResponse.redirect(new URL('/login', request.url))
    }
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|manifest.json|icons|api).*)',
  ],
}
