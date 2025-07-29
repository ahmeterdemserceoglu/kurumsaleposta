import { NextRequest, NextResponse } from 'next/server';
import { executeQuery, executeQuerySingle } from '@/lib/database';

// GET /api/emails/messages/[id] - Get single email message
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Get message with attachments
    const message = await executeQuerySingle<any>(
      `SELECT 
        em.id,
        em.messageId,
        em.fromAddress,
        em.toAddresses,
        em.ccAddresses,
        em.bccAddresses,
        em.subject,
        em.body,
        em.folder,
        em.isRead,
        em.timestamp,
        em.createdAt
       FROM email_messages em
       WHERE em.id = ?`,
      [id]
    );

    if (!message) {
      return NextResponse.json(
        { error: 'Email message not found' },
        { status: 404 }
      );
    }

    // Get attachments
    const attachments = await executeQuery<any>(
      `SELECT id, filename, size, mimeType, url
       FROM email_attachments 
       WHERE emailMessageId = ?`,
      [id]
    );

    // Format response
    const formattedMessage = {
      ...message,
      toAddresses: JSON.parse(message.toAddresses || '[]'),
      ccAddresses: JSON.parse(message.ccAddresses || '[]'),
      bccAddresses: JSON.parse(message.bccAddresses || '[]'),
      attachments
    };

    return NextResponse.json(formattedMessage);

  } catch (error) {
    console.error('Error fetching email message:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PATCH /api/emails/messages/[id] - Update email message (mark as read, move folder, etc.)
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    // Check if message exists
    const existingMessage = await executeQuerySingle(
      'SELECT id FROM email_messages WHERE id = ?',
      [id]
    );

    if (!existingMessage) {
      return NextResponse.json(
        { error: 'Email message not found' },
        { status: 404 }
      );
    }

    // Build dynamic update query
    const allowedFields = ['isRead', 'folder'];
    const updateFields: string[] = [];
    const updateValues: any[] = [];

    Object.entries(body).forEach(([key, value]) => {
      if (allowedFields.includes(key) && value !== undefined) {
        updateFields.push(`${key} = ?`);
        updateValues.push(value);
      }
    });

    if (updateFields.length === 0) {
      return NextResponse.json(
        { error: 'No valid fields to update' },
        { status: 400 }
      );
    }

    updateValues.push(id);

    // Update message
    await executeQuery(
      `UPDATE email_messages SET ${updateFields.join(', ')}, updatedAt = NOW() WHERE id = ?`,
      updateValues
    );

    // Get updated message
    const updatedMessage = await executeQuerySingle<any>(
      `SELECT 
        em.id,
        em.messageId,
        em.fromAddress,
        em.toAddresses,
        em.ccAddresses,
        em.bccAddresses,
        em.subject,
        em.body,
        em.folder,
        em.isRead,
        em.timestamp,
        em.createdAt
       FROM email_messages em
       WHERE em.id = ?`,
      [id]
    );

    // Format response
    const formattedMessage = {
      ...updatedMessage,
      toAddresses: JSON.parse(updatedMessage.toAddresses || '[]'),
      ccAddresses: JSON.parse(updatedMessage.ccAddresses || '[]'),
      bccAddresses: JSON.parse(updatedMessage.bccAddresses || '[]')
    };

    return NextResponse.json(formattedMessage);

  } catch (error) {
    console.error('Error updating email message:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE /api/emails/messages/[id] - Delete email message
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Check if message exists
    const existingMessage = await executeQuerySingle(
      'SELECT id, folder FROM email_messages WHERE id = ?',
      [id]
    );

    if (!existingMessage) {
      return NextResponse.json(
        { error: 'Email message not found' },
        { status: 404 }
      );
    }

    // If already in trash, delete permanently
    if (existingMessage.folder === 'trash') {
      // Delete attachments first
      await executeQuery(
        'DELETE FROM email_attachments WHERE emailMessageId = ?',
        [id]
      );

      // Delete message
      await executeQuery(
        'DELETE FROM email_messages WHERE id = ?',
        [id]
      );

      return NextResponse.json({
        message: 'Email message deleted permanently',
        deletedMessageId: id
      });
    } else {
      // Move to trash
      await executeQuery(
        'UPDATE email_messages SET folder = ?, updatedAt = NOW() WHERE id = ?',
        ['trash', id]
      );

      return NextResponse.json({
        message: 'Email message moved to trash',
        messageId: id
      });
    }

  } catch (error) {
    console.error('Error deleting email message:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}