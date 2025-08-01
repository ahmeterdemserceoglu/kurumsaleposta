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
    connection = await mysql.createConnection(dbConfig)

    // Since we don't have a payments table yet, we'll calculate stats based on subscriptions
    // In a real scenario, you would have a dedicated payments table

    // Get all subscriptions for calculations (simulating payments)
    const [subscriptions] = await connection.execute(`
      SELECT 
        s.id,
        s.status,
        s.plan,
        s.createdAt,
        CASE 
          WHEN s.plan = 'starter' THEN 99
          WHEN s.plan = 'business' THEN 299
          WHEN s.plan = 'enterprise' THEN 999
          ELSE 99
        END as amount
      FROM subscriptions s
    `)

    const allPayments = (subscriptions as any[]).map(sub => ({
      id: sub.id,
      amount: sub.amount,
      status: sub.status === 'active' ? 'completed' : sub.status === 'cancelled' ? 'refunded' : 'pending',
      created_at: sub.createdAt,
      paid_at: sub.createdAt
    }))

    const completedPayments = allPayments.filter(p => p.status === 'completed')
    const pendingPayments = allPayments.filter(p => p.status === 'pending')
    const refundedPayments = allPayments.filter(p => p.status === 'refunded')

    // Calculate stats
    const totalRevenue = completedPayments.reduce((sum, p) => sum + p.amount, 0)
    const totalPayments = allPayments.length
    const successRate = totalPayments > 0 ? (completedPayments.length / totalPayments) * 100 : 0
    const averageAmount = completedPayments.length > 0 ? totalRevenue / completedPayments.length : 0

    // Today's revenue
    const today = new Date().toISOString().split('T')[0]
    const todayRevenue = completedPayments
      .filter(p => p.paid_at && new Date(p.paid_at).toISOString().split('T')[0] === today)
      .reduce((sum, p) => sum + p.amount, 0)

    // Monthly revenue
    const startOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1)
    const monthlyRevenue = completedPayments
      .filter(p => p.paid_at && new Date(p.paid_at) >= startOfMonth)
      .reduce((sum, p) => sum + p.amount, 0)

    // Pending and refunded amounts
    const pendingAmount = pendingPayments.reduce((sum, p) => sum + p.amount, 0)
    const refundedAmount = refundedPayments.reduce((sum, p) => sum + p.amount, 0)

    const stats = {
      totalRevenue,
      totalPayments,
      successRate: Math.round(successRate * 100) / 100,
      averageAmount: Math.round(averageAmount * 100) / 100,
      todayRevenue,
      monthlyRevenue,
      pendingAmount,
      refundedAmount
    }

    return NextResponse.json({ stats })
  } catch (error) {
    console.error('Error fetching payment stats:', error)
    return NextResponse.json(
      { error: 'Failed to fetch payment stats' },
      { status: 500 }
    )
  } finally {
    if (connection) {
      await connection.end()
    }
  }
}