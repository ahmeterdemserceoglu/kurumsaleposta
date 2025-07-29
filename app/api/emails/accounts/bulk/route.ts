import { NextRequest, NextResponse } from 'next/server';
import { EmailAccount, User, Company } from '@/types';
import { bulkEmailAccountSchema } from '@/lib/validations';
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

// POST /api/emails/accounts/bulk - Create multiple email accounts
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate request body
    const validationResult = bulkEmailAccountSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Invalid request data', details: validationResult.error.issues },
        { status: 400 }
      );
    }

    const { accounts } = validationResult.data;
    const createdAccounts: EmailAccount[] = [];
    const errors: Array<{ userId: string; error: string }> = [];

    // Get company info from first user (assuming all users are from same company)
    let company: Company | null = null;
    if (accounts.length > 0) {
      company = await getUserCompany(accounts[0].userId);
      if (!company) {
        return NextResponse.json(
          { error: 'Company not found' },
          { status: 404 }
        );
      }
    }

    // Check current account count and remaining limit
    const currentAccountCount = await executeQuerySingle<{ count: number }>(
      'SELECT COUNT(*) as count FROM email_accounts WHERE companyId = ?',
      [company!.id]
    );

    const currentCount = currentAccountCount?.count || 0;
    const maxAccounts = company!.settings.maxEmailAccounts;
    const remainingSlots = maxAccounts - currentCount;

    if (accounts.length > remainingSlots) {
      return NextResponse.json(
        { 
          error: `Cannot create ${accounts.length} accounts. Only ${remainingSlots} slots remaining in your plan.`,
          details: {
            requested: accounts.length,
            remaining: remainingSlots,
            current: currentCount,
            limit: maxAccounts
          }
        },
        { status: 403 }
      );
    }

    // Process each account creation
    for (const accountData of accounts) {
      try {
        const { firstName, lastName, userId } = accountData;

        // Check if user already has an email account
        const existingAccount = await executeQuerySingle(
          'SELECT id FROM email_accounts WHERE userId = ?',
          [userId]
        );
        
        if (existingAccount) {
          errors.push({ userId, error: 'User already has an email account' });
          continue;
        }

        // Generate email address
        const email = await generateEmailAddress(firstName, lastName, company!.domain);

        // Create new email account in database
        const result = await executeQuery(
          `INSERT INTO email_accounts (email, userId, companyId, forwardingRules, storageUsed, status, createdAt) 
           VALUES (?, ?, ?, '[]', 0, 'active', NOW())`,
          [email, userId, company!.id]
        );

        const accountId = (result as any).insertId;

        const newAccount: EmailAccount = {
          id: accountId.toString(),
          email,
          userId,
          companyId: company!.id,
          forwardingRules: [],
          storageUsed: 0,
          status: 'active'
        };

        createdAccounts.push(newAccount);

      } catch (error) {
        errors.push({ 
          userId: accountData.userId, 
          error: error instanceof Error ? error.message : 'Unknown error' 
        });
      }
    }

    // Return results
    const response = {
      created: createdAccounts,
      errors,
      summary: {
        total: accounts.length,
        successful: createdAccounts.length,
        failed: errors.length
      }
    };

    // Return 207 Multi-Status if there were partial failures
    const statusCode = errors.length > 0 ? 207 : 201;
    
    return NextResponse.json(response, { status: statusCode });

  } catch (error) {
    console.error('Error creating bulk email accounts:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}