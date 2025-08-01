import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Simple JWT decode without verification (for middleware)
function decodeJWT(token: string) {
  try {
    const base64Url = token.split('.')[1]
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/')
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    )
    return JSON.parse(jsonPayload)
  } catch (error) {
    console.error('JWT decode error:', error)
    return null
  }
}

// Check if JWT is expired
function isTokenExpired(payload: any): boolean {
  if (!payload || !payload.exp) return true
  const currentTime = Math.floor(Date.now() / 1000)
  return payload.exp < currentTime
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Admin panel yetki kontrolü
  if (pathname.startsWith('/admin')) {
    let token = request.cookies.get('auth_token')?.value

    // Eğer cookie'de token yoksa, Authorization header'ından al
    if (!token) {
      const authHeader = request.headers.get('authorization')
      if (authHeader && authHeader.startsWith('Bearer ')) {
        token = authHeader.substring(7)
      }
    }

    if (!token) {
      return NextResponse.redirect(new URL('/login?redirect=/admin', request.url))
    }

    try {
      // Decode token without verification (middleware limitation)
      const payload = decodeJWT(token)
      
      if (!payload) {
        return NextResponse.redirect(new URL('/login?redirect=/admin', request.url))
      }

      // Check if token is expired
      if (isTokenExpired(payload)) {
        return NextResponse.redirect(new URL('/login?redirect=/admin', request.url))
      }
      
      // Admin rolü kontrolü
      if (!payload.role || !['admin', 'super_admin'].includes(payload.role)) {
        return NextResponse.redirect(new URL('/?error=unauthorized', request.url))
      }

      // Admin kullanıcı bilgilerini header'a ekle
      const response = NextResponse.next()
      response.headers.set('x-admin-user', JSON.stringify({
        userId: payload.userId,
        email: payload.email,
        role: payload.role
      }))
      
      return response
    } catch (error) {
      console.error('Admin middleware error:', error)
      return NextResponse.redirect(new URL('/login?redirect=/admin', request.url))
    }
  }

  // API routes için admin kontrolü
  if (pathname.startsWith('/api/admin')) {
    const token = request.cookies.get('auth_token')?.value

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    try {
      const payload = decodeJWT(token)
      
      if (!payload || isTokenExpired(payload)) {
        return NextResponse.json({ error: 'Invalid or expired token' }, { status: 401 })
      }
      
      if (!payload.role || !['admin', 'super_admin'].includes(payload.role)) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
      }

      // Admin bilgilerini header'a ekle
      const response = NextResponse.next()
      response.headers.set('x-admin-user', JSON.stringify({
        userId: payload.userId,
        email: payload.email,
        role: payload.role
      }))
      
      return response
    } catch (error) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/admin/:path*',
    '/api/admin/:path*'
  ]
}