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
    const plan = searchParams.get('plan') || ''
    const status = searchParams.get('status') || ''
    const billing_cycle = searchParams.get('billing_cycle') || ''

    const offset = (page - 1) * limit

    connection = await mysql.createConnection(dbConfig)

    // Build WHERE clause
    let whereConditions = []
    let queryParams = []

    if (search) {
      whereConditions.push('c.name LIKE ?')
      queryParams.push(`%${search}%`)
    }
    if (plan) {
      whereConditions.push('s.plan = ?')
      queryParams.push(plan)
    }
    if (status) {
      whereConditions.push('s.status = ?')
      queryParams.push(status)
    }
    if (billing_cycle) {
      whereConditions.push('s.billing_cycle = ?')
      queryParams.push(billing_cycle)
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

    // Get subscriptions with company info
    const subscriptionsQuery = `
      SELECT 
        s.*,
        c.name as companyName
      FROM subscriptions s
      INNER JOIN companies c ON s.companyId = c.id
      ${whereClause}
      ORDER BY s.createdAt DESC
      LIMIT ? OFFSET ?
    `
    const [subscriptionsResult] = await connection.execute(subscriptionsQuery, [...queryParams, limit, offset])
    const subscriptionsData = subscriptionsResult as any[]

    // Map the data to match the expected format
    const subscriptions = subscriptionsData.map(sub => ({
      id: sub.id,
      companyId: sub.companyId,
      companyName: sub.companyName || 'Bilinmeyen',
      plan: sub.plan,
      status: sub.status,
      price: calculatePlanPrice(sub.plan), // Calculate price based on plan
      currency: 'TRY',
      billing_cycle: 'monthly', // Default since not in current schema
      starts_at: sub.currentPeriodStart,
      ends_at: sub.currentPeriodEnd,
      auto_renew: true, // Default since not in current schema
      createdAt: sub.createdAt
    }))

    const totalPages = Math.ceil(total / limit)

    return NextResponse.json({
      subscriptions,
      totalPages,
      currentPage: page,
      total
    })
  } catch (error) {
    console.error('Error fetching subscriptions:', error)
    return NextResponse.json(
      { error: 'Failed to fetch subscriptions' },
      { status: 500 }
    )
  } finally {
    if (connection) {
      await connection.end()
    }
  }
}

// Helper function to calculate plan prices
function calculatePlanPrice(plan: string): number {
  const prices = {
    'starter': 99,
    'business': 299,
    'enterprise': 999
  }
  return prices[plan as keyof typeof prices] || 99
}