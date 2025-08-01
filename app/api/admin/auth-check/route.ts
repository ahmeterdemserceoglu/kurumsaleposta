import { NextRequest, NextResponse } from 'next/server'
import { executeQuerySingle } from '@/lib/database'
import { verifyAccessToken } from '@/lib/jwt'

export async function GET(request: NextRequest) {
  try {
    // Token'ı header'dan al
    const authHeader = request.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ authorized: false, error: 'No token provided' }, { status: 401 })
    }

    const token = authHeader.substring(7)

    // Token'ı verify et
    let payload
    try {
      payload = verifyAccessToken(token)
    } catch (error) {
      return NextResponse.json({ authorized: false, error: 'Invalid token' }, { status: 401 })
    }

    // Veritabanından kullanıcı bilgilerini kontrol et
    const user = await executeQuerySingle(
      'SELECT id, email, role, status, is_banned FROM users WHERE id = ?',
      [payload.userId]
    )

    if (!user) {
      return NextResponse.json({ authorized: false, error: 'User not found' }, { status: 404 })
    }

    // Kullanıcı durumu kontrolleri
    if (user.status !== 'active') {
      return NextResponse.json({ authorized: false, error: 'User inactive' }, { status: 403 })
    }

    if (user.is_banned) {
      return NextResponse.json({ authorized: false, error: 'User banned' }, { status: 403 })
    }

    // Admin rolü kontrolü
    if (!['admin', 'super_admin'].includes(user.role)) {
      return NextResponse.json({ authorized: false, error: 'Insufficient role' }, { status: 403 })
    }

    // Tüm kontroller başarılı
    return NextResponse.json({ 
      authorized: true, 
      user: {
        id: user.id,
        email: user.email,
        role: user.role
      }
    })

  } catch (error) {
    console.error('Admin auth check error:', error)
    return NextResponse.json({ authorized: false, error: 'Internal server error' }, { status: 500 })
  }
}