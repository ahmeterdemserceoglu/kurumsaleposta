import { NextRequest, NextResponse } from 'next/server'
import mysql from 'mysql2/promise'

const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'admin',
  password: process.env.DB_PASSWORD || 'sifre123',
  database: process.env.DB_NAME || 'mydata',
  port: parseInt(process.env.DB_PORT || '3306')
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  let connection;
  try {
    const updates = await request.json()
    const { id } = await params
    const companyId = parseInt(id)

    if (isNaN(companyId)) {
      return NextResponse.json(
        { error: 'Invalid company ID' },
        { status: 400 }
      )
    }

    connection = await mysql.createConnection(dbConfig)

    // Prepare update fields
    const updateFields = []
    const updateValues = []

    if (updates.status) {
      updateFields.push('status = ?')
      updateValues.push(updates.status)
    }
    if (updates.size) {
      updateFields.push('size = ?')
      updateValues.push(updates.size)
    }
    if (updates.industry) {
      updateFields.push('industry = ?')
      updateValues.push(updates.industry)
    }
    if (updates.admin_notes) {
      updateFields.push('admin_notes = ?')
      updateValues.push(updates.admin_notes)
    }

    if (updateFields.length === 0) {
      return NextResponse.json(
        { error: 'No valid fields to update' },
        { status: 400 }
      )
    }

    // Always update the updatedAt field
    updateFields.push('updatedAt = NOW()')
    updateValues.push(companyId)

    const updateQuery = `
      UPDATE companies 
      SET ${updateFields.join(', ')}
      WHERE id = ?
    `

    await connection.execute(updateQuery, updateValues)

    // Get the updated company
    const [companyResult] = await connection.execute(
      'SELECT * FROM companies WHERE id = ?',
      [companyId]
    )
    const company = (companyResult as any[])[0]

    return NextResponse.json({
      message: 'Company updated successfully',
      company
    })
  } catch (error) {
    console.error('Error updating company:', error)
    return NextResponse.json(
      { error: 'Failed to update company' },
      { status: 500 }
    )
  } finally {
    if (connection) {
      await connection.end()
    }
  }
}