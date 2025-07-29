import nodemailer from 'nodemailer';

// SMTP Configuration
const SMTP_CONFIG = {
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: process.env.SMTP_SECURE === 'true', // true for 465, false for other ports
    auth: {
        user: process.env.SMTP_USER || '',
        pass: process.env.SMTP_PASS || ''
    }
};

// Create reusable transporter object using SMTP transport
const transporter = nodemailer.createTransport(SMTP_CONFIG);

// Verify SMTP connection
export const verifyConnection = async (): Promise<boolean> => {
    try {
        await transporter.verify();
        console.log('SMTP server is ready to take our messages');
        return true;
    } catch (error) {
        console.error('SMTP connection error:', error);
        return false;
    }
};

// Send email function
export const sendEmail = async (options: {
    from: string;
    to: string | string[];
    cc?: string | string[];
    bcc?: string | string[];
    subject: string;
    text?: string;
    html?: string;
    attachments?: Array<{
        filename: string;
        content: Buffer | string;
        contentType?: string;
    }>;
}): Promise<{ success: boolean; messageId?: string; error?: string }> => {
    try {
        // Verify connection before sending
        const isConnected = await verifyConnection();
        if (!isConnected) {
            return { success: false, error: 'SMTP connection failed' };
        }

        // Direkt gönderen kişinin adresini kullan - varsayılan değer yok
        const fromAddress = options.from;

        const info = await transporter.sendMail({
            from: fromAddress, // Direkt gönderen kişinin e-posta adresi
            replyTo: fromAddress, // Reply de aynı adrese
            to: Array.isArray(options.to) ? options.to.join(', ') : options.to,
            cc: options.cc ? (Array.isArray(options.cc) ? options.cc.join(', ') : options.cc) : undefined,
            bcc: options.bcc ? (Array.isArray(options.bcc) ? options.bcc.join(', ') : options.bcc) : undefined,
            subject: options.subject,
            text: options.text,
            html: options.html || options.text,
            attachments: options.attachments
        });

        console.log('Email sent successfully:', info.messageId);
        return { success: true, messageId: info.messageId };

    } catch (error) {
        console.error('Error sending email:', error);
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error occurred'
        };
    }
};

// Test email function - from parametresi zorunlu
export const sendTestEmail = async (to: string, from: string): Promise<{ success: boolean; error?: string }> => {
    return sendEmail({
        from: from, // Dinamik from adresi - varsayılan değer yok
        to,
        subject: 'Test Email from Your App',
        text: 'This is a test email to verify SMTP configuration.',
        html: `
      <h2>Test Email</h2>
      <p>This is a test email to verify SMTP configuration.</p>
      <p>If you received this email, your SMTP setup is working correctly!</p>
      <p><strong>Sent from:</strong> ${from}</p>
    `
    });
};

export default transporter;