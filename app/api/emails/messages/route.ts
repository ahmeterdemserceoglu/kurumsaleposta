import { NextRequest, NextResponse } from 'next/server';
import { EmailMessage } from '@/types';
import { executeQuery, executeQuerySingle } from '@/lib/database';
import { emailComposeSchema } from '@/lib/validations';

// GET /api/emails/messages - Get email messages for an account
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const accountId = searchParams.get('accountId');
    const folder = searchParams.get('folder') || 'inbox';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const search = searchParams.get('search') || '';

    if (!accountId) {
      return NextResponse.json(
        { error: 'Account ID is required' },
        { status: 400 }
      );
    }

    console.log('Messages API - Fetching messages for accountId:', accountId, 'folder:', folder);

    // Build query with filters
    let whereConditions = ['em.emailAccountId = ?', 'em.folder = ?'];
    let queryParams: any[] = [accountId, folder];

    if (search) {
      whereConditions.push('(em.subject LIKE ? OR em.fromAddress LIKE ? OR em.body LIKE ?)');
      const searchTerm = `%${search}%`;
      queryParams.push(searchTerm, searchTerm, searchTerm);
    }

    const whereClause = whereConditions.join(' AND ');

    // Get total count
    const countQuery = `
      SELECT COUNT(*) as total
      FROM email_messages em
      WHERE ${whereClause}
    `;
    
    const countResult = await executeQuerySingle<{ total: number }>(countQuery, queryParams);
    const total = countResult?.total || 0;

    // Get paginated results
    const offset = (page - 1) * limit;
    const messagesQuery = `
      SELECT 
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
        em.createdAt,
        COUNT(ea.id) as attachmentCount
      FROM email_messages em
      LEFT JOIN email_attachments ea ON em.id = ea.emailMessageId
      WHERE ${whereClause}
      GROUP BY em.id
      ORDER BY em.timestamp DESC
      LIMIT ? OFFSET ?
    `;

    queryParams.push(limit, offset);
    const messages = await executeQuery<any>(messagesQuery, queryParams);

    // Parse JSON fields
    const formattedMessages = messages.map(message => ({
      ...message,
      toAddresses: JSON.parse(message.toAddresses || '[]'),
      ccAddresses: JSON.parse(message.ccAddresses || '[]'),
      bccAddresses: JSON.parse(message.bccAddresses || '[]'),
      attachmentCount: parseInt(message.attachmentCount) || 0
    }));

    return NextResponse.json({
      messages: formattedMessages,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    });

  } catch (error) {
    console.error('Error fetching email messages:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/emails/messages - Send new email
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate request body
    const validationResult = emailComposeSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Invalid request data', details: validationResult.error.issues },
        { status: 400 }
      );
    }

    const { to, cc, bcc, subject, body: messageBody, accountId } = body;

    if (!accountId) {
      return NextResponse.json(
        { error: 'Account ID is required' },
        { status: 400 }
      );
    }

    // Get sender email account
    const senderAccount = await executeQuerySingle<any>(
      'SELECT email FROM email_accounts WHERE id = ?',
      [accountId]
    );

    if (!senderAccount) {
      return NextResponse.json(
        { error: 'Email account not found' },
        { status: 404 }
      );
    }

    const messageId = `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const timestamp = new Date();

    // Save to sent folder
    const result = await executeQuery(
      `INSERT INTO email_messages (
        messageId, emailAccountId, fromAddress, toAddresses, ccAddresses, bccAddresses,
        subject, body, folder, isRead, timestamp, createdAt
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'sent', true, ?, NOW())`,
      [
        messageId,
        accountId,
        senderAccount.email,
        JSON.stringify(to),
        JSON.stringify(cc || []),
        JSON.stringify(bcc || []),
        subject,
        messageBody,
        timestamp
      ]
    );

    const emailId = (result as any).insertId;

    // In a real system, you would send the email via SMTP here
    console.log('Email sent:', {
      from: senderAccount.email,
      to,
      subject,
      messageId
    });

    // Create inbox copies for recipients (if they are internal users)
    for (const recipient of to) {
      const recipientAccount = await executeQuerySingle<any>(
        'SELECT id FROM email_accounts WHERE email = ?',
        [recipient]
      );

      if (recipientAccount) {
        await executeQuery(
          `INSERT INTO email_messages (
            messageId, emailAccountId, fromAddress, toAddresses, ccAddresses, bccAddresses,
            subject, body, folder, isRead, timestamp, createdAt
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'inbox', false, ?, NOW())`,
          [
            messageId,
            recipientAccount.id,
            senderAccount.email,
            JSON.stringify(to),
            JSON.stringify(cc || []),
            JSON.stringify(bcc || []),
            subject,
            messageBody,
            timestamp
          ]
        );
      }
    }

    const newMessage = {
      id: emailId.toString(),
      messageId,
      fromAddress: senderAccount.email,
      toAddresses: to,
      ccAddresses: cc || [],
      bccAddresses: bcc || [],
      subject,
      body: messageBody,
      folder: 'sent',
      isRead: true,
      timestamp,
      attachmentCount: 0
    };

    return NextResponse.json(newMessage, { status: 201 });

  } catch (error) {
    console.error('Error sending email:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}