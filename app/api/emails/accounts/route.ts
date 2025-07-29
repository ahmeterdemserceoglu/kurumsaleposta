import { NextRequest, NextResponse } from 'next/server';
import { EmailAccount, User, Company } from '@/types';
import { emailAccountCreateSchema, bulkEmailAccountSchema, paginationSchema } from '@/lib/validations';
import { executeQuery, executeQuerySingle } from '@/lib/database';

// Helper function to generate email address
async function generateEmailAddress(firstName: string, lastName: string, domain: string): Promise<string> {
    const baseEmail = `${firstName.toLowerCase()}.${lastName.toLowerCase()}@${domain}`;

    // Check if email already exists and add number suffix if needed
    let counter = 1;
    let email = baseEmail;

    while (true) {
        const existingAccount = await executeQuerySingle(
            'SELECT id FROM email_accounts WHERE email = ?',
            [email]
        );

        if (!existingAccount) {
            break;
        }

        email = `${firstName.toLowerCase()}.${lastName.toLowerCase()}${counter}@${domain}`;
        counter++;
    }

    return email;
}

// Helper function to get user's company
async function getUserCompany(userId: string): Promise<Company | null> {
    const result = await executeQuerySingle<any>(
        `SELECT c.id, c.name, c.domain, c.backupEmail, c.plan, c.status, c.createdAt,
            cs.maxEmailAccounts, cs.storageLimit
     FROM companies c
     JOIN users u ON c.id = u.companyId
     LEFT JOIN company_settings cs ON c.id = cs.companyId
     WHERE u.id = ?`,
        [userId]
    );

    if (!result) return null;

    return {
        id: result.id,
        name: result.name,
        domain: result.domain,
        backupEmail: result.backupEmail,
        plan: result.plan,
        status: result.status,
        createdAt: result.createdAt,
        settings: {
            maxEmailAccounts: result.maxEmailAccounts || 10,
            storageLimit: result.storageLimit || 10,
            securitySettings: {
                passwordPolicy: {
                    minLength: 8,
                    requireUppercase: true,
                    requireLowercase: true,
                    requireNumbers: true,
                    requireSpecialChars: false
                },
                twoFactorRequired: false,
                sessionTimeout: 480
            }
        }
    };
}

// GET /api/emails/accounts - List email accounts with pagination and filtering
export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const search = searchParams.get('search') || '';
    const status = searchParams.get('status') || '';
    const companyId = searchParams.get('companyId') || '';
    let queryParams: any[] = [];

    try {

        // Validate pagination
        const paginationResult = paginationSchema.safeParse({ page, limit });
        if (!paginationResult.success) {
            return NextResponse.json(
                { error: 'Invalid pagination parameters' },
                { status: 400 }
            );
        }

        if (!companyId) {
            return NextResponse.json(
                { error: 'Company ID is required' },
                { status: 400 }
            );
        }

        console.log('Email API - Fetching accounts for companyId:', companyId); // Debug log

        // Build query with filters
        let whereConditions = ['ea.companyId = ?'];
        queryParams = [companyId];

        if (status && status !== 'all') {
            whereConditions.push('ea.status = ?');
            queryParams.push(status);
        }

        if (search) {
            whereConditions.push('ea.email LIKE ?');
            queryParams.push(`%${search}%`);
        }

        const whereClause = whereConditions.join(' AND ');

        // Get total count
        const countQuery = `
      SELECT COUNT(*) as total
      FROM email_accounts ea
      WHERE ${whereClause}
    `;

        const countResult = await executeQuerySingle<{ total: number }>(countQuery, queryParams);
        const total = countResult?.total || 0;

        // Get paginated results
        const offset = (page - 1) * limit;
        const accountsQuery = `
      SELECT 
        ea.id,
        ea.email,
        ea.userId,
        ea.companyId,
        ea.forwardingRules,
        ea.storageUsed,
        ea.status,
        ea.createdAt
      FROM email_accounts ea
      WHERE ${whereClause}
      ORDER BY ea.createdAt DESC
      LIMIT ? OFFSET ?
    `;

        queryParams.push(limit, offset);
        const accounts = await executeQuery<any>(accountsQuery, queryParams);

        // Parse forwarding rules JSON
        const formattedAccounts = accounts.map(account => ({
            ...account,
            forwardingRules: JSON.parse(account.forwardingRules || '[]')
        }));

        return NextResponse.json({
            accounts: formattedAccounts,
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit)
        });

    } catch (error) {
        console.error('Error fetching email accounts:', error);
        console.error('Error details:', {
            message: error instanceof Error ? error.message : 'Unknown error',
            stack: error instanceof Error ? error.stack : undefined,
            companyId,
            queryParams
        });
        return NextResponse.json(
            { 
                error: 'Internal server error',
                details: error instanceof Error ? error.message : 'Unknown error'
            },
            { status: 500 }
        );
    }
}

// POST /api/emails/accounts - Create single email account
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { email, userId, companyId, password } = body;

        // Basic validation
        if (!email || !userId || !companyId) {
            return NextResponse.json(
                { message: 'Email, userId, and companyId are required' },
                { status: 400 }
            );
        }

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return NextResponse.json(
                { message: 'Invalid email format' },
                { status: 400 }
            );
        }

        // Password is optional for email accounts
        if (password && password.length < 8) {
            return NextResponse.json(
                { message: 'Password must be at least 8 characters long' },
                { status: 400 }
            );
        }

        // Check if email already exists
        const existingAccount = await executeQuerySingle(
            'SELECT id FROM email_accounts WHERE email = ?',
            [email]
        );

        if (existingAccount) {
            return NextResponse.json(
                { message: 'Email address already exists' },
                { status: 409 }
            );
        }

        // Allow multiple email accounts per user (removed single account restriction)

        // Get company info to check limits
        const company = await executeQuerySingle<any>(
            `SELECT c.id, c.name, c.domain, cs.maxEmailAccounts
       FROM companies c
       LEFT JOIN company_settings cs ON c.id = cs.companyId
       WHERE c.id = ?`,
            [companyId]
        );

        if (!company) {
            return NextResponse.json(
                { message: 'Company not found' },
                { status: 404 }
            );
        }

        // Check company email account limit
        const currentAccountCount = await executeQuerySingle<{ count: number }>(
            'SELECT COUNT(*) as count FROM email_accounts WHERE companyId = ?',
            [companyId]
        );

        const maxAccounts = company.maxEmailAccounts || 10;
        if (currentAccountCount && currentAccountCount.count >= maxAccounts) {
            return NextResponse.json(
                { message: 'Email account limit reached for your plan' },
                { status: 403 }
            );
        }

        // Create new email account in database
        const result = await executeQuery(
            `INSERT INTO email_accounts (email, userId, companyId, forwardingRules, storageUsed, status, createdAt) 
       VALUES (?, ?, ?, '[]', 0, 'active', NOW())`,
            [email, userId, companyId]
        );

        const accountId = (result as any).insertId;

        // Return the created account
        const newAccount: EmailAccount = {
            id: accountId.toString(),
            email,
            userId,
            companyId,
            forwardingRules: [],
            storageUsed: 0,
            status: 'active'
        };

        return NextResponse.json({
            success: true,
            account: newAccount,
            message: 'Email account created successfully'
        }, { status: 201 });

    } catch (error) {
        console.error('Error creating email account:', error);
        return NextResponse.json(
            { message: 'Internal server error' },
            { status: 500 }
        );
    }
}