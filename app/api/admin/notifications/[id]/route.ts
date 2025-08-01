import { NextRequest, NextResponse } from 'next/server'
import mysql from 'mysql2/promise'

const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'admin',
  password: process.env.DB_PASSWORD || 'sifre123',
  database: process.env.DB_NAME || 'mydata',
  port: parseInt(process.env.DB_PORT || '3306')
}

export async function DELETE(
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

    // Check if notification exists
    const [existingNotification] = await connection.execute(
      'SELECT id FROM admin_notifications WHERE id = ?',
      [notificationId]
    )

    if ((existingNotification as any[]).length === 0) {
      return NextResponse.json(
        { error: 'Notification not found' },
        { status: 404 }
      )
    }

    // Delete the notification
    await connection.execute(
      'DELETE FROM admin_notifications WHERE id = ?',
      [notificationId]
    )

    return NextResponse.json({
      message: 'Notification deleted successfully'
    })
  } catch (error) {
    console.error('Error deleting notification:', error)
    return NextResponse.json(
      { error: 'Failed to delete notification' },
      { status: 500 }
    )
  } finally {
    if (connection) {
      await connection.end()
    }
  }
}