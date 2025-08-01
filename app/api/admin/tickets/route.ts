import { NextRequest, NextResponse } from 'next/server'
import mysql from 'mysql2/promise'

const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'admin',
  password: process.env.DB_PASSWORD || 'sifre123',
  database: process.env.DB_NAME || 'mydata',
  port: parseInt(process.env.DB_PORT || '3306')
}

export async function GET(request: NextRequest) {
  let connection;
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const search = searchParams.get('search') || ''
    const status = searchParams.get('status') || ''
    const priority = searchParams.get('priority') || ''
    const category = searchParams.get('category') || ''
    const assigned_to = searchParams.get('assigned_to') || ''

    const offset = (page - 1) * limit

    connection = await mysql.createConnection(dbConfig)

    // Build WHERE clause
    let whereConditions = []
    let queryParams = []

    if (search) {
      whereConditions.push('(t.subject LIKE ? OR c.name LIKE ?)')
      queryParams.push(`%${search}%`, `%${search}%`)
    }
    if (status) {
      whereConditions.push('t.status = ?')
      queryParams.push(status)
    }
    if (priority) {
      whereConditions.push('t.priority = ?')
      queryParams.push(priority)
    }
    if (category) {
      whereConditions.push('t.category = ?')
      queryParams.push(category)
    }
    if (assigned_to) {
      if (assigned_to === 'unassigned') {
        whereConditions.push('t.assignedTo IS NULL')
      } else if (assigned_to === 'me') {
        whereConditions.push('t.assignedTo = ?')
        queryParams.push('current_admin_id') // This would be the current admin's ID
      } else {
        whereConditions.push('t.assignedTo = ?')
        queryParams.push(assigned_to)
      }
    }

    const whereClause = whereConditions.length > 0 ? 'WHERE ' + whereConditions.join(' AND ') : ''

    // Get total count
    const countQuery = `
      SELECT COUNT(*) as total
      FROM support_tickets t
      INNER JOIN companies c ON t.companyId = c.id
      INNER JOIN users u ON t.userId = u.id
      ${whereClause}
    `
    const [countResult] = await connection.execute(countQuery, queryParams)
    const total = (countResult as any)[0].total

    // Get tickets with company and user info
    const ticketsQuery = `
      SELECT 
        t.*,
        c.name as companyName,
        u.email as userEmail
      FROM support_tickets t
      INNER JOIN companies c ON t.companyId = c.id
      INNER JOIN users u ON t.userId = u.id
      ${whereClause}
      ORDER BY t.createdAt DESC
      LIMIT ? OFFSET ?
    `
    const [ticketsResult] = await connection.execute(ticketsQuery, [...queryParams, limit, offset])
    const ticketsData = ticketsResult as any[]

    const tickets = ticketsData.map(ticket => ({
      id: ticket.id,
      companyId: ticket.companyId,
      companyName: ticket.companyName || 'Bilinmeyen',
      userId: ticket.userId,
      userEmail: ticket.userEmail || 'Bilinmeyen',
      subject: ticket.subject,
      description: ticket.description,
      status: ticket.status,
      priority: ticket.priority,
      category: ticket.category,
      assigned_to: ticket.assignedTo,
      assignedAdminName: ticket.assignedAdminName,
      resolved_at: ticket.resolvedAt,
      createdAt: ticket.createdAt,
      updatedAt: ticket.updatedAt
    }))

    const totalPages = Math.ceil(total / limit)

    return NextResponse.json({
      tickets,
      totalPages,
      currentPage: page,
      total
    })
  } catch (error) {
    console.error('Error fetching tickets:', error)
    return NextResponse.json(
      { error: 'Failed to fetch tickets' },
      { status: 500 }
    )
  } finally {
    if (connection) {
      await connection.end()
    }
  }
}