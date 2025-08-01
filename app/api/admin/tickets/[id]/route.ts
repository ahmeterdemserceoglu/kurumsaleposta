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
    const ticketId = parseInt(id)

    if (isNaN(ticketId)) {
      return NextResponse.json(
        { error: 'Invalid ticket ID' },
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
    if (updates.priority) {
      updateFields.push('priority = ?')
      updateValues.push(updates.priority)
    }
    if (updates.assigned_to !== undefined) {
      updateFields.push('assignedTo = ?')
      updateValues.push(updates.assigned_to)
      updateFields.push('assignedAdminName = ?')
      updateValues.push(updates.assigned_to ? 'Admin Name' : null)
    }
    if (updates.resolved_at) {
      updateFields.push('resolvedAt = ?')
      updateValues.push(updates.resolved_at)
    }

    if (updateFields.length === 0) {
      return NextResponse.json(
        { error: 'No valid fields to update' },
        { status: 400 }
      )
    }

    // Always update the updatedAt field
    updateFields.push('updatedAt = NOW()')
    updateValues.push(ticketId)

    const updateQuery = `
      UPDATE support_tickets 
      SET ${updateFields.join(', ')}
      WHERE id = ?
    `

    await connection.execute(updateQuery, updateValues)

    // Get the updated ticket with company and user info
    const [ticketResult] = await connection.execute(`
      SELECT 
        t.*,
        c.name as companyName,
        u.email as userEmail
      FROM support_tickets t
      INNER JOIN companies c ON t.companyId = c.id
      INNER JOIN users u ON t.userId = u.id
      WHERE t.id = ?
    `, [ticketId])
    
    const ticket = (ticketResult as any[])[0]

    if (!ticket) {
      return NextResponse.json(
        { error: 'Ticket not found' },
        { status: 404 }
      )
    }

    // If there's a response, you might want to send an email to the user
    if (updates.response && updates.response.trim()) {
      // Here you would typically send an email with the response
      console.log('Sending response email:', updates.response)
    }

    return NextResponse.json({
      message: 'Ticket updated successfully',
      ticket: {
        id: ticket.id,
        companyId: ticket.companyId,
        companyName: ticket.companyName,
        userId: ticket.userId,
        userEmail: ticket.userEmail,
        subject: ticket.subject,
        description: ticket.description,
        status: ticket.status,
        priority: ticket.priority,
        category: ticket.category,
        assigned_to: ticket.assignedTo,
        assignedAdminName: ticket.assignedAdminName,
        resolved_at: ticket.resolvedAt,
        createdAt: ticket.createdAt,
        updatedAt: ticket.updatedAt
      }
    })
  } catch (error) {
    console.error('Error updating ticket:', error)
    return NextResponse.json(
      { error: 'Failed to update ticket' },
      { status: 500 }
    )
  } finally {
    if (connection) {
      await connection.end()
    }
  }
}