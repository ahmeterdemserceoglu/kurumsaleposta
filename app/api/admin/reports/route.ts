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
    const period = searchParams.get('period') || '30d'

    let startDate: Date
    const endDate = new Date()

    switch (period) {
      case '7d':
        startDate = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
        break
      case '90d':
        startDate = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000)
        break
      case '1y':
        startDate = new Date(Date.now() - 365 * 24 * 60 * 60 * 1000)
        break
      default: // 30d
        startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
    }

    connection = await mysql.createConnection(dbConfig)

    // Get total revenue from active subscriptions in the period
    const [revenueResult] = await connection.execute(`
      SELECT SUM(
        CASE 
          WHEN s.plan = 'starter' THEN 99
          WHEN s.plan = 'business' THEN 299
          WHEN s.plan = 'enterprise' THEN 999
          ELSE 99
        END
      ) as total_revenue
      FROM subscriptions s 
      WHERE s.status = 'active'
      AND DATE(s.createdAt) >= ? 
      AND DATE(s.createdAt) <= ?
    `, [startDate.toISOString().split('T')[0], endDate.toISOString().split('T')[0]])
    
    const totalRevenue = (revenueResult as any)[0].total_revenue || 0

    // Get total users in the period
    const [usersResult] = await connection.execute(`
      SELECT COUNT(*) as count 
      FROM users 
      WHERE DATE(createdAt) >= ? 
      AND DATE(createdAt) <= ?
    `, [startDate.toISOString().split('T')[0], endDate.toISOString().split('T')[0]])
    
    const totalUsers = (usersResult as any)[0].count

    // Get total companies in the period
    const [companiesResult] = await connection.execute(`
      SELECT COUNT(*) as count 
      FROM companies 
      WHERE DATE(createdAt) >= ? 
      AND DATE(createdAt) <= ?
    `, [startDate.toISOString().split('T')[0], endDate.toISOString().split('T')[0]])
    
    const totalCompanies = (companiesResult as any)[0].count

    // Get active subscriptions
    const [activeSubsResult] = await connection.execute(
      'SELECT COUNT(*) as count FROM subscriptions WHERE status = ?',
      ['active']
    )
    const activeSubscriptions = (activeSubsResult as any)[0].count

    // Calculate monthly growth based on previous period
    const previousPeriodStart = new Date(startDate.getTime() - (endDate.getTime() - startDate.getTime()))
    const [previousUsersResult] = await connection.execute(`
      SELECT COUNT(*) as count 
      FROM users 
      WHERE DATE(createdAt) >= ? 
      AND DATE(createdAt) < ?
    `, [previousPeriodStart.toISOString().split('T')[0], startDate.toISOString().split('T')[0]])
    
    const previousUsers = (previousUsersResult as any)[0].count
    const monthlyGrowth = previousUsers > 0 ? Math.round(((totalUsers - previousUsers) / previousUsers) * 100) : 0

    // Calculate churn rate
    const [cancelledSubsResult] = await connection.execute(`
      SELECT COUNT(*) as count 
      FROM subscriptions 
      WHERE status = 'cancelled'
      AND DATE(updatedAt) >= ? 
      AND DATE(updatedAt) <= ?
    `, [startDate.toISOString().split('T')[0], endDate.toISOString().split('T')[0]])
    
    const cancelledSubscriptions = (cancelledSubsResult as any)[0].count
    const churnRate = activeSubscriptions > 0 
      ? Math.round((cancelledSubscriptions / activeSubscriptions) * 100 * 10) / 10
      : 0

    const reportData = {
      totalRevenue,
      totalUsers,
      totalCompanies,
      activeSubscriptions,
      monthlyGrowth,
      churnRate
    }

    return NextResponse.json(reportData)
  } catch (error) {
    console.error('Error fetching report data:', error)
    return NextResponse.json(
      { error: 'Failed to fetch report data' },
      { status: 500 }
    )
  } finally {
    if (connection) {
      await connection.end()
    }
  }
}