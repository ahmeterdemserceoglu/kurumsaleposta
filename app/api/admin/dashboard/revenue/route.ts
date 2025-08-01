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
      default: // 30d
        startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
    }

    connection = await mysql.createConnection(dbConfig)

    // Get actual revenue data based on subscriptions created in the period
    const [subscriptions] = await connection.execute(`
      SELECT 
        s.createdAt,
        CASE 
          WHEN s.plan = 'starter' THEN 99
          WHEN s.plan = 'business' THEN 299
          WHEN s.plan = 'enterprise' THEN 999
          ELSE 99
        END as amount
      FROM subscriptions s 
      WHERE s.status = 'active' 
      AND DATE(s.createdAt) >= ? 
      AND DATE(s.createdAt) <= ?
      ORDER BY s.createdAt ASC
    `, [startDate.toISOString().split('T')[0], endDate.toISOString().split('T')[0]])

    // Group revenue by date
    const revenueByDate: { [key: string]: number } = {}
    
    ;(subscriptions as any[]).forEach(sub => {
      const date = new Date(sub.createdAt).toISOString().split('T')[0]
      revenueByDate[date] = (revenueByDate[date] || 0) + sub.amount
    })

    // Get daily revenue from all active subscriptions (distributed daily)
    const [activeSubscriptionsRevenue] = await connection.execute(`
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
    `)
    const dailyRevenue = Math.round((activeSubscriptionsRevenue as any)[0].daily_revenue || 0)

    // Fill in all dates with actual or distributed revenue
    const data = []
    const currentDate = new Date(startDate)
    
    while (currentDate <= endDate) {
      const dateStr = currentDate.toISOString().split('T')[0]
      // Use actual revenue from new subscriptions + daily portion from existing subscriptions
      const newSubscriptionRevenue = revenueByDate[dateStr] || 0
      const totalRevenue = newSubscriptionRevenue + dailyRevenue
      
      data.push({
        date: dateStr,
        revenue: totalRevenue
      })
      currentDate.setDate(currentDate.getDate() + 1)
    }

    return NextResponse.json({ data })
  } catch (error) {
    console.error('Error fetching revenue data:', error)
    return NextResponse.json(
      { error: 'Failed to fetch revenue data' },
      { status: 500 }
    )
  } finally {
    if (connection) {
      await connection.end()
    }
  }
}