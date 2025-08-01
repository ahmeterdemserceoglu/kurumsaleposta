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
    const { status } = await request.json()
    const { id } = await params
    const subscriptionId = parseInt(id)

    if (isNaN(subscriptionId)) {
      return NextResponse.json(
        { error: 'Invalid subscription ID' },
        { status: 400 }
      )
    }

    if (!status || !['active', 'cancelled', 'past_due'].includes(status)) {
      return NextResponse.json(
        { error: 'Invalid status. Must be: active, cancelled, or past_due' },
        { status: 400 }
      )
    }

    connection = await mysql.createConnection(dbConfig)

    // Update subscription status
    await connection.execute(
      `UPDATE subscriptions 
       SET status = ?, updatedAt = NOW()
       WHERE id = ?`,
      [status, subscriptionId]
    )

    // Get the updated subscription with company info
    const [subscriptionResult] = await connection.execute(
      `SELECT s.*, c.name as companyName
       FROM subscriptions s
       INNER JOIN companies c ON s.companyId = c.id
       WHERE s.id = ?`,
      [subscriptionId]
    )
    
    const subscription = (subscriptionResult as any[])[0]

    if (!subscription) {
      return NextResponse.json(
        { error: 'Subscription not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      message: 'Subscription status updated successfully',
      subscription: {
        id: subscription.id,
        companyId: subscription.companyId,
        companyName: subscription.companyName,
        plan: subscription.plan,
        status: subscription.status,
        currentPeriodStart: subscription.currentPeriodStart,
        currentPeriodEnd: subscription.currentPeriodEnd,
        createdAt: subscription.createdAt,
        updatedAt: subscription.updatedAt
      }
    })
  } catch (error) {
    console.error('Error updating subscription status:', error)
    return NextResponse.json(
      { error: 'Failed to update subscription status' },
      { status: 500 }
    )
  } finally {
    if (connection) {
      await connection.end()
    }
  }
}