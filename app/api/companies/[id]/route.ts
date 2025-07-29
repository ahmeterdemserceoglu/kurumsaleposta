import { NextRequest, NextResponse } from 'next/server';
import { executeQuerySingle } from '@/lib/database';

// GET /api/companies/[id] - Get company information
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Get company with settings
    const company = await executeQuerySingle<any>(
      `SELECT 
        c.id,
        c.name,
        c.domain,
        c.backupEmail,
        c.plan,
        c.status,
        c.createdAt,
        cs.maxEmailAccounts,
        cs.storageLimit
       FROM companies c
       LEFT JOIN company_settings cs ON c.id = cs.companyId
       WHERE c.id = ?`,
      [id]
    );

    if (!company) {
      return NextResponse.json(
        { error: 'Company not found' },
        { status: 404 }
      );
    }

    // Format response
    const response = {
      id: company.id,
      name: company.name,
      domain: company.domain,
      backupEmail: company.backupEmail,
      plan: company.plan,
      status: company.status,
      createdAt: company.createdAt,
      settings: {
        maxEmailAccounts: company.maxEmailAccounts || (
          company.plan === 'starter' ? 10 : 
          company.plan === 'business' ? 50 : 200
        ),
        storageLimit: company.storageLimit || (
          company.plan === 'starter' ? 10 : 
          company.plan === 'business' ? 100 : 500
        )
      }
    };

    return NextResponse.json(response);

  } catch (error) {
    console.error('Error fetching company:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}