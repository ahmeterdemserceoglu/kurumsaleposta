import { NextRequest, NextResponse } from 'next/server';
import { executeQuery, executeQuerySingle } from '@/lib/database';
import { EmailMessage } from '@/types';
import { sendEmail as sendSMTPEmail } from '@/lib/smtp';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const {
            fromAccountId,
            to,
            cc = [],
            bcc = [],
            subject,
            body: emailBody,
            attachments = []
        } = body;

        // Validate required fields
        if (!fromAccountId || !to || !Array.isArray(to) || to.length === 0 || !subject || !emailBody) {
            return NextResponse.json(
                { message: 'fromAccountId, to, subject and body are required' },
                { status: 400 }
            );
        }

        // Validate email addresses
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        const allEmails = [...to, ...cc, ...bcc];

        for (const email of allEmails) {
            if (!emailRegex.test(email)) {
                return NextResponse.json(
                    { message: `Invalid email address: ${email}` },
                    { status: 400 }
                );
            }
        }

        // Get sender account info
        const senderAccount = await executeQuerySingle<any>(
            'SELECT email FROM email_accounts WHERE id = ?',
            [fromAccountId]
        );

        if (!senderAccount) {
            return NextResponse.json(
                { message: 'Sender account not found' },
                { status: 404 }
            );
        }

        // Generate unique message ID
        const messageId = `msg_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
        const timestamp = new Date();

        // Save to sender's sent folder
        const sentResult = await executeQuery(
            `INSERT INTO email_messages (
        messageId, emailAccountId, fromAddress, toAddresses, ccAddresses, bccAddresses,
        subject, body, folder, isRead, timestamp, createdAt
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'sent', true, ?, NOW())`,
            [
                messageId,
                fromAccountId,
                senderAccount.email,
                JSON.stringify(to),
                JSON.stringify(cc),
                JSON.stringify(bcc),
                subject,
                emailBody,
                timestamp
            ]
        );

        // Optimize: Get all recipient accounts in one query
        const allRecipients = [...to, ...cc];
        if (allRecipients.length > 0) {
            const placeholders = allRecipients.map(() => '?').join(',');
            const recipientAccounts = await executeQuery<any>(
                `SELECT id, email FROM email_accounts WHERE email IN (${placeholders})`,
                allRecipients
            );

            // Bulk insert for all recipients
            if (recipientAccounts.length > 0) {
                const insertValues = recipientAccounts.map(account => [
                    messageId,
                    account.id,
                    senderAccount.email,
                    JSON.stringify(to),
                    JSON.stringify(cc),
                    JSON.stringify(bcc),
                    subject,
                    emailBody,
                    'inbox',
                    false,
                    timestamp
                ]);

                // Bulk insert - much more efficient
                const insertQuery = `
          INSERT INTO email_messages (
            messageId, emailAccountId, fromAddress, toAddresses, ccAddresses, bccAddresses,
            subject, body, folder, isRead, timestamp, createdAt
          ) VALUES ${insertValues.map(() => '(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())').join(', ')}
        `;

                await executeQuery(insertQuery, insertValues.flat());
            }
        }

        // Send actual email via SMTP
        try {
            const smtpResult = await sendSMTPEmail({
                from: senderAccount.email, // Sistem hesabından gönder (info@hdticaret.com)
                to: to,
                cc: cc.length > 0 ? cc : undefined,
                bcc: bcc.length > 0 ? bcc : undefined,
                subject: subject,
                html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px;">
              <h2 style="color: #333; margin-bottom: 20px;">${subject}</h2>
              <div style="background-color: white; padding: 20px; border-radius: 4px; border-left: 4px solid #007bff;">
                ${emailBody.replace(/\n/g, '<br>')}
              </div>
              <div style="margin-top: 20px; padding-top: 20px; border-top: 1px solid #dee2e6; color: #6c757d; font-size: 12px;">
                <p>Bu e-posta ${senderAccount.email} tarafından gönderilmiştir.</p>
                <p>Mesaj ID: ${messageId}</p>
              </div>
            </div>
          </div>
        `,
                text: emailBody,
                attachments: attachments.map((att: any) => ({
                    filename: att.filename,
                    content: att.content || att.url,
                    contentType: att.mimeType
                }))
            });

            if (!smtpResult.success) {
                console.error('SMTP send failed:', smtpResult.error);
                // Continue anyway - email is saved locally even if SMTP fails
            } else {
                console.log('Email sent via SMTP successfully:', smtpResult.messageId);
            }
        } catch (smtpError) {
            console.error('SMTP error:', smtpError);
            // Continue anyway - email is saved locally even if SMTP fails
        }

        // Handle attachments if any - bulk insert
        if (attachments && attachments.length > 0) {
            const attachmentValues = attachments.map((att: any) => [
                (sentResult as any).insertId,
                att.filename,
                att.size,
                att.mimeType,
                att.url
            ]);

            const attachmentQuery = `
        INSERT INTO email_attachments (emailMessageId, filename, size, mimeType, url, createdAt)
        VALUES ${attachmentValues.map(() => '(?, ?, ?, ?, ?, NOW())').join(', ')}
      `;

            await executeQuery(attachmentQuery, attachmentValues.flat());
        }

        // Return success response
        const sentMessage: EmailMessage = {
            id: (sentResult as any).insertId.toString(),
            messageId,
            from: senderAccount.email,
            to,
            cc,
            bcc,
            subject,
            body: emailBody,
            folder: 'sent',
            isRead: true,
            timestamp,
            attachments: attachments || []
        };

        return NextResponse.json({
            success: true,
            message: 'Email sent successfully',
            data: sentMessage
        }, { status: 201 });

    } catch (error) {
        console.error('Error sending email:', error);
        return NextResponse.json(
            { message: 'Internal server error' },
            { status: 500 }
        );
    }
}