import { NextRequest, NextResponse } from 'next/server'
import mysql from 'mysql2/promise'

const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'admin',
  password: process.env.DB_PASSWORD || 'sifre123',
  database: process.env.DB_NAME || 'mydata',
  port: parseInt(process.env.DB_PORT || '3306')
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  let connection;
  try {
    const { reason } = await request.json()
    const { id } = await params
    const companyId = parseInt(id)

    if (isNaN(companyId)) {
      return NextResponse.json(
        { error: 'Invalid company ID' },
        { status: 400 }
      )
    }

    if (!reason || reason.trim().length === 0) {
      return NextResponse.json(
        { error: 'Suspension reason is required' },
        { status: 400 }
      )
    }

    connection = await mysql.createConnection(dbConfig)

    // Update company status to suspended
    await connection.execute(
      `UPDATE companies 
       SET status = 'suspended', 
           suspension_reason = ?, 
           suspended_at = NOW(), 
           updatedAt = NOW()
       WHERE id = ?`,
      [reason, companyId]
    )

    // Also suspend all active subscriptions for this company
    await connection.execute(
      `UPDATE subscriptions 
       SET status = 'cancelled', 
           updatedAt = NOW()
       WHERE companyId = ? AND status = 'active'`,
      [companyId]
    )

    // Disable all users from this company
    await connection.execute(
      `UPDATE users 
       SET status = 'inactive', 
           updatedAt = NOW()
       WHERE companyId = ?`,
      [companyId]
    )

    // Get the updated company
    const [companyResult] = await connection.execute(
      'SELECT * FROM companies WHERE id = ?',
      [companyId]
    )
    const company = (companyResult as any[])[0]

    return NextResponse.json({
      message: 'Company suspended successfully',
      company
    })
  } catch (error) {
    console.error('Error suspending company:', error)
    return NextResponse.json(
      { error: 'Failed to suspend company' },
      { status: 500 }
    )
  } finally {
    if (connection) {
      await connection.end()
    }
  }
}