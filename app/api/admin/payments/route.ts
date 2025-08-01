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
    const payment_method = searchParams.get('payment_method') || ''
    const gateway = searchParams.get('gateway') || ''
    const date_from = searchParams.get('date_from') || ''
    const date_to = searchParams.get('date_to') || ''

    const offset = (page - 1) * limit

    // Since we don't have a payments table yet, we'll simulate payment data based on subscriptions
    // In a real scenario, you would have a dedicated payments table
    
    connection = await mysql.createConnection(dbConfig)

    // Build WHERE clause for filtering subscriptions (simulating payments)
    let whereConditions = []
    let queryParams = []

    if (search) {
      whereConditions.push('c.name LIKE ?')
      queryParams.push(`%${search}%`)
    }
    if (status) {
      // Map subscription status to payment status
      const paymentStatus = status === 'completed' ? 'active' : status
      whereConditions.push('s.status = ?')
      queryParams.push(paymentStatus)
    }
    if (date_from) {
      whereConditions.push('DATE(s.createdAt) >= ?')
      queryParams.push(date_from)
    }
    if (date_to) {
      whereConditions.push('DATE(s.createdAt) <= ?')
      queryParams.push(date_to)
    }

    const whereClause = whereConditions.length > 0 ? 'WHERE ' + whereConditions.join(' AND ') : ''

    // Get total count
    const countQuery = `
      SELECT COUNT(*) as total
      FROM subscriptions s
      INNER JOIN companies c ON s.companyId = c.id
      ${whereClause}
    `
    const [countResult] = await connection.execute(countQuery, queryParams)
    const total = (countResult as any)[0].total

    // Get simulated payments data from subscriptions
    const paymentsQuery = `
      SELECT 
        s.id,
        s.companyId,
        c.name as companyName,
        s.plan,
        s.status,
        s.createdAt,
        CASE 
          WHEN s.plan = 'starter' THEN 99
          WHEN s.plan = 'business' THEN 299
          WHEN s.plan = 'enterprise' THEN 999
          ELSE 99
        END as amount
      FROM subscriptions s
      INNER JOIN companies c ON s.companyId = c.id
      ${whereClause}
      ORDER BY s.createdAt DESC
      LIMIT ? OFFSET ?
    `
    const [paymentsResult] = await connection.execute(paymentsQuery, [...queryParams, limit, offset])
    const paymentsData = paymentsResult as any[]

    // Map subscription data to payment format
    const payments = paymentsData.map((sub, index) => ({
      id: sub.id,
      companyId: sub.companyId,
      companyName: sub.companyName || 'Bilinmeyen',
      subscriptionId: sub.id,
      amount: sub.amount,
      currency: 'TRY',
      status: sub.status === 'active' ? 'completed' : 'pending',
      payment_method: sub.plan === 'starter' ? 'credit_card' : sub.plan === 'business' ? 'bank_transfer' : 'paypal',
      transaction_id: `TXN-${sub.id}-${Date.now()}`,
      gateway: sub.plan === 'starter' ? 'stripe' : sub.plan === 'business' ? 'iyzico' : 'paypal',
      description: `${sub.plan} planı abonelik ödemesi`,
      paid_at: sub.createdAt,
      createdAt: sub.createdAt
    }))

    const totalPages = Math.ceil(total / limit)

    return NextResponse.json({
      payments,
      totalPages,
      currentPage: page,
      total
    })
  } catch (error) {
    console.error('Error fetching payments:', error)
    return NextResponse.json(
      { error: 'Failed to fetch payments' },
      { status: 500 }
    )
  } finally {
    if (connection) {
      await connection.end()
    }
  }
}