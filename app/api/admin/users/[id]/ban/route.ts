import { NextRequest, NextResponse } from 'next/server'
import { executeQuery } from '@/lib/database'

interface RouteParams {
  params: Promise<{ id: string }>
}

export async function POST(
  request: NextRequest,
  context: RouteParams
) {
  try {
    // Admin yetki kontrolü middleware'de yapılıyor
    const adminUser = request.headers.get('x-admin-user')
    const adminData = adminUser ? JSON.parse(adminUser) : null
    
    if (!adminData) {
      return NextResponse.json({ error: 'Admin bilgisi bulunamadı' }, { status: 401 })
    }

    const params = await context.params
    const { id } = params
    const body = await request.json()
    const { reason } = body

    if (!reason) {
      return NextResponse.json({ error: 'Yasaklama nedeni gerekli' }, { status: 400 })
    }

    // Check if user exists and is not super_admin
    const user = await executeQuery(
      'SELECT id, role, email FROM users WHERE id = ?',
      [id]
    )

    if (!user.length) {
      return NextResponse.json({ error: 'Kullanıcı bulunamadı' }, { status: 404 })
    }

    if (user[0].role === 'super_admin') {
      return NextResponse.json({ error: 'Süper admin yasaklanamaz' }, { status: 403 })
    }

    // Ban user
    await executeQuery(
      `UPDATE users SET 
        is_banned = TRUE,
        ban_reason = ?,
        banned_at = NOW(),
        banned_by = ?
      WHERE id = ?`,
      [reason, adminData.userId, id]
    )

    return NextResponse.json({ 
      success: true, 
      message: 'Kullanıcı başarıyla yasaklandı' 
    })

  } catch (error) {
    console.error('Ban user error:', error)
    return NextResponse.json(
      { error: 'Kullanıcı yasaklanırken hata oluştu' },
      { status: 500 }
    )
  }
}