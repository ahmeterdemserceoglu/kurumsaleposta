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
        const type = searchParams.get('type') || 'revenue'
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
        let chartData: { labels: string[]; data: number[] }

        switch (type) {
            case 'revenue':
                // Get revenue data based on subscriptions created in the period
                const [subscriptions] = await connection.execute(`
          SELECT 
            DATE(s.createdAt) as date,
            SUM(CASE 
              WHEN s.plan = 'starter' THEN 99
              WHEN s.plan = 'business' THEN 299
              WHEN s.plan = 'enterprise' THEN 999
              ELSE 99
            END) as amount
          FROM subscriptions s 
          WHERE s.status = 'active'
          AND DATE(s.createdAt) >= ? 
          AND DATE(s.createdAt) <= ?
          GROUP BY DATE(s.createdAt)
          ORDER BY DATE(s.createdAt) ASC
        `, [startDate.toISOString().split('T')[0], endDate.toISOString().split('T')[0]])

                const revenueByDate: { [key: string]: number } = {}
                    ; (subscriptions as any[]).forEach(sub => {
                        const date = new Date(sub.date).toISOString().split('T')[0]
                        revenueByDate[date] = sub.amount
                    })

                const revenueDates: string[] = []
                const revenueValues: number[] = []
                const currentDate = new Date(startDate)

                while (currentDate <= endDate) {
                    const dateStr = currentDate.toISOString().split('T')[0]
                    revenueDates.push(dateStr)
                    revenueValues.push(revenueByDate[dateStr] || 0)
                    currentDate.setDate(currentDate.getDate() + 1)
                }

                chartData = { labels: revenueDates, data: revenueValues }
                break

            case 'users':
                const [users] = await connection.execute(`
          SELECT 
            DATE(createdAt) as date,
            COUNT(*) as count
          FROM users 
          WHERE DATE(createdAt) >= ? 
          AND DATE(createdAt) <= ?
          GROUP BY DATE(createdAt)
          ORDER BY DATE(createdAt) ASC
        `, [startDate.toISOString().split('T')[0], endDate.toISOString().split('T')[0]])

                const usersByDate: { [key: string]: number } = {}
                    ; (users as any[]).forEach(user => {
                        const date = new Date(user.date).toISOString().split('T')[0]
                        usersByDate[date] = user.count
                    })

                const userDates: string[] = []
                const userValues: number[] = []
                const userCurrentDate = new Date(startDate)

                while (userCurrentDate <= endDate) {
                    const dateStr = userCurrentDate.toISOString().split('T')[0]
                    userDates.push(dateStr)
                    userValues.push(usersByDate[dateStr] || 0)
                    userCurrentDate.setDate(userCurrentDate.getDate() + 1)
                }

                chartData = { labels: userDates, data: userValues }
                break

            case 'plans':
                const [planData] = await connection.execute(`
          SELECT 
            plan,
            COUNT(*) as count
          FROM subscriptions 
          WHERE status = 'active'
          GROUP BY plan
        `)

                const planLabels: string[] = []
                const planValues: number[] = []
                const planNames = { 'starter': 'Başlangıç', 'business': 'İş', 'enterprise': 'Kurumsal' }

                    ; (planData as any[]).forEach(plan => {
                        planLabels.push(planNames[plan.plan as keyof typeof planNames] || plan.plan)
                        planValues.push(plan.count)
                    })

                chartData = { labels: planLabels, data: planValues }
                break

            case 'payments':
                // Since we don't have actual payment methods, simulate based on plans
                const [paymentData] = await connection.execute(`
          SELECT 
            CASE 
              WHEN plan = 'starter' THEN 'Kredi Kartı'
              WHEN plan = 'business' THEN 'Banka Havalesi'
              WHEN plan = 'enterprise' THEN 'Kurumsal Hesap'
              ELSE 'Kredi Kartı'
            END as payment_method,
            COUNT(*) as count
          FROM subscriptions 
          WHERE status = 'active'
          GROUP BY payment_method
        `)

                const methodLabels: string[] = []
                const methodValues: number[] = []

                    ; (paymentData as any[]).forEach(method => {
                        methodLabels.push(method.payment_method)
                        methodValues.push(method.count)
                    })

                chartData = { labels: methodLabels, data: methodValues }
                break

            default:
                chartData = { labels: [], data: [] }
        }

        return NextResponse.json({ chartData })
    } catch (error) {
        console.error('Error fetching chart data:', error)
        return NextResponse.json(
            { error: 'Failed to fetch chart data' },
            { status: 500 }
        )
    } finally {
        if (connection) {
            await connection.end()
        }
    }
}