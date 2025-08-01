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

    // Get user registrations
    const [users] = await connection.execute(
      'SELECT createdAt FROM users WHERE createdAt >= ? AND createdAt <= ? ORDER BY createdAt ASC',
      [startDate.toISOString().split('T')[0], endDate.toISOString().split('T')[0]]
    )

    // Get company registrations
    const [companies] = await connection.execute(
      'SELECT createdAt FROM companies WHERE createdAt >= ? AND createdAt <= ? ORDER BY createdAt ASC',
      [startDate.toISOString().split('T')[0], endDate.toISOString().split('T')[0]]
    )

    // Group by date
    const usersByDate: { [key: string]: number } = {}
    const companiesByDate: { [key: string]: number } = {}
    
    ;(users as any[]).forEach(user => {
      const date = new Date(user.createdAt).toISOString().split('T')[0]
      usersByDate[date] = (usersByDate[date] || 0) + 1
    })

    ;(companies as any[]).forEach(company => {
      const date = new Date(company.createdAt).toISOString().split('T')[0]
      companiesByDate[date] = (companiesByDate[date] || 0) + 1
    })

    // Fill in missing dates with actual data (0 if no registrations)
    const data = []
    const currentDate = new Date(startDate)
    
    while (currentDate <= endDate) {
      const dateStr = currentDate.toISOString().split('T')[0]
      
      data.push({
        date: dateStr,
        users: usersByDate[dateStr] || 0,
        companies: companiesByDate[dateStr] || 0
      })
      currentDate.setDate(currentDate.getDate() + 1)
    }

    return NextResponse.json({ data })
  } catch (error) {
    console.error('Error fetching user growth data:', error)
    return NextResponse.json(
      { error: 'Failed to fetch user growth data' },
      { status: 500 }
    )
  } finally {
    if (connection) {
      await connection.end()
    }
  }
}