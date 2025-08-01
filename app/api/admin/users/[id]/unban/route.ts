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

    // Check if user exists
    const user = await executeQuery(
      'SELECT id, is_banned FROM users WHERE id = ?',
      [id]
    )

    if (!user.length) {
      return NextResponse.json({ error: 'Kullanıcı bulunamadı' }, { status: 404 })
    }

    if (!user[0].is_banned) {
      return NextResponse.json({ error: 'Kullanıcı zaten yasaklı değil' }, { status: 400 })
    }

    // Unban user
    await executeQuery(
      `UPDATE users SET 
        is_banned = FALSE,
        ban_reason = NULL,
        banned_at = NULL,
        banned_by = NULL
      WHERE id = ?`,
      [id]
    )

    return NextResponse.json({ 
      success: true, 
      message: 'Kullanıcı yasağı başarıyla kaldırıldı' 
    })

  } catch (error) {
    console.error('Unban user error:', error)
    return NextResponse.json(
      { error: 'Kullanıcı yasağı kaldırılırken hata oluştu' },
      { status: 500 }
    )
  }
}