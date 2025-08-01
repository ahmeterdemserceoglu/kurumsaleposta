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
    const filter = searchParams.get('filter') || 'all'

    connection = await mysql.createConnection(dbConfig)

    let whereClause = ''
    if (filter === 'unread') {
      whereClause = 'WHERE isRead = false'
    } else if (filter === 'read') {
      whereClause = 'WHERE isRead = true'
    }

    const [notifications] = await connection.execute(`
      SELECT * FROM admin_notifications 
      ${whereClause}
      ORDER BY createdAt DESC
    `)

    return NextResponse.json({
      notifications: (notifications as any[]).map(n => ({
        id: n.id,
        title: n.title,
        message: n.message,
        type: n.type,
        target: n.target,
        targetId: n.targetId,
        isRead: n.isRead,
        createdBy: n.createdBy,
        createdAt: n.createdAt,
        expiresAt: n.expiresAt
      }))
    })
  } catch (error) {
    console.error('Error fetching notifications:', error)
    return NextResponse.json(
      { error: 'Failed to fetch notifications' },
      { status: 500 }
    )
  } finally {
    if (connection) {
      await connection.end()
    }
  }
}

export async function POST(request: NextRequest) {
  let connection;
  try {
    const { title, message, type, target, targetId, expiresAt } = await request.json()

    if (!title || !message) {
      return NextResponse.json(
        { error: 'Title and message are required' },
        { status: 400 }
      )
    }

    connection = await mysql.createConnection(dbConfig)

    const [result] = await connection.execute(`
      INSERT INTO admin_notifications (title, message, type, target, targetId, expiresAt, isRead, createdBy)
      VALUES (?, ?, ?, ?, ?, ?, false, 'admin')
    `, [
      title,
      message,
      type || 'info',
      target || 'all',
      targetId || null,
      expiresAt || null
    ])

    const insertId = (result as any).insertId

    // Get the created notification
    const [notification] = await connection.execute(
      'SELECT * FROM admin_notifications WHERE id = ?',
      [insertId]
    )

    return NextResponse.json({
      message: 'Notification created successfully',
      notification: (notification as any[])[0]
    })
  } catch (error) {
    console.error('Error creating notification:', error)
    return NextResponse.json(
      { error: 'Failed to create notification' },
      { status: 500 }
    )
  } finally {
    if (connection) {
      await connection.end()
    }
  }
}