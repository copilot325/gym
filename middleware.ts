import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { auth } from '@/lib/auth-config'

// Paths públicos
const publicPaths = [
  '/login',
  '/register',
  '/api/auth',
]

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl

  // Permitir assets y públicos
  if (publicPaths.some(p => pathname.startsWith(p)) || pathname.startsWith('/_next') || pathname.startsWith('/favicon')) {
    return NextResponse.next()
  }

  // Obtener sesión vía headers
  const session = await auth.api.getSession({ headers: req.headers })
  if (!session) {
    const url = req.nextUrl.clone()
    url.pathname = '/login'
    return NextResponse.redirect(url)
  }

  if (!session.user.emailVerified) {
    const url = req.nextUrl.clone()
    url.pathname = '/login'
    url.searchParams.set('pendingApproval','1')
    return NextResponse.redirect(url)
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!api/auth).*)'],
}