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
    const size = searchParams.get('size') || ''
    const industry = searchParams.get('industry') || ''
    const subscription_plan = searchParams.get('subscription_plan') || ''

    const offset = (page - 1) * limit

    connection = await mysql.createConnection(dbConfig)

    // Build WHERE clause
    let whereConditions = []
    let queryParams = []

    if (search) {
      whereConditions.push('c.name LIKE ?')
      queryParams.push(`%${search}%`)
    }
    if (status) {
      whereConditions.push('c.status = ?')
      queryParams.push(status)
    }
    if (size) {
      whereConditions.push('c.size = ?')
      queryParams.push(size)
    }
    if (industry) {
      whereConditions.push('c.industry = ?')
      queryParams.push(industry)
    }
    if (subscription_plan) {
      whereConditions.push('s.plan = ?')
      queryParams.push(subscription_plan)
    }

    const whereClause = whereConditions.length > 0 ? 'WHERE ' + whereConditions.join(' AND ') : ''

    // Get total count
    const countQuery = `
      SELECT COUNT(DISTINCT c.id) as total
      FROM companies c
      LEFT JOIN subscriptions s ON c.id = s.companyId
      ${whereClause}
    `
    const [countResult] = await connection.execute(countQuery, queryParams)
    const total = (countResult as any)[0].total

    // Get companies with subscriptions
    const companiesQuery = `
      SELECT 
        c.*,
        s.plan as subscription_plan,
        s.status as subscription_status
      FROM companies c
      LEFT JOIN subscriptions s ON c.id = s.companyId
      ${whereClause}
      ORDER BY c.createdAt DESC
      LIMIT ? OFFSET ?
    `
    const [companiesResult] = await connection.execute(companiesQuery, [...queryParams, limit, offset])
    const companiesData = companiesResult as any[]

    // Get user counts for each company
    const companyIds = companiesData.map(c => c.id)
    let userCounts: any[] = []
    let emailCounts: any[] = []
    let lastLogins: any[] = []

    if (companyIds.length > 0) {
      const placeholders = companyIds.map(() => '?').join(',')
      
      // Get user counts
      const userCountQuery = `
        SELECT companyId, COUNT(*) as count
        FROM users 
        WHERE companyId IN (${placeholders})
        GROUP BY companyId
      `
      const [userCountResult] = await connection.execute(userCountQuery, companyIds)
      userCounts = userCountResult as any[]

      // Get email counts (from usage_metrics)
      const emailCountQuery = `
        SELECT companyId, SUM(emailsSent) as total_emails_sent
        FROM usage_metrics 
        WHERE companyId IN (${placeholders})
        GROUP BY companyId
      `
      const [emailCountResult] = await connection.execute(emailCountQuery, companyIds)
      emailCounts = emailCountResult as any[]

      // Get last login for each company
      const lastLoginQuery = `
        SELECT companyId, MAX(lastLogin) as last_login
        FROM users 
        WHERE companyId IN (${placeholders}) AND lastLogin IS NOT NULL
        GROUP BY companyId
      `
      const [lastLoginResult] = await connection.execute(lastLoginQuery, companyIds)
      lastLogins = lastLoginResult as any[]
    }

    const companies = companiesData.map(company => {
      const userCount = userCounts.find(u => u.companyId === company.id)?.count || 0
      const totalEmailsSent = emailCounts.find(e => e.companyId === company.id)?.total_emails_sent || 0
      const lastLogin = lastLogins.find(l => l.companyId === company.id)?.last_login

      return {
        id: company.id,
        name: company.name,
        email: company.backupEmail, // Using backupEmail as main email
        phone: company.phone || '',
        website: company.website || '',
        industry: company.industry || 'other',
        size: company.size || 'small',
        status: company.status || 'active',
        subscription_plan: company.subscription_plan || 'starter',
        subscription_status: company.subscription_status || 'inactive',
        total_users: userCount,
        total_emails_sent: totalEmailsSent,
        last_login: lastLogin,
        createdAt: company.createdAt
      }
    })

    const totalPages = Math.ceil(total / limit)

    return NextResponse.json({
      companies,
      totalPages,
      currentPage: page,
      total
    })
  } catch (error) {
    console.error('Error fetching companies:', error)
    return NextResponse.json(
      { error: 'Failed to fetch companies' },
      { status: 500 }
    )
  } finally {
    if (connection) {
      await connection.end()
    }
  }
}