import { NextRequest, NextResponse } from 'next/server'
import mysql from 'mysql2/promise'

const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'admin',
  password: process.env.DB_PASSWORD || 'sifre123',
  database: process.env.DB_NAME || 'mydata',
  port: parseInt(process.env.DB_PORT || '3306')
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  let connection;
  try {
    const { id } = await params
    const notificationId = parseInt(id)

    if (isNaN(notificationId)) {
      return NextResponse.json(
        { error: 'Invalid notification ID' },
        { status: 400 }
      )
    }

    connection = await mysql.createConnection(dbConfig)

    await connection.execute(`
      UPDATE admin_notifications 
      SET isRead = true, readAt = NOW(), updatedAt = NOW()
      WHERE id = ?
    `, [notificationId])

    // Get the updated notification
    const [notification] = await connection.execute(
      'SELECT * FROM admin_notifications WHERE id = ?',
      [notificationId]
    )

    const notificationData = (notification as any[])[0]

    if (!notificationData) {
      return NextResponse.json(
        { error: 'Notification not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      message: 'Notification marked as read',
      notification: {
        id: notificationData.id,
        title: notificationData.title,
        message: notificationData.message,
        type: notificationData.type,
        target: notificationData.target,
        targetId: notificationData.targetId,
        isRead: notificationData.isRead,
        readAt: notificationData.readAt,
        createdBy: notificationData.createdBy,
        createdAt: notificationData.createdAt,
        expiresAt: notificationData.expiresAt
      }
    })
  } catch (error) {
    console.error('Error marking notification as read:', error)
    return NextResponse.json(
      { error: 'Failed to mark notification as read' },
      { status: 500 }
    )
  } finally {
    if (connection) {
      await connection.end()
    }
  }
}