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

    // Get total users
    const [usersResult] = await connection.execute('SELECT COUNT(*) as count FROM users')
    const totalUsers = (usersResult as any)[0].count

    // Get total companies
    const [companiesResult] = await connection.execute('SELECT COUNT(*) as count FROM companies')
    const totalCompanies = (companiesResult as any)[0].count

    // Get active subscriptions
    const [subscriptionsResult] = await connection.execute(
      'SELECT COUNT(*) as count FROM subscriptions WHERE status = ?',
      ['active']
    )
    const activeSubscriptions = (subscriptionsResult as any)[0].count

    // Get open tickets
    const [ticketsResult] = await connection.execute(
      'SELECT COUNT(*) as count FROM support_tickets WHERE status = ?',
      ['open']
    )
    const openTickets = (ticketsResult as any)[0].count

    // Get today's revenue from active subscriptions (daily portion)
    const [todayRevenueResult] = await connection.execute(`
      SELECT SUM(
        CASE 
          WHEN s.plan = 'starter' THEN 99
          WHEN s.plan = 'business' THEN 299
          WHEN s.plan = 'enterprise' THEN 999
          ELSE 99
        END
      ) / 30 as daily_revenue
      FROM subscriptions s 
      WHERE s.status = 'active'
      AND DATE(s.createdAt) = CURDATE()
    `)
    const todayRevenue = Math.round((todayRevenueResult as any)[0].daily_revenue || 0)

    // Get monthly revenue from usage metrics or simulate
    const [revenueResult] = await connection.execute(`
      SELECT SUM(
        CASE 
          WHEN s.plan = 'starter' THEN 99
          WHEN s.plan = 'business' THEN 299
          WHEN s.plan = 'enterprise' THEN 999
          ELSE 99
        END
      ) as revenue
      FROM subscriptions s 
      WHERE s.status = 'active'
    `)
    const monthlyRevenue = (revenueResult as any)[0].revenue || 0

    const stats = {
      totalUsers: totalUsers || 0,
      totalCompanies: totalCompanies || 0,
      activeSubscriptions: activeSubscriptions || 0,
      openTickets: openTickets || 0,
      todayRevenue,
      monthlyRevenue
    }

    return NextResponse.json(stats)
  } catch (error) {
    console.error('Error fetching dashboard stats:', error)
    return NextResponse.json(
      { error: 'Failed to fetch dashboard stats' },
      { status: 500 }
    )
  } finally {
    if (connection) {
      await connection.end()
    }
  }
}