import { NextRequest, NextResponse } from 'next/server'
import { executeQuery } from '@/lib/database'

export async function GET(request: NextRequest) {
  try {
    // Admin yetki kontrolü middleware'de yapılıyor
    
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const search = searchParams.get('search') || ''
    const role = searchParams.get('role') || ''
    const status = searchParams.get('status') || ''
    const plan = searchParams.get('plan') || ''

    const offset = (page - 1) * limit

    // Build WHERE clause
    let whereConditions = ['1=1']
    let queryParams: any[] = []

    if (search) {
      whereConditions.push('(u.email LIKE ? OR u.firstName LIKE ? OR u.lastName LIKE ?)')
      queryParams.push(`%${search}%`, `%${search}%`, `%${search}%`)
    }

    if (role) {
      whereConditions.push('u.role = ?')
      queryParams.push(role)
    }

    if (status === 'banned') {
      whereConditions.push('u.is_banned = TRUE')
    } else if (status) {
      whereConditions.push('u.status = ? AND u.is_banned = FALSE')
      queryParams.push(status)
    }

    if (plan) {
      whereConditions.push('c.plan = ?')
      queryParams.push(plan)
    }

    const whereClause = whereConditions.join(' AND ')

    // Get users with company info
    const usersQuery = `
      SELECT 
        u.id,
        u.email,
        u.firstName,
        u.lastName,
        u.role,
        u.status,
        u.is_banned,
        u.ban_reason,
        u.last_login,
        u.createdAt,
        c.id as companyId,
        c.name as companyName,
        c.plan as companyPlan
      FROM users u
      LEFT JOIN companies c ON u.companyId = c.id
      WHERE ${whereClause}
      ORDER BY u.createdAt DESC
      LIMIT ? OFFSET ?
    `

    const users = await executeQuery(usersQuery, [...queryParams, limit, offset])

    // Get total count
    const countQuery = `
      SELECT COUNT(*) as total
      FROM users u
      LEFT JOIN companies c ON u.companyId = c.id
      WHERE ${whereClause}
    `

    const countResult = await executeQuery(countQuery, queryParams)
    const total = countResult[0]?.total || 0
    const totalPages = Math.ceil(total / limit)

    // Format response
    const formattedUsers = users.map((user: any) => ({
      id: user.id.toString(),
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
      status: user.status,
      is_banned: !!user.is_banned,
      ban_reason: user.ban_reason,
      last_login: user.last_login,
      createdAt: user.createdAt,
      company: {
        id: user.companyId?.toString() || '',
        name: user.companyName || '',
        plan: user.companyPlan || 'starter'
      }
    }))

    return NextResponse.json({
      users: formattedUsers,
      pagination: {
        page,
        limit,
        total,
        totalPages
      }
    })

  } catch (error) {
    console.error('Admin users API error:', error)
    return NextResponse.json(
      { error: 'Kullanıcılar yüklenirken hata oluştu' },
      { status: 500 }
    )
  }
}